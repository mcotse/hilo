# Dataset Enrichment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the hardcoded dataset with a Convex-backed data layer, add a player dispute flow, and build an admin dashboard for content management.

**Architecture:** Convex backend as single source of truth. Game client reads items/categories via reactive queries. Admin dashboard lives as protected `/admin/*` routes (react-router) in the same React app, behind Clerk auth. API source adapters are Convex actions that fetch from external APIs and upsert via internal mutations.

**Tech Stack:** Convex, Clerk, React 19, React Router, Vite, Tailwind CSS, Motion/React

**Worktree:** `/Users/mcotse/Developer/higher-lower/.worktrees/dataset-enrichment` (branch: `feature/dataset-enrichment`)

---

## Task 1: Initialize Convex and define schema

**Files:**
- Create: `convex/schema.ts`
- Create: `convex/auth.config.ts`
- Modify: `package.json` (add dependencies)
- Modify: `.gitignore` (add `.env.local`)

**Step 1: Install Convex and Clerk packages**

Run:
```bash
cd /Users/mcotse/Developer/higher-lower/.worktrees/dataset-enrichment
npm install convex @clerk/clerk-react
```

**Step 2: Initialize Convex project**

Run:
```bash
npx convex dev --once
```

This creates the `convex/` directory with `_generated/` and prompts for project setup. Follow the prompts to create a new project named `higher-lower`.

**Step 3: Add `.env.local` to `.gitignore`**

Check if `.env.local` is already covered by `*.local` in `.gitignore`. It is — the existing `.gitignore` has `*.local`. No action needed.

**Step 4: Write the schema**

Create `convex/schema.ts`:

```typescript
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
```

**Step 5: Write auth config**

Create `convex/auth.config.ts`:

```typescript
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
};
```

**Step 6: Verify schema pushes cleanly**

Run:
```bash
npx convex dev --once
```

Expected: Schema deploys with no errors.

**Step 7: Commit**

```bash
git add convex/ package.json package-lock.json .gitignore
git commit -m "feat: initialize Convex with schema for items, facts, categories, disputes"
```

---

## Task 2: Write seed script to migrate existing data

**Files:**
- Create: `convex/seed.ts`
- Read: `src/data/items.ts` (existing 151 items)
- Read: `src/data/categories.ts` (existing 5 categories)

**Step 1: Create the seed data file**

Create `convex/seed.ts` that contains the existing items and categories as constants, plus an `internalMutation` that inserts them all. The seed must:
- Read the existing item data from `src/data/items.ts` format
- For each item: insert into `items` table, then insert each fact into `facts` table
- Insert all 5 categories into `categories` table
- Mark all facts as `status: "verified"` (hand-curated)
- Be idempotent (skip if items already exist)

```typescript
import { internalMutation } from "./_generated/server";

// Format patterns matching the existing formatValue functions
const CATEGORIES = [
  { label: "Calories", question: "Which has more calories?", metricKey: "calories", color: "#ffb380", unit: "cal", formatPattern: "{value} cal", enabled: true, sortOrder: 0 },
  { label: "Population", question: "Which has a higher population?", metricKey: "population", color: "#80c4ff", unit: "people", formatPattern: "{value}", enabled: true, sortOrder: 1 },
  { label: "Rotten Tomatoes", question: "Which has a higher Rotten Tomatoes score?", metricKey: "rotten_tomatoes", color: "#c8a2ff", unit: "%", formatPattern: "{value}%", enabled: true, sortOrder: 2 },
  { label: "Top Speed", question: "Which is faster?", metricKey: "top_speed", color: "#5ce0d6", unit: "mph", formatPattern: "{value} mph", enabled: true, sortOrder: 3 },
  { label: "Average Price", question: "Which costs more?", metricKey: "average_price", color: "#6ee7a0", unit: "$", formatPattern: "${value}", enabled: true, sortOrder: 4 },
];

// The ITEMS constant will contain all 151 items from src/data/items.ts
// converted to the format: { slug, name, emoji, tags, facts: { [metricKey]: { value, unit, source, asOf } } }
// (Full data to be populated from src/data/items.ts during implementation)

export default internalMutation({
  args: {},
  handler: async (ctx) => {
    // Idempotency: skip if data exists
    const existing = await ctx.db.query("items").first();
    if (existing) {
      console.log("Seed data already exists, skipping.");
      return;
    }

    const now = Date.now();

    // Insert categories
    for (const cat of CATEGORIES) {
      await ctx.db.insert("categories", { ...cat, });
    }
    console.log(`Seeded ${CATEGORIES.length} categories.`);

    // Insert items and their facts
    let itemCount = 0;
    let factCount = 0;
    for (const item of ITEMS) {
      const itemId = await ctx.db.insert("items", {
        name: item.name,
        slug: item.slug,
        emoji: item.emoji,
        tags: item.tags,
        createdAt: now,
        updatedAt: now,
      });

      for (const [metricKey, fact] of Object.entries(item.facts)) {
        await ctx.db.insert("facts", {
          itemId,
          metricKey,
          value: fact.value,
          unit: fact.unit,
          source: fact.source,
          asOf: fact.asOf ?? "2024",
          status: "verified",
          createdAt: now,
          updatedAt: now,
        });
        factCount++;
      }
      itemCount++;
    }

    console.log(`Seeded ${itemCount} items with ${factCount} facts.`);
  },
});
```

