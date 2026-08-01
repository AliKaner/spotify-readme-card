import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

async function lookupGithubAccountId(ctx: QueryCtx, userId: Id<"users">) {
  const account = await ctx.db
    .query("authAccounts")
    .withIndex("userIdAndProvider", (q) => q.eq("userId", userId).eq("provider", "github"))
    .unique();
  return account?.providerAccountId ?? null;
}

/**
 * Convex Auth's own `authAccounts` table already stores the GitHub numeric account id
 * (`providerAccountId`) for every logged-in user — no extra OAuth scope needed to read
 * it back, since GitHub's public REST API can look up a user's full public profile by
 * that id alone (`GET /user/{id}`), no token or scope required.
 */
export const getForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return lookupGithubAccountId(ctx, userId);
  },
});

export const getForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => lookupGithubAccountId(ctx, userId),
});
