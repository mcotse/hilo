import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  items: defineTable({
    name: v.string(),
    slug: v.string(),
    emoji: v.string(),
    imageUrl: v.optional(v.string()),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"]),

  facts: defineTable({
    itemId: v.id("items"),
    metricKey: v.string(),
    value: v.number(),
    unit: v.string(),
    source: v.string(),
    sourceUrl: v.optional(v.string()),
    asOf: v.string(),
    status: v.union(
      v.literal("verified"),
      v.literal("unverified"),
      v.literal("disputed")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_item", ["itemId"])
    .index("by_metric", ["metricKey"])
    .index("by_item_metric", ["itemId", "metricKey"])
    .index("by_status", ["status"]),

  categories: defineTable({
    label: v.string(),
    question: v.string(),
    metricKey: v.string(),
    color: v.string(),
    unit: v.string(),
    formatPattern: v.string(),
    enabled: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_metricKey", ["metricKey"])
    .index("by_enabled", ["enabled"]),

  disputes: defineTable({
    factId: v.id("facts"),
    reason: v.optional(v.string()),
    comment: v.optional(v.string()),
    status: v.union(
      v.literal("open"),
      v.literal("resolved"),
      v.literal("dismissed")
    ),
    resolvedBy: v.optional(v.string()),
    resolution: v.optional(v.string()),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_fact", ["factId"])
    .index("by_status", ["status"]),

  sourceSyncs: defineTable({
    adapterName: v.string(),
    lastSyncAt: v.number(),
    itemsFetched: v.number(),
    status: v.union(
      v.literal("success"),
      v.literal("error")
    ),
    error: v.optional(v.string()),
  })
    .index("by_adapter", ["adapterName"]),
});
