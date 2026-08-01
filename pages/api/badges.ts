import type { NextApiRequest, NextApiResponse } from "next";
import { getConvexSessionFromRequest } from "../../lib/auth/convexSession";
import { getAllBadgesForUser } from "../../lib/achievementsData";

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

  const badges = await getAllBadgesForUser(session.user._id);
  const earnedCount = badges.filter((b) => b.earned).length;

  res.status(200).json({ badges, total: badges.length, earnedCount });
}
