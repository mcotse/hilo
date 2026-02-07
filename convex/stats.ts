import { query } from "./_generated/server";

export const overview = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("items").collect();
    const facts = await ctx.db.query("facts").collect();
    const openDisputes = await ctx.db
      .query("disputes")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_enabled", (q) => q.eq("enabled", true))
      .collect();

    // Count facts per metric
    const factsByMetric: Record<string, number> = {};
    for (const fact of facts) {
      factsByMetric[fact.metricKey] = (factsByMetric[fact.metricKey] ?? 0) + 1;
    }

    // Count items by verification status
    const verifiedFacts = facts.filter((f) => f.status === "verified").length;
    const unverifiedFacts = facts.filter(
      (f) => f.status === "unverified"
    ).length;

    return {
      totalItems: items.length,
      totalFacts: facts.length,
      verifiedFacts,
      unverifiedFacts,
      openDisputes: openDisputes.length,
      enabledCategories: categories.length,
      factsByMetric,
    };
  },
});
