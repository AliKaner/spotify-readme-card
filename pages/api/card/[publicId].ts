import type { NextApiRequest, NextApiResponse } from "next";
import { createConvexClient } from "../../../lib/convexClient";
import { resolveTheme } from "../../../lib/themes";
import { getProvider } from "../../../lib/providers/registry";
import { api } from "../../../convex/_generated/api";

const CACHE_BY_TYPE: Record<string, string> = {
  "now-playing": "s-maxage=1, stale-while-revalidate",
  "top-tracks": "s-maxage=3600, stale-while-revalidate",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "image/svg+xml");

  const { publicId } = req.query;
  if (typeof publicId !== "string") {
    res.status(400).send(errorCard("Invalid card id"));
    return;
  }

  try {
    const client = createConvexClient();
    const card = await client.query(api.cards.getByPublicId, { publicId });
    if (!card) {
      res.setHeader("Cache-Control", "no-store");
      res.status(404).send(errorCard("Card not found"));
      return;
    }

    res.setHeader("Cache-Control", CACHE_BY_TYPE[card.type] ?? "s-maxage=60, stale-while-revalidate");

    const provider = getProvider(card.provider);
    if (!provider) {
      res.status(200).send(errorCard("Unknown provider"));
      return;
    }

    const connection = await client.query(api.connections.getByUserAndProvider, {
      userId: card.userId,
      provider: card.provider,
    });
    if (!connection) {
      res.status(200).send(errorCard(`${provider.displayName} not connected`));
      return;
    }

    const theme = resolveTheme(card.theme);
    const svg = await provider.renderCard({ connection, type: card.type, theme, config: card.config });

    res.status(200).send(svg);
  } catch (error) {
    console.error(`GET /api/card/${publicId} failed:`, error);
    res.status(200).send(errorCard("Unable to load card data"));
  }
}

function errorCard(message: string): string {
  return `<svg width="480" height="140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${message}">
  <rect width="480" height="140" rx="12" fill="#191414" />
  <text x="240" y="74" text-anchor="middle" fill="#b3b3b3" font-family="Segoe UI, sans-serif" font-size="13">${message}</text>
</svg>`;
}
