import { internalMutation } from "./_generated/server";

/**
 * Seed script: migrates all 151 items and 5 categories from the legacy
 * static data files into the Convex database.
 *
 * Run with:  npx convex run seed
 *
 * Idempotent -- upserts by slug/metricKey so re-runs update existing rows.
 */
export default internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // ---------------------------------------------------------------
    // 1. CATEGORIES
    // ---------------------------------------------------------------
    const categoryData: Array<{
      label: string;
      question: string;
      metricKey: string;
      color: string;
      unit: string;
      formatPattern: string;
      sortOrder: number;
    }> = [
      {
        label: "Calories",
        question: "Which has more calories?",
        metricKey: "calories",
        color: "#ffb380",
        unit: "cal",
        formatPattern: "{value} cal",
        sortOrder: 0,
      },
      {
        label: "Population",
        question: "Which has a higher population?",
        metricKey: "population",
        color: "#80c4ff",
        unit: "people",
        formatPattern: "{value}",
        sortOrder: 1,
      },
      {
        label: "Rotten Tomatoes",
        question: "Which has a higher Rotten Tomatoes score?",
        metricKey: "rotten_tomatoes",
        color: "#c8a2ff",
        unit: "%",
        formatPattern: "{value}%",
        sortOrder: 2,
      },
      {
        label: "Top Speed",
        question: "Which is faster?",
        metricKey: "top_speed",
        color: "#5ce0d6",
        unit: "mph",
        formatPattern: "{value} mph",
        sortOrder: 3,
      },
      {
        label: "Average Price",
        question: "Which costs more?",
        metricKey: "average_price",
        color: "#6ee7a0",
        unit: "$",
        formatPattern: "${value}",
        sortOrder: 4,
      },
    ];

    // Upsert categories by metricKey (truly idempotent).
    let categoriesInserted = 0;
    let categoriesUpdated = 0;
    for (const cat of categoryData) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_metricKey", (q) => q.eq("metricKey", cat.metricKey))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, { ...cat, enabled: true });
        categoriesUpdated++;
      } else {
        await ctx.db.insert("categories", { ...cat, enabled: true });
        categoriesInserted++;
      }
    }
    console.log(`Categories: ${categoriesInserted} inserted, ${categoriesUpdated} updated.`);

    // ---------------------------------------------------------------
    // 2. ITEMS + FACTS
    // ---------------------------------------------------------------
    // Items are upserted by slug (truly idempotent).

    // Helper type for seed data
    type SeedItem = {
      slug: string;
      name: string;
      emoji: string;
      tags: string[];
      facts: Record<
        string,
        { value: number; unit: string; source: string; asOf: string }
      >;
    };

    // --- FOOD / RESTAURANT ITEMS (calories + price) ---  [20 items]
    const foodItems: SeedItem[] = [
      {
        slug: "big-mac",
        name: "Big Mac",
        emoji: "\u{1F354}",
        tags: ["food"],
        facts: {
          calories: { value: 563, unit: "cal", source: "McDonald's Nutrition Guide", asOf: "2024" },
          average_price: { value: 5.58, unit: "$", source: "The Economist Big Mac Index", asOf: "2024" },
        },
      },
      {
        slug: "chipotle-burrito",
        name: "Chipotle Burrito",
        emoji: "\u{1F32F}",
        tags: ["food"],
        facts: {
          calories: { value: 1070, unit: "cal", source: "Chipotle Nutrition Calculator", asOf: "2024" },
          average_price: { value: 10.75, unit: "$", source: "Chipotle Menu", asOf: "2024" },
        },
      },
      {
        slug: "slice-of-pizza",
        name: "Slice of Pizza",
        emoji: "\u{1F355}",
        tags: ["food"],
        facts: {
          calories: { value: 285, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 3.50, unit: "$", source: "US average", asOf: "2024" },
        },
      },
      {
        slug: "pad-thai",
        name: "Pad Thai",
        emoji: "\u{1F35C}",
        tags: ["food"],
        facts: {
          calories: { value: 630, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 14.00, unit: "$", source: "Restaurant average", asOf: "2024" },
        },
      },
      {
        slug: "caesar-salad",
        name: "Caesar Salad",
        emoji: "\u{1F957}",
        tags: ["food"],
        facts: {
          calories: { value: 481, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 12.00, unit: "$", source: "Restaurant average", asOf: "2024" },
        },
      },
      {
        slug: "avocado-toast",
        name: "Avocado Toast",
        emoji: "\u{1F951}",
        tags: ["food"],
        facts: {
          calories: { value: 290, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 11.00, unit: "$", source: "Cafe average", asOf: "2024" },
        },
      },
      {
        slug: "mcnuggets-10pc",
        name: "10pc McNuggets",
        emoji: "\u{1F357}",
        tags: ["food"],
        facts: {
          calories: { value: 410, unit: "cal", source: "McDonald's Nutrition Guide", asOf: "2024" },
          average_price: { value: 5.29, unit: "$", source: "McDonald's Menu", asOf: "2024" },
        },
      },
      {
        slug: "croissant",
        name: "Croissant",
        emoji: "\u{1F950}",
        tags: ["food"],
        facts: {
          calories: { value: 406, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 3.75, unit: "$", source: "Bakery average", asOf: "2024" },
        },
      },
      {
        slug: "bagel-cream-cheese",
        name: "Bagel w/ Cream Cheese",
        emoji: "\u{1F96F}",
        tags: ["food"],
        facts: {
          calories: { value: 360, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 4.50, unit: "$", source: "Deli average", asOf: "2024" },
        },
      },
      {
        slug: "starbucks-frappuccino",
        name: "Starbucks Frappuccino",
        emoji: "\u2615",
        tags: ["food"],
        facts: {
          calories: { value: 380, unit: "cal", source: "Starbucks Nutrition", asOf: "2024" },
          average_price: { value: 5.95, unit: "$", source: "Starbucks Menu", asOf: "2024" },
        },
      },
      {
        slug: "cinnabon-classic",
        name: "Cinnabon Classic Roll",
        emoji: "\u{1F9C1}",
        tags: ["food"],
        facts: {
          calories: { value: 880, unit: "cal", source: "Cinnabon Nutrition", asOf: "2024" },
          average_price: { value: 5.99, unit: "$", source: "Cinnabon Menu", asOf: "2024" },
        },
      },
      {
        slug: "subway-footlong",
        name: "Subway Footlong",
        emoji: "\u{1F956}",
        tags: ["food"],
        facts: {
          calories: { value: 600, unit: "cal", source: "Subway Nutrition (Turkey)", asOf: "2024" },
          average_price: { value: 8.49, unit: "$", source: "Subway Menu", asOf: "2024" },
        },
      },
      {
        slug: "cheesecake-factory-slice",
        name: "Cheesecake Factory Slice",
        emoji: "\u{1F370}",
        tags: ["food"],
        facts: {
          calories: { value: 1500, unit: "cal", source: "Cheesecake Factory Nutrition", asOf: "2024" },
          average_price: { value: 10.50, unit: "$", source: "Cheesecake Factory Menu", asOf: "2024" },
        },
      },
      {
        slug: "in-n-out-double-double",
        name: "In-N-Out Double-Double",
        emoji: "\u{1F354}",
        tags: ["food"],
        facts: {
          calories: { value: 670, unit: "cal", source: "In-N-Out Nutrition", asOf: "2024" },
          average_price: { value: 5.25, unit: "$", source: "In-N-Out Menu", asOf: "2024" },
        },
      },
      {
        slug: "chick-fil-a-sandwich",
        name: "Chick-fil-A Sandwich",
        emoji: "\u{1F414}",
        tags: ["food"],
        facts: {
          calories: { value: 440, unit: "cal", source: "Chick-fil-A Nutrition", asOf: "2024" },
          average_price: { value: 5.59, unit: "$", source: "Chick-fil-A Menu", asOf: "2024" },
        },
      },
      {
        slug: "whole-dominos-pizza",
        name: "Whole Domino's Pizza",
        emoji: "\u{1F355}",
        tags: ["food"],
        facts: {
          calories: { value: 2080, unit: "cal", source: "Domino's Nutrition (medium hand tossed)", asOf: "2024" },
          average_price: { value: 13.99, unit: "$", source: "Domino's Menu", asOf: "2024" },
        },
      },
      {
        slug: "panda-express-plate",
        name: "Panda Express Plate",
        emoji: "\u{1F43C}",
        tags: ["food"],
        facts: {
          calories: { value: 1130, unit: "cal", source: "Panda Express Nutrition", asOf: "2024" },
          average_price: { value: 10.40, unit: "$", source: "Panda Express Menu", asOf: "2024" },
        },
      },
      {
        slug: "banana",
        name: "Banana",
        emoji: "\u{1F34C}",
        tags: ["food"],
        facts: {
          calories: { value: 105, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 0.25, unit: "$", source: "USDA Average Retail Price", asOf: "2024" },
        },
      },
      {
        slug: "glazed-donut",
        name: "Glazed Donut",
        emoji: "\u{1F369}",
        tags: ["food"],
        facts: {
          calories: { value: 240, unit: "cal", source: "Krispy Kreme Nutrition", asOf: "2024" },
          average_price: { value: 1.89, unit: "$", source: "Krispy Kreme Menu", asOf: "2024" },
        },
      },
      {
        slug: "ramen-bowl",
        name: "Bowl of Ramen",
        emoji: "\u{1F35C}",
        tags: ["food"],
        facts: {
          calories: { value: 450, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 16.00, unit: "$", source: "Restaurant average", asOf: "2024" },
        },
      },
    ];

    // --- COUNTRIES (population) ---  [21 items]
    const countryItems: SeedItem[] = [
      {
        slug: "china",
        name: "China",
        emoji: "\u{1F1E8}\u{1F1F3}",
        tags: ["country"],
        facts: {
          population: { value: 1425000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
        },
      },
      {
        slug: "india",
        name: "India",
        emoji: "\u{1F1EE}\u{1F1F3}",
        tags: ["country"],
        facts: {
          population: { value: 1441000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
        },
      },
      {
        slug: "united-states",
        name: "United States",
        emoji: "\u{1F1FA}\u{1F1F8}",
        tags: ["country"],
        facts: {
          population: { value: 340000000, unit: "people", source: "US Census Bureau", asOf: "2024" },
        },
      },
      {
        slug: "indonesia",
        name: "Indonesia",
        emoji: "\u{1F1EE}\u{1F1E9}",
        tags: ["country"],
        facts: {
          population: { value: 278000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
        },
      },
      {
        slug: "brazil",
        name: "Brazil",
        emoji: "\u{1F1E7}\u{1F1F7}",
        tags: ["country"],
        facts: {
          population: { value: 216000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
        },
      },
      {
        slug: "japan",
        name: "Japan",
        emoji: "\u{1F1EF}\u{1F1F5}",
        tags: ["country"],
        facts: {
          population: { value: 124000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
        },
      },
      {
        slug: "germany",
        name: "Germany",
        emoji: "\u{1F1E9}\u{1F1EA}",
        tags: ["country"],
        facts: {
          population: { value: 84000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
        },
      },
      {
        slug: "united-kingdom",
        name: "United Kingdom",
        emoji: "\u{1F1EC}\u{1F1E7}",
        tags: ["country"],
        facts: {
          population: { value: 68000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
        },
      },
      {
        slug: "france",
        name: "France",
        emoji: "\u{1F1EB}\u{1F1F7}",
        tags: ["country"],
        facts: {
          population: { value: 66000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
        },
      },
      {
        slug: "italy",
        name: "Italy",
        emoji: "\u{1F1EE}\u{1F1F9}",
        tags: ["country"],
        facts: {
          population: { value: 59000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
        },
      },
      {
        slug: "south-korea",
        name: "South Korea",
        emoji: "\u{1F1F0}\u{1F1F7}",
        tags: ["country"],
        facts: {
          population: { value: 52000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
        },
      },
      {
        slug: "canada",
        name: "Canada",
        emoji: "\u{1F1E8}\u{1F1E6}",
        tags: ["country"],
        facts: {
          population: { value: 41000000, unit: "people", source: "Statistics Canada", asOf: "2024" },
        },
      },
      {
        slug: "australia",
        name: "Australia",
        emoji: "\u{1F1E6}\u{1F1FA}",
        tags: ["country"],
        facts: {
          population: { value: 26000000, unit: "people", source: "ABS", asOf: "2024" },
        },
      },
      {
        slug: "mexico",
        name: "Mexico",
        emoji: "\u{1F1F2}\u{1F1FD}",
        tags: ["country"],
        facts: {
          population: { value: 130000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
        },
      },
      {
        slug: "nigeria",
        name: "Nigeria",
        emoji: "\u{1F1F3}\u{1F1EC}",
        tags: ["country"],
        facts: {
          population: { value: 230000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
        },
      },
      {
        slug: "egypt",
        name: "Egypt",
        emoji: "\u{1F1EA}\u{1F1EC}",
        tags: ["country"],
        facts: {
          population: { value: 105000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
        },
      },
      {
        slug: "thailand",
        name: "Thailand",
        emoji: "\u{1F1F9}\u{1F1ED}",
        tags: ["country"],
        facts: {
          population: { value: 72000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
        },
      },
      {
        slug: "spain",
        name: "Spain",
        emoji: "\u{1F1EA}\u{1F1F8}",
        tags: ["country"],
        facts: {
          population: { value: 48000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
        },
      },
      {
        slug: "argentina",
        name: "Argentina",
        emoji: "\u{1F1E6}\u{1F1F7}",
        tags: ["country"],
        facts: {
          population: { value: 46000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
        },
      },
      {
        slug: "new-zealand",
        name: "New Zealand",
        emoji: "\u{1F1F3}\u{1F1FF}",
        tags: ["country"],
        facts: {
          population: { value: 5200000, unit: "people", source: "Stats NZ", asOf: "2024" },
        },
      },
      {
        slug: "iceland",
        name: "Iceland",
        emoji: "\u{1F1EE}\u{1F1F8}",
        tags: ["country"],
        facts: {
          population: { value: 383000, unit: "people", source: "Statistics Iceland", asOf: "2024" },
        },
      },
    ];

    // --- MOVIES (rotten_tomatoes) ---  [25 items]
    const movieItems: SeedItem[] = [
      {
        slug: "the-shawshank-redemption",
        name: "Shawshank Redemption",
        emoji: "\u{1F3AC}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 91, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
      {
        slug: "the-dark-knight",
        name: "The Dark Knight",
        emoji: "\u{1F987}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 94, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
      {
        slug: "pulp-fiction",
        name: "Pulp Fiction",
        emoji: "\u{1F3AC}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 92, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
      {
        slug: "forrest-gump",
        name: "Forrest Gump",
        emoji: "\u{1F3C3}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 71, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
      {
        slug: "the-lion-king",
        name: "The Lion King (1994)",
        emoji: "\u{1F981}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 93, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
      {
        slug: "titanic",
        name: "Titanic",
        emoji: "\u{1F6A2}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 88, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
      {
        slug: "jurassic-park",
        name: "Jurassic Park",
        emoji: "\u{1F995}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 93, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
      {
        slug: "the-matrix",
        name: "The Matrix",
        emoji: "\u{1F48A}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 83, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
      {
        slug: "fight-club",
        name: "Fight Club",
        emoji: "\u{1F94A}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 79, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
      {
        slug: "inception",
        name: "Inception",
        emoji: "\u{1F4AD}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 87, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
      {
        slug: "toy-story",
        name: "Toy Story",
        emoji: "\u{1F920}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 100, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
      {
        slug: "finding-nemo",
        name: "Finding Nemo",
        emoji: "\u{1F41F}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 99, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
      {
        slug: "the-avengers",
        name: "The Avengers (2012)",
        emoji: "\u{1F9B8}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 91, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
      {
        slug: "frozen",
        name: "Frozen",
        emoji: "\u2744\uFE0F",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 90, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
      {
        slug: "star-wars-new-hope",
        name: "Star Wars: A New Hope",
        emoji: "\u2B50",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 93, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
      {
        slug: "the-godfather",
        name: "The Godfather",
        emoji: "\u{1F3AC}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 97, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
      {
        slug: "jaws",
        name: "Jaws",
        emoji: "\u{1F988}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 97, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
      {
        slug: "batman-v-superman",
        name: "Batman v Superman",
        emoji: "\u{1F987}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 29, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
      {
        slug: "transformers-2",
        name: "Transformers: Revenge",
        emoji: "\u{1F916}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 20, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
      {
        slug: "twilight",
        name: "Twilight",
        emoji: "\u{1F9DB}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 49, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
      {
        slug: "cats-2019",
        name: "Cats (2019)",
        emoji: "\u{1F431}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 19, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
      {
        slug: "superbad",
        name: "Superbad",
        emoji: "\u{1F389}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 88, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
      {
        slug: "parasite",
        name: "Parasite",
        emoji: "\u{1F3E0}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 99, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
      {
        slug: "get-out",
        name: "Get Out",
        emoji: "\u{1FAE3}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 98, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
      {
        slug: "mean-girls",
        name: "Mean Girls",
        emoji: "\u{1F485}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 84, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
        },
      },
    ];

    // --- ANIMALS -- TOP SPEED ---  [43 items]
    const animalItems: SeedItem[] = [
      {
        slug: "cheetah",
        name: "Cheetah",
        emoji: "\u{1F406}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 70, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "peregrine-falcon",
        name: "Peregrine Falcon",
        emoji: "\u{1F985}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 240, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "lion",
        name: "Lion",
        emoji: "\u{1F981}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 50, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "grizzly-bear",
        name: "Grizzly Bear",
        emoji: "\u{1F43B}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 35, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "usain-bolt",
        name: "Usain Bolt",
        emoji: "\u{1F3C3}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 28, unit: "mph", source: "World Athletics", asOf: "2024" },
        },
      },
      {
        slug: "horse",
        name: "Horse",
        emoji: "\u{1F40E}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 55, unit: "mph", source: "Guinness World Records", asOf: "2024" },
        },
      },
      {
        slug: "greyhound",
        name: "Greyhound",
        emoji: "\u{1F415}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 45, unit: "mph", source: "American Kennel Club", asOf: "2024" },
        },
      },
      {
        slug: "dolphin",
        name: "Dolphin",
        emoji: "\u{1F42C}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 37, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "sailfish",
        name: "Sailfish",
        emoji: "\u{1F41F}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 68, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "black-mamba",
        name: "Black Mamba",
        emoji: "\u{1F40D}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 12, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "ostrich",
        name: "Ostrich",
        emoji: "\u{1F9A9}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 45, unit: "mph", source: "San Diego Zoo", asOf: "2024" },
        },
      },
      {
        slug: "kangaroo",
        name: "Kangaroo",
        emoji: "\u{1F998}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 44, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "elephant",
        name: "Elephant",
        emoji: "\u{1F418}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 25, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "hippo",
        name: "Hippo",
        emoji: "\u{1F99B}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 19, unit: "mph", source: "San Diego Zoo", asOf: "2024" },
        },
      },
      {
        slug: "crocodile",
        name: "Crocodile",
        emoji: "\u{1F40A}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 22, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "rabbit",
        name: "Rabbit",
        emoji: "\u{1F407}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 35, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "house-cat",
        name: "House Cat",
        emoji: "\u{1F431}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 30, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "chicken",
        name: "Chicken",
        emoji: "\u{1F414}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 9, unit: "mph", source: "Smithsonian", asOf: "2024" },
        },
      },
      {
        slug: "pig",
        name: "Pig",
        emoji: "\u{1F437}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 11, unit: "mph", source: "Smithsonian", asOf: "2024" },
        },
      },
      {
        slug: "sloth",
        name: "Sloth",
        emoji: "\u{1F9A5}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 0.15, unit: "mph", source: "World Wildlife Fund", asOf: "2024" },
        },
      },
      {
        slug: "tortoise",
        name: "Tortoise",
        emoji: "\u{1F422}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 0.3, unit: "mph", source: "Guinness World Records", asOf: "2024" },
        },
      },
      {
        slug: "great-white-shark",
        name: "Great White Shark",
        emoji: "\u{1F988}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 35, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "moose",
        name: "Moose",
        emoji: "\u{1FACE}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 35, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "giraffe",
        name: "Giraffe",
        emoji: "\u{1F992}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 37, unit: "mph", source: "San Diego Zoo", asOf: "2024" },
        },
      },
      {
        slug: "wolf",
        name: "Wolf",
        emoji: "\u{1F43A}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 40, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "coyote",
        name: "Coyote",
        emoji: "\u{1F43A}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 43, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "red-fox",
        name: "Red Fox",
        emoji: "\u{1F98A}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 30, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "bald-eagle",
        name: "Bald Eagle",
        emoji: "\u{1F985}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 100, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "hummingbird",
        name: "Hummingbird",
        emoji: "\u{1F426}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 30, unit: "mph", source: "Cornell Lab of Ornithology", asOf: "2024" },
        },
      },
      {
        slug: "cobra",
        name: "Cobra",
        emoji: "\u{1F40D}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 12, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "chimpanzee",
        name: "Chimpanzee",
        emoji: "\u{1F412}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 25, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "brown-bear",
        name: "Brown Bear",
        emoji: "\u{1F43B}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 30, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "polar-bear",
        name: "Polar Bear",
        emoji: "\u{1F43B}\u200D\u2744\uFE0F",
        tags: ["animal"],
        facts: {
          top_speed: { value: 25, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "african-wild-dog",
        name: "African Wild Dog",
        emoji: "\u{1F415}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 44, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "pronghorn-antelope",
        name: "Pronghorn Antelope",
        emoji: "\u{1F98C}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 55, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "wildebeest",
        name: "Wildebeest",
        emoji: "\u{1F403}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 50, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "garden-snail",
        name: "Garden Snail",
        emoji: "\u{1F40C}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 0.03, unit: "mph", source: "Guinness World Records", asOf: "2024" },
        },
      },
      {
        slug: "komodo-dragon",
        name: "Komodo Dragon",
        emoji: "\u{1F98E}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 13, unit: "mph", source: "Smithsonian", asOf: "2024" },
        },
      },
      {
        slug: "domestic-dog-average",
        name: "Domestic Dog (Average)",
        emoji: "\u{1F436}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 20, unit: "mph", source: "American Kennel Club", asOf: "2024" },
        },
      },
      {
        slug: "iguana",
        name: "Iguana",
        emoji: "\u{1F98E}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 21, unit: "mph", source: "San Diego Zoo", asOf: "2024" },
        },
      },
      {
        slug: "zebra",
        name: "Zebra",
        emoji: "\u{1F993}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 40, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "penguin",
        name: "Penguin",
        emoji: "\u{1F427}",
        tags: ["animal"],
        facts: {
          top_speed: { value: 22, unit: "mph", source: "National Geographic", asOf: "2024" },
        },
      },
      {
        slug: "squirrel",
        name: "Squirrel",
        emoji: "\u{1F43F}\uFE0F",
        tags: ["animal"],
        facts: {
          top_speed: { value: 20, unit: "mph", source: "National Wildlife Federation", asOf: "2024" },
        },
      },
    ];

    // --- MONEY / AVERAGE PRICE ---  [42 items]
    const productItems: SeedItem[] = [
      {
        slug: "iphone-16-pro",
        name: "iPhone 16 Pro",
        emoji: "\u{1F4F1}",
        tags: ["product"],
        facts: {
          average_price: { value: 1199, unit: "$", source: "Apple", asOf: "2024" },
        },
      },
      {
        slug: "macbook-pro",
        name: "MacBook Pro",
        emoji: "\u{1F4BB}",
        tags: ["product"],
        facts: {
          average_price: { value: 1999, unit: "$", source: "Apple", asOf: "2024" },
        },
      },
      {
        slug: "tesla-model-3",
        name: "Tesla Model 3",
        emoji: "\u{1F697}",
        tags: ["product"],
        facts: {
          average_price: { value: 38990, unit: "$", source: "Tesla", asOf: "2024" },
        },
      },
      {
        slug: "toyota-camry",
        name: "Toyota Camry",
        emoji: "\u{1F699}",
        tags: ["product"],
        facts: {
          average_price: { value: 28855, unit: "$", source: "Toyota", asOf: "2024" },
        },
      },
      {
        slug: "cup-of-coffee",
        name: "Cup of Coffee",
        emoji: "\u2615",
        tags: ["product"],
        facts: {
          average_price: { value: 5.50, unit: "$", source: "National Coffee Association", asOf: "2024" },
        },
      },
      {
        slug: "netflix-monthly",
        name: "Netflix Monthly",
        emoji: "\u{1F4FA}",
        tags: ["product"],
        facts: {
          average_price: { value: 15.49, unit: "$", source: "Netflix", asOf: "2024" },
        },
      },
      {
        slug: "gallon-of-gas",
        name: "Gallon of Gas",
        emoji: "\u26FD",
        tags: ["product"],
        facts: {
          average_price: { value: 3.50, unit: "$", source: "AAA Gas Prices", asOf: "2024" },
        },
      },
      {
        slug: "dozen-eggs",
        name: "Dozen Eggs",
        emoji: "\u{1F95A}",
        tags: ["product"],
        facts: {
          average_price: { value: 4.50, unit: "$", source: "USDA Average Retail Price", asOf: "2024" },
        },
      },
      {
        slug: "costco-hot-dog",
        name: "Costco Hot Dog",
        emoji: "\u{1F32D}",
        tags: ["product"],
        facts: {
          average_price: { value: 1.50, unit: "$", source: "Costco", asOf: "2024" },
        },
      },
      {
        slug: "movie-ticket",
        name: "Movie Ticket",
        emoji: "\u{1F39F}\uFE0F",
        tags: ["product"],
        facts: {
          average_price: { value: 11.00, unit: "$", source: "National Association of Theatre Owners", asOf: "2024" },
        },
      },
      {
        slug: "pair-of-levis",
        name: "Pair of Levis",
        emoji: "\u{1F456}",
        tags: ["product"],
        facts: {
          average_price: { value: 69, unit: "$", source: "Levi's", asOf: "2024" },
        },
      },
      {
        slug: "nike-air-max",
        name: "Nike Air Max",
        emoji: "\u{1F45F}",
        tags: ["product"],
        facts: {
          average_price: { value: 130, unit: "$", source: "Nike", asOf: "2024" },
        },
      },
      {
        slug: "airpods-pro",
        name: "AirPods Pro",
        emoji: "\u{1F3A7}",
        tags: ["product"],
        facts: {
          average_price: { value: 249, unit: "$", source: "Apple", asOf: "2024" },
        },
      },
      {
        slug: "ps5",
        name: "PS5",
        emoji: "\u{1F3AE}",
        tags: ["product"],
        facts: {
          average_price: { value: 499, unit: "$", source: "Sony", asOf: "2024" },
        },
      },
      {
        slug: "nintendo-switch",
        name: "Nintendo Switch",
        emoji: "\u{1F3AE}",
        tags: ["product"],
        facts: {
          average_price: { value: 299, unit: "$", source: "Nintendo", asOf: "2024" },
        },
      },
      {
        slug: "broadway-ticket",
        name: "Broadway Ticket",
        emoji: "\u{1F3AD}",
        tags: ["product"],
        facts: {
          average_price: { value: 150, unit: "$", source: "Broadway League", asOf: "2024" },
        },
      },
      {
        slug: "disneyland-ticket",
        name: "Disneyland Ticket",
        emoji: "\u{1F3F0}",
        tags: ["product"],
        facts: {
          average_price: { value: 104, unit: "$", source: "Disneyland", asOf: "2024" },
        },
      },
      {
        slug: "rolex-submariner",
        name: "Rolex Submariner",
        emoji: "\u231A",
        tags: ["product"],
        facts: {
          average_price: { value: 10100, unit: "$", source: "Rolex", asOf: "2024" },
        },
      },
      {
        slug: "ray-ban-wayfarers",
        name: "Ray-Ban Wayfarers",
        emoji: "\u{1F576}\uFE0F",
        tags: ["product"],
        facts: {
          average_price: { value: 163, unit: "$", source: "Ray-Ban", asOf: "2024" },
        },
      },
      {
        slug: "spotify-monthly",
        name: "Spotify Monthly",
        emoji: "\u{1F3B5}",
        tags: ["product"],
        facts: {
          average_price: { value: 11.99, unit: "$", source: "Spotify", asOf: "2024" },
        },
      },
      {
        slug: "uber-ride-average",
        name: "Uber Ride Average",
        emoji: "\u{1F695}",
        tags: ["product"],
        facts: {
          average_price: { value: 25, unit: "$", source: "Uber", asOf: "2024" },
        },
      },
      {
        slug: "gym-membership-monthly",
        name: "Gym Membership Monthly",
        emoji: "\u{1F4AA}",
        tags: ["product"],
        facts: {
          average_price: { value: 53, unit: "$", source: "IHRSA", asOf: "2024" },
        },
      },
      {
        slug: "costco-membership",
        name: "Costco Membership",
        emoji: "\u{1F6D2}",
        tags: ["product"],
        facts: {
          average_price: { value: 65, unit: "$", source: "Costco", asOf: "2024" },
        },
      },
      {
        slug: "amazon-prime-annual",
        name: "Amazon Prime Annual",
        emoji: "\u{1F4E6}",
        tags: ["product"],
        facts: {
          average_price: { value: 139, unit: "$", source: "Amazon", asOf: "2024" },
        },
      },
      {
        slug: "wedding-average",
        name: "Wedding Average",
        emoji: "\u{1F492}",
        tags: ["product"],
        facts: {
          average_price: { value: 33000, unit: "$", source: "The Knot", asOf: "2024" },
        },
      },
      {
        slug: "college-textbook",
        name: "College Textbook",
        emoji: "\u{1F4DA}",
        tags: ["product"],
        facts: {
          average_price: { value: 105, unit: "$", source: "College Board", asOf: "2024" },
        },
      },
      {
        slug: "starbucks-latte",
        name: "Starbucks Latte",
        emoji: "\u2615",
        tags: ["product"],
        facts: {
          average_price: { value: 5.75, unit: "$", source: "Starbucks Menu", asOf: "2024" },
        },
      },
      {
        slug: "avocado",
        name: "Avocado",
        emoji: "\u{1F951}",
        tags: ["product"],
        facts: {
          average_price: { value: 1.50, unit: "$", source: "USDA Average Retail Price", asOf: "2024" },
        },
      },
      {
        slug: "gallon-of-milk",
        name: "Gallon of Milk",
        emoji: "\u{1F95B}",
        tags: ["product"],
        facts: {
          average_price: { value: 4.25, unit: "$", source: "USDA Average Retail Price", asOf: "2024" },
        },
      },
      {
        slug: "loaf-of-bread",
        name: "Loaf of Bread",
        emoji: "\u{1F35E}",
        tags: ["product"],
        facts: {
          average_price: { value: 3.50, unit: "$", source: "Bureau of Labor Statistics", asOf: "2024" },
        },
      },
      {
        slug: "honda-civic",
        name: "Honda Civic",
        emoji: "\u{1F697}",
        tags: ["product"],
        facts: {
          average_price: { value: 24950, unit: "$", source: "Honda", asOf: "2024" },
        },
      },
      {
        slug: "ipad",
        name: "iPad",
        emoji: "\u{1F4F1}",
        tags: ["product"],
        facts: {
          average_price: { value: 449, unit: "$", source: "Apple", asOf: "2024" },
        },
      },
      {
        slug: "lego-millennium-falcon",
        name: "LEGO Millennium Falcon",
        emoji: "\u{1F9F1}",
        tags: ["product"],
        facts: {
          average_price: { value: 849, unit: "$", source: "LEGO", asOf: "2024" },
        },
      },
      {
        slug: "yeti-tumbler",
        name: "YETI Tumbler",
        emoji: "\u{1F964}",
        tags: ["product"],
        facts: {
          average_price: { value: 38, unit: "$", source: "YETI", asOf: "2024" },
        },
      },
      {
        slug: "stanley-cup-tumbler",
        name: "Stanley Cup Tumbler",
        emoji: "\u{1F964}",
        tags: ["product"],
        facts: {
          average_price: { value: 45, unit: "$", source: "Stanley", asOf: "2024" },
        },
      },
      {
        slug: "nfl-jersey",
        name: "NFL Jersey",
        emoji: "\u{1F3C8}",
        tags: ["product"],
        facts: {
          average_price: { value: 130, unit: "$", source: "NFL Shop", asOf: "2024" },
        },
      },
      {
        slug: "plane-ticket-domestic",
        name: "Domestic Plane Ticket",
        emoji: "\u2708\uFE0F",
        tags: ["product"],
        facts: {
          average_price: { value: 360, unit: "$", source: "Bureau of Transportation Statistics", asOf: "2024" },
        },
      },
      {
        slug: "annual-car-insurance",
        name: "Annual Car Insurance",
        emoji: "\u{1F699}",
        tags: ["product"],
        facts: {
          average_price: { value: 2150, unit: "$", source: "Insurance Information Institute", asOf: "2024" },
        },
      },
      {
        slug: "gopro-hero",
        name: "GoPro Hero",
        emoji: "\u{1F4F7}",
        tags: ["product"],
        facts: {
          average_price: { value: 399, unit: "$", source: "GoPro", asOf: "2024" },
        },
      },
      {
        slug: "electric-scooter",
        name: "Electric Scooter",
        emoji: "\u{1F6F4}",
        tags: ["product"],
        facts: {
          average_price: { value: 450, unit: "$", source: "Consumer Reports", asOf: "2024" },
        },
      },
      {
        slug: "dyson-vacuum",
        name: "Dyson Vacuum",
        emoji: "\u{1F9F9}",
        tags: ["product"],
        facts: {
          average_price: { value: 499, unit: "$", source: "Dyson", asOf: "2024" },
        },
      },
      {
        slug: "kindle",
        name: "Kindle",
        emoji: "\u{1F4D6}",
        tags: ["product"],
        facts: {
          average_price: { value: 99, unit: "$", source: "Amazon", asOf: "2024" },
        },
      },
    ];

    // Combine all items
    const allItems: SeedItem[] = [
      ...foodItems,
      ...countryItems,
      ...movieItems,
      ...animalItems,
      ...productItems,
    ];

    console.log(`Seeding ${allItems.length} items...`);

    let itemsInserted = 0;
    let itemsUpdated = 0;
    let factsInserted = 0;
    let factsUpdated = 0;

    for (const item of allItems) {
      // Upsert item by slug
      const existing = await ctx.db
        .query("items")
        .withIndex("by_slug", (q) => q.eq("slug", item.slug))
        .first();

      let itemId;
      if (existing) {
        await ctx.db.patch(existing._id, {
          name: item.name,
          emoji: item.emoji,
          tags: item.tags,
          updatedAt: now,
        });
        itemId = existing._id;
        itemsUpdated++;
      } else {
        itemId = await ctx.db.insert("items", {
          name: item.name,
          slug: item.slug,
          emoji: item.emoji,
          tags: item.tags,
          createdAt: now,
          updatedAt: now,
        });
        itemsInserted++;
      }

      // Upsert each fact by itemId + metricKey
      for (const [metricKey, fact] of Object.entries(item.facts)) {
        const existingFact = await ctx.db
          .query("facts")
          .withIndex("by_item_metric", (q) =>
            q.eq("itemId", itemId).eq("metricKey", metricKey)
          )
          .first();

        if (existingFact) {
          await ctx.db.patch(existingFact._id, {
            value: fact.value,
            unit: fact.unit,
            source: fact.source,
            asOf: fact.asOf,
            updatedAt: now,
          });
          factsUpdated++;
        } else {
          await ctx.db.insert("facts", {
            itemId,
            metricKey,
            value: fact.value,
            unit: fact.unit,
            source: fact.source,
            asOf: fact.asOf,
            status: "verified",
            createdAt: now,
            updatedAt: now,
          });
          factsInserted++;
        }
      }
    }

    console.log(
      `Seed complete: categories(+${categoriesInserted} ~${categoriesUpdated}), items(+${itemsInserted} ~${itemsUpdated}), facts(+${factsInserted} ~${factsUpdated}).`
    );
  },
});
