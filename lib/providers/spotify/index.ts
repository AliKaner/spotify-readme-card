import { z } from "zod";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Theme } from "../../themes";
import { getValidSpotifyAccessToken } from "../../connections";
import { createConvexClient } from "../../convexClient";
import { buildErrorCard } from "../../cards/errorCard";
import { api } from "../../../convex/_generated/api";
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
import { buildNowPlayingCard } from "../../cards/nowPlayingCard";
import { buildTopTracksCard, buildTopTracksGridCard, type TopTrackWithArt } from "../../cards/topTracksCard";
import { buildTopArtistsCard, type TopArtistWithArt } from "../../cards/topArtistsCard";
import { buildRecentlyPlayedCard, type RecentTrackWithArt } from "../../cards/recentlyPlayedCard";
import { buildTopGenresCard } from "../../cards/topGenresCard";
import { buildSonicProfileCard } from "../../cards/sonicProfileCard";
import { buildFeaturedTrackCard } from "../../cards/featuredTrackCard";
import { buildFeaturedArtistCard } from "../../cards/featuredArtistCard";
import { buildFeaturedPlaylistCard } from "../../cards/featuredPlaylistCard";
import { renderSingleItemLayout, emptySingleItemCard, type SingleItemGenericLayout } from "../../cards/layouts/singleItem";
import { renderRankedListLayout, type RankedItem, type RankedListGenericLayout } from "../../cards/layouts/rankedList";
import { renderAggregateStatLayout, type AggregateStatGenericLayout } from "../../cards/layouts/aggregateStat";
import type { CardTypeDef, Provider } from "../types";

const SINGLE_ITEM_LAYOUTS = ["full", "compact", "terminal", "badge", "portrait", "split"] as const;
// Shared by top-tracks/top-artists/recently-played — "grid" is a bespoke renderer for
// top-tracks and falls through to the generic grid layout for the other two (see renderCard).
const RANKED_LIST_LAYOUTS = ["list", "grid", "avatars", "terminal", "bars", "compact"] as const;
const AGGREGATE_STAT_LAYOUTS = ["bars", "terminal", "radial", "badge", "tiles", "portrait"] as const;

const nowPlayingConfigSchema = z.object({
  layout: z.enum(SINGLE_ITEM_LAYOUTS).default("full"),
});

const topTracksConfigSchema = z.object({
  time_range: z.enum(["short_term", "medium_term", "long_term"]).default("short_term"),
  limit: z.number().int().min(1).max(10).default(5),
  layout: z.enum(RANKED_LIST_LAYOUTS).default("list"),
});

const topArtistsConfigSchema = z.object({
  time_range: z.enum(["short_term", "medium_term", "long_term"]).default("short_term"),
  limit: z.number().int().min(1).max(10).default(5),
  layout: z.enum(RANKED_LIST_LAYOUTS).default("list"),
});

const recentlyPlayedConfigSchema = z.object({
  limit: z.number().int().min(1).max(10).default(5),
  layout: z.enum(RANKED_LIST_LAYOUTS).default("list"),
});

const topGenresConfigSchema = z.object({
  time_range: z.enum(["short_term", "medium_term", "long_term"]).default("short_term"),
  layout: z.enum(AGGREGATE_STAT_LAYOUTS).default("bars"),
});

const sonicProfileConfigSchema = z.object({
  time_range: z.enum(["short_term", "medium_term", "long_term"]).default("short_term"),
  layout: z.enum(AGGREGATE_STAT_LAYOUTS).default("bars"),
});

