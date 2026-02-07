import { query } from "./_generated/server";

/**
 * Used by the game. Returns all enabled categories sorted by sortOrder ascending.
 */
export const listEnabled = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_enabled", (q) => q.eq("enabled", true))
      .collect();

    return categories.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

/**
 * Used by admin dashboard. Returns all categories.
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("categories").collect();
  },
});
