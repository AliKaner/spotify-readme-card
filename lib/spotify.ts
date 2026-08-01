import { getSiteUrl } from "./env";

const SPOTIFY_AUTHORIZE_ENDPOINT = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const SPOTIFY_ME_ENDPOINT = "https://api.spotify.com/v1/me";
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played?limit=1";
const TOP_TRACKS_ENDPOINT = "https://api.spotify.com/v1/me/top/tracks";

export const SPOTIFY_SCOPES = ["user-read-currently-playing", "user-read-recently-played", "user-top-read"].join(" ");

export interface Track {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumImageUrl?: string;
  songUrl: string;
}

export interface TopTrack {
  title: string;
  artist: string;
  albumImageUrl?: string;
  songUrl: string;
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
  const response = await fetch(RECENTLY_PLAYED_ENDPOINT, {
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
    title: item.name,
    artist: (item.artists ?? []).map((a: any) => a.name).join(", "),
    albumImageUrl: item.album?.images?.[0]?.url,
    songUrl: item.external_urls?.spotify ?? "",
  }));
}
