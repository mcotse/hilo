"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import type { NormalizedItem } from "./types";

const SEARCH_URL =
  "https://world.openfoodfacts.org/cgi/search.pl?search_terms=&sort_by=unique_scans_n&page_size=50&json=1";

/**
 * Convert a name to a URL-friendly kebab-case slug.
 * Handles special characters, accented letters, and multiple spaces.
 */
function toSlug(name: string): string {
  return name
    .normalize("NFD") // decompose accented characters
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/['']/g, "") // remove apostrophes
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric (keep spaces/hyphens)
    .trim()
    .replace(/[\s-]+/g, "-") // collapse spaces/hyphens into single hyphen
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

/**
 * Clean up a product name by trimming whitespace and removing
 * excessive brand/detail suffixes that make names unwieldy.
 */
function cleanProductName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

type OpenFoodFactsProduct = {
  product_name?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    sugars_100g?: number;
    proteins_100g?: number;
  };
};

type SearchResponse = {
  products: OpenFoodFactsProduct[];
  count: number;
  page_size: number;
};

/**
 * Fetch popular food products from Open Food Facts and upsert them
 * into the Convex database via itemMutations.upsertItem.
 *
 * Open Food Facts is free and requires no API key.
 *
 * This is an internalAction — it can only be invoked from other Convex
 * functions or via `npx convex run`.
 */
export const fetchPopular = internalAction({
  args: {},
  handler: async (ctx) => {
    const syncStartedAt = Date.now();
    let itemsFetched = 0;

    try {
      const response = await fetch(SEARCH_URL, {
        headers: {
          // Open Food Facts asks for a descriptive User-Agent
          "User-Agent": "HigherLower/1.0 (Convex adapter)",
        },
      });
      if (!response.ok) {
        throw new Error(
          `Open Food Facts API returned ${response.status}: ${response.statusText}`
        );
      }

      const data: SearchResponse = await response.json();

      // Filter to products that have a name and calorie data
      const filtered = data.products.filter(
        (p) =>
          p.product_name &&
          p.product_name.trim().length > 0 &&
          p.nutriments &&
          typeof p.nutriments["energy-kcal_100g"] === "number" &&
          p.nutriments["energy-kcal_100g"] > 0
      );

      // Track slugs to avoid duplicates within the same batch
      const seenSlugs = new Set<string>();

      for (const product of filtered) {
        const name = cleanProductName(product.product_name!);
        const slug = toSlug(name);

        // Skip if slug is empty or duplicate
        if (!slug || seenSlugs.has(slug)) {
          continue;
        }
        seenSlugs.add(slug);

        const item: NormalizedItem = {
          slug,
          name,
          emoji: "\uD83C\uDF7D\uFE0F",
          tags: ["food"],
          facts: [
            {
              metricKey: "calories",
              value: product.nutriments!["energy-kcal_100g"]!,
              unit: "cal/100g",
              source: "Open Food Facts",
              sourceUrl: "https://world.openfoodfacts.org",
              asOf: new Date().getFullYear().toString(),
            },
          ],
        };

        // Add sugar if available
        if (
          product.nutriments!.sugars_100g !== undefined &&
          typeof product.nutriments!.sugars_100g === "number"
        ) {
          item.facts.push({
            metricKey: "sugar",
            value: product.nutriments!.sugars_100g,
            unit: "g/100g",
            source: "Open Food Facts",
            sourceUrl: "https://world.openfoodfacts.org",
            asOf: new Date().getFullYear().toString(),
          });
        }

        // Add protein if available
        if (
          product.nutriments!.proteins_100g !== undefined &&
          typeof product.nutriments!.proteins_100g === "number"
        ) {
          item.facts.push({
            metricKey: "protein",
            value: product.nutriments!.proteins_100g,
            unit: "g/100g",
            source: "Open Food Facts",
            sourceUrl: "https://world.openfoodfacts.org",
            asOf: new Date().getFullYear().toString(),
          });
        }

        await ctx.runMutation(internal.itemMutations.upsertItem, {
          slug: item.slug,
          name: item.name,
          emoji: item.emoji,
          tags: item.tags,
          facts: item.facts,
        });

        itemsFetched++;
      }

      // Record successful sync
      await ctx.runMutation(internal.sourceSyncs.recordSync, {
        adapterName: "openfoodfacts",
        lastSyncAt: syncStartedAt,
        itemsFetched,
        status: "success",
      });

      return {
        status: "success" as const,
        itemsFetched,
        totalFromApi: data.products.length,
        filteredOut: data.products.length - filtered.length,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Record error sync
      await ctx.runMutation(internal.sourceSyncs.recordSync, {
        adapterName: "openfoodfacts",
        lastSyncAt: syncStartedAt,
        itemsFetched,
        status: "error",
        error: errorMessage,
      });

      throw error;
    }
  },
});
