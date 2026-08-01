import { getSiteUrl } from "./env";

const SPOTIFY_AUTHORIZE_ENDPOINT = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const SPOTIFY_ME_ENDPOINT = "https://api.spotify.com/v1/me";
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played";
const TOP_TRACKS_ENDPOINT = "https://api.spotify.com/v1/me/top/tracks";
const TOP_ARTISTS_ENDPOINT = "https://api.spotify.com/v1/me/top/artists";
const AUDIO_FEATURES_ENDPOINT = "https://api.spotify.com/v1/audio-features";
const SEARCH_ENDPOINT = "https://api.spotify.com/v1/search";
const TRACKS_ENDPOINT = "https://api.spotify.com/v1/tracks";
const ARTISTS_ENDPOINT = "https://api.spotify.com/v1/artists";
const PLAYLISTS_ENDPOINT = "https://api.spotify.com/v1/playlists";

export const SPOTIFY_SCOPES = [
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-top-read",
  "playlist-read-private",
].join(" ");

export interface Track {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumImageUrl?: string;
  songUrl: string;
}

export interface TopTrack {
  id: string;
  title: string;
  artist: string;
  albumImageUrl?: string;
  songUrl: string;
}

export interface RecentTrack {
  title: string;
  artist: string;
  albumImageUrl?: string;
  songUrl: string;
  playedAt: string;
}

export interface TopArtist {
  name: string;
  genre?: string;
  genres: string[];
  imageUrl?: string;
  artistUrl: string;
}

export interface GenreCount {
  genre: string;
  count: number;
}

export interface AudioFeaturesAverage {
  energy: number;
  danceability: number;
  valence: number;
  tempo: number;
}

export type TimeRange = "short_term" | "medium_term" | "long_term";

export interface SpotifyTokenSet {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope?: string;
}

function getBasicAuthHeader(): string {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET environment variable.");
  }

  return Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
}

function redirectUri(): string {
  return `${getSiteUrl()}/api/connect/spotify/callback`;
}

export function buildAuthorizeUrl(state: string): string {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) throw new Error("Missing SPOTIFY_CLIENT_ID environment variable.");

  const url = new URL(SPOTIFY_AUTHORIZE_ENDPOINT);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("scope", SPOTIFY_SCOPES);
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeCode(code: string): Promise<SpotifyTokenSet> {
  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${getBasicAuthHeader()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange Spotify authorization code (status ${response.status}).`);
  }

  const data = await response.json();
  if (!data.refresh_token) {
    throw new Error("Spotify did not return a refresh token.");
  }

  return {
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    scope: data.scope as string | undefined,
  };
}

export async function refreshSpotifyToken(refreshToken: string): Promise<Omit<SpotifyTokenSet, "scope">> {
  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${getBasicAuthHeader()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh Spotify access token (status ${response.status}).`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token as string,
    // Spotify only returns a new refresh_token some of the time — keep the old one otherwise.
    refreshToken: (data.refresh_token as string | undefined) ?? refreshToken,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
}

export async function getSpotifyProfile(accessToken: string): Promise<{ id: string; displayName: string } | null> {
  const response = await fetch(SPOTIFY_ME_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return null;

  const data = await response.json();
  return { id: data.id as string, displayName: (data.display_name as string) ?? data.id };
}

function mapTrackItem(item: any, isPlaying: boolean): Track {
  return {
    isPlaying,
    title: item.name,
    artist: (item.artists ?? []).map((a: any) => a.name).join(", "),
    album: item.album?.name ?? "",
    albumImageUrl: item.album?.images?.[0]?.url,
    songUrl: item.external_urls?.spotify ?? "",
  };
}

async function getRecentlyPlayed(accessToken: string): Promise<Track | null> {
  const response = await fetch(`${RECENTLY_PLAYED_ENDPOINT}?limit=1`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) return null;

  const data = await response.json();
  const item = data.items?.[0]?.track;
  if (!item) return null;

  return mapTrackItem(item, false);
}

export async function getNowPlaying(accessToken: string): Promise<Track | null> {
  const response = await fetch(NOW_PLAYING_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  // 204 = nothing currently playing, fall back to recently played
  if (response.status === 204 || !response.ok) {
    return getRecentlyPlayed(accessToken);
  }

  const data = await response.json();
  if (!data?.item) {
    return getRecentlyPlayed(accessToken);
  }

  return mapTrackItem(data.item, Boolean(data.is_playing));
}

export async function getTopTracks(
  accessToken: string,
  timeRange: TimeRange = "short_term",
  limit = 5
): Promise<TopTrack[]> {
  const url = new URL(TOP_TRACKS_ENDPOINT);
  url.searchParams.set("time_range", timeRange);
  url.searchParams.set("limit", String(Math.min(Math.max(limit, 1), 10)));

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) return [];

  const data = await response.json();
  return (data.items ?? []).map((item: any) => ({
    id: item.id,
    title: item.name,
    artist: (item.artists ?? []).map((a: any) => a.name).join(", "),
    albumImageUrl: item.album?.images?.[0]?.url,
    songUrl: item.external_urls?.spotify ?? "",
  }));
}

export async function getRecentlyPlayedList(accessToken: string, limit = 5): Promise<RecentTrack[]> {
  const url = new URL(RECENTLY_PLAYED_ENDPOINT);
  url.searchParams.set("limit", String(Math.min(Math.max(limit, 1), 10)));

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) return [];

  const data = await response.json();
  return (data.items ?? []).map((entry: any) => ({
    title: entry.track?.name,
    artist: (entry.track?.artists ?? []).map((a: any) => a.name).join(", "),
    albumImageUrl: entry.track?.album?.images?.[0]?.url,
    songUrl: entry.track?.external_urls?.spotify ?? "",
    playedAt: entry.played_at,
  }));
}

export async function getTopArtists(
  accessToken: string,
  timeRange: TimeRange = "short_term",
  limit = 5
): Promise<TopArtist[]> {
  const url = new URL(TOP_ARTISTS_ENDPOINT);
  url.searchParams.set("time_range", timeRange);
  url.searchParams.set("limit", String(Math.min(Math.max(limit, 1), 10)));

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) return [];

  const data = await response.json();
  return (data.items ?? []).map((item: any) => ({
    name: item.name,
    genre: item.genres?.[0],
    genres: item.genres ?? [],
    imageUrl: item.images?.[0]?.url,
    artistUrl: item.external_urls?.spotify ?? "",
  }));
}