**Step 2: Populate the ITEMS constant**

Copy every item from `src/data/items.ts`, converting `id` → `slug` and adding `tags` based on the category section comments (e.g., food items get `["food"]`, countries get `["country"]`, etc.).

**Step 3: Run the seed**

Run:
```bash
npx convex run seed
```

Expected: "Seeded 5 categories. Seeded 151 items with ~220 facts."

**Step 4: Verify via Convex dashboard**

Run:
```bash
npx convex dashboard
```

Check the items and facts tables have the expected row counts.

**Step 5: Commit**

```bash
git add convex/seed.ts
git commit -m "feat: add seed script to migrate 151 items and 5 categories to Convex"
```

---

## Task 3: Write Convex queries for game data

**Files:**
- Create: `convex/items.ts` (queries)
- Create: `convex/categories.ts` (queries)

**Step 1: Write item queries**

Create `convex/items.ts`:

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

// Get all items with their facts for a given metric (used by game)
export const listByMetric = query({
  args: { metricKey: v.string() },
  handler: async (ctx, args) => {
    const facts = await ctx.db
      .query("facts")
      .withIndex("by_metric", (q) => q.eq("metricKey", args.metricKey))
      .collect();

    const itemIds = [...new Set(facts.map((f) => f.itemId))];
    const items = await Promise.all(itemIds.map((id) => ctx.db.get(id)));

    // Build the shape the game expects: { id, name, emoji, facts: { [metricKey]: { value, unit, source, asOf } } }
    return items
      .filter((item) => item !== null)
      .map((item) => {
        const itemFacts = facts.filter((f) => f.itemId === item._id);
        const factsObj: Record<string, { value: number; unit: string; source: string; asOf?: string }> = {};
        for (const f of itemFacts) {
          factsObj[f.metricKey] = { value: f.value, unit: f.unit, source: f.source, asOf: f.asOf };
        }
        return {
          id: item.slug,
          name: item.name,
          emoji: item.emoji,
          facts: factsObj,
        };
      });
  },
});

// Get all items with all their facts (used by admin)
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("items").collect();
    const allFacts = await ctx.db.query("facts").collect();

    return items.map((item) => {
      const itemFacts = allFacts.filter((f) => f.itemId === item._id);
      return { ...item, facts: itemFacts };
    });
  },
});
```

**Step 2: Write category queries**

Create `convex/categories.ts`:

```typescript
import { query } from "./_generated/server";

// Get enabled categories (used by game)
export const listEnabled = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_enabled", (q) => q.eq("enabled", true))
      .collect();
  },
});

