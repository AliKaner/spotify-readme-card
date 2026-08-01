import type { NextApiRequest, NextApiResponse } from "next";
import { createConvexClient } from "../../../lib/convexClient";
import { resolveTheme } from "../../../lib/themes";
import { getProvider } from "../../../lib/providers/registry";
import { buildErrorCard } from "../../../lib/cards/errorCard";
import { api } from "../../../convex/_generated/api";

const CACHE_BY_TYPE: Record<string, string> = {
  "now-playing": "s-maxage=1, stale-while-revalidate",
  "top-tracks": "s-maxage=3600, stale-while-revalidate",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "image/svg+xml");

  const { publicId } = req.query;
  if (typeof publicId !== "string") {
    res.status(400).send(buildErrorCard("Invalid card id"));
    return;
  }

  try {
    const client = createConvexClient();
    const card = await client.query(api.cards.getByPublicId, { publicId });
    if (!card) {
      res.setHeader("Cache-Control", "no-store");
      res.status(404).send(buildErrorCard("Card not found"));
      return;
    }

    res.setHeader("Cache-Control", CACHE_BY_TYPE[card.type] ?? "s-maxage=60, stale-while-revalidate");

    const provider = getProvider(card.provider);
    if (!provider) {
      res.status(200).send(buildErrorCard("Unknown provider"));
      return;
    }

    const theme = resolveTheme(card.theme);
    const svg = await provider.renderCard({ userId: card.userId, type: card.type, theme, config: card.config });

    res.status(200).send(svg);
  } catch (error) {
    console.error(`GET /api/card/${publicId} failed:`, error);
    res.status(200).send(buildErrorCard("Unable to load card data"));
  }
}