export function computeTopGenres(artists: TopArtist[], limit = 5): GenreCount[] {
  const counts = new Map<string, number>();
  for (const artist of artists) {
    for (const genre of artist.genres) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getAudioFeaturesAverage(accessToken: string, trackIds: string[]): Promise<AudioFeaturesAverage | null> {
  if (trackIds.length === 0) return null;

  const url = new URL(AUDIO_FEATURES_ENDPOINT);
  url.searchParams.set("ids", trackIds.slice(0, 100).join(","));

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) return null;

  const data = await response.json();
  const features = (data.audio_features ?? []).filter(Boolean);
  if (features.length === 0) return null;

  const sum = features.reduce(
    (acc: AudioFeaturesAverage, f: any) => ({
      energy: acc.energy + f.energy,
      danceability: acc.danceability + f.danceability,
      valence: acc.valence + f.valence,
      tempo: acc.tempo + f.tempo,
    }),
    { energy: 0, danceability: 0, valence: 0, tempo: 0 }
  );

  return {
    energy: sum.energy / features.length,
    danceability: sum.danceability / features.length,
    valence: sum.valence / features.length,
    tempo: sum.tempo / features.length,
  };
}

export interface SearchResultTrack {
  id: string;
  title: string;
  artist: string;
  imageUrl?: string;
}

export interface SearchResultArtist {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface SearchResultPlaylist {
  id: string;
  name: string;
  owner: string;
  imageUrl?: string;
}

export type SearchType = "track" | "artist" | "playlist";

/** Used to power the "feature a specific item" card picker — searches Spotify's public catalog. */
export async function searchSpotify(
  accessToken: string,
  query: string,
  type: SearchType,
  limit = 8
): Promise<(SearchResultTrack | SearchResultArtist | SearchResultPlaylist)[]> {
  if (!query.trim()) return [];

  const url = new URL(SEARCH_ENDPOINT);
  url.searchParams.set("q", query);
  url.searchParams.set("type", type);
  url.searchParams.set("limit", String(Math.min(Math.max(limit, 1), 20)));

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return [];

  const data = await response.json();

  if (type === "track") {
    return (data.tracks?.items ?? []).map((item: any) => ({
      id: item.id,
      title: item.name,
      artist: (item.artists ?? []).map((a: any) => a.name).join(", "),
      imageUrl: item.album?.images?.[0]?.url,
    }));
  }

  if (type === "artist") {
    return (data.artists?.items ?? []).map((item: any) => ({
      id: item.id,
      name: item.name,
      imageUrl: item.images?.[0]?.url,
    }));
  }

  return (data.playlists?.items ?? [])
    .filter(Boolean)
    .map((item: any) => ({
      id: item.id,
      name: item.name,
      owner: item.owner?.display_name ?? "",
      imageUrl: item.images?.[0]?.url,
    }));
}

export interface FeaturedTrack {
  title: string;
  artist: string;
  album: string;
  albumImageUrl?: string;
  songUrl: string;
}

export async function getTrackById(accessToken: string, trackId: string): Promise<FeaturedTrack | null> {
  const response = await fetch(`${TRACKS_ENDPOINT}/${encodeURIComponent(trackId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return null;

  const item = await response.json();
  return {
    title: item.name,
    artist: (item.artists ?? []).map((a: any) => a.name).join(", "),
    album: item.album?.name ?? "",
    albumImageUrl: item.album?.images?.[0]?.url,
    songUrl: item.external_urls?.spotify ?? "",
  };
}

export interface FeaturedArtist {
  name: string;
  genres: string[];
  imageUrl?: string;
  followers?: number;
  artistUrl: string;
}

export async function getArtistById(accessToken: string, artistId: string): Promise<FeaturedArtist | null> {
  const response = await fetch(`${ARTISTS_ENDPOINT}/${encodeURIComponent(artistId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return null;

  const item = await response.json();
  return {
    name: item.name,
    genres: item.genres ?? [],
    imageUrl: item.images?.[0]?.url,
    followers: item.followers?.total,
    artistUrl: item.external_urls?.spotify ?? "",
  };
}

export interface FeaturedPlaylist {
  name: string;
  description?: string;
  imageUrl?: string;
  trackCount: number;
  owner: string;
  playlistUrl: string;
}

export async function getPlaylistById(accessToken: string, playlistId: string): Promise<FeaturedPlaylist | null> {
  const response = await fetch(`${PLAYLISTS_ENDPOINT}/${encodeURIComponent(playlistId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return null;

  const item = await response.json();
  return {
    name: item.name,
    description: item.description || undefined,
    imageUrl: item.images?.[0]?.url,
    trackCount: item.tracks?.total ?? 0,
    owner: item.owner?.display_name ?? "",
    playlistUrl: item.external_urls?.spotify ?? "",
  };
}
