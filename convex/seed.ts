import { internalMutation } from "./_generated/server";

/**
 * Seed script: migrates all 442 items and 12 categories from the legacy
 * static data files into the Convex database.
 *
 * Run with:  npx convex run seed
 *
 * Idempotent -- skips insertion when rows already exist.
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
      {
        label: "Area",
        question: "Which is bigger?",
        metricKey: "area",
        color: "#f0b060",
        unit: "sq mi",
        formatPattern: "{value} sq mi",
        sortOrder: 5,
      },
      {
        label: "Release Year",
        question: "Which came out first?",
        metricKey: "release_year",
        color: "#e88cba",
        unit: "year",
        formatPattern: "{value}",
        sortOrder: 6,
      },
      {
        label: "Instagram Followers",
        question: "Who has more followers?",
        metricKey: "instagram_followers",
        color: "#f77dce",
        unit: "followers",
        formatPattern: "{value}",
        sortOrder: 7,
      },
      {
        label: "Spotify Monthly Listeners",
        question: "Who gets more streams?",
        metricKey: "spotify_monthly_listeners",
        color: "#1db954",
        unit: "listeners",
        formatPattern: "{value}",
        sortOrder: 8,
      },
      {
        label: "Career Points",
        question: "Who scored more?",
        metricKey: "career_points",
        color: "#ff6b4a",
        unit: "points",
        formatPattern: "{value}",
        sortOrder: 9,
      },
      {
        label: "Annual Salary",
        question: "Who earns more?",
        metricKey: "annual_salary",
        color: "#d4af37",
        unit: "$",
        formatPattern: "${value}",
        sortOrder: 10,
      },
      {
        label: "Screen Time",
        question: "Who stares at screens more?",
        metricKey: "screen_time_hours",
        color: "#7eb8da",
        unit: "hrs/day",
        formatPattern: "{value} hrs/day",
        sortOrder: 11,
      },
    ];

    // Check idempotency -- if any category already exists, skip all.
    const existingCategory = await ctx.db
      .query("categories")
      .first();

    let categoriesInserted = 0;
    if (existingCategory) {
      console.log("Categories already seeded -- skipping.");
    } else {
      for (const cat of categoryData) {
        await ctx.db.insert("categories", {
          ...cat,
          enabled: true,
        });
        categoriesInserted++;
      }
      console.log(`Inserted ${categoriesInserted} categories.`);
    }

    // ---------------------------------------------------------------
    // 2. ITEMS + FACTS
    // ---------------------------------------------------------------
    // Check idempotency -- if any item already exists, skip all.
    const existingItem = await ctx.db
      .query("items")
      .first();

    if (existingItem) {
      console.log("Items already seeded -- skipping.");
      console.log("Seed complete (idempotent, no new data).");
      return;
    }

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
      {
        slug: "sushi-roll-8pc",
        name: "Sushi Roll (8pc)",
        emoji: "🍣",
        tags: ["food"],
        facts: {
          calories: { value: 350, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 12, unit: "$", source: "Restaurant average", asOf: "2024" },
        },
      },
      {
        slug: "taco-bell-crunchwrap",
        name: "Taco Bell Crunchwrap",
        emoji: "🌮",
        tags: ["food"],
        facts: {
          calories: { value: 530, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 4.79, unit: "$", source: "Taco Bell menu", asOf: "2024" },
        },
      },
      {
        slug: "wendys-baconator",
        name: "Wendy's Baconator",
        emoji: "🍔",
        tags: ["food"],
        facts: {
          calories: { value: 960, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 8.49, unit: "$", source: "Wendy's menu", asOf: "2024" },
        },
      },
      {
        slug: "fish-and-chips",
        name: "Fish & Chips",
        emoji: "🐟",
        tags: ["food"],
        facts: {
          calories: { value: 840, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 14, unit: "$", source: "Restaurant average", asOf: "2024" },
        },
      },
      {
        slug: "pho",
        name: "Pho",
        emoji: "🍜",
        tags: ["food"],
        facts: {
          calories: { value: 450, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 13, unit: "$", source: "Restaurant average", asOf: "2024" },
        },
      },
      {
        slug: "kebab-plate",
        name: "Kebab Plate",
        emoji: "🥙",
        tags: ["food"],
        facts: {
          calories: { value: 700, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 12, unit: "$", source: "Restaurant average", asOf: "2024" },
        },
      },
      {
        slug: "acai-bowl",
        name: "Açaí Bowl",
        emoji: "🫐",
        tags: ["food"],
        facts: {
          calories: { value: 510, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 11, unit: "$", source: "Restaurant average", asOf: "2024" },
        },
      },
      {
        slug: "dim-sum-6pc",
        name: "Dim Sum (6pc)",
        emoji: "🥟",
        tags: ["food"],
        facts: {
          calories: { value: 320, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 8, unit: "$", source: "Restaurant average", asOf: "2024" },
        },
      },
      {
        slug: "chicken-tikka-masala",
        name: "Chicken Tikka Masala",
        emoji: "🍛",
        tags: ["food"],
        facts: {
          calories: { value: 550, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 15, unit: "$", source: "Restaurant average", asOf: "2024" },
        },
      },
      {
        slug: "waffle-house-waffle",
        name: "Waffle House Waffle",
        emoji: "🧇",
        tags: ["food"],
        facts: {
          calories: { value: 410, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 4.50, unit: "$", source: "Waffle House menu", asOf: "2024" },
        },
      },
      {
        slug: "five-guys-burger",
        name: "Five Guys Burger",
        emoji: "🍔",
        tags: ["food"],
        facts: {
          calories: { value: 840, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 9.79, unit: "$", source: "Five Guys menu", asOf: "2024" },
        },
      },
      {
        slug: "chilis-baby-back-ribs",
        name: "Chili's Baby Back Ribs",
        emoji: "🍖",
        tags: ["food"],
        facts: {
          calories: { value: 1320, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 18, unit: "$", source: "Chili's menu", asOf: "2024" },
        },
      },
      {
        slug: "greek-yogurt-cup",
        name: "Greek Yogurt Cup",
        emoji: "🥛",
        tags: ["food"],
        facts: {
          calories: { value: 150, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 1.50, unit: "$", source: "Grocery store average", asOf: "2024" },
        },
      },
      {
        slug: "oreo-pack-15",
        name: "Oreo Pack (15)",
        emoji: "🍪",
        tags: ["food"],
        facts: {
          calories: { value: 960, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 4.29, unit: "$", source: "Grocery store average", asOf: "2024" },
        },
      },
      {
        slug: "hot-pocket",
        name: "Hot Pocket",
        emoji: "🫓",
        tags: ["food"],
        facts: {
          calories: { value: 290, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 2.50, unit: "$", source: "Grocery store average", asOf: "2024" },
        },
      },
      {
        slug: "lunchable",
        name: "Lunchable",
        emoji: "🧀",
        tags: ["food"],
        facts: {
          calories: { value: 310, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 3.99, unit: "$", source: "Grocery store average", asOf: "2024" },
        },
      },
      {
        slug: "instant-ramen-pack",
        name: "Instant Ramen Pack",
        emoji: "🍜",
        tags: ["food"],
        facts: {
          calories: { value: 380, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 0.50, unit: "$", source: "Grocery store average", asOf: "2024" },
        },
      },
      {
        slug: "protein-bar",
        name: "Protein Bar",
        emoji: "💪",
        tags: ["food"],
        facts: {
          calories: { value: 210, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 2.99, unit: "$", source: "Grocery store average", asOf: "2024" },
        },
      },
      {
        slug: "smoothie-king-smoothie",
        name: "Smoothie King Smoothie",
        emoji: "🥤",
        tags: ["food"],
        facts: {
          calories: { value: 450, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 7.99, unit: "$", source: "Smoothie King menu", asOf: "2024" },
        },
      },
      {
        slug: "churro",
        name: "Churro",
        emoji: "🥖",
        tags: ["food"],
        facts: {
          calories: { value: 240, unit: "cal", source: "USDA FoodData Central", asOf: "2024" },
          average_price: { value: 3.00, unit: "$", source: "Street vendor average", asOf: "2024" },
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
          area: { value: 3705407, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
          screen_time_hours: { value: 5.3, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
        },
      },
      {
        slug: "india",
        name: "India",
        emoji: "\u{1F1EE}\u{1F1F3}",
        tags: ["country"],
        facts: {
          population: { value: 1441000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
          area: { value: 1269219, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
          screen_time_hours: { value: 4.8, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
        },
      },
      {
        slug: "united-states",
        name: "United States",
        emoji: "\u{1F1FA}\u{1F1F8}",
        tags: ["country"],
        facts: {
          population: { value: 340000000, unit: "people", source: "US Census Bureau", asOf: "2024" },
          area: { value: 3796742, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
          screen_time_hours: { value: 7.0, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
        },
      },
      {
        slug: "indonesia",
        name: "Indonesia",
        emoji: "\u{1F1EE}\u{1F1E9}",
        tags: ["country"],
        facts: {
          population: { value: 278000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
          area: { value: 735358, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
          screen_time_hours: { value: 5.4, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
        },
      },
      {
        slug: "brazil",
        name: "Brazil",
        emoji: "\u{1F1E7}\u{1F1F7}",
        tags: ["country"],
        facts: {
          population: { value: 216000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
          area: { value: 3287956, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
          screen_time_hours: { value: 5.4, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
        },
      },
      {
        slug: "japan",
        name: "Japan",
        emoji: "\u{1F1EF}\u{1F1F5}",
        tags: ["country"],
        facts: {
          population: { value: 124000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
          area: { value: 145937, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
          screen_time_hours: { value: 4.4, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
        },
      },
      {
        slug: "germany",
        name: "Germany",
        emoji: "\u{1F1E9}\u{1F1EA}",
        tags: ["country"],
        facts: {
          population: { value: 84000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
          area: { value: 137988, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
          screen_time_hours: { value: 5.0, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
        },
      },
      {
        slug: "united-kingdom",
        name: "United Kingdom",
        emoji: "\u{1F1EC}\u{1F1E7}",
        tags: ["country"],
        facts: {
          population: { value: 68000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
          area: { value: 94058, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
          screen_time_hours: { value: 5.7, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
        },
      },
      {
        slug: "france",
        name: "France",
        emoji: "\u{1F1EB}\u{1F1F7}",
        tags: ["country"],
        facts: {
          population: { value: 66000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
          area: { value: 248573, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
          screen_time_hours: { value: 5.0, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
        },
      },
      {
        slug: "italy",
        name: "Italy",
        emoji: "\u{1F1EE}\u{1F1F9}",
        tags: ["country"],
        facts: {
          population: { value: 59000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
          area: { value: 116348, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
          screen_time_hours: { value: 5.1, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
        },
      },
      {
        slug: "south-korea",
        name: "South Korea",
        emoji: "\u{1F1F0}\u{1F1F7}",
        tags: ["country"],
        facts: {
          population: { value: 52000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
          area: { value: 38502, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
          screen_time_hours: { value: 5.1, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
        },
      },
      {
        slug: "canada",
        name: "Canada",
        emoji: "\u{1F1E8}\u{1F1E6}",
        tags: ["country"],
        facts: {
          population: { value: 41000000, unit: "people", source: "Statistics Canada", asOf: "2024" },
          area: { value: 3855103, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
          screen_time_hours: { value: 6.0, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
        },
      },
      {
        slug: "australia",
        name: "Australia",
        emoji: "\u{1F1E6}\u{1F1FA}",
        tags: ["country"],
        facts: {
          population: { value: 26000000, unit: "people", source: "ABS", asOf: "2024" },
          area: { value: 2969907, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
          screen_time_hours: { value: 5.7, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
        },
      },
      {
        slug: "mexico",
        name: "Mexico",
        emoji: "\u{1F1F2}\u{1F1FD}",
        tags: ["country"],
        facts: {
          population: { value: 130000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
          area: { value: 758449, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
          screen_time_hours: { value: 4.9, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
        },
      },
      {
        slug: "nigeria",
        name: "Nigeria",
        emoji: "\u{1F1F3}\u{1F1EC}",
        tags: ["country"],
        facts: {
          population: { value: 230000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
          area: { value: 356669, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
          screen_time_hours: { value: 4.2, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
        },
      },
      {
        slug: "egypt",
        name: "Egypt",
        emoji: "\u{1F1EA}\u{1F1EC}",
        tags: ["country"],
        facts: {
          population: { value: 105000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
          area: { value: 386662, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
          screen_time_hours: { value: 4.5, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
        },
      },
      {
        slug: "thailand",
        name: "Thailand",
        emoji: "\u{1F1F9}\u{1F1ED}",
        tags: ["country"],
        facts: {
          population: { value: 72000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
          area: { value: 198117, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
          screen_time_hours: { value: 5.7, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
        },
      },
      {
        slug: "spain",
        name: "Spain",
        emoji: "\u{1F1EA}\u{1F1F8}",
        tags: ["country"],
        facts: {
          population: { value: 48000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
          area: { value: 195124, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
          screen_time_hours: { value: 5.3, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
        },
      },
      {
        slug: "argentina",
        name: "Argentina",
        emoji: "\u{1F1E6}\u{1F1F7}",
        tags: ["country"],
        facts: {
          population: { value: 46000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
          area: { value: 1073518, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
          screen_time_hours: { value: 5.2, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
        },
      },
      {
        slug: "new-zealand",
        name: "New Zealand",
        emoji: "\u{1F1F3}\u{1F1FF}",
        tags: ["country"],
        facts: {
          population: { value: 5200000, unit: "people", source: "Stats NZ", asOf: "2024" },
          area: { value: 103483, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
          screen_time_hours: { value: 5.5, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
        },
      },
      {
        slug: "iceland",
        name: "Iceland",
        emoji: "\u{1F1EE}\u{1F1F8}",
        tags: ["country"],
        facts: {
          population: { value: 383000, unit: "people", source: "Statistics Iceland", asOf: "2024" },
          area: { value: 39769, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
          screen_time_hours: { value: 6.5, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
        },
      },
      {
      slug: "vietnam",
      name: "Vietnam",
      emoji: "🇻🇳",
      tags: ["country"],
      facts: {
      population: { value: 99000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
      area: { value: 127882, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
      screen_time_hours: { value: 5.0, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
      },
      },
      {
      slug: "colombia",
      name: "Colombia",
      emoji: "🇨🇴",
      tags: ["country"],
      facts: {
      population: { value: 52000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
      area: { value: 439736, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
      screen_time_hours: { value: 5.1, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
      },
      },
      {
      slug: "kenya",
      name: "Kenya",
      emoji: "🇰🇪",
      tags: ["country"],
      facts: {
      population: { value: 56000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
      area: { value: 224081, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
      screen_time_hours: { value: 4.0, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
      },
      },
      {
      slug: "saudi-arabia",
      name: "Saudi Arabia",
      emoji: "🇸🇦",
      tags: ["country"],
      facts: {
      population: { value: 37000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
      area: { value: 830000, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
      screen_time_hours: { value: 6.2, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
      },
      },
      {
      slug: "poland",
      name: "Poland",
      emoji: "🇵🇱",
      tags: ["country"],
      facts: {
      population: { value: 38000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
      area: { value: 120728, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
      screen_time_hours: { value: 5.3, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
      },
      },
      {
      slug: "philippines",
      name: "Philippines",
      emoji: "🇵🇭",
      tags: ["country"],
      facts: {
      population: { value: 117000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
      area: { value: 115831, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
      screen_time_hours: { value: 5.5, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
      },
      },
      {
      slug: "pakistan",
      name: "Pakistan",
      emoji: "🇵🇰",
      tags: ["country"],
      facts: {
      population: { value: 230000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
      area: { value: 340509, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
      screen_time_hours: { value: 4.3, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
      },
      },
      {
      slug: "bangladesh",
      name: "Bangladesh",
      emoji: "🇧🇩",
      tags: ["country"],
      facts: {
      population: { value: 173000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
      area: { value: 56977, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
      screen_time_hours: { value: 4.1, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
      },
      },
      {
      slug: "turkey",
      name: "Turkey",
      emoji: "🇹🇷",
      tags: ["country"],
      facts: {
      population: { value: 86000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
      area: { value: 302535, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
      screen_time_hours: { value: 5.2, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
      },
      },
      {
      slug: "iran",
      name: "Iran",
      emoji: "🇮🇷",
      tags: ["country"],
      facts: {
      population: { value: 89000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
      area: { value: 636372, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
      screen_time_hours: { value: 4.6, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
      },
      },
      {
      slug: "ethiopia",
      name: "Ethiopia",
      emoji: "🇪🇹",
      tags: ["country"],
      facts: {
      population: { value: 127000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
      area: { value: 426372, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
      screen_time_hours: { value: 3.5, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
      },
      },
      {
      slug: "dr-congo",
      name: "DR Congo",
      emoji: "🇨🇩",
      tags: ["country"],
      facts: {
      population: { value: 102000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
      area: { value: 905355, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
      screen_time_hours: { value: 3.2, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
      },
      },
      {
      slug: "tanzania",
      name: "Tanzania",
      emoji: "🇹🇿",
      tags: ["country"],
      facts: {
      population: { value: 67000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
      area: { value: 365756, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
      screen_time_hours: { value: 3.4, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
      },
      },
      {
      slug: "south-africa",
      name: "South Africa",
      emoji: "🇿🇦",
      tags: ["country"],
      facts: {
      population: { value: 62000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
      area: { value: 471445, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
      screen_time_hours: { value: 5.4, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
      },
      },
      {
      slug: "russia",
      name: "Russia",
      emoji: "🇷🇺",
      tags: ["country"],
      facts: {
      population: { value: 144000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
      area: { value: 6601670, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
      screen_time_hours: { value: 5.8, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
      },
      },
      {
      slug: "sweden",
      name: "Sweden",
      emoji: "🇸🇪",
      tags: ["country"],
      facts: {
      population: { value: 11000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
      area: { value: 173860, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
      screen_time_hours: { value: 5.5, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
      },
      },
      {
      slug: "norway",
      name: "Norway",
      emoji: "🇳🇴",
      tags: ["country"],
      facts: {
      population: { value: 5500000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
      area: { value: 148729, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
      screen_time_hours: { value: 5.8, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
      },
      },
      {
      slug: "switzerland",
      name: "Switzerland",
      emoji: "🇨🇭",
      tags: ["country"],
      facts: {
      population: { value: 9000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
      area: { value: 15940, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
      screen_time_hours: { value: 5.2, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
      },
      },
      {
      slug: "singapore",
      name: "Singapore",
      emoji: "🇸🇬",
      tags: ["country"],
      facts: {
      population: { value: 6000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
      area: { value: 278, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
      screen_time_hours: { value: 6.0, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
      },
      },
      {
      slug: "israel",
      name: "Israel",
      emoji: "🇮🇱",
      tags: ["country"],
      facts: {
      population: { value: 10000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
      area: { value: 8550, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
      screen_time_hours: { value: 5.5, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
      },
      },
      {
      slug: "uae",
      name: "UAE",
      emoji: "🇦🇪",
      tags: ["country"],
      facts: {
      population: { value: 10000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
      area: { value: 32278, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
      screen_time_hours: { value: 6.4, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
      },
      },
      {
      slug: "portugal",
      name: "Portugal",
      emoji: "🇵🇹",
      tags: ["country"],
      facts: {
      population: { value: 10000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
      area: { value: 35556, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
      screen_time_hours: { value: 5.0, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
      },
      },
      {
      slug: "greece",
      name: "Greece",
      emoji: "🇬🇷",
      tags: ["country"],
      facts: {
      population: { value: 10000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
      area: { value: 50949, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
      screen_time_hours: { value: 5.3, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
      },
      },
      {
      slug: "chile",
      name: "Chile",
      emoji: "🇨🇱",
      tags: ["country"],
      facts: {
      population: { value: 20000000, unit: "people", source: "UN World Population Prospects", asOf: "2024" },
      area: { value: 291933, unit: "sq mi", source: "CIA World Factbook", asOf: "2024" },
      screen_time_hours: { value: 5.0, unit: "hrs/day", source: "DataReportal Digital 2024", asOf: "2024" },
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
          release_year: { value: 1994, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
        slug: "the-dark-knight",
        name: "The Dark Knight",
        emoji: "\u{1F987}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 94, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
          release_year: { value: 2008, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
        slug: "pulp-fiction",
        name: "Pulp Fiction",
        emoji: "\u{1F3AC}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 92, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
          release_year: { value: 1994, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
        slug: "forrest-gump",
        name: "Forrest Gump",
        emoji: "\u{1F3C3}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 71, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
          release_year: { value: 1994, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
        slug: "the-lion-king",
        name: "The Lion King (1994)",
        emoji: "\u{1F981}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 93, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
          release_year: { value: 1994, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
        slug: "titanic",
        name: "Titanic",
        emoji: "\u{1F6A2}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 88, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
          release_year: { value: 1997, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
        slug: "jurassic-park",
        name: "Jurassic Park",
        emoji: "\u{1F995}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 93, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
          release_year: { value: 1993, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
        slug: "the-matrix",
        name: "The Matrix",
        emoji: "\u{1F48A}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 83, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
          release_year: { value: 1999, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
        slug: "fight-club",
        name: "Fight Club",
        emoji: "\u{1F94A}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 79, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
          release_year: { value: 1999, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
        slug: "inception",
        name: "Inception",
        emoji: "\u{1F4AD}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 87, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
          release_year: { value: 2010, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
        slug: "toy-story",
        name: "Toy Story",
        emoji: "\u{1F920}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 100, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
          release_year: { value: 1995, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
        slug: "finding-nemo",
        name: "Finding Nemo",
        emoji: "\u{1F41F}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 99, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
          release_year: { value: 2003, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
        slug: "the-avengers",
        name: "The Avengers (2012)",
        emoji: "\u{1F9B8}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 91, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
          release_year: { value: 2012, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
        slug: "frozen",
        name: "Frozen",
        emoji: "\u2744\uFE0F",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 90, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
          release_year: { value: 2013, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
        slug: "star-wars-new-hope",
        name: "Star Wars: A New Hope",
        emoji: "\u2B50",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 93, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
          release_year: { value: 1977, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
        slug: "the-godfather",
        name: "The Godfather",
        emoji: "\u{1F3AC}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 97, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
          release_year: { value: 1972, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
        slug: "jaws",
        name: "Jaws",
        emoji: "\u{1F988}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 97, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
          release_year: { value: 1975, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
        slug: "batman-v-superman",
        name: "Batman v Superman",
        emoji: "\u{1F987}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 29, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
          release_year: { value: 2016, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
        slug: "transformers-2",
        name: "Transformers: Revenge",
        emoji: "\u{1F916}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 20, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
          release_year: { value: 2009, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
        slug: "twilight",
        name: "Twilight",
        emoji: "\u{1F9DB}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 49, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
          release_year: { value: 2008, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
        slug: "cats-2019",
        name: "Cats (2019)",
        emoji: "\u{1F431}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 19, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
          release_year: { value: 2019, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
        slug: "superbad",
        name: "Superbad",
        emoji: "\u{1F389}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 88, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
          release_year: { value: 2007, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
        slug: "parasite",
        name: "Parasite",
        emoji: "\u{1F3E0}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 99, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
          release_year: { value: 2019, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
        slug: "get-out",
        name: "Get Out",
        emoji: "\u{1FAE3}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 98, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
          release_year: { value: 2017, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
        slug: "mean-girls",
        name: "Mean Girls",
        emoji: "\u{1F485}",
        tags: ["movie"],
        facts: {
          rotten_tomatoes: { value: 84, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
          release_year: { value: 2004, unit: "year", source: "IMDb", asOf: "2024" },
        },
      },
      {
      slug: "barbie-2023",
      name: "Barbie (2023)",
      emoji: "🎀",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 88, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 2023, unit: "year", source: "IMDb", asOf: "2024" },
      },
      },
      {
      slug: "oppenheimer",
      name: "Oppenheimer",
      emoji: "💣",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 93, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 2023, unit: "year", source: "IMDb", asOf: "2024" },
      },
      },
      {
      slug: "everything-everywhere-all-at-once",
      name: "Everything Everywhere All at Once",
      emoji: "🥯",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 95, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 2022, unit: "year", source: "IMDb", asOf: "2024" },
      },
      },
      {
      slug: "spider-man-into-the-spider-verse",
      name: "Spider-Man: Into the Spider-Verse",
      emoji: "🕷️",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 97, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 2018, unit: "year", source: "IMDb", asOf: "2024" },
      },
      },
      {
      slug: "inside-out",
      name: "Inside Out",
      emoji: "😊",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 98, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 2015, unit: "year", source: "IMDb", asOf: "2024" },
      },
      },
      {
      slug: "mad-max-fury-road",
      name: "Mad Max: Fury Road",
      emoji: "🔥",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 97, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 2015, unit: "year", source: "IMDb", asOf: "2024" },
      },
      },
      {
      slug: "the-shining",
      name: "The Shining",
      emoji: "🪓",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 83, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 1980, unit: "year", source: "IMDb", asOf: "2024" },
      },
      },
      {
      slug: "alien",
      name: "Alien",
      emoji: "👽",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 98, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 1979, unit: "year", source: "IMDb", asOf: "2024" },
      },
      },
      {
      slug: "goodfellas",
      name: "Goodfellas",
      emoji: "🎰",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 96, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 1990, unit: "year", source: "IMDb", asOf: "2024" },
      },
      },
      {
      slug: "schindlers-list",
      name: "Schindler's List",
      emoji: "📜",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 98, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 1993, unit: "year", source: "IMDb", asOf: "2024" },
      },
      },
      {
      slug: "black-panther",
      name: "Black Panther",
      emoji: "🐾",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 96, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 2018, unit: "year", source: "IMDb", asOf: "2024" },
      },
      },
      {
      slug: "coco",
      name: "Coco",
      emoji: "🎸",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 97, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 2017, unit: "year", source: "IMDb", asOf: "2024" },
      },
      },
      {
      slug: "wall-e",
      name: "WALL-E",
      emoji: "🤖",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 96, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 2008, unit: "year", source: "IMDb", asOf: "2024" },
      },
      },
      {
      slug: "up",
      name: "Up",
      emoji: "🎈",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 98, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 2009, unit: "year", source: "IMDb", asOf: "2024" },
      },
      },
      {
      slug: "the-incredibles",
      name: "The Incredibles",
      emoji: "🦸",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 97, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 2004, unit: "year", source: "IMDb", asOf: "2024" },
      },
      },
      {
      slug: "dune-2021",
      name: "Dune (2021)",
      emoji: "🏜️",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 83, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 2021, unit: "year", source: "IMDb", asOf: "2024" },
      },
      },
      {
      slug: "top-gun-maverick",
      name: "Top Gun: Maverick",
      emoji: "✈️",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 96, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 2022, unit: "year", source: "IMDb", asOf: "2024" },
      },
      },
      {
      slug: "john-wick",
      name: "John Wick",
      emoji: "🔫",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 86, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 2014, unit: "year", source: "IMDb", asOf: "2024" },
      },
      },
      {
      slug: "la-la-land",
      name: "La La Land",
      emoji: "🌙",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 91, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 2016, unit: "year", source: "IMDb", asOf: "2024" },
      },
      },
      {
      slug: "moonlight",
      name: "Moonlight",
      emoji: "🌊",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 98, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 2016, unit: "year", source: "IMDb", asOf: "2024" },
      },
      },
      {
      slug: "the-room-2003",
      name: "The Room (2003)",
      emoji: "🥄",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 25, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 2003, unit: "year", source: "IMDb", asOf: "2024" },
      },
      },
      {
      slug: "emoji-movie",
      name: "Emoji Movie",
      emoji: "💩",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 6, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 2017, unit: "year", source: "IMDb", asOf: "2024" },
      },
      },
      {
      slug: "morbius",
      name: "Morbius",
      emoji: "🧛",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 15, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 2022, unit: "year", source: "IMDb", asOf: "2024" },
      },
      },
      {
      slug: "minions",
      name: "Minions",
      emoji: "🍌",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 55, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 2015, unit: "year", source: "IMDb", asOf: "2024" },
      },
      },
      {
      slug: "fast-and-furious-9",
      name: "Fast & Furious 9",
      emoji: "🏎️",
      tags: ["movie"],
      facts: {
      rotten_tomatoes: { value: 60, unit: "%", source: "Rotten Tomatoes", asOf: "2024" },
      release_year: { value: 2021, unit: "year", source: "IMDb", asOf: "2024" },
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
      {
      slug: "blue-whale",
      name: "Blue Whale",
      emoji: "🐋",
      tags: ["animal"],
      facts: {
      top_speed: { value: 20, unit: "mph", source: "National Geographic", asOf: "2024" },
      },
      },
      {
      slug: "roadrunner",
      name: "Roadrunner",
      emoji: "🐦",
      tags: ["animal"],
      facts: {
      top_speed: { value: 20, unit: "mph", source: "National Geographic", asOf: "2024" },
      },
      },
      {
      slug: "gorilla",
      name: "Gorilla",
      emoji: "🦍",
      tags: ["animal"],
      facts: {
      top_speed: { value: 25, unit: "mph", source: "National Geographic", asOf: "2024" },
      },
      },
      {
      slug: "gazelle",
      name: "Gazelle",
      emoji: "🦌",
      tags: ["animal"],
      facts: {
      top_speed: { value: 60, unit: "mph", source: "National Geographic", asOf: "2024" },
      },
      },
      {
      slug: "lynx",
      name: "Lynx",
      emoji: "🐱",
      tags: ["animal"],
      facts: {
      top_speed: { value: 50, unit: "mph", source: "National Geographic", asOf: "2024" },
      },
      },
      {
      slug: "wolverine",
      name: "Wolverine",
      emoji: "🦡",
      tags: ["animal"],
      facts: {
      top_speed: { value: 30, unit: "mph", source: "National Geographic", asOf: "2024" },
      },
      },
      {
      slug: "honey-badger",
      name: "Honey Badger",
      emoji: "🦡",
      tags: ["animal"],
      facts: {
      top_speed: { value: 19, unit: "mph", source: "National Geographic", asOf: "2024" },
      },
      },
      {
      slug: "anaconda",
      name: "Anaconda",
      emoji: "🐍",
      tags: ["animal"],
      facts: {
      top_speed: { value: 5, unit: "mph", source: "National Geographic", asOf: "2024" },
      },
      },
      {
      slug: "tasmanian-devil",
      name: "Tasmanian Devil",
      emoji: "😈",
      tags: ["animal"],
      facts: {
      top_speed: { value: 8, unit: "mph", source: "National Geographic", asOf: "2024" },
      },
      },
      {
      slug: "warthog",
      name: "Warthog",
      emoji: "🐗",
      tags: ["animal"],
      facts: {
      top_speed: { value: 30, unit: "mph", source: "National Geographic", asOf: "2024" },
      },
      },
      {
      slug: "mako-shark",
      name: "Mako Shark",
      emoji: "🦈",
      tags: ["animal"],
      facts: {
      top_speed: { value: 46, unit: "mph", source: "National Geographic", asOf: "2024" },
      },
      },
      {
      slug: "dragonfly",
      name: "Dragonfly",
      emoji: "🪰",
      tags: ["animal"],
      facts: {
      top_speed: { value: 35, unit: "mph", source: "National Geographic", asOf: "2024" },
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
          release_year: { value: 2024, unit: "year", source: "Apple", asOf: "2024" },
        },
      },
      {
        slug: "macbook-pro",
        name: "MacBook Pro",
        emoji: "\u{1F4BB}",
        tags: ["product"],
        facts: {
          average_price: { value: 1999, unit: "$", source: "Apple", asOf: "2024" },
          release_year: { value: 2023, unit: "year", source: "Apple", asOf: "2024" },
        },
      },
      {
        slug: "tesla-model-3",
        name: "Tesla Model 3",
        emoji: "\u{1F697}",
        tags: ["product"],
        facts: {
          average_price: { value: 38990, unit: "$", source: "Tesla", asOf: "2024" },
          release_year: { value: 2017, unit: "year", source: "Tesla", asOf: "2024" },
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
          release_year: { value: 2022, unit: "year", source: "Apple", asOf: "2024" },
        },
      },
      {
        slug: "ps5",
        name: "PS5",
        emoji: "\u{1F3AE}",
        tags: ["product"],
        facts: {
          average_price: { value: 499, unit: "$", source: "Sony", asOf: "2024" },
          release_year: { value: 2020, unit: "year", source: "Sony", asOf: "2024" },
        },
      },
      {
        slug: "nintendo-switch",
        name: "Nintendo Switch",
        emoji: "\u{1F3AE}",
        tags: ["product"],
        facts: {
          average_price: { value: 299, unit: "$", source: "Nintendo", asOf: "2024" },
          release_year: { value: 2017, unit: "year", source: "Nintendo", asOf: "2024" },
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
          release_year: { value: 2024, unit: "year", source: "GoPro", asOf: "2024" },
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
          release_year: { value: 2007, unit: "year", source: "Amazon", asOf: "2024" },
        },
      },
      {
      slug: "steam-deck",
      name: "Steam Deck",
      emoji: "🎮",
      tags: ["product"],
      facts: {
      average_price: { value: 399, unit: "$", source: "Valve Store", asOf: "2024" },
      release_year: { value: 2022, unit: "year", source: "manufacturer", asOf: "2024" },
      },
      },
      {
      slug: "apple-vision-pro",
      name: "Apple Vision Pro",
      emoji: "🥽",
      tags: ["product"],
      facts: {
      average_price: { value: 3499, unit: "$", source: "Apple Store", asOf: "2024" },
      release_year: { value: 2024, unit: "year", source: "manufacturer", asOf: "2024" },
      },
      },
      {
      slug: "meta-quest-3",
      name: "Meta Quest 3",
      emoji: "🕶️",
      tags: ["product"],
      facts: {
      average_price: { value: 499, unit: "$", source: "Meta Store", asOf: "2024" },
      release_year: { value: 2023, unit: "year", source: "manufacturer", asOf: "2024" },
      },
      },
      {
      slug: "costco-rotisserie-chicken",
      name: "Costco Rotisserie Chicken",
      emoji: "🍗",
      tags: ["product"],
      facts: {
      average_price: { value: 4.99, unit: "$", source: "Costco", asOf: "2024" },
      },
      },
      {
      slug: "ikea-kallax-shelf",
      name: "IKEA KALLAX Shelf",
      emoji: "🗄️",
      tags: ["product"],
      facts: {
      average_price: { value: 69.99, unit: "$", source: "IKEA", asOf: "2024" },
      },
      },
      {
      slug: "crocs",
      name: "Crocs",
      emoji: "🐊",
      tags: ["product"],
      facts: {
      average_price: { value: 49.99, unit: "$", source: "Crocs.com", asOf: "2024" },
      },
      },
      {
      slug: "patagonia-puffer",
      name: "Patagonia Puffer",
      emoji: "🧥",
      tags: ["product"],
      facts: {
      average_price: { value: 279, unit: "$", source: "Patagonia", asOf: "2024" },
      },
      },
      {
      slug: "airbnb-night-avg",
      name: "Airbnb Night (avg)",
      emoji: "🏠",
      tags: ["product"],
      facts: {
      average_price: { value: 160, unit: "$", source: "Airbnb market data", asOf: "2024" },
      },
      },
      {
      slug: "uber-eats-delivery-fee",
      name: "Uber Eats Delivery Fee",
      emoji: "🛵",
      tags: ["product"],
      facts: {
      average_price: { value: 5.99, unit: "$", source: "Uber Eats", asOf: "2024" },
      },
      },
      {
      slug: "peloton-bike",
      name: "Peloton Bike",
      emoji: "🚴",
      tags: ["product"],
      facts: {
      average_price: { value: 1445, unit: "$", source: "Peloton", asOf: "2024" },
      release_year: { value: 2019, unit: "year", source: "manufacturer", asOf: "2024" },
      },
      },
      {
      slug: "roomba",
      name: "Roomba",
      emoji: "🤖",
      tags: ["product"],
      facts: {
      average_price: { value: 349, unit: "$", source: "iRobot", asOf: "2024" },
      },
      },
      {
      slug: "instant-pot",
      name: "Instant Pot",
      emoji: "🍲",
      tags: ["product"],
      facts: {
      average_price: { value: 89, unit: "$", source: "Amazon", asOf: "2024" },
      },
      },
      {
      slug: "bose-quietcomfort",
      name: "Bose QuietComfort",
      emoji: "🎧",
      tags: ["product"],
      facts: {
      average_price: { value: 349, unit: "$", source: "Bose", asOf: "2024" },
      },
      },
      {
      slug: "canada-goose-jacket",
      name: "Canada Goose Jacket",
      emoji: "🧥",
      tags: ["product"],
      facts: {
      average_price: { value: 1095, unit: "$", source: "Canada Goose", asOf: "2024" },
      },
      },
      {
      slug: "allbirds-runners",
      name: "Allbirds Runners",
      emoji: "👟",
      tags: ["product"],
      facts: {
      average_price: { value: 98, unit: "$", source: "Allbirds", asOf: "2024" },
      },
      },
      {
      slug: "oura-ring",
      name: "Oura Ring",
      emoji: "💍",
      tags: ["product"],
      facts: {
      average_price: { value: 299, unit: "$", source: "Oura", asOf: "2024" },
      release_year: { value: 2022, unit: "year", source: "manufacturer", asOf: "2024" },
      },
      },
      {
      slug: "theragun",
      name: "Theragun",
      emoji: "🔫",
      tags: ["product"],
      facts: {
      average_price: { value: 299, unit: "$", source: "Therabody", asOf: "2024" },
      },
      },
      {
      slug: "vitamix-blender",
      name: "Vitamix Blender",
      emoji: "🫙",
      tags: ["product"],
      facts: {
      average_price: { value: 449, unit: "$", source: "Vitamix", asOf: "2024" },
      },
      },
    ];


    // --- MUSIC ARTISTS (instagram, spotify, salary) ---  [40 items]
    const musicArtistItems: SeedItem[] = [
      {
      slug: "taylor-swift",
      name: "Taylor Swift",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 283000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 88000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 200000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "drake",
      name: "Drake",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 146000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 79000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 120000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "bad-bunny",
      name: "Bad Bunny",
      emoji: "🎵",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 47000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 69000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 90000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "bts",
      name: "BTS",
      emoji: "🎵",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 79000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 50000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 80000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "beyonce",
      name: "Beyoncé",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 319000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 55000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 115000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "billie-eilish",
      name: "Billie Eilish",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 110000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 65000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 30000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "the-weeknd",
      name: "The Weeknd",
      emoji: "🎵",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 74000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 95000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 75000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "ed-sheeran",
      name: "Ed Sheeran",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 44000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 82000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 110000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "ariana-grande",
      name: "Ariana Grande",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 378000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 70000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 55000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "justin-bieber",
      name: "Justin Bieber",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 293000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 65000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 50000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "rihanna",
      name: "Rihanna",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 151000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 57000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 80000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "post-malone",
      name: "Post Malone",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 26000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 55000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 45000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "dua-lipa",
      name: "Dua Lipa",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 88000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 60000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 35000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "harry-styles",
      name: "Harry Styles",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 49000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 45000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 40000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "shakira",
      name: "Shakira",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 92000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 40000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 35000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "kanye-west",
      name: "Kanye West",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 18000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 52000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 60000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "travis-scott",
      name: "Travis Scott",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 51000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 48000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 65000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "olivia-rodrigo",
      name: "Olivia Rodrigo",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 35000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 45000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 20000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "doja-cat",
      name: "Doja Cat",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 25000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 50000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 25000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "sza",
      name: "SZA",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 15000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 45000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 15000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "eminem",
      name: "Eminem",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 38000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 52000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 50000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "adele",
      name: "Adele",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 56000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 48000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 60000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "bruno-mars",
      name: "Bruno Mars",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 37000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 55000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 45000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "lady-gaga",
      name: "Lady Gaga",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 56000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 42000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 40000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "kendrick-lamar",
      name: "Kendrick Lamar",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 17000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 40000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 35000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "j-balvin",
      name: "J Balvin",
      emoji: "🎵",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 52000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 38000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 25000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "coldplay",
      name: "Coldplay",
      emoji: "🎵",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 27000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 58000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 35000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "imagine-dragons",
      name: "Imagine Dragons",
      emoji: "🎵",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 12000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 50000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 25000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "miley-cyrus",
      name: "Miley Cyrus",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 215000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 45000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 25000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "nicki-minaj",
      name: "Nicki Minaj",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 228000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 40000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 30000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "luke-combs",
      name: "Luke Combs",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 5000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 30000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 20000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "morgan-wallen",
      name: "Morgan Wallen",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 5000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 35000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 22000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "karol-g",
      name: "Karol G",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 65000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 42000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 20000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "blackpink",
      name: "BLACKPINK",
      emoji: "🎵",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 72000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 35000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 40000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "peso-pluma",
      name: "Peso Pluma",
      emoji: "🎵",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 15000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 30000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 15000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "tyler-the-creator",
      name: "Tyler, the Creator",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 18000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 25000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 16000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "lana-del-rey",
      name: "Lana Del Rey",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 24000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 35000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 18000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "metro-boomin",
      name: "Metro Boomin",
      emoji: "🎵",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 9000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 30000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 20000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "21-savage",
      name: "21 Savage",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 16000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 28000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 18000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "sabrina-carpenter",
      name: "Sabrina Carpenter",
      emoji: "🎤",
      tags: ["music_artist"],
      facts: {
      instagram_followers: { value: 38000000, unit: "followers", source: "Instagram", asOf: "2024" },
      spotify_monthly_listeners: { value: 55000000, unit: "listeners", source: "Spotify", asOf: "2024" },
      annual_salary: { value: 12000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
    ];

    // --- ATHLETES (instagram, career_points, salary) ---  [40 items]
    const athleteItems: SeedItem[] = [
      {
      slug: "cristiano-ronaldo",
      name: "Cristiano Ronaldo",
      emoji: "⚽",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 640000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 900, unit: "points", source: "Transfermarkt", asOf: "2024" },
      annual_salary: { value: 136000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "lionel-messi",
      name: "Lionel Messi",
      emoji: "⚽",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 503000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 838, unit: "points", source: "Transfermarkt", asOf: "2024" },
      annual_salary: { value: 130000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "lebron-james",
      name: "LeBron James",
      emoji: "🏀",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 159000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 40474, unit: "points", source: "NBA", asOf: "2024" },
      annual_salary: { value: 46000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "virat-kohli",
      name: "Virat Kohli",
      emoji: "🏏",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 271000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 27000, unit: "points", source: "ESPN Cricinfo", asOf: "2024" },
      annual_salary: { value: 26000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "serena-williams",
      name: "Serena Williams",
      emoji: "🎾",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 17000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 23, unit: "points", source: "WTA", asOf: "2024" },
      annual_salary: { value: 35000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "neymar",
      name: "Neymar",
      emoji: "⚽",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 228000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 440, unit: "points", source: "Transfermarkt", asOf: "2024" },
      annual_salary: { value: 55000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "stephen-curry",
      name: "Stephen Curry",
      emoji: "🏀",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 50000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 23000, unit: "points", source: "NBA", asOf: "2024" },
      annual_salary: { value: 52000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "kylian-mbappe",
      name: "Kylian Mbapp\u00e9",
      emoji: "⚽",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 115000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 300, unit: "points", source: "Transfermarkt", asOf: "2024" },
      annual_salary: { value: 90000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "tom-brady",
      name: "Tom Brady",
      emoji: "🏈",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 15000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 649, unit: "points", source: "NFL", asOf: "2024" },
      annual_salary: { value: 84000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "roger-federer",
      name: "Roger Federer",
      emoji: "🎾",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 12000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 20, unit: "points", source: "ATP", asOf: "2024" },
      annual_salary: { value: 90000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "rafael-nadal",
      name: "Rafael Nadal",
      emoji: "🎾",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 20000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 22, unit: "points", source: "ATP", asOf: "2024" },
      annual_salary: { value: 30000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "novak-djokovic",
      name: "Novak Djokovic",
      emoji: "🎾",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 13000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 24, unit: "points", source: "ATP", asOf: "2024" },
      annual_salary: { value: 25000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "kevin-durant",
      name: "Kevin Durant",
      emoji: "🏀",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 15000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 28000, unit: "points", source: "NBA", asOf: "2024" },
      annual_salary: { value: 44000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "giannis-antetokounmpo",
      name: "Giannis Antetokounmpo",
      emoji: "🏀",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 16000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 16000, unit: "points", source: "NBA", asOf: "2024" },
      annual_salary: { value: 45000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "erling-haaland",
      name: "Erling Haaland",
      emoji: "⚽",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 35000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 250, unit: "points", source: "Transfermarkt", asOf: "2024" },
      annual_salary: { value: 35000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "patrick-mahomes",
      name: "Patrick Mahomes",
      emoji: "🏈",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 6000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 200, unit: "points", source: "NFL", asOf: "2024" },
      annual_salary: { value: 53000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "lewis-hamilton",
      name: "Lewis Hamilton",
      emoji: "🏎️",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 36000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 104, unit: "points", source: "Formula1.com", asOf: "2024" },
      annual_salary: { value: 55000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "usain-bolt-athlete",
      name: "Usain Bolt",
      emoji: "🏃",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 12000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 23, unit: "points", source: "World Athletics", asOf: "2024" },
      annual_salary: { value: 20000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "michael-phelps",
      name: "Michael Phelps",
      emoji: "🏊",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 5000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 28, unit: "points", source: "Olympics", asOf: "2024" },
      annual_salary: { value: 10000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "simone-biles",
      name: "Simone Biles",
      emoji: "🤸",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 7000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 37, unit: "points", source: "FIG", asOf: "2024" },
      annual_salary: { value: 10000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "tiger-woods",
      name: "Tiger Woods",
      emoji: "⛳",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 4000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 82, unit: "points", source: "PGA Tour", asOf: "2024" },
      annual_salary: { value: 40000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "connor-mcdavid",
      name: "Connor McDavid",
      emoji: "🏒",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 3000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 982, unit: "points", source: "NHL", asOf: "2024" },
      annual_salary: { value: 16000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "mohamed-salah",
      name: "Mohamed Salah",
      emoji: "⚽",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 63000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 300, unit: "points", source: "Transfermarkt", asOf: "2024" },
      annual_salary: { value: 35000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "luka-doncic",
      name: "Luka Don\u010di\u0107",
      emoji: "🏀",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 11000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 10000, unit: "points", source: "NBA", asOf: "2024" },
      annual_salary: { value: 40000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "shohei-ohtani",
      name: "Shohei Ohtani",
      emoji: "⚾",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 8000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 225, unit: "points", source: "MLB", asOf: "2024" },
      annual_salary: { value: 70000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "conor-mcgregor",
      name: "Conor McGregor",
      emoji: "🥊",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 47000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 22, unit: "points", source: "UFC", asOf: "2024" },
      annual_salary: { value: 30000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "max-verstappen",
      name: "Max Verstappen",
      emoji: "🏎️",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 12000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 62, unit: "points", source: "Formula1.com", asOf: "2024" },
      annual_salary: { value: 55000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "naomi-osaka",
      name: "Naomi Osaka",
      emoji: "🎾",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 6000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 4, unit: "points", source: "WTA", asOf: "2024" },
      annual_salary: { value: 15000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "aaron-judge",
      name: "Aaron Judge",
      emoji: "⚾",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 4000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 300, unit: "points", source: "MLB", asOf: "2024" },
      annual_salary: { value: 40000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "nikola-jokic",
      name: "Nikola Joki\u0107",
      emoji: "🏀",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 3000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 14000, unit: "points", source: "NBA", asOf: "2024" },
      annual_salary: { value: 47000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "lamar-jackson",
      name: "Lamar Jackson",
      emoji: "🏈",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 3000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 130, unit: "points", source: "NFL", asOf: "2024" },
      annual_salary: { value: 52000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "travis-kelce",
      name: "Travis Kelce",
      emoji: "🏈",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 5000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 76, unit: "points", source: "NFL", asOf: "2024" },
      annual_salary: { value: 17000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "jayson-tatum",
      name: "Jayson Tatum",
      emoji: "🏀",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 8000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 12000, unit: "points", source: "NBA", asOf: "2024" },
      annual_salary: { value: 32000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "bukayo-saka",
      name: "Bukayo Saka",
      emoji: "⚽",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 6000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 80, unit: "points", source: "Transfermarkt", asOf: "2024" },
      annual_salary: { value: 15000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "jude-bellingham",
      name: "Jude Bellingham",
      emoji: "⚽",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 30000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 70, unit: "points", source: "Transfermarkt", asOf: "2024" },
      annual_salary: { value: 18000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "ms-dhoni",
      name: "MS Dhoni",
      emoji: "🏏",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 40000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 17000, unit: "points", source: "ESPN Cricinfo", asOf: "2024" },
      annual_salary: { value: 20000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "sachin-tendulkar",
      name: "Sachin Tendulkar",
      emoji: "🏏",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 45000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 34357, unit: "points", source: "ESPN Cricinfo", asOf: "2024" },
      annual_salary: { value: 15000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "caitlin-clark",
      name: "Caitlin Clark",
      emoji: "🏀",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 3000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 3951, unit: "points", source: "NCAA", asOf: "2024" },
      annual_salary: { value: 8000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "alex-morgan",
      name: "Alex Morgan",
      emoji: "⚽",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 10000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 123, unit: "points", source: "US Soccer", asOf: "2024" },
      annual_salary: { value: 6000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "megan-rapinoe",
      name: "Megan Rapinoe",
      emoji: "⚽",
      tags: ["athlete"],
      facts: {
      instagram_followers: { value: 3000000, unit: "followers", source: "Instagram", asOf: "2024" },
      career_points: { value: 63, unit: "points", source: "US Soccer", asOf: "2024" },
      annual_salary: { value: 5000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
    ];

    // --- CELEBRITIES (instagram, salary) ---  [30 items]
    const celebrityItems: SeedItem[] = [
      {
      slug: "mrbeast",
      name: "MrBeast",
      emoji: "📹",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 60000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 82000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "kylie-jenner",
      name: "Kylie Jenner",
      emoji: "🌟",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 399000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 65000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "the-rock",
      name: "The Rock (Dwayne Johnson)",
      emoji: "🎬",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 395000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 87000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "khaby-lame",
      name: "Khaby Lame",
      emoji: "📹",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 80000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 16000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "kim-kardashian",
      name: "Kim Kardashian",
      emoji: "🌟",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 364000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 60000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "selena-gomez",
      name: "Selena Gomez",
      emoji: "🌟",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 430000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 40000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "jennifer-aniston",
      name: "Jennifer Aniston",
      emoji: "🎬",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 45000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 20000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "oprah-winfrey",
      name: "Oprah Winfrey",
      emoji: "🌟",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 22000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 75000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "kevin-hart",
      name: "Kevin Hart",
      emoji: "🎬",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 180000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 45000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "will-smith",
      name: "Will Smith",
      emoji: "🎬",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 65000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 35000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "zendaya",
      name: "Zendaya",
      emoji: "🎬",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 185000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 25000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "tom-holland",
      name: "Tom Holland",
      emoji: "🎬",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 68000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 20000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "ryan-reynolds",
      name: "Ryan Reynolds",
      emoji: "🎬",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 48000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 30000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "chris-hemsworth",
      name: "Chris Hemsworth",
      emoji: "🎬",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 59000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 25000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "margot-robbie",
      name: "Margot Robbie",
      emoji: "🎬",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 28000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 20000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "timothee-chalamet",
      name: "Timoth\u00e9e Chalamet",
      emoji: "🎬",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 20000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 15000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "emma-watson",
      name: "Emma Watson",
      emoji: "🎬",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 72000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 12000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "ellen-degeneres",
      name: "Ellen DeGeneres",
      emoji: "🌟",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 130000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 20000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "jimmy-fallon",
      name: "Jimmy Fallon",
      emoji: "🌟",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 17000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 16000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "joe-rogan",
      name: "Joe Rogan",
      emoji: "🎙️",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 17000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 45000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "pewdiepie",
      name: "PewDiePie",
      emoji: "📹",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 22000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 15000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "addison-rae",
      name: "Addison Rae",
      emoji: "🌟",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 38000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 10000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "david-beckham",
      name: "David Beckham",
      emoji: "🌟",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 87000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 45000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "priyanka-chopra",
      name: "Priyanka Chopra",
      emoji: "🎬",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 90000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 20000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "gal-gadot",
      name: "Gal Gadot",
      emoji: "🎬",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 88000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 18000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "robert-downey-jr",
      name: "Robert Downey Jr.",
      emoji: "🎬",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 52000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 25000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "mark-zuckerberg",
      name: "Mark Zuckerberg",
      emoji: "💻",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 14000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 50000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "elon-musk",
      name: "Elon Musk",
      emoji: "🚀",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 8000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 100000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "gordon-ramsay",
      name: "Gordon Ramsay",
      emoji: "👨‍🍳",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 17000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 22000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
      {
      slug: "charli-damelio",
      name: "Charli D'Amelio",
      emoji: "📹",
      tags: ["celebrity"],
      facts: {
      instagram_followers: { value: 55000000, unit: "followers", source: "Instagram", asOf: "2024" },
      annual_salary: { value: 14000000, unit: "$", source: "Forbes", asOf: "2024" },
      },
      },
    ];

    // --- CITIES (population, area) ---  [30 items]
    const cityItems: SeedItem[] = [
      {
      slug: "tokyo",
      name: "Tokyo",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 14000000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 845, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "new-york-city",
      name: "New York City",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 8300000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 302, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "london",
      name: "London",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 9000000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 607, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "lagos",
      name: "Lagos",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 16000000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 452, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "mumbai",
      name: "Mumbai",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 21000000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 233, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "sao-paulo",
      name: "São Paulo",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 12000000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 587, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "shanghai",
      name: "Shanghai",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 29000000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 2448, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "delhi",
      name: "Delhi",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 32000000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 573, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "mexico-city",
      name: "Mexico City",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 22000000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 573, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "cairo",
      name: "Cairo",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 22000000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 175, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "istanbul",
      name: "Istanbul",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 16000000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 2063, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "beijing",
      name: "Beijing",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 22000000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 6336, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "bangkok",
      name: "Bangkok",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 11000000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 606, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "los-angeles",
      name: "Los Angeles",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 4000000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 469, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "paris",
      name: "Paris",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 2100000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 41, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "seoul",
      name: "Seoul",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 9700000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 234, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "jakarta",
      name: "Jakarta",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 11000000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 255, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "lima",
      name: "Lima",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 11000000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 1031, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "dhaka",
      name: "Dhaka",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 23000000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 118, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "buenos-aires",
      name: "Buenos Aires",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 3100000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 78, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "moscow",
      name: "Moscow",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 13000000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 970, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "nairobi",
      name: "Nairobi",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 5000000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 270, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "dubai",
      name: "Dubai",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 3600000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 1588, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "toronto",
      name: "Toronto",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 2800000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 243, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "sydney",
      name: "Sydney",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 5300000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 4775, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "berlin",
      name: "Berlin",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 3600000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 344, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "singapore-city",
      name: "Singapore City",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 5600000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 278, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "hong-kong",
      name: "Hong Kong",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 7400000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 427, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "bogota",
      name: "Bogotá",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 8000000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 613, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
      {
      slug: "karachi",
      name: "Karachi",
      emoji: "🏙️",
      tags: ["city"],
      facts: {
      population: { value: 16000000, unit: "people", source: "UN World Urbanization Prospects", asOf: "2024" },
      area: { value: 1362, unit: "sq mi", source: "City government data", asOf: "2024" },
      },
      },
    ];

    // --- US STATES (population, area) ---  [25 items]
    const usStateItems: SeedItem[] = [
      {
      slug: "california",
      name: "California",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 39000000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 163696, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
      {
      slug: "texas",
      name: "Texas",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 30000000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 268596, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
      {
      slug: "florida",
      name: "Florida",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 23000000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 65758, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
      {
      slug: "new-york",
      name: "New York",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 19000000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 54555, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
      {
      slug: "alaska",
      name: "Alaska",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 733000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 665384, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
      {
      slug: "rhode-island",
      name: "Rhode Island",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 1100000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 1545, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
      {
      slug: "wyoming",
      name: "Wyoming",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 577000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 97813, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
      {
      slug: "montana",
      name: "Montana",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 1100000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 147040, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
      {
      slug: "pennsylvania",
      name: "Pennsylvania",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 13000000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 46054, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
      {
      slug: "illinois",
      name: "Illinois",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 12500000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 57914, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
      {
      slug: "ohio",
      name: "Ohio",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 11800000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 44826, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
      {
      slug: "georgia",
      name: "Georgia",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 11000000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 59425, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
      {
      slug: "michigan",
      name: "Michigan",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 10000000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 96714, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
      {
      slug: "colorado",
      name: "Colorado",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 5900000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 104094, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
      {
      slug: "arizona",
      name: "Arizona",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 7400000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 113990, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
      {
      slug: "massachusetts",
      name: "Massachusetts",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 7000000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 10554, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
      {
      slug: "washington",
      name: "Washington",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 7800000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 71298, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
      {
      slug: "oregon",
      name: "Oregon",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 4200000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 98379, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
      {
      slug: "hawaii",
      name: "Hawaii",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 1400000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 10932, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
      {
      slug: "vermont",
      name: "Vermont",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 647000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 9616, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
      {
      slug: "nevada",
      name: "Nevada",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 3200000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 110572, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
      {
      slug: "minnesota",
      name: "Minnesota",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 5700000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 86936, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
      {
      slug: "virginia",
      name: "Virginia",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 8600000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 42775, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
      {
      slug: "tennessee",
      name: "Tennessee",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 7000000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 42144, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
      {
      slug: "louisiana",
      name: "Louisiana",
      emoji: "🏛️",
      tags: ["us_state"],
      facts: {
      population: { value: 4600000, unit: "people", source: "US Census Bureau", asOf: "2024" },
      area: { value: 52378, unit: "sq mi", source: "US Census Bureau", asOf: "2024" },
      },
      },
    ];

    // --- VIDEO GAMES (release_year) ---  [25 items]
    const videoGameItems: SeedItem[] = [
      {
      slug: "minecraft",
      name: "Minecraft",
      emoji: "⛏️",
      tags: ["video_game"],
      facts: {
      release_year: { value: 2011, unit: "year", source: "publisher", asOf: "2024" },
      },
      },
      {
      slug: "gta-v",
      name: "GTA V",
      emoji: "🚗",
      tags: ["video_game"],
      facts: {
      release_year: { value: 2013, unit: "year", source: "publisher", asOf: "2024" },
      },
      },
      {
      slug: "elden-ring",
      name: "Elden Ring",
      emoji: "💍",
      tags: ["video_game"],
      facts: {
      release_year: { value: 2022, unit: "year", source: "publisher", asOf: "2024" },
      },
      },
      {
      slug: "tetris",
      name: "Tetris",
      emoji: "🧱",
      tags: ["video_game"],
      facts: {
      release_year: { value: 1984, unit: "year", source: "publisher", asOf: "2024" },
      },
      },
      {
      slug: "the-legend-of-zelda-breath-of-the-wild",
      name: "The Legend of Zelda: Breath of the Wild",
      emoji: "🗡️",
      tags: ["video_game"],
      facts: {
      release_year: { value: 2017, unit: "year", source: "publisher", asOf: "2024" },
      },
      },
      {
      slug: "fortnite",
      name: "Fortnite",
      emoji: "🪂",
      tags: ["video_game"],
      facts: {
      release_year: { value: 2017, unit: "year", source: "publisher", asOf: "2024" },
      },
      },
      {
      slug: "among-us",
      name: "Among Us",
      emoji: "📮",
      tags: ["video_game"],
      facts: {
      release_year: { value: 2018, unit: "year", source: "publisher", asOf: "2024" },
      },
      },
      {
      slug: "pac-man",
      name: "Pac-Man",
      emoji: "🟡",
      tags: ["video_game"],
      facts: {
      release_year: { value: 1980, unit: "year", source: "publisher", asOf: "2024" },
      },
      },
      {
      slug: "super-mario-bros",
      name: "Super Mario Bros",
      emoji: "🍄",
      tags: ["video_game"],
      facts: {
      release_year: { value: 1985, unit: "year", source: "publisher", asOf: "2024" },
      },
      },
      {
      slug: "pokemon-red-blue",
      name: "Pokémon Red/Blue",
      emoji: "🔴",
      tags: ["video_game"],
      facts: {
      release_year: { value: 1996, unit: "year", source: "publisher", asOf: "2024" },
      },
      },
      {
      slug: "the-last-of-us",
      name: "The Last of Us",
      emoji: "🍂",
      tags: ["video_game"],
      facts: {
      release_year: { value: 2013, unit: "year", source: "publisher", asOf: "2024" },
      },
      },
      {
      slug: "red-dead-redemption-2",
      name: "Red Dead Redemption 2",
      emoji: "🤠",
      tags: ["video_game"],
      facts: {
      release_year: { value: 2018, unit: "year", source: "publisher", asOf: "2024" },
      },
      },
      {
      slug: "portal-2",
      name: "Portal 2",
      emoji: "🕳️",
      tags: ["video_game"],
      facts: {
      release_year: { value: 2011, unit: "year", source: "publisher", asOf: "2024" },
      },
      },
      {
      slug: "halo-combat-evolved",
      name: "Halo: Combat Evolved",
      emoji: "🪖",
      tags: ["video_game"],
      facts: {
      release_year: { value: 2001, unit: "year", source: "publisher", asOf: "2024" },
      },
      },
      {
      slug: "world-of-warcraft",
      name: "World of Warcraft",
      emoji: "⚔️",
      tags: ["video_game"],
      facts: {
      release_year: { value: 2004, unit: "year", source: "publisher", asOf: "2024" },
      },
      },
      {
      slug: "the-witcher-3",
      name: "The Witcher 3",
      emoji: "🐺",
      tags: ["video_game"],
      facts: {
      release_year: { value: 2015, unit: "year", source: "publisher", asOf: "2024" },
      },
      },
      {
      slug: "skyrim",
      name: "Skyrim",
      emoji: "🐉",
      tags: ["video_game"],
      facts: {
      release_year: { value: 2011, unit: "year", source: "publisher", asOf: "2024" },
      },
      },
      {
      slug: "dark-souls",
      name: "Dark Souls",
      emoji: "🔥",
      tags: ["video_game"],
      facts: {
      release_year: { value: 2011, unit: "year", source: "publisher", asOf: "2024" },
      },
      },
      {
      slug: "stardew-valley",
      name: "Stardew Valley",
      emoji: "🌾",
      tags: ["video_game"],
      facts: {
      release_year: { value: 2016, unit: "year", source: "publisher", asOf: "2024" },
      },
      },
      {
      slug: "undertale",
      name: "Undertale",
      emoji: "💀",
      tags: ["video_game"],
      facts: {
      release_year: { value: 2015, unit: "year", source: "publisher", asOf: "2024" },
      },
      },
      {
      slug: "cyberpunk-2077",
      name: "Cyberpunk 2077",
      emoji: "🌃",
      tags: ["video_game"],
      facts: {
      release_year: { value: 2020, unit: "year", source: "publisher", asOf: "2024" },
      },
      },
      {
      slug: "animal-crossing-new-horizons",
      name: "Animal Crossing: New Horizons",
      emoji: "🏝️",
      tags: ["video_game"],
      facts: {
      release_year: { value: 2020, unit: "year", source: "publisher", asOf: "2024" },
      },
      },
      {
      slug: "doom-1993",
      name: "Doom (1993)",
      emoji: "👹",
      tags: ["video_game"],
      facts: {
      release_year: { value: 1993, unit: "year", source: "publisher", asOf: "2024" },
      },
      },
      {
      slug: "half-life-2",
      name: "Half-Life 2",
      emoji: "🔧",
      tags: ["video_game"],
      facts: {
      release_year: { value: 2004, unit: "year", source: "publisher", asOf: "2024" },
      },
      },
      {
      slug: "baldurs-gate-3",
      name: "Baldur's Gate 3",
      emoji: "🎲",
      tags: ["video_game"],
      facts: {
      release_year: { value: 2023, unit: "year", source: "publisher", asOf: "2024" },
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
      ...musicArtistItems,
      ...athleteItems,
      ...celebrityItems,
      ...cityItems,
      ...usStateItems,
      ...videoGameItems,
    ];

    console.log(`Seeding ${allItems.length} items...`);

    let itemsInserted = 0;
    let factsInserted = 0;

    for (const item of allItems) {
      // Insert item
      const itemId = await ctx.db.insert("items", {
        name: item.name,
        slug: item.slug,
        emoji: item.emoji,
        tags: item.tags,
        createdAt: now,
        updatedAt: now,
      });
      itemsInserted++;

      // Insert each fact for this item
      for (const [metricKey, fact] of Object.entries(item.facts)) {
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

    console.log(
      `Seed complete: ${categoriesInserted} categories, ${itemsInserted} items, ${factsInserted} facts inserted.`
    );
  },
});
