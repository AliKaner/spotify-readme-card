import { z } from "zod";
import type { Doc } from "../../../convex/_generated/dataModel";
import type { Theme } from "../../themes";
import { getValidSpotifyAccessToken } from "../../connections";
import {
  getNowPlaying,
  getTopTracks,
  getTopArtists,
  getRecentlyPlayedList,
  getAudioFeaturesAverage,
  computeTopGenres,
  getTrackById,
  getArtistById,
  getPlaylistById,
  type TimeRange,
} from "../../spotify";
import { toDataUri } from "../../image";
import { buildNowPlayingCard, buildNowPlayingCompactCard } from "../../cards/nowPlayingCard";
import { buildTopTracksCard, buildTopTracksGridCard, type TopTrackWithArt } from "../../cards/topTracksCard";
import { buildTopArtistsCard, type TopArtistWithArt } from "../../cards/topArtistsCard";
import { buildRecentlyPlayedCard, type RecentTrackWithArt } from "../../cards/recentlyPlayedCard";
import { buildTopGenresCard } from "../../cards/topGenresCard";
import { buildSonicProfileCard } from "../../cards/sonicProfileCard";
import { buildFeaturedTrackCard } from "../../cards/featuredTrackCard";
import { buildFeaturedArtistCard } from "../../cards/featuredArtistCard";
import { buildFeaturedPlaylistCard } from "../../cards/featuredPlaylistCard";
import type { CardTypeDef, Provider } from "../types";

const nowPlayingConfigSchema = z.object({
  layout: z.enum(["full", "compact"]).default("full"),
});

const topTracksConfigSchema = z.object({
  time_range: z.enum(["short_term", "medium_term", "long_term"]).default("short_term"),
  limit: z.number().int().min(1).max(10).default(5),
  layout: z.enum(["list", "grid"]).default("list"),
});

const topArtistsConfigSchema = z.object({
  time_range: z.enum(["short_term", "medium_term", "long_term"]).default("short_term"),
  limit: z.number().int().min(1).max(10).default(5),
});

const recentlyPlayedConfigSchema = z.object({
  limit: z.number().int().min(1).max(10).default(5),
});

const topGenresConfigSchema = z.object({
  time_range: z.enum(["short_term", "medium_term", "long_term"]).default("short_term"),
});

const sonicProfileConfigSchema = z.object({
  time_range: z.enum(["short_term", "medium_term", "long_term"]).default("short_term"),
});

const featuredIdConfigSchema = z.object({
  spotifyId: z.string().min(1),
});

const TOP_TRACKS_TITLES: Record<TimeRange, string> = {
  short_term: "Top Tracks · 4 Weeks",
  medium_term: "Top Tracks · 6 Months",
  long_term: "Top Tracks · All Time",
};

const TOP_ARTISTS_TITLES: Record<TimeRange, string> = {
  short_term: "Top Artists · 4 Weeks",
  medium_term: "Top Artists · 6 Months",
  long_term: "Top Artists · All Time",
};

