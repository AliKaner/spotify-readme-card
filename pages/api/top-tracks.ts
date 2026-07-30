import type { NextApiRequest, NextApiResponse } from "next";
import { getTopTracks, type TimeRange } from "../../lib/spotify";
import { toDataUri } from "../../lib/image";
import { resolveTheme } from "../../lib/themes";
import { buildTopTracksCard, type TopTrackWithArt } from "../../lib/cards/topTracksCard";

const TITLES: Record<TimeRange, string> = {
  short_term: "Top Tracks · 4 Weeks",
  medium_term: "Top Tracks · 6 Months",
  long_term: "Top Tracks · All Time",
};

function parseTimeRange(value: unknown): TimeRange {
  return value === "medium_term" || value === "long_term" ? value : "short_term";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");

  try {
    const theme = resolveTheme(req.query.theme);
    const timeRange = parseTimeRange(req.query.time_range);
    const limit = Math.min(Math.max(Number(req.query.limit) || 5, 1), 10);

    const tracks = await getTopTracks(timeRange, limit);
    const withArt: TopTrackWithArt[] = await Promise.all(
      tracks.map(async (track) => ({ track, art: await toDataUri(track.albumImageUrl) }))
    );

    res.status(200).send(buildTopTracksCard(withArt, theme, TITLES[timeRange]));
  } catch (error) {
    res.status(200).send(errorCard());
  }
}

function errorCard(): string {
  return `<svg width="480" height="100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Unable to load Spotify data">
  <rect width="480" height="100" rx="12" fill="#191414" />
  <text x="240" y="54" text-anchor="middle" fill="#b3b3b3" font-family="Segoe UI, sans-serif" font-size="13">Unable to load Spotify data</text>
</svg>`;
}