const featuredIdConfigSchema = z.object({
  spotifyId: z.string().min(1),
  layout: z.enum(SINGLE_ITEM_LAYOUTS).default("full"),
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
  { id: "now-playing", label: "Now Playing", configSchema: nowPlayingConfigSchema, defaultConfig: { layout: "full" } },
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
    defaultConfig: { time_range: "short_term", limit: 5, layout: "list" },
  },
  {
    id: "recently-played",
    label: "Recently Played",
    configSchema: recentlyPlayedConfigSchema,
    defaultConfig: { limit: 5, layout: "list" },
  },
  {
    id: "top-genres",
    label: "Top Genres",
    configSchema: topGenresConfigSchema,
    defaultConfig: { time_range: "short_term", layout: "bars" },
  },
  {
    id: "sonic-profile",
    label: "Sonic Profile",
    configSchema: sonicProfileConfigSchema,
    defaultConfig: { time_range: "short_term", layout: "bars" },
  },
  {
    id: "featured-track",
    label: "Featured Track",
    configSchema: featuredIdConfigSchema,
    defaultConfig: { spotifyId: "", layout: "full" },
  },
  {
    id: "featured-artist",
    label: "Featured Artist",
    configSchema: featuredIdConfigSchema,
    defaultConfig: { spotifyId: "", layout: "full" },
  },
  {
    id: "featured-playlist",
    label: "Featured Playlist",
    configSchema: featuredIdConfigSchema,
    defaultConfig: { spotifyId: "", layout: "full" },
  },
];

