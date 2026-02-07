"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import type { NormalizedItem } from "./types";

const TOP_RATED_URL =
  "https://api.themoviedb.org/3/movie/top_rated?language=en-US";
const MOVIE_DETAIL_URL = "https://api.themoviedb.org/3/movie";

/** Number of pages to fetch from the top-rated endpoint (20 movies per page). */
const PAGES_TO_FETCH = 3;

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

type TmdbListMovie = {
  id: number;
  title: string;
  vote_average: number;
  release_date: string;
  overview: string;
};

type TmdbListResponse = {
  page: number;
  results: TmdbListMovie[];
  total_pages: number;
  total_results: number;
};

type TmdbMovieDetail = {
  id: number;
  runtime: number | null;
  budget: number;
  revenue: number;
};

/**
 * Fetch top-rated movies from TMDB and upsert them into the Convex database.
 *
 * This is an internalAction -- it can only be invoked from other Convex
 * functions or via `npx convex run`.
 *
 * Requires the TMDB_API_KEY environment variable to be set.
 */
export const fetchPopular = internalAction({
  args: {},
  handler: async (ctx) => {
    const syncStartedAt = Date.now();
    let itemsFetched = 0;

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      // Record an error sync and throw
      await ctx.runMutation(internal.sourceSyncs.recordSync, {
        adapterName: "tmdb",
        lastSyncAt: syncStartedAt,
        itemsFetched: 0,
        status: "error",
        error: "TMDB_API_KEY environment variable is not set",
      });
      throw new Error("TMDB_API_KEY environment variable is not set");
    }

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    };

    try {
      // Fetch pages 1-3 of top-rated movies
      const allMovies: TmdbListMovie[] = [];

      for (let page = 1; page <= PAGES_TO_FETCH; page++) {
        const response = await fetch(
          `${TOP_RATED_URL}&page=${page}`,
          { headers }
        );
        if (!response.ok) {
          throw new Error(
            `TMDB API returned ${response.status}: ${response.statusText}`
          );
        }
        const data: TmdbListResponse = await response.json();
        allMovies.push(...data.results);
      }

      // Fetch details for each movie and upsert
      for (const movie of allMovies) {
        // Fetch movie details for runtime, budget, and revenue
        const detailResponse = await fetch(
          `${MOVIE_DETAIL_URL}/${movie.id}`,
          { headers }
        );

        let detail: TmdbMovieDetail | null = null;
        if (detailResponse.ok) {
          detail = await detailResponse.json();
        }

        const releaseYear = movie.release_date
          ? movie.release_date.substring(0, 4)
          : null;

        const facts: NormalizedItem["facts"] = [];

        // TMDB vote_average is 0-10; convert to percentage
        facts.push({
          metricKey: "rotten_tomatoes",
          value: Math.round(movie.vote_average * 10),
          unit: "%",
          source: "TMDB",
          asOf: new Date().getFullYear().toString(),
        });

        if (releaseYear) {
          facts.push({
            metricKey: "release_year",
            value: parseInt(releaseYear, 10),
            unit: "year",
            source: "TMDB",
            asOf: releaseYear,
          });
        }

        if (detail?.revenue && detail.revenue > 0) {
          facts.push({
            metricKey: "box_office",
            value: detail.revenue,
            unit: "$",
            source: "TMDB",
            asOf: releaseYear ?? new Date().getFullYear().toString(),
          });
        }

        if (detail?.runtime && detail.runtime > 0) {
          facts.push({
            metricKey: "runtime",
            value: detail.runtime,
            unit: "min",
            source: "TMDB",
            asOf: releaseYear ?? new Date().getFullYear().toString(),
          });
        }

        const item: NormalizedItem = {
          slug: toSlug(movie.title),
          name: movie.title,
          emoji: "\uD83C\uDFAC",
          tags: ["movie"],
          facts,
        };

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
        adapterName: "tmdb",
        lastSyncAt: syncStartedAt,
        itemsFetched,
        status: "success",
      });

      return {
        status: "success" as const,
        itemsFetched,
        totalFromApi: allMovies.length,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Record error sync
      await ctx.runMutation(internal.sourceSyncs.recordSync, {
        adapterName: "tmdb",
        lastSyncAt: syncStartedAt,
        itemsFetched,
        status: "error",
        error: errorMessage,
      });

      throw error;
    }
  },
});
