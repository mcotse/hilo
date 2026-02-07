import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/authGuard";

/**
 * Create a new category.
 */
export const create = mutation({
  args: {
    label: v.string(),
    question: v.string(),
    metricKey: v.string(),
    color: v.string(),
    unit: v.string(),
    formatPattern: v.string(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return ctx.db.insert("categories", {
      ...args,
      enabled: true,
    });
  },
});

/**
 * Update an existing category.
 */
export const update = mutation({
  args: {
    id: v.id("categories"),
    label: v.optional(v.string()),
    question: v.optional(v.string()),
    color: v.optional(v.string()),
    formatPattern: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await requireAdmin(ctx);
    const patch: Record<string, unknown> = {};
    if (fields.label !== undefined) patch.label = fields.label;
    if (fields.question !== undefined) patch.question = fields.question;
    if (fields.color !== undefined) patch.color = fields.color;
    if (fields.formatPattern !== undefined) patch.formatPattern = fields.formatPattern;
    if (fields.enabled !== undefined) patch.enabled = fields.enabled;
    if (fields.sortOrder !== undefined) patch.sortOrder = fields.sortOrder;

    await ctx.db.patch(id, patch);
  },
});
