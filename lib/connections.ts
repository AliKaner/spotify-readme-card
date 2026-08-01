import { encryptToken, decryptToken } from "./crypto";
import { refreshSpotifyToken } from "./spotify";
import { createConvexClient } from "./convexClient";
import { api } from "../convex/_generated/api";
import type { Doc } from "../convex/_generated/dataModel";

// Refresh a little before actual expiry so the served card never hits a stale token.
const REFRESH_MARGIN_MS = 60 * 1000;

export async function getValidSpotifyAccessToken(connection: Doc<"connections">): Promise<string> {
  if (connection.expiresAt > Date.now() + REFRESH_MARGIN_MS) {
    return decryptToken(connection.accessToken);
  }

  const refreshed = await refreshSpotifyToken(decryptToken(connection.refreshToken));

  const client = createConvexClient();
  await client.mutation(api.connections.updateTokens, {
    connectionId: connection._id,
    accessToken: encryptToken(refreshed.accessToken),
    refreshToken: encryptToken(refreshed.refreshToken),
    expiresAt: refreshed.expiresAt.getTime(),
  });

  return refreshed.accessToken;
}
