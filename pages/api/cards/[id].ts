import type { NextApiRequest, NextApiResponse } from "next";
import { getConvexSession } from "../../../lib/auth/convexSession";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getConvexSession(req.cookies);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { id } = req.query;
  if (typeof id !== "string") {
    res.status(400).json({ error: "Invalid card id" });
    return;
  }

  if (req.method === "DELETE") {
    try {
      await session.client.mutation(api.cards.remove, { id: id as Id<"cards"> });
      res.status(204).end();
    } catch (error) {
      console.error(`DELETE /api/cards/${id} failed:`, error);
      res.status(404).json({ error: "Card not found" });
    }
    return;
  }

  res.setHeader("Allow", "DELETE");
  res.status(405).json({ error: "Method not allowed" });
}
