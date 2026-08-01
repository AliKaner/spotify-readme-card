import type { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { createConvexClient } from "../convexClient";

export interface ConvexSession {
  client: ConvexHttpClient;
  user: Doc<"users">;
}

function extractBearerToken(authHeader: string | string[] | undefined): string | null {
  const header = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}

/**
 * Authenticates a server-side ConvexHttpClient using the JWT the client sent as an
 * `Authorization: Bearer <token>` header (obtained client-side via `useAuthToken()`).
 * Convex Auth's own token storage (localStorage by default) has no framework-level bridge
 * into Pages Router API routes, so callers must explicitly forward the token themselves.
 */
export async function getConvexSessionFromRequest(
  authHeader: string | string[] | undefined
): Promise<ConvexSession | null> {
  const token = extractBearerToken(authHeader);
  if (!token) return null;

  const client = createConvexClient();
  client.setAuth(token);

  const user = await client.query(api.users.me, {});
  if (!user) return null;

  return { client, user };
}
