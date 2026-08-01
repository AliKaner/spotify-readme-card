import type { NextApiRequest, NextApiResponse } from "next";
import { getConvexSessionFromRequest } from "../../../lib/auth/convexSession";
import { buildAuthorizeUrl } from "../../../lib/spotify";
import { signState } from "../../../lib/oauthState";

// Called via fetch() with an Authorization header (not a plain <a href> navigation —
// browsers won't attach custom headers to a top-level navigation), so it returns the
// authorize URL as JSON and lets the client do `window.location.href = url`.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getConvexSessionFromRequest(req.headers.authorization);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const state = signState(session.user._id);
  res.status(200).json({ url: buildAuthorizeUrl(state) });
}