export const spotifyCardTypes: CardTypeDef[] = [
  {
    id: "now-playing",
    label: "Now Playing",
    configSchema: nowPlayingConfigSchema,
    defaultConfig: { layout: "full" },
  },
  {
    id: "top-tracks",
    label: "Top Tracks",
    configSchema: topTracksConfigSchema,
    defaultConfig: { time_range: "short_term", limit: 5, layout: "list" },
  },
  {
    id: "top-artists",
    label: "Top Artists",
    configSchema: topArtistsConfigSchema,
    defaultConfig: { time_range: "short_term", limit: 5 },
  },
  {
    id: "recently-played",
    label: "Recently Played",
    configSchema: recentlyPlayedConfigSchema,
    defaultConfig: { limit: 5 },
  },
  {
    id: "top-genres",
    label: "Top Genres",
    configSchema: topGenresConfigSchema,
    defaultConfig: { time_range: "short_term" },
  },
  {
    id: "sonic-profile",
    label: "Sonic Profile",
    configSchema: sonicProfileConfigSchema,
    defaultConfig: { time_range: "short_term" },
  },
  {
    id: "featured-track",
    label: "Featured Track",
    configSchema: featuredIdConfigSchema,
    defaultConfig: { spotifyId: "" },
  },
  {
    id: "featured-artist",
    label: "Featured Artist",
    configSchema: featuredIdConfigSchema,
    defaultConfig: { spotifyId: "" },
  },
  {
    id: "featured-playlist",
    label: "Featured Playlist",
    configSchema: featuredIdConfigSchema,
    defaultConfig: { spotifyId: "" },
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
    const parsed = nowPlayingConfigSchema.parse(args.config ?? {});
    const track = await getNowPlaying(accessToken);
    const albumArt = track ? await toDataUri(track.albumImageUrl) : null;
    return parsed.layout === "compact"
      ? buildNowPlayingCompactCard(track, albumArt, args.theme)
      : buildNowPlayingCard(track, albumArt, args.theme);
  }

  if (args.type === "top-tracks") {
    const parsed = topTracksConfigSchema.parse(args.config ?? {});
    const tracks = await getTopTracks(accessToken, parsed.time_range, parsed.limit);
    const withArt: TopTrackWithArt[] = await Promise.all(
      tracks.map(async (track) => ({ track, art: await toDataUri(track.albumImageUrl) }))
    );
    return parsed.layout === "grid"
      ? buildTopTracksGridCard(withArt, args.theme, TOP_TRACKS_TITLES[parsed.time_range])
      : buildTopTracksCard(withArt, args.theme, TOP_TRACKS_TITLES[parsed.time_range]);
  }

  if (args.type === "top-artists") {
    const parsed = topArtistsConfigSchema.parse(args.config ?? {});
    const artists = await getTopArtists(accessToken, parsed.time_range, parsed.limit);
    const withArt: TopArtistWithArt[] = await Promise.all(
      artists.map(async (artist) => ({ artist, art: await toDataUri(artist.imageUrl) }))
    );
    return buildTopArtistsCard(withArt, args.theme, TOP_ARTISTS_TITLES[parsed.time_range]);
  }

  if (args.type === "recently-played") {
    const parsed = recentlyPlayedConfigSchema.parse(args.config ?? {});
    const tracks = await getRecentlyPlayedList(accessToken, parsed.limit);
    const withArt: RecentTrackWithArt[] = await Promise.all(
      tracks.map(async (track) => ({ track, art: await toDataUri(track.albumImageUrl) }))
    );
    return buildRecentlyPlayedCard(withArt, args.theme);
  }

  if (args.type === "top-genres") {
    const parsed = topGenresConfigSchema.parse(args.config ?? {});
    const artists = await getTopArtists(accessToken, parsed.time_range, 50);
    const genres = computeTopGenres(artists, 5);
    return buildTopGenresCard(genres, args.theme);
  }

  if (args.type === "sonic-profile") {
    const parsed = sonicProfileConfigSchema.parse(args.config ?? {});
    const tracks = await getTopTracks(accessToken, parsed.time_range, 20);
    const features = await getAudioFeaturesAverage(
      accessToken,
      tracks.map((t) => t.id)
    );
    return buildSonicProfileCard(features, args.theme);
  }

  if (args.type === "featured-track") {
    const parsed = featuredIdConfigSchema.parse(args.config ?? {});
    const track = await getTrackById(accessToken, parsed.spotifyId);
    const albumArt = track ? await toDataUri(track.albumImageUrl) : null;
    return buildFeaturedTrackCard(track, albumArt, args.theme);
  }

  if (args.type === "featured-artist") {
    const parsed = featuredIdConfigSchema.parse(args.config ?? {});
    const artist = await getArtistById(accessToken, parsed.spotifyId);
    const art = artist ? await toDataUri(artist.imageUrl) : null;
    return buildFeaturedArtistCard(artist, art, args.theme);
  }

  if (args.type === "featured-playlist") {
    const parsed = featuredIdConfigSchema.parse(args.config ?? {});
    const playlist = await getPlaylistById(accessToken, parsed.spotifyId);
    const art = playlist ? await toDataUri(playlist.imageUrl) : null;
    return buildFeaturedPlaylistCard(playlist, art, args.theme);
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
