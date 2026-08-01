import type { NextApiRequest, NextApiResponse } from "next";
import { exchangeCode, getSpotifyProfile } from "../../../../lib/spotify";
import { verifyAndExtractUserId } from "../../../../lib/oauthState";
import { encryptToken } from "../../../../lib/crypto";
import { createConvexClient } from "../../../../lib/convexClient";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

// Spotify redirects the browser here directly (a plain GET, no Authorization header
// available). Trust flows through the signed OAuth state instead of a bridged session —
// see lib/oauthState.ts.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, state, error } = req.query;

  if (error || typeof code !== "string" || typeof state !== "string") {
    res.redirect(302, "/dashboard?error=spotify_denied");
    return;
  }

  const userId = verifyAndExtractUserId(state);
  if (!userId) {
    res.status(400).send("Invalid or expired authorization state. Please try connecting again.");
    return;
  }

  try {
    const tokens = await exchangeCode(code);
    const profile = await getSpotifyProfile(tokens.accessToken);

    const client = createConvexClient();
    await client.mutation(api.connections.upsertForUser, {
      userId: userId as Id<"users">,
      provider: "spotify",
      accessToken: encryptToken(tokens.accessToken),
      refreshToken: encryptToken(tokens.refreshToken),
      expiresAt: tokens.expiresAt.getTime(),
      scope: tokens.scope,
      externalId: profile?.id,
      displayName: profile?.displayName,
    });

    res.redirect(302, "/dashboard");
  } catch (err) {
    console.error("Spotify connect callback failed:", err);
    res.redirect(302, "/dashboard?error=spotify_connect_failed");
  }
}
