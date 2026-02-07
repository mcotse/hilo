"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import type { NormalizedItem } from "./types";

const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";
const USER_AGENT = "HigherLowerGame/1.0 (dataset-enrichment)";

const KMH_TO_MPH = 1 / 1.60934;

/**
 * Convert a name to a URL-friendly kebab-case slug.
 */
function toSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Execute a SPARQL query against the Wikidata endpoint.
 */
async function sparqlQuery(query: string): Promise<SparqlResults> {
  const url = new URL(SPARQL_ENDPOINT);
  url.searchParams.set("query", query);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/sparql-results+json",
      "User-Agent": USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Wikidata SPARQL returned ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}

type SparqlBinding = {
  type: string;
  value: string;
  datatype?: string;
};

type SparqlResults = {
  results: {
    bindings: Record<string, SparqlBinding>[];
  };
};

/**
 * Safely parse a numeric value from a SPARQL binding.
 */
function parseNumber(binding: SparqlBinding | undefined): number | null {
  if (!binding) return null;
  const num = parseFloat(binding.value);
  return isFinite(num) ? num : null;
}

/**
 * Fetch animals with top speed, lifespan, and mass from Wikidata.
 */
export const fetchAnimals = internalAction({
  args: {},
  handler: async (ctx) => {
    const syncStartedAt = Date.now();
    let itemsFetched = 0;

    try {
      // Animals on Wikidata are classified as taxon (Q16521), not directly
      // as animal (Q729). We require top speed (P2052) to filter to organisms
      // with meaningful speed data — this naturally returns animals.
      const query = `
SELECT ?item ?itemLabel ?speed ?lifespan ?mass WHERE {
  ?item wdt:P31 wd:Q16521 .
  ?item wdt:P2052 ?speed .
  OPTIONAL { ?item wdt:P2250 ?lifespan . }
  OPTIONAL { ?item wdt:P2067 ?mass . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
LIMIT 200
      `.trim();

      const data = await sparqlQuery(query);
      const bindings = data.results.bindings;

      // Deduplicate by item URI — multiple rows can appear for the same entity
      // when it has multiple values for a property. Keep the first occurrence.
      const seen = new Set<string>();

      for (const row of bindings) {
        const label = row.itemLabel?.value;
        const itemUri = row.item?.value;
        if (!label || !itemUri) continue;

        // Skip if we've already processed this entity
        if (seen.has(itemUri)) continue;
        seen.add(itemUri);

        // Skip entries whose label is still a Q-id (no English label found)
        if (/^Q\d+$/.test(label)) continue;

        const speed = parseNumber(row.speed);
        const lifespan = parseNumber(row.lifespan);
        const mass = parseNumber(row.mass);

        // Must have at least one usable fact
        if (speed === null && lifespan === null && mass === null) continue;

        const item: NormalizedItem = {
          slug: toSlug(label),
          name: label,
          emoji: "\uD83D\uDC3E", // 🐾
          tags: ["animal"],
          facts: [],
        };

        if (speed !== null) {
          item.facts.push({
            metricKey: "top_speed",
            value: Math.round(speed * KMH_TO_MPH * 100) / 100,
            unit: "mph",
            source: "wikidata.org",
            sourceUrl: itemUri,
            asOf: new Date().getFullYear().toString(),
          });
        }

        if (lifespan !== null) {
          item.facts.push({
            metricKey: "lifespan",
            value: lifespan,
            unit: "years",
            source: "wikidata.org",
            sourceUrl: itemUri,
            asOf: new Date().getFullYear().toString(),
          });
        }

        if (mass !== null) {
          item.facts.push({
            metricKey: "weight",
            value: Math.round(mass * 100) / 100,
            unit: "kg",
            source: "wikidata.org",
            sourceUrl: itemUri,
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

      await ctx.runMutation(internal.sourceSyncs.recordSync, {
        adapterName: "wikidata-animals",
        lastSyncAt: syncStartedAt,
        itemsFetched,
        status: "success",
      });

      return {
        status: "success" as const,
        itemsFetched,
        totalBindings: bindings.length,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      await ctx.runMutation(internal.sourceSyncs.recordSync, {
        adapterName: "wikidata-animals",
        lastSyncAt: syncStartedAt,
        itemsFetched,
        status: "error",
        error: errorMessage,
      });

      throw error;
    }
  },
});

/**
 * Fetch notable buildings/structures with height and year built from Wikidata.
 */
export const fetchLandmarks = internalAction({
  args: {},
  handler: async (ctx) => {
    const syncStartedAt = Date.now();
    let itemsFetched = 0;

    try {
      // Query buildings (Q41176), skyscrapers (Q11303), and towers (Q12518)
      // directly rather than traversing the subclass hierarchy which times out.
      const query = `
SELECT ?item ?itemLabel ?height ?inception WHERE {
  VALUES ?type { wd:Q41176 wd:Q11303 wd:Q12518 }
  ?item wdt:P31 ?type .
  ?item wdt:P2048 ?height .
  OPTIONAL { ?item wdt:P571 ?inception . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
ORDER BY DESC(?height)
LIMIT 100
      `.trim();

      const data = await sparqlQuery(query);
      const bindings = data.results.bindings;

      const seen = new Set<string>();

      for (const row of bindings) {
        const label = row.itemLabel?.value;
        const itemUri = row.item?.value;
        if (!label || !itemUri) continue;

        if (seen.has(itemUri)) continue;
        seen.add(itemUri);

        // Skip entries whose label is still a Q-id
        if (/^Q\d+$/.test(label)) continue;

        const height = parseNumber(row.height);
        if (height === null) continue;

        const item: NormalizedItem = {
          slug: toSlug(label),
          name: label,
          emoji: "\uD83C\uDFDB\uFE0F", // 🏛️
          tags: ["landmark"],
          facts: [
            {
              metricKey: "height",
              value: Math.round(height * 100) / 100,
              unit: "meters",
              source: "wikidata.org",
              sourceUrl: itemUri,
              asOf: new Date().getFullYear().toString(),
            },
          ],
        };

        // Parse inception/year built if available
        if (row.inception?.value) {
          const yearMatch = row.inception.value.match(/^(\d{4})/);
          if (yearMatch) {
            const year = parseInt(yearMatch[1], 10);
            if (isFinite(year)) {
              item.facts.push({
                metricKey: "year_built",
                value: year,
                unit: "year",
                source: "wikidata.org",
                sourceUrl: itemUri,
                asOf: new Date().getFullYear().toString(),
              });
            }
          }
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

      await ctx.runMutation(internal.sourceSyncs.recordSync, {
        adapterName: "wikidata-landmarks",
        lastSyncAt: syncStartedAt,
        itemsFetched,
        status: "success",
      });

      return {
        status: "success" as const,
        itemsFetched,
        totalBindings: bindings.length,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      await ctx.runMutation(internal.sourceSyncs.recordSync, {
        adapterName: "wikidata-landmarks",
        lastSyncAt: syncStartedAt,
        itemsFetched,
        status: "error",
        error: errorMessage,
      });

      throw error;
    }
  },
});
