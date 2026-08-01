import type { Id } from "../convex/_generated/dataModel";
import { createConvexClient } from "./convexClient";
import { api } from "../convex/_generated/api";
import { getValidSpotifyAccessToken } from "./connections";
import { getTopArtists, getRecentlyPlayedList, computeTopGenres } from "./spotify";
import { getGithubProfileById, getGithubRepos } from "./github";
import { computeGithubBadges, computeSpotifyBadges, type Badge } from "./badges";

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
      const repos = await getGithubRepos(profile.login, 100);
      badges.push(...computeGithubBadges(profile, repos));
    }
  }

  const connection = await client.query(api.connections.getByUserAndProvider, { userId, provider: "spotify" });
  if (connection) {
    try {
      const accessToken = await getValidSpotifyAccessToken(connection);
      const [shortArtists, longArtists, recent, playlistCount] = await Promise.all([
        getTopArtists(accessToken, "short_term", 20),
        getTopArtists(accessToken, "long_term", 20),
        getRecentlyPlayedList(accessToken, 20),
        getPlaylistCount(accessToken),
      ]);

      const genres = computeTopGenres(shortArtists, 50);
      const sameTopArtist = Boolean(shortArtists[0] && longArtists[0] && shortArtists[0].name === longArtists[0].name);

      const nightHours = recent.filter((t) => new Date(t.playedAt).getUTCHours() < 5).length;
      const nightOwlRatio = recent.length > 0 ? nightHours / recent.length : 0;

      badges.push(
        ...computeSpotifyBadges({
          topGenreCount: genres.length,
          playlistCount,
          sameTopArtistAcrossRanges: sameTopArtist,
          nightOwlRatio,
        })
      );
    } catch (error) {
      console.error("Spotify badge computation failed (non-fatal):", error);
    }
  }

  return badges;
}
