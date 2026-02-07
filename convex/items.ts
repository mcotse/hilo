import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Used by the game engine. Given a metricKey, returns all items that have
 * a fact for that metric, shaped for the game client.
 */
export const listByMetric = query({
  args: { metricKey: v.string() },
  handler: async (ctx, { metricKey }) => {
    // 1. Get all facts for the given metric using the by_metric index
    const metricFacts = await ctx.db
      .query("facts")
      .withIndex("by_metric", (q) => q.eq("metricKey", metricKey))
      .collect();

    // 2. Get unique itemIds from those facts
    const itemIds = [...new Set(metricFacts.map((f) => f.itemId))];

    // 3. Fetch each item and build the return shape
    const results = await Promise.all(
      itemIds.map(async (itemId) => {
        const item = await ctx.db.get(itemId);
        if (!item) return null;

        // Fetch ALL facts for this item (for forward compatibility)
        const allFacts = await ctx.db
          .query("facts")
          .withIndex("by_item", (q) => q.eq("itemId", itemId))
          .collect();

        // Build the facts record
        const facts: Record<
          string,
          { value: number; unit: string; source: string; asOf?: string }
        > = {};
        for (const fact of allFacts) {
          facts[fact.metricKey] = {
            value: fact.value,
            unit: fact.unit,
            source: fact.source,
            ...(fact.asOf ? { asOf: fact.asOf } : {}),
          };
        }

        return {
          id: item.slug,
          name: item.name,
          emoji: item.emoji,
          facts,
        };
      })
    );

    return results.filter((r) => r !== null);
  },
});

/**
 * Used by admin dashboard. Returns all items with their associated facts.
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("items").collect();

    return Promise.all(
      items.map(async (item) => {
        const facts = await ctx.db
          .query("facts")
          .withIndex("by_item", (q) => q.eq("itemId", item._id))
          .collect();

        return {
          ...item,
          facts,
        };
      })
    );
  },
});
