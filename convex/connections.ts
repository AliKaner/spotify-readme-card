import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

async function findConnection(ctx: QueryCtx, userId: Id<"users">, provider: string) {
  return ctx.db
    .query("connections")
    .withIndex("by_user_provider", (q) => q.eq("userId", userId).eq("provider", provider))
    .unique();
}

export const getForCurrentUser = query({
  args: { provider: v.string() },
  handler: async (ctx, { provider }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return findConnection(ctx, userId, provider);
  },
});

/**
 * Service-level lookup with no auth check — used by the public, unauthenticated
 * /api/card/[publicId] endpoint, which never has a bridged user session. Safe because
 * only our own trusted Next.js server calls this, scoped to a userId it already
 * resolved via the card's own owner (never taken from an arbitrary caller).
 */
export const getByUserAndProvider = query({
  args: { userId: v.id("users"), provider: v.string() },
  handler: async (ctx, { userId, provider }) => findConnection(ctx, userId, provider),
});

export const upsertForCurrentUser = mutation({
  args: {
    provider: v.string(),
    externalId: v.optional(v.string()),
    displayName: v.optional(v.string()),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiresAt: v.number(),
    scope: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await findConnection(ctx, userId, args.provider);
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return ctx.db.insert("connections", { userId, ...args });
  },
});

// Service-level — called after a background token refresh triggered by the public
// card endpoint, so it can't be gated on the (nonexistent, in that context) caller session.
export const updateTokens = mutation({
  args: {
    connectionId: v.id("connections"),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, { connectionId, accessToken, refreshToken, expiresAt }) => {
    await ctx.db.patch(connectionId, { accessToken, refreshToken, expiresAt });
  },
});
