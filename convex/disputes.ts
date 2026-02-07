import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/authGuard";

/**
 * Player submits a dispute against a fact (no auth required).
 * Rejects if an open dispute already exists for the same fact.
 */
export const submit = mutation({
  args: {
    factId: v.id("facts"),
    reason: v.optional(v.string()),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, { factId, reason, comment }) => {
    // Check the fact exists
    const fact = await ctx.db.get(factId);
    if (!fact) {
      return { success: false, reason: "Fact not found" };
    }

    // Check for an existing open dispute on the same fact
    const existing = await ctx.db
      .query("disputes")
      .withIndex("by_fact", (q) => q.eq("factId", factId))
      .filter((q) => q.eq(q.field("status"), "open"))
      .first();

    if (existing) {
      return { success: false, reason: "An open dispute already exists for this fact" };
    }

    await ctx.db.insert("disputes", {
      factId,
      reason,
      comment,
      status: "open",
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Admin: list disputes with optional status filter.
 */
export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("open"),
        v.literal("resolved"),
        v.literal("dismissed")
      )
    ),
  },
  handler: async (ctx, { status }) => {
    await requireAdmin(ctx);
    if (status) {
      return ctx.db
        .query("disputes")
        .withIndex("by_status", (q) => q.eq("status", status))
        .collect();
    }
    return ctx.db.query("disputes").collect();
  },
});

/**
 * Admin: resolve a dispute.
 */
export const resolve = mutation({
  args: {
    disputeId: v.id("disputes"),
    resolution: v.string(),
    resolvedBy: v.string(),
  },
  handler: async (ctx, { disputeId, resolution, resolvedBy }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(disputeId, {
      status: "resolved",
      resolution,
      resolvedBy,
      resolvedAt: Date.now(),
    });
  },
});

/**
 * Admin: dismiss a dispute.
 */
export const dismiss = mutation({
  args: {
    disputeId: v.id("disputes"),
    resolution: v.optional(v.string()),
    resolvedBy: v.string(),
  },
  handler: async (ctx, { disputeId, resolution, resolvedBy }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(disputeId, {
      status: "dismissed",
      resolution,
      resolvedBy,
      resolvedAt: Date.now(),
    });
  },
});

/**
 * Get count of disputes for a given fact.
 */
export const countByFact = query({
  args: {
    factId: v.id("facts"),
  },
  handler: async (ctx, { factId }) => {
    const disputes = await ctx.db
      .query("disputes")
      .withIndex("by_fact", (q) => q.eq("factId", factId))
      .collect();
    return disputes.length;
  },
});
