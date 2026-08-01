import type { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { createConvexClient } from "../convexClient";
import { CONVEX_AUTH_JWT_COOKIE } from "./convexAuthCookies";

export interface ConvexSession {
  client: ConvexHttpClient;
  user: Doc<"users">;
}

/**
 * Bridges the client-side Convex Auth JWT (persisted to a cookie by our custom
 * TokenStorage, see lib/auth/convexTokenStorage.ts) into a server-side authenticated
 * ConvexHttpClient. Known limitation: if the JWT has expired since the client last
 * refreshed it, this returns null even though the user has a valid refresh token —
 * there is no supported server-side refresh path on the Pages Router (see plan notes).
 */
export async function getConvexSession(cookies: Partial<Record<string, string>>): Promise<ConvexSession | null> {
  const token = cookies[CONVEX_AUTH_JWT_COOKIE];
  if (!token) return null;

  const client = createConvexClient();
  client.setAuth(token);

  const user = await client.query(api.users.me, {});
  if (!user) return null;

  return { client, user };
}
