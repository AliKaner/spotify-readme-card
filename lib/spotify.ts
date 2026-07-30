const SPOTIFY_TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played?limit=1";
const TOP_TRACKS_ENDPOINT = "https://api.spotify.com/v1/me/top/tracks";

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

function getBasicAuthHeader(): string {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET environment variable.");
  }

  return Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
}

async function getAccessToken(): Promise<string> {
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!refreshToken) {
    throw new Error("Missing SPOTIFY_REFRESH_TOKEN environment variable.");
  }

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
  return data.access_token as string;
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

export async function getNowPlaying(): Promise<Track | null> {
  const accessToken = await getAccessToken();

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

export async function getTopTracks(timeRange: TimeRange = "short_term", limit = 5): Promise<TopTrack[]> {
  const accessToken = await getAccessToken();

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
