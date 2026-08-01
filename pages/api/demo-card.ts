import type { NextApiRequest, NextApiResponse } from "next";
import { resolveTheme } from "../../lib/themes";
import { buildNowPlayingCard } from "../../lib/cards/nowPlayingCard";
import { buildTopTracksCard, buildTopTracksGridCard, type TopTrackWithArt } from "../../lib/cards/topTracksCard";
import { buildTopArtistsCard, type TopArtistWithArt } from "../../lib/cards/topArtistsCard";
import { buildRecentlyPlayedCard, type RecentTrackWithArt } from "../../lib/cards/recentlyPlayedCard";
import { buildTopGenresCard } from "../../lib/cards/topGenresCard";
import { buildSonicProfileCard } from "../../lib/cards/sonicProfileCard";
import { buildFeaturedTrackCard } from "../../lib/cards/featuredTrackCard";
import { buildFeaturedArtistCard } from "../../lib/cards/featuredArtistCard";
import { buildFeaturedPlaylistCard } from "../../lib/cards/featuredPlaylistCard";
import { renderSingleItemLayout, type SingleItemGenericLayout } from "../../lib/cards/layouts/singleItem";
import { renderRankedListLayout, type RankedItem, type RankedListGenericLayout } from "../../lib/cards/layouts/rankedList";
import { renderAggregateStatLayout, type AggregateStatGenericLayout } from "../../lib/cards/layouts/aggregateStat";
import { computeTopGenres } from "../../lib/spotify";

