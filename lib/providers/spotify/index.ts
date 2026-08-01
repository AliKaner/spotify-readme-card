import { z } from "zod";
import type { Doc } from "../../../convex/_generated/dataModel";
import type { Theme } from "../../themes";
import { getValidSpotifyAccessToken } from "../../connections";
import { getNowPlaying, getTopTracks, type TimeRange } from "../../spotify";
import { toDataUri } from "../../image";
import { buildNowPlayingCard } from "../../cards/nowPlayingCard";
import { buildTopTracksCard, type TopTrackWithArt } from "../../cards/topTracksCard";
import type { CardTypeDef, Provider } from "../types";

const nowPlayingConfigSchema = z.object({});

const topTracksConfigSchema = z.object({
  time_range: z.enum(["short_term", "medium_term", "long_term"]).default("short_term"),
  limit: z.number().int().min(1).max(10).default(5),
});

const TOP_TRACKS_TITLES: Record<TimeRange, string> = {
  short_term: "Top Tracks · 4 Weeks",
  medium_term: "Top Tracks · 6 Months",
  long_term: "Top Tracks · All Time",
};

export const spotifyCardTypes: CardTypeDef[] = [
  { id: "now-playing", label: "Now Playing", configSchema: nowPlayingConfigSchema, defaultConfig: {} },
  {
    id: "top-tracks",
    label: "Top Tracks",
    configSchema: topTracksConfigSchema,
    defaultConfig: { time_range: "short_term", limit: 5 },
  },
];

async function renderCard(args: {
  connection: Doc<"connections">;
  type: string;
  theme: Theme;
  config: unknown;
}): Promise<string> {
  const accessToken = await getValidSpotifyAccessToken(args.connection);

  if (args.type === "now-playing") {
    const track = await getNowPlaying(accessToken);
    const albumArt = track ? await toDataUri(track.albumImageUrl) : null;
    return buildNowPlayingCard(track, albumArt, args.theme);
  }

  if (args.type === "top-tracks") {
    const parsed = topTracksConfigSchema.parse(args.config ?? {});
    const tracks = await getTopTracks(accessToken, parsed.time_range, parsed.limit);
    const withArt: TopTrackWithArt[] = await Promise.all(
      tracks.map(async (track) => ({ track, art: await toDataUri(track.albumImageUrl) }))
    );
    return buildTopTracksCard(withArt, args.theme, TOP_TRACKS_TITLES[parsed.time_range]);
  }

  throw new Error(`Unknown Spotify card type: ${args.type}`);
}

export const spotifyProvider: Provider = {
  id: "spotify",
  displayName: "Spotify",
  status: "live",
  cardTypes: spotifyCardTypes,
  renderCard,
};
