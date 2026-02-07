"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import type { NormalizedItem } from "./types";

const API_URL =
  "https://restcountries.com/v3.1/all?fields=name,population,area,flags,flag,cca2";

const MIN_POPULATION = 100_000;

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

type RestCountryResponse = {
  name: { common: string; official: string };
  population: number;
  area: number;
  flags: { png: string; svg: string; alt?: string };
  flag: string;
  cca2: string;
};

/**
 * Fetch all countries from the RestCountries API and upsert them
 * into the Convex database via itemMutations.upsertItem.
 *
 * This is an internalAction — it can only be invoked from other Convex
 * functions or via `npx convex run`.
 */
export const fetchAll = internalAction({
  args: {},
  handler: async (ctx) => {
    const syncStartedAt = Date.now();
    let itemsFetched = 0;

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(
          `RestCountries API returned ${response.status}: ${response.statusText}`
        );
      }

      const countries: RestCountryResponse[] = await response.json();

      // Filter out micro-states
      const filtered = countries.filter(
        (c) => c.population > MIN_POPULATION
      );

      // Normalize and upsert each country
      for (const country of filtered) {
        const item: NormalizedItem = {
          slug: toSlug(country.name.common),
          name: country.name.common,
          emoji: country.flag,
          tags: ["country"],
          facts: [
            {
              metricKey: "population",
              value: country.population,
              unit: "people",
              source: "restcountries.com",
              asOf: "2025",
            },
          ],
        };

        // Only include area if it's a positive number
        if (country.area > 0) {
          item.facts.push({
            metricKey: "area",
            value: country.area,
            unit: "km\u00B2",
            source: "restcountries.com",
            asOf: "2025",
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
        adapterName: "restcountries",
        lastSyncAt: syncStartedAt,
        itemsFetched,
        status: "success",
      });

      return {
        status: "success" as const,
        itemsFetched,
        totalFromApi: countries.length,
        filteredOut: countries.length - filtered.length,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Record error sync
      await ctx.runMutation(internal.sourceSyncs.recordSync, {
        adapterName: "restcountries",
        lastSyncAt: syncStartedAt,
        itemsFetched,
        status: "error",
        error: errorMessage,
      });

      throw error;
    }
  },
});
