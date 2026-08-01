import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  connections: defineTable({
    userId: v.id("users"),
    provider: v.string(), // e.g. "spotify" — plain string so new providers need no migration
    externalId: v.optional(v.string()),
    displayName: v.optional(v.string()),
    accessToken: v.string(), // AES-256-GCM encrypted
    refreshToken: v.string(), // AES-256-GCM encrypted
    expiresAt: v.number(), // epoch ms
    scope: v.optional(v.string()),
  }).index("by_user_provider", ["userId", "provider"]),

  cards: defineTable({
    userId: v.id("users"),
    publicId: v.string(), // nanoid(12), used in the public embed URL
    provider: v.string(), // e.g. "spotify"
    type: v.string(), // e.g. "now-playing" | "top-tracks"
    theme: v.string(),
    config: v.any(),
  })
    .index("by_public_id", ["publicId"])
    .index("by_user", ["userId"]),
});
