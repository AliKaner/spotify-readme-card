import type { NextApiRequest, NextApiResponse } from "next";
import { getConvexSession } from "../../../../lib/auth/convexSession";
import { exchangeCode, getSpotifyProfile } from "../../../../lib/spotify";
import { verifyState } from "../../../../lib/oauthState";
import { encryptToken } from "../../../../lib/crypto";
import { api } from "../../../../convex/_generated/api";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getConvexSession(req.cookies);
  if (!session) {
    res.redirect(302, "/signin");
    return;
  }

  const { code, state, error } = req.query;

  if (error || typeof code !== "string" || typeof state !== "string") {
    res.redirect(302, "/dashboard?error=spotify_denied");
    return;
  }

  if (!verifyState(state, session.user._id)) {
    res.status(400).send("Invalid or expired authorization state. Please try connecting again.");
    return;
  }

  try {
    const tokens = await exchangeCode(code);
    const profile = await getSpotifyProfile(tokens.accessToken);

    await session.client.mutation(api.connections.upsertForCurrentUser, {
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
