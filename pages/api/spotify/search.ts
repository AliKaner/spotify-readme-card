import type { NextApiRequest, NextApiResponse } from "next";
import { getConvexSessionFromRequest } from "../../../lib/auth/convexSession";
import { getValidSpotifyAccessToken } from "../../../lib/connections";
import { searchSpotify, type SearchType } from "../../../lib/spotify";
import { api } from "../../../convex/_generated/api";

const VALID_TYPES: SearchType[] = ["track", "artist", "playlist"];

// Authenticated proxy to Spotify's catalog search, used by the "feature a specific
// track/artist/playlist" picker UI. Uses the caller's own Spotify connection.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const session = await getConvexSessionFromRequest(req.headers.authorization);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { q, type } = req.query;
  if (typeof q !== "string" || typeof type !== "string" || !VALID_TYPES.includes(type as SearchType)) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }

  const connection = await session.client.query(api.connections.getForCurrentUser, { provider: "spotify" });
  if (!connection) {
    res.status(400).json({ error: "Connect Spotify first." });
    return;
  }

  const accessToken = await getValidSpotifyAccessToken(connection);
  const results = await searchSpotify(accessToken, q, type as SearchType);
  res.status(200).json({ results });
}