// Get all categories (used by admin)
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
  },
});
```

**Step 3: Verify queries work**

Run:
```bash
npx convex run items:listByMetric '{"metricKey": "calories"}'
```

Expected: Returns ~19 food items with their calories facts.

**Step 4: Commit**

```bash
git add convex/items.ts convex/categories.ts
git commit -m "feat: add Convex queries for items and categories"
```

---

## Task 4: Write Convex mutations for disputes and admin CRUD

**Files:**
- Create: `convex/disputes.ts`
- Modify: `convex/items.ts` (add mutations)
- Modify: `convex/categories.ts` (add mutations)

**Step 1: Write dispute mutations**

Create `convex/disputes.ts`:

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Player submits a dispute (no auth required)
export const submit = mutation({
  args: {
    factId: v.id("facts"),
    reason: v.optional(v.string()),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Duplicate check: reject if open dispute exists for this fact
    const existing = await ctx.db
      .query("disputes")
      .withIndex("by_fact", (q) => q.eq("factId", args.factId))
      .filter((q) => q.eq(q.field("status"), "open"))
      .first();

    if (existing) {
      return { success: false, reason: "duplicate" };
    }

    await ctx.db.insert("disputes", {
      factId: args.factId,
      reason: args.reason,
      comment: args.comment,
      status: "open",
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Admin: list disputes with status filter
export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("disputes")
        .withIndex("by_status", (q) => q.eq("status", args.status as "open" | "resolved" | "dismissed"))
        .collect();
    }
    return await ctx.db.query("disputes").collect();
  },
});

// Admin: resolve a dispute
export const resolve = mutation({
  args: {
    disputeId: v.id("disputes"),
    resolution: v.string(),
    resolvedBy: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.disputeId, {
      status: "resolved",
      resolution: args.resolution,
      resolvedBy: args.resolvedBy,
      resolvedAt: Date.now(),
    });
  },
});

// Admin: dismiss a dispute
export const dismiss = mutation({
  args: {
    disputeId: v.id("disputes"),
    resolution: v.optional(v.string()),
    resolvedBy: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.disputeId, {
      status: "dismissed",
      resolution: args.resolution,
      resolvedBy: args.resolvedBy,
      resolvedAt: Date.now(),
    });
  },
});

// Get duplicate count for a fact
export const countByFact = query({
  args: { factId: v.id("facts") },
  handler: async (ctx, args) => {
    const disputes = await ctx.db
      .query("disputes")
      .withIndex("by_fact", (q) => q.eq("factId", args.factId))
      .collect();
    return disputes.length;
  },
});
```

**Step 2: Add item CRUD mutations to `convex/items.ts`**

Append to `convex/items.ts`:

```typescript
import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    emoji: v.string(),
    tags: v.array(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("items", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("items"),
    name: v.optional(v.string()),
    emoji: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, { ...fields, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    // Also delete all facts for this item
    const facts = await ctx.db
      .query("facts")
      .withIndex("by_item", (q) => q.eq("itemId", args.id))
      .collect();
    for (const fact of facts) {
      await ctx.db.delete(fact._id);
    }
    await ctx.db.delete(args.id);
  },
});

// Fact CRUD
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
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("facts", {
      ...args,
      status: "unverified",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateFact = mutation({
  args: {
    id: v.id("facts"),
    value: v.optional(v.number()),
    source: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    asOf: v.optional(v.string()),
    status: v.optional(v.union(v.literal("verified"), v.literal("unverified"), v.literal("disputed"))),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, { ...fields, updatedAt: Date.now() });
  },
});

// Upsert for API adapters: find by slug, insert or update
export const upsertItem = internalMutation({
  args: {
    slug: v.string(),
    name: v.string(),
    emoji: v.string(),
    tags: v.array(v.string()),
    facts: v.array(v.object({
      metricKey: v.string(),
      value: v.number(),
      unit: v.string(),
      source: v.string(),
      sourceUrl: v.optional(v.string()),
      asOf: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("items")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    let itemId;
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        emoji: args.emoji,
        tags: args.tags,
        updatedAt: now,
      });
      itemId = existing._id;
    } else {
      itemId = await ctx.db.insert("items", {
        name: args.name,
        slug: args.slug,
        emoji: args.emoji,
        tags: args.tags,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Upsert facts
    for (const fact of args.facts) {
      const existingFact = await ctx.db
        .query("facts")
        .withIndex("by_item_metric", (q) =>
          q.eq("itemId", itemId).eq("metricKey", fact.metricKey)
        )
        .unique();

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
```

**Step 3: Add category mutations to `convex/categories.ts`**

