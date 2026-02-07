import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/authGuard";

/**
 * Create a new item.
 */
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    emoji: v.string(),
    tags: v.array(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, { name, slug, emoji, tags, imageUrl }) => {
    await requireAdmin(ctx);
    const now = Date.now();
    return ctx.db.insert("items", {
      name,
      slug,
      emoji,
      tags,
      imageUrl,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update an existing item.
 */
export const update = mutation({
  args: {
    id: v.id("items"),
    name: v.optional(v.string()),
    emoji: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await requireAdmin(ctx);
    // Build a patch object with only the provided fields
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (fields.name !== undefined) patch.name = fields.name;
    if (fields.emoji !== undefined) patch.emoji = fields.emoji;
    if (fields.tags !== undefined) patch.tags = fields.tags;
    if (fields.imageUrl !== undefined) patch.imageUrl = fields.imageUrl;

    await ctx.db.patch(id, patch);
  },
});

/**
 * Delete an item and all its facts.
 */
export const remove = mutation({
  args: {
    id: v.id("items"),
  },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    // First delete all facts associated with this item
    const facts = await ctx.db
      .query("facts")
      .withIndex("by_item", (q) => q.eq("itemId", id))
      .collect();

    for (const fact of facts) {
      await ctx.db.delete(fact._id);
    }

    // Then delete the item itself
    await ctx.db.delete(id);
  },
});

/**
 * Create a new fact for an item.
 */
export const createFact = mutation({
  args: {
    itemId: v.id("items"),
    metricKey: v.string(),
    value: v.number(),
    unit: v.string(),
    source: v.string(),
    sourceUrl: v.optional(v.string()),
    asOf: v.string(),
  },
  handler: async (ctx, { itemId, metricKey, value, unit, source, sourceUrl, asOf }) => {
    await requireAdmin(ctx);
    const now = Date.now();
    return ctx.db.insert("facts", {
      itemId,
      metricKey,
      value,
      unit,
      source,
      sourceUrl,
      asOf,
      status: "unverified",
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update an existing fact.
 */
export const updateFact = mutation({
  args: {
    id: v.id("facts"),
    value: v.optional(v.number()),
    source: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    asOf: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("verified"),
        v.literal("unverified"),
        v.literal("disputed")
      )
    ),
  },
  handler: async (ctx, { id, ...fields }) => {
    await requireAdmin(ctx);
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (fields.value !== undefined) patch.value = fields.value;
    if (fields.source !== undefined) patch.source = fields.source;
    if (fields.sourceUrl !== undefined) patch.sourceUrl = fields.sourceUrl;
    if (fields.asOf !== undefined) patch.asOf = fields.asOf;
    if (fields.status !== undefined) patch.status = fields.status;

    await ctx.db.patch(id, patch);
  },
});

/**
 * Internal mutation for API adapters.
 * Upserts an item by slug and upserts its facts by itemId+metricKey.
 */
export const upsertItem = internalMutation({
  args: {
    slug: v.string(),
    name: v.string(),
    emoji: v.string(),
    tags: v.array(v.string()),
    facts: v.array(
      v.object({
        metricKey: v.string(),
        value: v.number(),
        unit: v.string(),
        source: v.string(),
        sourceUrl: v.optional(v.string()),
        asOf: v.string(),
      })
    ),
  },
  handler: async (ctx, { slug, name, emoji, tags, facts }) => {
    const now = Date.now();

    // Find item by slug
    const existing = await ctx.db
      .query("items")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    let itemId;
    if (existing) {
      // Update existing item
      await ctx.db.patch(existing._id, {
        name,
        emoji,
        tags,
        updatedAt: now,
      });
      itemId = existing._id;
    } else {
      // Insert new item
      itemId = await ctx.db.insert("items", {
        name,
        slug,
        emoji,
        tags,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Upsert each fact
    for (const fact of facts) {
      const existingFact = await ctx.db
        .query("facts")
        .withIndex("by_item_metric", (q) =>
          q.eq("itemId", itemId).eq("metricKey", fact.metricKey)
        )
        .first();

      if (existingFact) {
        await ctx.db.patch(existingFact._id, {
          value: fact.value,
          unit: fact.unit,
          source: fact.source,
          sourceUrl: fact.sourceUrl,
          asOf: fact.asOf,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("facts", {
          itemId,
          metricKey: fact.metricKey,
          value: fact.value,
          unit: fact.unit,
          source: fact.source,
          sourceUrl: fact.sourceUrl,
          asOf: fact.asOf,
          status: "unverified",
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return itemId;
  },
});
