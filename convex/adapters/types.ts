/**
 * Shared types for API source adapters.
 *
 * Each adapter fetches data from an external API and normalizes it into
 * NormalizedItem objects that can be upserted into the Convex database.
 */

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