Append to `convex/categories.ts`:

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

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
    return await ctx.db.insert("categories", { ...args, enabled: true });
  },
});

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
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});
```

**Step 4: Verify all functions deploy**

Run:
```bash
npx convex dev --once
```

Expected: All functions deploy without errors.

**Step 5: Commit**

```bash
git add convex/disputes.ts convex/items.ts convex/categories.ts
git commit -m "feat: add CRUD mutations for items, facts, categories, and disputes"
```

---

## Task 5: Swap game client from hardcoded data to Convex

**Files:**
- Modify: `src/main.tsx` (add ConvexProvider)
- Modify: `src/engine/types.ts` (add ConvexCategory type)
- Modify: `src/hooks/useGame.ts` (read from Convex)
- Modify: `src/App.tsx` (pass loading state)
- Create: `src/lib/formatValue.ts` (format pattern interpreter)

**Step 1: Create format value interpreter**

The existing `Category` type has `formatValue: (n: number) => string` — a function. Convex can't store functions, so categories now store `formatPattern: string` (e.g., `"{value} cal"`). We need a client-side interpreter.

Create `src/lib/formatValue.ts`:

```typescript
export function createFormatValue(pattern: string): (n: number) => string {
  return (n: number) => {
    // Handle population-style abbreviation
    if (pattern === "{value}") {
      if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
      if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
      if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
      return n.toLocaleString();
    }
    return pattern.replace("{value}", n.toLocaleString());
  };
}
```

**Step 2: Update `src/main.tsx` with ConvexProvider**

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import App from './App'
import './index.css'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>,
)
```

**Step 3: Update `useGame` hook to accept items and categories as params**

Modify `src/hooks/useGame.ts` to remove hardcoded imports and accept data as parameters:

- Remove `import { items } from '@/data/items'`
- Remove `import { categories } from '@/data/categories'`
- Change `useGame()` to `useGame(items: Item[], categories: Category[])`
- The `startGame` and `startGameWithCategory` callbacks use the passed-in `items` and `categories`

**Step 4: Update `App.tsx` to fetch from Convex and pass to `useGame`**

- Add `useQuery(api.items.listByMetric, ...)` and `useQuery(api.categories.listEnabled)`
- Convert Convex categories to game `Category` type using `createFormatValue`
- Pass fetched data to `useGame(items, categories)`
- Show a loading state while data is `undefined`

**Step 5: Verify the game works end-to-end**

Run:
```bash
npx convex dev &
npm run dev
```

Open browser, play a full game. Verify:
- Start screen loads
- Categories display
- Items load and pair correctly
- Reveal animation works
- Streak/record persist

**Step 6: Commit**

```bash
git add src/main.tsx src/hooks/useGame.ts src/App.tsx src/lib/formatValue.ts src/engine/types.ts
git commit -m "feat: swap game client from hardcoded data to Convex queries"
```

---

## Task 6: Add react-router and admin layout shell

**Files:**
- Install: `react-router` package
- Create: `src/admin/AdminLayout.tsx`
- Create: `src/admin/AdminHome.tsx`
- Create: `src/admin/AdminItems.tsx` (placeholder)
- Create: `src/admin/AdminCategories.tsx` (placeholder)
- Create: `src/admin/AdminDisputes.tsx` (placeholder)
- Create: `src/admin/AdminSources.tsx` (placeholder)
- Modify: `src/App.tsx` (wrap with router)
- Modify: `src/main.tsx` (add Clerk + router)

**Step 1: Install react-router**

Run:
```bash
npm install react-router
```

**Step 2: Create admin layout shell**

Create `src/admin/AdminLayout.tsx` — a sidebar layout with navigation links to each admin route. Uses Tailwind. Sidebar links: Dashboard, Items, Categories, Disputes, Sources.

**Step 3: Create placeholder pages**

Create each admin page as a minimal component with a heading. These will be fleshed out in later tasks.

- `AdminHome.tsx` — "Dashboard" heading
- `AdminItems.tsx` — "Items" heading
- `AdminCategories.tsx` — "Categories" heading
- `AdminDisputes.tsx` — "Disputes" heading
- `AdminSources.tsx` — "Sources" heading

**Step 4: Set up routing in main.tsx**

Update `src/main.tsx` to use `BrowserRouter` (or `createBrowserRouter`), with:
- `/` → Game (existing `App` component, now renamed to `Game`)
- `/admin` → `AdminLayout` wrapping child routes
- `/admin/items` → `AdminItems`
- `/admin/categories` → `AdminCategories`
- `/admin/disputes` → `AdminDisputes`
- `/admin/sources` → `AdminSources`

Add Clerk provider wrapping the entire app. Admin routes use `<Authenticated>` gate. Game routes remain public.

**Step 5: Verify routing works**

Run dev servers and navigate to:
- `http://localhost:5173/` → Game loads
- `http://localhost:5173/admin` → Admin layout loads (may require Clerk login)

**Step 6: Commit**

