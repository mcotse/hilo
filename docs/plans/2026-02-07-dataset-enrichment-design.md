# Dataset Enrichment: API Sourcing, Disputes & Admin Dashboard

**Date:** 2026-02-07
**Status:** Draft

## Problem

The game has 151 hardcoded items across 5 categories. Thinner categories (Calories: 19, Population: 21, Movies: 25) feel repetitive quickly. Items only support one or two metrics each, limiting cross-category play. There's no mechanism for players to report inaccurate data, and no way to manage the dataset without editing code.

## Goals

1. Replace the hardcoded dataset with a Convex-backed data layer fed by external APIs
2. Add new categories and cross-category facts so items are playable across multiple metrics
3. Let players flag facts they believe are wrong, feeding a review queue
4. Build an admin dashboard for full content management with a path toward analytics

## Architecture

Three layers:

- **Game client** (existing React app) — reads items/categories from Convex in real-time, posts disputes
- **Convex backend** — source of truth for items, categories, disputes; handles mutations, queries, and the sourcing pipeline
- **Admin dashboard** — protected routes in the same React app (`/admin/*`); full CRUD, dispute review, API source management

```
External APIs (Wikidata, TMDB, Spotify, etc.)
        |
        v  (seed script / admin-triggered fetch)
   Convex Database
    /           \
Game UI      Admin Dashboard
(reads)      (reads + writes)
    \
  Disputes --> Convex --> Admin Review Queue
```

**Auth:** Clerk via Convex's built-in auth integration. Admin routes and mutations are protected. Game-side is fully public.

## Data Model

### `items` table

| Field     | Type     | Description                          |
|-----------|----------|--------------------------------------|
| name      | string   | Display name ("Big Mac")             |
| slug      | string   | Unique kebab-case key ("big-mac")    |
| emoji     | string   | Single emoji                         |
| imageUrl  | string?  | Optional, for future visual upgrades |
| tags      | string[] | Freeform tags for filtering          |
| createdAt | number   | Timestamp                            |
| updatedAt | number   | Timestamp                            |

### `facts` table (one row per item + metric)

| Field     | Type        | Description                                    |
|-----------|-------------|------------------------------------------------|
| itemId    | Id<"items"> | Reference to parent item                       |
| metricKey | string      | Matches a category's metricKey ("calories")    |
| value     | number      | The numeric value                              |
| unit      | string      | Display unit ("cal", "$", "mph", "%")          |
| source    | string      | Attribution text                               |
| sourceUrl | string?     | Link to the actual source                      |
| asOf      | string      | Year/date of the data                          |
| status    | string      | "verified" / "unverified" / "disputed"         |
| createdAt | number      | Timestamp                                      |
| updatedAt | number      | Timestamp                                      |

Splitting facts from items means any item can have any number of metrics, and each fact carries its own verification status and source. Disputes target a specific fact, not a whole item.

### `categories` table

| Field         | Type    | Description                              |
|---------------|---------|------------------------------------------|
| label         | string  | Display name ("Calories")                |
| question      | string  | "Which has more calories?"               |
| metricKey     | string  | Key matching facts.metricKey             |
| color         | string  | Hex color for UI theming                 |
| unit          | string  | Display unit                             |
| formatPattern | string  | Template string ("{value} cal")          |
| enabled       | boolean | Toggle categories on/off from admin      |
| sortOrder     | number  | Controls display order in game           |

### `disputes` table

| Field      | Type         | Description                                         |
|------------|--------------|-----------------------------------------------------|
| factId     | Id<"facts">  | The specific fact being disputed                    |
| reason     | string?      | Preset: "Wrong value" / "Outdated" / "Bad source"   |
| comment    | string?      | Optional free-text from the player                  |
| status     | string       | "open" / "resolved" / "dismissed"                   |
| resolvedBy | string?      | Admin who handled it                                |
| resolution | string?      | Note on what was done                               |
| createdAt  | number       | Timestamp                                           |
| resolvedAt | number?      | Timestamp                                           |

## API Sourcing Pipeline

Each external source gets its own adapter: a Convex action that fetches, normalizes, and upserts data.

### Source adapters

| Adapter            | API                    | Metrics                                              |
|--------------------|------------------------|------------------------------------------------------|
| Wikidata/Wikipedia | Wikidata SPARQL + REST | population, area, elevation, year_founded, lifespan  |
| TMDB               | The Movie Database API | rotten_tomatoes, box_office, runtime, budget, release_year |
| Spotify            | Spotify Web API        | monthly_listeners, total_streams                     |
| Open Food Facts    | Open Food Facts API    | calories, sugar, protein, ingredients_count          |
| RestCountries      | restcountries.com      | population, area, languages_count, gdp               |

