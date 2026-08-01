import { getAuthUserId } from "@convex-dev/auth/server";
import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { MAX_CARDS_PER_USER } from "../lib/limits";

export const listForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return ctx.db
      .query("cards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Public — no auth check. Used by the unauthenticated GET /api/card/[publicId] endpoint.
export const getByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, { publicId }) => {
    return ctx.db
      .query("cards")
      .withIndex("by_public_id", (q) => q.eq("publicId", publicId))
      .unique();
  },
});

export const create = mutation({
  args: {
    publicId: v.string(),
    provider: v.string(),
    type: v.string(),
    theme: v.string(),
    config: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("cards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    if (existing.length >= MAX_CARDS_PER_USER) {
      throw new ConvexError(`You've reached the ${MAX_CARDS_PER_USER}-card limit. Delete one before creating another.`);
    }

    return ctx.db.insert("cards", { userId, ...args });
  },
});

export const remove = mutation({
  args: { id: v.id("cards") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const card = await ctx.db.get(id);
    if (!card || card.userId !== userId) {
      throw new Error("Card not found");
    }

    await ctx.db.delete(id);
  },
});