```bash
git add src/admin/ src/main.tsx src/App.tsx package.json package-lock.json
git commit -m "feat: add react-router with admin layout shell and Clerk auth"
```

---

## Task 7: Build admin items browser and editor

**Files:**
- Modify: `src/admin/AdminItems.tsx` (full implementation)

**Step 1: Build the items table**

Replace the placeholder with a full implementation:
- Use `useQuery(api.items.listAll)` to fetch all items with facts
- Render a searchable table with columns: emoji, name, slug, tags, fact count, verification status
- Add a search input that filters by name
- Add filter chips for categories (which metric keys the item has facts for)

**Step 2: Add inline row expansion**

Click a row to expand it, showing:
- Editable fields: name, emoji, tags
- List of facts with editable value, source, sourceUrl, asOf, status
- Save button that calls `useMutation(api.items.update)` and `useMutation(api.items.updateFact)`

**Step 3: Add "Create Item" form**

Button at top opens a form with: name, slug (auto-generated from name), emoji, tags. On submit calls `useMutation(api.items.create)`.

**Step 4: Add delete with confirmation**

Delete button on each row with a confirm dialog. Calls `useMutation(api.items.remove)`.

**Step 5: Verify CRUD operations work**

- Create a test item, verify it appears in table
- Edit its name, verify it updates
- Add a fact to it, verify it shows
- Delete it, verify it disappears

**Step 6: Commit**

```bash
git add src/admin/AdminItems.tsx
git commit -m "feat: build admin items browser with inline editing and CRUD"
```

---

## Task 8: Build admin categories manager

**Files:**
- Modify: `src/admin/AdminCategories.tsx` (full implementation)

**Step 1: Build category list**

- Use `useQuery(api.categories.listAll)` to fetch all categories
- Render a list with: label, question, metricKey, color swatch, enabled toggle, sort order
- Each row has an enabled/disabled toggle that calls `useMutation(api.categories.update)`

**Step 2: Add inline editing**

Click a category to expand/edit: label, question, color (color picker), formatPattern, sortOrder. Save calls `useMutation(api.categories.update)`.

**Step 3: Add "Create Category" form**

Form with: label, question, metricKey, color, unit, formatPattern, sortOrder. Submit calls `useMutation(api.categories.create)`.

**Step 4: Verify**

- Toggle a category off, verify it disappears from game
- Create a new category, verify it shows in the list
- Edit a color, verify it updates

**Step 5: Commit**

```bash
git add src/admin/AdminCategories.tsx
git commit -m "feat: build admin categories manager with toggle and CRUD"
```

---

## Task 9: Build admin dispute review queue

**Files:**
- Modify: `src/admin/AdminDisputes.tsx` (full implementation)

**Step 1: Build dispute list with tabs**

- Tab bar: Open | Resolved | Dismissed
- Use `useQuery(api.disputes.list, { status })` to fetch filtered disputes
- Each dispute card shows: the fact (item name + metric + value), reason, comment, created time
- Show duplicate count badge using `useQuery(api.disputes.countByFact)`

**Step 2: Add resolve/dismiss actions**

- "Edit Fact" button: opens inline editor for the disputed fact's value/source, on save calls `updateFact` + `resolve`
- "Dismiss" button: optional note field, calls `useMutation(api.disputes.dismiss)`
- "Resolve" button: note field, calls `useMutation(api.disputes.resolve)`

**Step 3: Verify**

- Manually insert a test dispute via Convex dashboard
- Verify it shows in Open tab
- Dismiss it, verify it moves to Dismissed tab
- Create another, edit the fact, verify it auto-resolves

**Step 4: Commit**

```bash
git add src/admin/AdminDisputes.tsx
git commit -m "feat: build admin dispute review queue with resolve/dismiss/edit"
```

---

## Task 10: Add dispute flag button to game reveal screen

**Files:**
- Create: `src/components/DisputeSheet.tsx`
- Modify: `src/components/Card.tsx` (add flag button)
- Modify: `src/App.tsx` (wire up dispute state)

**Step 1: Create DisputeSheet component**

Create `src/components/DisputeSheet.tsx` — a bottom sheet overlay with:
- Header showing the fact: "Big Mac — 563 cal"
- Optional reason chips: "Wrong value", "Outdated", "Bad source" (tappable, multi-select off)
- Optional comment text field (placeholder: "What seems off?")
- Submit button
- Uses `useMutation(api.disputes.submit)`
- localStorage rate limiting: tracks dispute count per session, max 3
- Shows toast on success ("Flagged for review") or duplicate ("Already flagged")