### How it works

1. Each adapter exports a `fetch` action and a `normalize` function
2. `fetch` calls the external API, returns raw results
3. `normalize` maps raw results into `{ name, slug, emoji, facts[] }` shape
4. A shared `upsert` mutation handles deduplication by slug — updates existing items, inserts new ones
5. All ingested facts get `status: "unverified"` until an admin reviews

### Trigger points

- **Seed script** — `npx convex run seed:runAll` for initial population
- **Admin dashboard** — "Fetch new items" button per adapter, with a preview before committing
- **Single item autofill** — Admin types an item name, picks a source adapter, the adapter pre-fills fact values for review

### Rate limiting & caching

Each adapter stores its last fetch timestamp. The admin UI shows "last synced: 3 days ago" and prevents hammering APIs.

## Dispute Flow

### Player side (in-game)

- On the reveal screen, a small flag icon appears in the corner of each card
- Tapping opens a lightweight bottom sheet with:
  - The fact being disputed: "Big Mac — 563 cal"
  - Optional preset reason chips: **Wrong value** / **Outdated** / **Bad source**
  - Optional comment text field (1-2 lines)
  - Submit button
- On submit: Convex mutation creates a dispute, brief toast confirmation, game continues uninterrupted
- No auth required — anonymous disputes

### Spam prevention

- Rate limit: max 3 disputes per session (localStorage counter)
- Duplicate check: Convex mutation rejects if an open dispute already exists for the same factId
- Can tighten later without needing accounts

### Admin side

- `/admin/disputes` shows a filterable list: Open / Resolved / Dismissed
- Each dispute card shows the item + fact, player's reason/comment, duplicate dispute count
- Quick actions: edit fact inline, dismiss with note, mark resolved
- Editing a fact from the dispute view updates the `facts` table and auto-resolves the dispute
- Batch dismiss for clearing noise

## Admin Dashboard

### Routes

```
/admin              — Overview (stats, recent activity)
/admin/items        — Item browser & editor
/admin/categories   — Category management
/admin/disputes     — Dispute review queue
/admin/sources      — API adapter status & trigger fetches
```

### `/admin` — Dashboard home

- Card grid: total items, total facts, open disputes, items by category
- Recent activity feed (last 10 edits, new items, resolved disputes)
- Designed as a grid layout that accepts new cards — analytics cards slot in here later

### `/admin/items` — Item browser

- Searchable, sortable table: emoji, name, tags, fact count, status indicators
- Filter sidebar: by category, by tag, by verification status
- Click row to expand inline editor for name, emoji, tags, and all associated facts
- "Add item" with API-assisted autofill: type a name, pick a source adapter, preview fetched facts, tweak, save
- Bulk actions: delete selected, mark as verified, re-fetch from source

### `/admin/categories` — Category management

- List with toggle switches for enabled/disabled
- Edit label, question, color, format pattern, sort order
- "Add category" — create a new metric key, UI shows which items could support it
- Preview: sample pair matchup with current formatting

### `/admin/sources` — API adapters

- One card per adapter: name, last sync, items fetched count, health status
- "Fetch now" with dry-run preview before committing
- Error log if last fetch failed

## Migration & Rollout

### Phase 1 — Convex setup & data migration

- Initialize Convex, define schema for all tables
- Seed script reads existing 151 items from `items.ts` and inserts into Convex
- Migrated facts get `status: "verified"` (hand-curated data)
- Keep `items.ts` temporarily as fallback

### Phase 2 — Game client swap

- Replace hardcoded imports in `useGame` and `pairing.ts` with Convex `useQuery` hooks
- Pairing logic stays client-side, fed from Convex instead of static imports
- Add dispute flag button to the reveal screen
- Delete `items.ts` and `categories.ts` once stable

### Phase 3 — API sourcing pipeline

- Build adapters one at a time, starting with Wikidata and TMDB (richest coverage)
- Run initial fetches, review in admin, verify and enable
- Add remaining adapters incrementally

### Phase 4 — Admin dashboard

- Build behind Clerk auth
- Start with dispute queue and item browser (highest immediate value)
- Add category management and source management
- Dashboard home overview stats last (closest to analytics, easiest to extend later)

### What stays the same

- Game mechanics, pairing algorithm, difficulty scaling — untouched
- Game UI/UX — only addition is the flag button on the reveal screen
- GitHub Pages for frontend, Convex handles the backend

## Future: Analytics (v2)

The dashboard home is designed as an extensible card grid. When ready, add:

- Most/least played categories
- Items with highest dispute rates
- Player streak distributions
- Most commonly seen pairs
- Session length and engagement metrics

This requires adding an `analytics_events` table and lightweight client-side event tracking, but the dashboard structure is ready to receive it.
