import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { getConvexSessionFromRequest } from "../../../lib/auth/convexSession";
import { getProvider } from "../../../lib/providers/registry";
import { themes } from "../../../lib/themes";
import { api } from "../../../convex/_generated/api";
import { nanoid } from "nanoid";

const createCardSchema = z.object({
  provider: z.string(),
  type: z.string(),
  theme: z.string(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getConvexSessionFromRequest(req.headers.authorization);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { client } = session;

  if (req.method === "GET") {
    const cards = await client.query(api.cards.listForCurrentUser, {});
    res.status(200).json({ cards });
    return;
  }

  if (req.method === "POST") {
    const parsed = createCardSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
      return;
    }

    const { provider: providerId, type, theme, config } = parsed.data;

    const provider = getProvider(providerId);
    if (!provider) {
      res.status(400).json({ error: `Unknown provider "${providerId}".` });
      return;
    }

    const cardType = provider.cardTypes.find((ct) => ct.id === type);
    if (!cardType) {
      res.status(400).json({ error: `Unknown card type "${type}" for provider "${providerId}".` });
      return;
    }

    if (!themes[theme]) {
      res.status(400).json({ error: `Unknown theme "${theme}".` });
      return;
    }

    const connection = await client.query(api.connections.getForCurrentUser, { provider: providerId });
    if (!connection) {
      res.status(400).json({ error: `Connect ${provider.displayName} before creating a card.` });
      return;
    }

    const configParse = cardType.configSchema.safeParse(config ?? {});
    if (!configParse.success) {
      res.status(400).json({ error: "Invalid card config", details: configParse.error.flatten() });
      return;
    }

    const cardId = await client.mutation(api.cards.create, {
      publicId: nanoid(12),
      provider: providerId,
      type,
      theme,
      config: configParse.data,
    });

    res.status(201).json({ cardId });
    return;
  }

  res.setHeader("Allow", "GET, POST");
  res.status(405).json({ error: "Method not allowed" });
}
