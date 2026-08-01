import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { getConvexSessionFromRequest } from "../../../lib/auth/convexSession";
import { getProvider } from "../../../lib/providers/registry";
import { resolveTheme, themes } from "../../../lib/themes";
import { api } from "../../../convex/_generated/api";

const previewSchema = z.object({
  provider: z.string(),
  type: z.string(),
  theme: z.string(),
  config: z.record(z.string(), z.unknown()).optional(),
});

// Authenticated, no persistence — renders a card from in-progress form state (not yet
// saved) so the dashboard's "new card" screen can show a live preview as the user tweaks
// options.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const session = await getConvexSessionFromRequest(req.headers.authorization);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = previewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { provider: providerId, type, theme, config } = parsed.data;

  const provider = getProvider(providerId);
  const cardType = provider?.cardTypes.find((ct) => ct.id === type);
  if (!provider || !cardType || !themes[theme]) {
    res.status(400).json({ error: "Invalid card parameters" });
    return;
  }

  if (provider.requiresConnection) {
    const connection = await session.client.query(api.connections.getForCurrentUser, { provider: providerId });
    if (!connection) {
      res.status(400).json({ error: `Connect ${provider.displayName} first.` });
      return;
    }
  }

  const configParse = cardType.configSchema.safeParse(config ?? {});
  if (!configParse.success) {
    res.status(400).json({ error: "Invalid card config" });
    return;
  }

  try {
    const svg = await provider.renderCard({
      userId: session.user._id,
      type,
      theme: resolveTheme(theme),
      config: configParse.data,
    });
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(svg);
  } catch (error) {
    console.error("Card preview failed:", error);
    res.status(500).json({ error: "Failed to render preview" });
  }
}
