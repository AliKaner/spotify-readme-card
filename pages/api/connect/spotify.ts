import type { NextApiRequest, NextApiResponse } from "next";
import { getConvexSession } from "../../../lib/auth/convexSession";
import { buildAuthorizeUrl } from "../../../lib/spotify";
import { signState } from "../../../lib/oauthState";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getConvexSession(req.cookies);
  if (!session) {
    res.redirect(302, `/signin?callbackUrl=${encodeURIComponent("/dashboard")}`);
    return;
  }

  const state = signState(session.user._id);
  res.redirect(302, buildAuthorizeUrl(state));
}