async function renderCard(args: {
  userId: Id<"users">;
  type: string;
  theme: Theme;
  config: unknown;
}): Promise<string> {
  const client = createConvexClient();
  const connection = await client.query(api.connections.getByUserAndProvider, { userId: args.userId, provider: "spotify" });
  if (!connection) return buildErrorCard("Spotify not connected");

  const accessToken = await getValidSpotifyAccessToken(connection);
  const theme = args.theme;

  if (args.type === "now-playing") {
    const parsed = nowPlayingConfigSchema.parse(args.config ?? {});
    const track = await getNowPlaying(accessToken);
    const albumArt = track ? await toDataUri(track.albumImageUrl) : null;
    if (parsed.layout === "full") return buildNowPlayingCard(track, albumArt, theme);
    if (!track) return emptySingleItemCard(theme, "No recent Spotify activity");
    return renderSingleItemLayout(
      parsed.layout as SingleItemGenericLayout,
      { title: track.title, subtitle: track.artist, art: albumArt, statusLabel: track.isPlaying ? "Now Playing" : "Last Played" },
      theme
    );
  }

  if (args.type === "top-tracks") {
    const parsed = topTracksConfigSchema.parse(args.config ?? {});
    const tracks = await getTopTracks(accessToken, parsed.time_range, parsed.limit);
    const withArt: TopTrackWithArt[] = await Promise.all(
      tracks.map(async (track) => ({ track, art: await toDataUri(track.albumImageUrl) }))
    );
    const title = TOP_TRACKS_TITLES[parsed.time_range];
    if (parsed.layout === "list") return buildTopTracksCard(withArt, theme, title);
    if (parsed.layout === "grid") return buildTopTracksGridCard(withArt, theme, title);
    const items: RankedItem[] = withArt.map(({ track, art }) => ({ title: track.title, subtitle: track.artist, art }));
    return renderRankedListLayout(parsed.layout as RankedListGenericLayout, items, theme, title);
  }

  if (args.type === "top-artists") {
    const parsed = topArtistsConfigSchema.parse(args.config ?? {});
    const artists = await getTopArtists(accessToken, parsed.time_range, parsed.limit);
    const withArt: TopArtistWithArt[] = await Promise.all(
      artists.map(async (artist) => ({ artist, art: await toDataUri(artist.imageUrl) }))
    );
    const title = TOP_ARTISTS_TITLES[parsed.time_range];
    if (parsed.layout === "list") return buildTopArtistsCard(withArt, theme, title);
    const items: RankedItem[] = withArt.map(({ artist, art }) => ({ title: artist.name, subtitle: artist.genre, art }));
    return renderRankedListLayout(parsed.layout as RankedListGenericLayout, items, theme, title);
  }

  if (args.type === "recently-played") {
    const parsed = recentlyPlayedConfigSchema.parse(args.config ?? {});
    const tracks = await getRecentlyPlayedList(accessToken, parsed.limit);
    const withArt: RecentTrackWithArt[] = await Promise.all(
      tracks.map(async (track) => ({ track, art: await toDataUri(track.albumImageUrl) }))
    );
    if (parsed.layout === "list") return buildRecentlyPlayedCard(withArt, theme);
    const items: RankedItem[] = withArt.map(({ track, art }) => ({ title: track.title, subtitle: track.artist, art }));
    return renderRankedListLayout(parsed.layout as RankedListGenericLayout, items, theme, "Recently Played");
  }

  if (args.type === "top-genres") {
    const parsed = topGenresConfigSchema.parse(args.config ?? {});
    const artists = await getTopArtists(accessToken, parsed.time_range, 50);
    const genres = computeTopGenres(artists, 5);
    if (parsed.layout === "bars") return buildTopGenresCard(genres, theme);
    const maxCount = Math.max(1, ...genres.map((g) => g.count));
    const metrics = genres.map((g) => ({ label: g.genre, value: g.count / maxCount }));
    return renderAggregateStatLayout(parsed.layout as AggregateStatGenericLayout, { metrics }, theme, "Top Genres");
  }

  if (args.type === "sonic-profile") {
    const parsed = sonicProfileConfigSchema.parse(args.config ?? {});
    const tracks = await getTopTracks(accessToken, parsed.time_range, 20);
    const features = await getAudioFeaturesAverage(
      accessToken,
      tracks.map((t) => t.id)
    );
    if (parsed.layout === "bars") return buildSonicProfileCard(features, theme);
    const metrics = features
      ? [
          { label: "energy", value: features.energy },
          { label: "danceability", value: features.danceability },
          { label: "positivity", value: features.valence },
        ]
      : [];
    const statNumber = features ? { value: features.tempo, label: "BPM AVG TEMPO" } : undefined;
    return renderAggregateStatLayout(parsed.layout as AggregateStatGenericLayout, { metrics, statNumber }, theme, "Sonic Profile");
  }

  if (args.type === "featured-track") {
    const parsed = featuredIdConfigSchema.parse(args.config ?? {});
    const track = await getTrackById(accessToken, parsed.spotifyId);
    const albumArt = track ? await toDataUri(track.albumImageUrl) : null;
    if (parsed.layout === "full") return buildFeaturedTrackCard(track, albumArt, theme);
    if (!track) return emptySingleItemCard(theme, "Track not found");
    return renderSingleItemLayout(
      parsed.layout as SingleItemGenericLayout,
      { title: track.title, subtitle: track.artist, art: albumArt, statusLabel: "Featured Track" },
      theme
    );
  }

  if (args.type === "featured-artist") {
    const parsed = featuredIdConfigSchema.parse(args.config ?? {});
    const artist = await getArtistById(accessToken, parsed.spotifyId);
    const art = artist ? await toDataUri(artist.imageUrl) : null;
    if (parsed.layout === "full") return buildFeaturedArtistCard(artist, art, theme);
    if (!artist) return emptySingleItemCard(theme, "Artist not found");
    return renderSingleItemLayout(
      parsed.layout as SingleItemGenericLayout,
      { title: artist.name, subtitle: artist.genres[0] ?? "Artist", art, statusLabel: "Featured Artist" },
      theme
    );
  }

  if (args.type === "featured-playlist") {
    const parsed = featuredIdConfigSchema.parse(args.config ?? {});
    const playlist = await getPlaylistById(accessToken, parsed.spotifyId);
    const art = playlist ? await toDataUri(playlist.imageUrl) : null;
    if (parsed.layout === "full") return buildFeaturedPlaylistCard(playlist, art, theme);
    if (!playlist) return emptySingleItemCard(theme, "Playlist not found");
    return renderSingleItemLayout(
      parsed.layout as SingleItemGenericLayout,
      { title: playlist.name, subtitle: `${playlist.trackCount} tracks`, art, statusLabel: "Featured Playlist" },
      theme
    );
  }

  throw new Error(`Unknown Spotify card type: ${args.type}`);
}

export const spotifyProvider: Provider = {
  id: "spotify",
  displayName: "Spotify",
  status: "live",
  requiresConnection: true,
  cardTypes: spotifyCardTypes,
  renderCard,
};
