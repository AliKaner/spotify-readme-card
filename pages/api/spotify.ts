import type { NextApiRequest, NextApiResponse } from "next";
import { getNowPlaying } from "../../lib/spotify";
import { toDataUri } from "../../lib/image";
import { resolveTheme } from "../../lib/themes";
import { buildNowPlayingCard } from "../../lib/cards/nowPlayingCard";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate");

  try {
    const theme = resolveTheme(req.query.theme);
    const track = await getNowPlaying();
    const albumArt = track ? await toDataUri(track.albumImageUrl) : null;

    res.status(200).send(buildNowPlayingCard(track, albumArt, theme));
  } catch (error) {
    console.error("GET /api/spotify failed:", error);
    res.status(200).send(errorCard());
  }
}

function errorCard(): string {
  return `<svg width="480" height="140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Unable to load Spotify data">
  <rect width="480" height="140" rx="12" fill="#191414" />
  <text x="240" y="74" text-anchor="middle" fill="#b3b3b3" font-family="Segoe UI, sans-serif" font-size="13">Unable to load Spotify data</text>
</svg>`;
}