// Self-contained gradient "album art" — no external image dependency, so the landing
// page's demo never breaks on a dead hotlink. Rendered through the exact same card
// builders and layout engines real cards use, so it's a genuine preview, not a mockup.
function gradientArt(hue: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},75%,58%)"/><stop offset="1" stop-color="hsl(${(hue + 55) % 360},70%,38%)"/></linearGradient></defs><rect width="200" height="200" fill="url(#g)"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

const DEMO_TRACKS = [
  { title: "Midnight City", artist: "M83", hue: 265 },
  { title: "Redbone", artist: "Childish Gambino", hue: 25 },
  { title: "Instant Crush", artist: "Daft Punk, Julian Casablancas", hue: 200 },
  { title: "Everything In Its Right Place", artist: "Radiohead", hue: 140 },
  { title: "Are You Bored Yet?", artist: "Wallows, Clairo", hue: 330 },
];

const DEMO_ARTISTS = [
  { name: "M83", genres: ["dream pop", "electronic"], hue: 265 },
  { name: "Childish Gambino", genres: ["hip hop", "rap"], hue: 25 },
  { name: "Daft Punk", genres: ["french house", "electronic"], hue: 200 },
  { name: "Radiohead", genres: ["art rock", "alternative"], hue: 140 },
  { name: "Wallows", genres: ["indie pop", "alternative"], hue: 330 },
];

const DEMO_PLAYLIST = { name: "Late Night Drive", trackCount: 42, owner: "you", hue: 210 };
const DEMO_SONIC = { energy: 0.74, danceability: 0.68, valence: 0.52, tempo: 118 };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");

  const theme = resolveTheme(typeof req.query.theme === "string" ? req.query.theme : "dracula");
  const type = typeof req.query.type === "string" ? req.query.type : "now-playing";
  const layout = typeof req.query.layout === "string" ? req.query.layout : undefined;
  const track = DEMO_TRACKS[0];

  if (type === "now-playing") {
    const art = gradientArt(track.hue);
    if (!layout || layout === "full") {
      res.status(200).send(
        buildNowPlayingCard({ isPlaying: true, title: track.title, artist: track.artist, album: "", albumImageUrl: undefined, songUrl: "" }, art, theme)
      );
      return;
    }
    res.status(200).send(
      renderSingleItemLayout(layout as SingleItemGenericLayout, { title: track.title, subtitle: track.artist, art, statusLabel: "Now Playing" }, theme)
    );
    return;
  }

  if (type === "featured-track") {
    const art = gradientArt(track.hue);
    if (!layout || layout === "full") {
      res.status(200).send(buildFeaturedTrackCard({ title: track.title, artist: track.artist, album: "", albumImageUrl: undefined, songUrl: "" }, art, theme));
      return;
    }
    res.status(200).send(
      renderSingleItemLayout(layout as SingleItemGenericLayout, { title: track.title, subtitle: track.artist, art, statusLabel: "Featured Track" }, theme)
    );
    return;
  }

  if (type === "featured-artist") {
    const a = DEMO_ARTISTS[0];
    const art = gradientArt(a.hue);
    if (!layout || layout === "full") {
      res.status(200).send(buildFeaturedArtistCard({ name: a.name, genres: a.genres, imageUrl: undefined, followers: 4_200_000, artistUrl: "" }, art, theme));
      return;
    }
    res.status(200).send(
      renderSingleItemLayout(layout as SingleItemGenericLayout, { title: a.name, subtitle: a.genres[0], art, statusLabel: "Featured Artist" }, theme)
    );
    return;
  }

  if (type === "featured-playlist") {
    const art = gradientArt(DEMO_PLAYLIST.hue);
    if (!layout || layout === "full") {
      res.status(200).send(
        buildFeaturedPlaylistCard(
          { name: DEMO_PLAYLIST.name, imageUrl: undefined, trackCount: DEMO_PLAYLIST.trackCount, owner: DEMO_PLAYLIST.owner, playlistUrl: "" },
          art,
          theme
        )
      );
      return;
    }
    res.status(200).send(
      renderSingleItemLayout(
        layout as SingleItemGenericLayout,
        { title: DEMO_PLAYLIST.name, subtitle: `${DEMO_PLAYLIST.trackCount} tracks`, art, statusLabel: "Featured Playlist" },
        theme
      )
    );
    return;
  }

  if (type === "top-tracks") {
    const withArt: TopTrackWithArt[] = DEMO_TRACKS.map((t) => ({
      track: { id: "", title: t.title, artist: t.artist, albumImageUrl: undefined, songUrl: "" },
      art: gradientArt(t.hue),
    }));
    const title = "Top Tracks · 4 Weeks";
    if (!layout || layout === "list") {
      res.status(200).send(buildTopTracksCard(withArt, theme, title));
      return;
    }
    if (layout === "grid") {
      res.status(200).send(buildTopTracksGridCard(withArt, theme, title));
      return;
    }
    const items: RankedItem[] = withArt.map(({ track: t, art }) => ({ title: t.title, subtitle: t.artist, art }));
    res.status(200).send(renderRankedListLayout(layout as RankedListGenericLayout, items, theme, title));
    return;
  }

  if (type === "top-artists") {
    const withArt: TopArtistWithArt[] = DEMO_ARTISTS.map((a) => ({
      artist: { name: a.name, genre: a.genres[0], genres: a.genres, artistUrl: "" },
      art: gradientArt(a.hue),
    }));
    const title = "Top Artists · 4 Weeks";
    if (!layout || layout === "list") {
      res.status(200).send(buildTopArtistsCard(withArt, theme, title));
      return;
    }
    const items: RankedItem[] = withArt.map(({ artist, art }) => ({ title: artist.name, subtitle: artist.genre, art }));
    res.status(200).send(renderRankedListLayout(layout as RankedListGenericLayout, items, theme, title));
    return;
  }

  if (type === "recently-played") {
    const withArt: RecentTrackWithArt[] = DEMO_TRACKS.map((t, i) => ({
      track: { title: t.title, artist: t.artist, albumImageUrl: undefined, songUrl: "", playedAt: new Date(Date.now() - i * 3600_000).toISOString() },
      art: gradientArt(t.hue),
    }));
    if (!layout || layout === "list") {
      res.status(200).send(buildRecentlyPlayedCard(withArt, theme));
      return;
    }
    const items: RankedItem[] = withArt.map(({ track: t, art }) => ({ title: t.title, subtitle: t.artist, art }));
    res.status(200).send(renderRankedListLayout(layout as RankedListGenericLayout, items, theme, "Recently Played"));
    return;
  }

  if (type === "top-genres") {
    const artists = DEMO_ARTISTS.map((a) => ({ name: a.name, genres: a.genres, artistUrl: "" }));
    const genres = computeTopGenres(artists, 5);
    if (!layout || layout === "bars") {
      res.status(200).send(buildTopGenresCard(genres, theme));
      return;
    }
    const maxCount = Math.max(1, ...genres.map((g) => g.count));
    const metrics = genres.map((g) => ({ label: g.genre, value: g.count / maxCount }));
    res.status(200).send(renderAggregateStatLayout(layout as AggregateStatGenericLayout, { metrics }, theme, "Top Genres"));
    return;
  }

  if (type === "sonic-profile") {
    if (!layout || layout === "bars") {
      res.status(200).send(buildSonicProfileCard(DEMO_SONIC, theme));
      return;
    }
    const metrics = [
      { label: "energy", value: DEMO_SONIC.energy },
      { label: "danceability", value: DEMO_SONIC.danceability },
      { label: "positivity", value: DEMO_SONIC.valence },
    ];
    res.status(200).send(
      renderAggregateStatLayout(
        layout as AggregateStatGenericLayout,
        { metrics, statNumber: { value: DEMO_SONIC.tempo, label: "BPM AVG TEMPO" } },
        theme,
        "Sonic Profile"
      )
    );
    return;
  }

  res.status(400).send("Unknown demo card type");
}