**Step 2: Add flag icon to Card component**

In `Card.tsx`, when `variant === "anchor"` or during reveal phase, show a small flag icon in the top-right corner. Clicking it opens the DisputeSheet for that card's fact.

**Step 3: Wire up in App.tsx**

- Add state for which fact is being disputed (`disputeFactId`)
- Pass flag handler to Card components
- Render DisputeSheet when `disputeFactId` is set

**Step 4: Verify**

- Play a game, get to reveal screen
- Tap flag icon on a card
- Submit a dispute with reason "Wrong value"
- Verify toast appears
- Check Convex dashboard for the dispute row
- Try flagging same fact again — should show "Already flagged"
- Flag 3 different facts, try a 4th — should show rate limit message

**Step 5: Commit**

```bash
git add src/components/DisputeSheet.tsx src/components/Card.tsx src/App.tsx
git commit -m "feat: add dispute flag button to game reveal screen"
```

---

## Task 11: Build admin dashboard home with overview stats

**Files:**
- Modify: `src/admin/AdminHome.tsx` (full implementation)
- Create: `convex/stats.ts` (aggregate queries)

**Step 1: Write stats queries**

Create `convex/stats.ts`:

```typescript
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

    return {
      totalItems: items.length,
      totalFacts: facts.length,
      openDisputes: openDisputes.length,
      enabledCategories: categories.length,
      factsByMetric,
    };
  },
});
```

**Step 2: Build dashboard home UI**

Replace `AdminHome.tsx` placeholder with:
- Card grid showing: Total Items, Total Facts, Open Disputes (with link to /admin/disputes), Enabled Categories
- Bar or list showing facts per metric
- Grid layout designed to accept additional cards later (analytics)

**Step 3: Verify**

- Navigate to `/admin` — stats cards show correct numbers matching Convex data

**Step 4: Commit**

```bash
git add convex/stats.ts src/admin/AdminHome.tsx
git commit -m "feat: build admin dashboard home with overview stats"
```

---

## Task 12: Build API source adapter framework + RestCountries adapter

**Files:**
- Create: `convex/adapters/restcountries.ts`
- Create: `convex/adapters/types.ts`
- Modify: `convex/sourceSyncs.ts` (new file for sync tracking)
- Modify: `src/admin/AdminSources.tsx` (full implementation)

**Step 1: Define adapter types**

Create `convex/adapters/types.ts`:

```typescript
export type NormalizedItem = {
  slug: string;
  name: string;
  emoji: string;
  tags: string[];
  facts: {
    metricKey: string;
    value: number;
    unit: string;
    source: string;
    sourceUrl?: string;
    asOf: string;
  }[];
};
```

**Step 2: Build RestCountries adapter**

Create `convex/adapters/restcountries.ts` as an `internalAction` that:
- Fetches from `https://restcountries.com/v3.1/all`
- Normalizes to `NormalizedItem[]` with facts for: population, area
- Generates slug from country name
- Uses country flag emoji
- Tags: `["country"]`
- Calls `internal.items.upsertItem` for each normalized item

**Step 3: Write sync tracking**

Create `convex/sourceSyncs.ts` with mutations to record sync results (adapter name, timestamp, count, status).

**Step 4: Build admin sources page**

Replace `AdminSources.tsx` placeholder with:
- One card per adapter (start with RestCountries)
- Shows: adapter name, last sync time, items fetched, status
- "Fetch Now" button that calls the adapter action
- Loading state while fetch is in progress

**Step 5: Verify**

- Click "Fetch Now" on RestCountries
- Verify countries appear/update in Items browser
- Verify sync record is logged

**Step 6: Commit**

```bash
git add convex/adapters/ convex/sourceSyncs.ts src/admin/AdminSources.tsx
git commit -m "feat: add API source adapter framework with RestCountries adapter"
```

---

## Task 13: Add TMDB adapter

**Files:**
- Create: `convex/adapters/tmdb.ts`
- Modify: `src/admin/AdminSources.tsx` (add TMDB card)

**Step 1: Build TMDB adapter**

