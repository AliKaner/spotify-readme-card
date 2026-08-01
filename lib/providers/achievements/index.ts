import { z } from "zod";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Theme } from "../../themes";
import { createConvexClient } from "../../convexClient";
import { api } from "../../../convex/_generated/api";
import { getValidSpotifyAccessToken } from "../../connections";
import { getTopArtists, getRecentlyPlayedList, computeTopGenres } from "../../spotify";
import { getGithubProfileById, getGithubRepos } from "../../github";
import { computeGithubBadges, computeSpotifyBadges, type Badge } from "../../badges";
import { buildBadgesCard } from "../../cards/badgesCard";
import type { CardTypeDef, Provider } from "../types";

const badgesConfigSchema = z.object({});

export const achievementsCardTypes: CardTypeDef[] = [
  { id: "badges", label: "Badges", configSchema: badgesConfigSchema, defaultConfig: {} },
];

async function getPlaylistCount(accessToken: string): Promise<number> {
  const response = await fetch("https://api.spotify.com/v1/me/playlists?limit=1", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return 0;
  const data = await response.json();
  return data.total ?? 0;
}

async function renderCard(args: {
  userId: Id<"users">;
  type: string;
  theme: Theme;
  config: unknown;
}): Promise<string> {
  const badges: Badge[] = [];
  const client = createConvexClient();

  // GitHub badges: always attempted — the numeric account id comes from Convex Auth's own
  // login record, and GitHub's public profile/repo endpoints need no token or extra scope.
  const githubAccountId = await client.query(api.githubAccounts.getForUser, { userId: args.userId });
  if (githubAccountId) {
    const profile = await getGithubProfileById(githubAccountId);
    if (profile) {
      const repos = await getGithubRepos(profile.login, 100);
      badges.push(...computeGithubBadges(profile, repos));
    }
  }

  // Spotify badges: only if the user has connected Spotify — a bonus, not required, so any
  // failure here is swallowed and just leaves the GitHub-only badges in place.
  const connection = await client.query(api.connections.getByUserAndProvider, { userId: args.userId, provider: "spotify" });
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

  return buildBadgesCard(badges, args.theme);
}

export const achievementsProvider: Provider = {
  id: "achievements",
  displayName: "Achievements",
  status: "live",
  requiresConnection: false,
  cardTypes: achievementsCardTypes,
  renderCard,
};
