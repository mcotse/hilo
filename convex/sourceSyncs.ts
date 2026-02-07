import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Record a sync result from an adapter run.
 * Internal-only — called by adapter actions after fetching data.
 */
export const recordSync = internalMutation({
  args: {
    adapterName: v.string(),
    lastSyncAt: v.number(),
    itemsFetched: v.number(),
    status: v.union(v.literal("success"), v.literal("error")),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("sourceSyncs", {
      adapterName: args.adapterName,
      lastSyncAt: args.lastSyncAt,
      itemsFetched: args.itemsFetched,
      status: args.status,
      error: args.error,
    });
  },
});

/**
 * Get the most recent sync record for each adapter.
 * Useful for a dashboard overview of all adapters.
 */
export const getLatest = query({
  args: {},
  handler: async (ctx) => {
    const allSyncs = await ctx.db.query("sourceSyncs").collect();

    // Group by adapterName and keep only the most recent
    const latestByAdapter = new Map<string, (typeof allSyncs)[number]>();
    for (const sync of allSyncs) {
      const existing = latestByAdapter.get(sync.adapterName);
      if (!existing || sync.lastSyncAt > existing.lastSyncAt) {
        latestByAdapter.set(sync.adapterName, sync);
      }
    }

    return Array.from(latestByAdapter.values());
  },
});

/**
 * List sync history for a specific adapter, sorted by time descending.
 */
export const listByAdapter = query({
  args: {
    adapterName: v.string(),
  },
  handler: async (ctx, { adapterName }) => {
    const syncs = await ctx.db
      .query("sourceSyncs")
      .withIndex("by_adapter", (q) => q.eq("adapterName", adapterName))
      .collect();

    // Sort by lastSyncAt descending (most recent first)
    return syncs.sort((a, b) => b.lastSyncAt - a.lastSyncAt);
  },
});
