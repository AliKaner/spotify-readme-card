import type { Id } from "../convex/_generated/dataModel";
import { createConvexClient } from "./convexClient";
import { api } from "../convex/_generated/api";
import { getValidSpotifyAccessToken } from "./connections";
import { getTopArtists, getTopTracks, getRecentlyPlayedList, computeTopGenres } from "./spotify";
import { getGithubProfileById, getGithubRepos, getGithubRecentActivity } from "./github";
import { computeGithubBadges, computeSpotifyBadges, type Badge } from "./badges";

const SEVEN_DAYS_MS = 7 * 24 * 3600 * 1000;

async function getPlaylistCount(accessToken: string): Promise<number> {
  const response = await fetch("https://api.spotify.com/v1/me/playlists?limit=1", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return 0;
  const data = await response.json();
  return data.total ?? 0;
}

/**
 * Full badge catalog for a user — earned AND locked entries, so callers can either
 * render only the earned ones (the SVG card) or show the whole progress wall (dashboard).
 * GitHub badges are attempted for every user (no extra OAuth scope needed); Spotify badges
 * are only computed if connected, and any failure there is swallowed as non-fatal.
 */
export async function getAllBadgesForUser(userId: Id<"users">): Promise<Badge[]> {
  const badges: Badge[] = [];
  const client = createConvexClient();

  const githubAccountId = await client.query(api.githubAccounts.getForUser, { userId });
  if (githubAccountId) {
    const profile = await getGithubProfileById(githubAccountId);
    if (profile) {
      const [repos, activity] = await Promise.all([
        getGithubRepos(profile.login, 100),
        getGithubRecentActivity(profile.login, 10),
      ]);
      const hasRecentPush = activity.some((a) => Date.now() - new Date(a.createdAt).getTime() < SEVEN_DAYS_MS);
      badges.push(...computeGithubBadges(profile, repos, hasRecentPush));
    }
  }

  const connection = await client.query(api.connections.getByUserAndProvider, { userId, provider: "spotify" });
  if (connection) {
    try {
      const accessToken = await getValidSpotifyAccessToken(connection);
      const [shortArtists, longArtists, topTracks, recent, playlistCount] = await Promise.all([
        getTopArtists(accessToken, "short_term", 20),
        getTopArtists(accessToken, "long_term", 20),
        getTopTracks(accessToken, "short_term", 10),
        getRecentlyPlayedList(accessToken, 20),
        getPlaylistCount(accessToken),
      ]);

      const genres = computeTopGenres(shortArtists, 50);
      const sameTopArtist = Boolean(shortArtists[0] && longArtists[0] && shortArtists[0].name === longArtists[0].name);

      const nightHours = recent.filter((t) => new Date(t.playedAt).getUTCHours() < 5).length;
      const nightOwlRatio = recent.length > 0 ? nightHours / recent.length : 0;

      const weekendPlays = recent.filter((t) => [0, 6].includes(new Date(t.playedAt).getUTCDay())).length;
      const weekendRatio = recent.length > 0 ? weekendPlays / recent.length : 0;

      const earlyMorningPlays = recent.filter((t) => {
        const hour = new Date(t.playedAt).getUTCHours();
        return hour >= 5 && hour < 9;
      }).length;
      const earlyRiserRatio = recent.length > 0 ? earlyMorningPlays / recent.length : 0;

      const playCounts = new Map<string, number>();
      for (const t of recent) {
        const key = `${t.title}::${t.artist}`;
        playCounts.set(key, (playCounts.get(key) ?? 0) + 1);
      }
      const hasRepeatedTrack = Array.from(playCounts.values()).some((count) => count >= 2);

      const topTrackArtistDiversity = new Set(topTracks.map((t) => t.artist)).size;

      badges.push(
        ...computeSpotifyBadges({
          topGenreCount: genres.length,
          playlistCount,
          sameTopArtistAcrossRanges: sameTopArtist,
          nightOwlRatio,
          topTrackArtistDiversity,
          hasRepeatedTrack,
          weekendRatio,
          earlyRiserRatio,
        })
      );
    } catch (error) {
      console.error("Spotify badge computation failed (non-fatal):", error);
    }
  }

  return badges;
}