Create `convex/adapters/tmdb.ts` as an `internalAction` that:
- Fetches popular/top-rated movies from TMDB API
- Requires `TMDB_API_KEY` env var (set via `npx convex env set`)
- Normalizes to items with facts: rotten_tomatoes (vote_average * 10), box_office (revenue), runtime, release_year
- Generates slug, uses film emoji, tags: `["movie"]`
- Calls `internal.items.upsertItem` for each

**Step 2: Add TMDB card to sources page**

Add a second adapter card in `AdminSources.tsx`.

**Step 3: Verify**

- Set TMDB API key: `npx convex env set TMDB_API_KEY <key>`
- Click "Fetch Now" on TMDB
- Verify movies appear in Items browser with multiple facts

**Step 4: Commit**

```bash
git add convex/adapters/tmdb.ts src/admin/AdminSources.tsx
git commit -m "feat: add TMDB adapter for movies data"
```

---

## Task 14: Add Open Food Facts adapter

**Files:**
- Create: `convex/adapters/openfoodfacts.ts`
- Modify: `src/admin/AdminSources.tsx` (add OFF card)

**Step 1: Build Open Food Facts adapter**

Create `convex/adapters/openfoodfacts.ts` as an `internalAction` that:
- Searches Open Food Facts API for popular food items
- Normalizes to items with facts: calories, sugar, protein
- Tags: `["food"]`

**Step 2: Add card to sources page**

**Step 3: Verify and commit**

```bash
git add convex/adapters/openfoodfacts.ts src/admin/AdminSources.tsx
git commit -m "feat: add Open Food Facts adapter for nutrition data"
```

---

## Task 15: Add Wikidata adapter

**Files:**
- Create: `convex/adapters/wikidata.ts`
- Modify: `src/admin/AdminSources.tsx` (add Wikidata card)

**Step 1: Build Wikidata adapter**

Create `convex/adapters/wikidata.ts` as an `internalAction` that:
- Runs SPARQL queries against Wikidata for animals (top speed, lifespan, weight), landmarks (height, year built), etc.
- Normalizes results into items with multiple cross-category facts
- Tags based on entity type: `["animal"]`, `["landmark"]`, etc.

**Step 2: Add card to sources page**

**Step 3: Verify and commit**

```bash
git add convex/adapters/wikidata.ts src/admin/AdminSources.tsx
git commit -m "feat: add Wikidata adapter for cross-category data"
```

---

## Task 16: Clean up legacy data files and verify full flow

**Files:**
- Delete: `src/data/items.ts`
- Delete: `src/data/categories.ts`
- Modify: any remaining references to deleted files

**Step 1: Search for remaining imports of old data files**

Run:
```bash
grep -r "from.*@/data/" src/
```

Remove or replace any remaining references.

**Step 2: Delete legacy files**

```bash
rm src/data/items.ts src/data/categories.ts
rmdir src/data/
```

**Step 3: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds with no errors.

**Step 4: Full integration test**

- Start dev servers
- Play a full game end-to-end
- Flag a fact
- Open admin, review the dispute
- Create a new item from admin
- Verify the new item appears in game
- Run a source adapter fetch
- Verify new items from API appear in game

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove legacy hardcoded data files, fully migrated to Convex"
```

---

## Task Summary

| # | Task | Parallelizable with |
|---|------|---------------------|
| 1 | Initialize Convex + schema | — |
| 2 | Seed script (migrate data) | — (depends on 1) |
| 3 | Convex queries for game | — (depends on 2) |
| 4 | Convex mutations for CRUD + disputes | 3 |
| 5 | Swap game client to Convex | — (depends on 3) |
| 6 | React-router + admin shell | 5 |
| 7 | Admin items browser | — (depends on 6) |
| 8 | Admin categories manager | 7 |
| 9 | Admin dispute queue | 7 |
| 10 | Game dispute flag button | — (depends on 5) |
| 11 | Admin dashboard home + stats | 7, 8, 9 |
| 12 | API adapter framework + RestCountries | — (depends on 4) |
| 13 | TMDB adapter | — (depends on 12) |
| 14 | Open Food Facts adapter | 13 |
| 15 | Wikidata adapter | 13 |
| 16 | Clean up + final verification | — (depends on all) |

**Parallel execution opportunities:**
- Tasks 3 & 4 can run in parallel
- Tasks 5 & 6 can run in parallel (different files)
- Tasks 7, 8, 9 can all run in parallel (independent admin pages)
- Tasks 10 & 11 can run in parallel
- Tasks 13, 14, 15 can all run in parallel (independent adapters)
