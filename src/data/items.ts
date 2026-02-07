import type { Item } from '@/engine/types'

export const items: Item[] = [
  // === FOOD / RESTAURANT ITEMS (calories + price) ===
  {
    id: 'big-mac',
    name: 'Big Mac',
    emoji: '🍔',
    facts: {
      calories: { value: 563, unit: 'cal', source: "McDonald's Nutrition Guide", asOf: '2024' },
      average_price: { value: 5.58, unit: '$', source: 'The Economist Big Mac Index', asOf: '2024' },
    },
  },
  {
    id: 'chipotle-burrito',
    name: 'Chipotle Burrito',
    emoji: '🌯',
    facts: {
      calories: { value: 1070, unit: 'cal', source: 'Chipotle Nutrition Calculator', asOf: '2024' },
      average_price: { value: 10.75, unit: '$', source: 'Chipotle Menu', asOf: '2024' },
    },
  },
  {
    id: 'slice-of-pizza',
    name: 'Slice of Pizza',
    emoji: '🍕',
    facts: {
      calories: { value: 285, unit: 'cal', source: 'USDA FoodData Central', asOf: '2024' },
      average_price: { value: 3.50, unit: '$', source: 'US average', asOf: '2024' },
    },
  },
  {
    id: 'pad-thai',
    name: 'Pad Thai',
    emoji: '🍜',
    facts: {
      calories: { value: 630, unit: 'cal', source: 'USDA FoodData Central', asOf: '2024' },
      average_price: { value: 14.00, unit: '$', source: 'Restaurant average', asOf: '2024' },
    },
  },
  {
    id: 'caesar-salad',
    name: 'Caesar Salad',
    emoji: '🥗',
    facts: {
      calories: { value: 481, unit: 'cal', source: 'USDA FoodData Central', asOf: '2024' },
      average_price: { value: 12.00, unit: '$', source: 'Restaurant average', asOf: '2024' },
    },
  },
  {
    id: 'avocado-toast',
    name: 'Avocado Toast',
    emoji: '🥑',
    facts: {
      calories: { value: 290, unit: 'cal', source: 'USDA FoodData Central', asOf: '2024' },
      average_price: { value: 11.00, unit: '$', source: 'Cafe average', asOf: '2024' },
    },
  },
  {
    id: 'mcnuggets-10pc',
    name: '10pc McNuggets',
    emoji: '🍗',
    facts: {
      calories: { value: 410, unit: 'cal', source: "McDonald's Nutrition Guide", asOf: '2024' },
      average_price: { value: 5.29, unit: '$', source: "McDonald's Menu", asOf: '2024' },
    },
  },
  {
    id: 'croissant',
    name: 'Croissant',
    emoji: '🥐',
    facts: {
      calories: { value: 406, unit: 'cal', source: 'USDA FoodData Central', asOf: '2024' },
      average_price: { value: 3.75, unit: '$', source: 'Bakery average', asOf: '2024' },
    },
  },
  {
    id: 'bagel-cream-cheese',
    name: 'Bagel w/ Cream Cheese',
    emoji: '🥯',
    facts: {
      calories: { value: 360, unit: 'cal', source: 'USDA FoodData Central', asOf: '2024' },
      average_price: { value: 4.50, unit: '$', source: 'Deli average', asOf: '2024' },
    },
  },
  {
    id: 'starbucks-frappuccino',
    name: 'Starbucks Frappuccino',
    emoji: '☕',
    facts: {
      calories: { value: 380, unit: 'cal', source: 'Starbucks Nutrition', asOf: '2024' },
      average_price: { value: 5.95, unit: '$', source: 'Starbucks Menu', asOf: '2024' },
    },
  },
  {
    id: 'cinnabon-classic',
    name: 'Cinnabon Classic Roll',
    emoji: '🧁',
    facts: {
      calories: { value: 880, unit: 'cal', source: 'Cinnabon Nutrition', asOf: '2024' },
      average_price: { value: 5.99, unit: '$', source: 'Cinnabon Menu', asOf: '2024' },
    },
  },
  {
    id: 'subway-footlong',
    name: 'Subway Footlong',
    emoji: '🥖',
    facts: {
      calories: { value: 600, unit: 'cal', source: 'Subway Nutrition (Turkey)', asOf: '2024' },
      average_price: { value: 8.49, unit: '$', source: 'Subway Menu', asOf: '2024' },
    },
  },
  {
    id: 'cheesecake-factory-slice',
    name: 'Cheesecake Factory Slice',
    emoji: '🍰',
    facts: {
      calories: { value: 1500, unit: 'cal', source: 'Cheesecake Factory Nutrition', asOf: '2024' },
      average_price: { value: 10.50, unit: '$', source: 'Cheesecake Factory Menu', asOf: '2024' },
    },
  },
  {
    id: 'in-n-out-double-double',
    name: 'In-N-Out Double-Double',
    emoji: '🍔',
    facts: {
      calories: { value: 670, unit: 'cal', source: 'In-N-Out Nutrition', asOf: '2024' },
      average_price: { value: 5.25, unit: '$', source: 'In-N-Out Menu', asOf: '2024' },
    },
  },
  {
    id: 'chick-fil-a-sandwich',
    name: 'Chick-fil-A Sandwich',
    emoji: '🐔',
    facts: {
      calories: { value: 440, unit: 'cal', source: 'Chick-fil-A Nutrition', asOf: '2024' },
      average_price: { value: 5.59, unit: '$', source: 'Chick-fil-A Menu', asOf: '2024' },
    },
  },
  {
    id: 'whole-dominos-pizza',
    name: "Whole Domino's Pizza",
    emoji: '🍕',
    facts: {
      calories: { value: 2080, unit: 'cal', source: "Domino's Nutrition (medium hand tossed)", asOf: '2024' },
      average_price: { value: 13.99, unit: '$', source: "Domino's Menu", asOf: '2024' },
    },
  },
  {
    id: 'panda-express-plate',
    name: 'Panda Express Plate',
    emoji: '🐼',
    facts: {
      calories: { value: 1130, unit: 'cal', source: 'Panda Express Nutrition', asOf: '2024' },
      average_price: { value: 10.40, unit: '$', source: 'Panda Express Menu', asOf: '2024' },
    },
  },
  {
    id: 'banana',
    name: 'Banana',
    emoji: '🍌',
    facts: {
      calories: { value: 105, unit: 'cal', source: 'USDA FoodData Central', asOf: '2024' },
      average_price: { value: 0.25, unit: '$', source: 'USDA Average Retail Price', asOf: '2024' },
    },
  },
  {
    id: 'glazed-donut',
    name: 'Glazed Donut',
    emoji: '🍩',
    facts: {
      calories: { value: 240, unit: 'cal', source: 'Krispy Kreme Nutrition', asOf: '2024' },
      average_price: { value: 1.89, unit: '$', source: 'Krispy Kreme Menu', asOf: '2024' },
    },
  },
  {
    id: 'ramen-bowl',
    name: 'Bowl of Ramen',
    emoji: '🍜',
    facts: {
      calories: { value: 450, unit: 'cal', source: 'USDA FoodData Central', asOf: '2024' },
      average_price: { value: 16.00, unit: '$', source: 'Restaurant average', asOf: '2024' },
    },
  },

  // === COUNTRIES & CITIES (population) ===
  {
    id: 'china',
    name: 'China',
    emoji: '🇨🇳',
    facts: {
      population: { value: 1425000000, unit: 'people', source: 'UN World Population Prospects', asOf: '2024' },
    },
  },
  {
    id: 'india',
    name: 'India',
    emoji: '🇮🇳',
    facts: {
      population: { value: 1441000000, unit: 'people', source: 'UN World Population Prospects', asOf: '2024' },
    },
  },
  {
    id: 'united-states',
    name: 'United States',
    emoji: '🇺🇸',
    facts: {
      population: { value: 340000000, unit: 'people', source: 'US Census Bureau', asOf: '2024' },
    },
  },
  {
    id: 'indonesia',
    name: 'Indonesia',
    emoji: '🇮🇩',
    facts: {
      population: { value: 278000000, unit: 'people', source: 'UN World Population Prospects', asOf: '2024' },
    },
  },
  {
    id: 'brazil',
    name: 'Brazil',
    emoji: '🇧🇷',
    facts: {
      population: { value: 216000000, unit: 'people', source: 'UN World Population Prospects', asOf: '2024' },
    },
  },
  {
    id: 'japan',
    name: 'Japan',
    emoji: '🇯🇵',
    facts: {
      population: { value: 124000000, unit: 'people', source: 'UN World Population Prospects', asOf: '2024' },
    },
  },
  {
    id: 'germany',
    name: 'Germany',
    emoji: '🇩🇪',
    facts: {
      population: { value: 84000000, unit: 'people', source: 'UN World Population Prospects', asOf: '2024' },
    },
  },
  {
    id: 'united-kingdom',
    name: 'United Kingdom',
    emoji: '🇬🇧',
    facts: {
      population: { value: 68000000, unit: 'people', source: 'UN World Population Prospects', asOf: '2024' },
    },
  },
  {
    id: 'france',
    name: 'France',
    emoji: '🇫🇷',
    facts: {
      population: { value: 66000000, unit: 'people', source: 'UN World Population Prospects', asOf: '2024' },
    },
  },
  {
    id: 'italy',
    name: 'Italy',
    emoji: '🇮🇹',
    facts: {
      population: { value: 59000000, unit: 'people', source: 'UN World Population Prospects', asOf: '2024' },
    },
  },
  {
    id: 'south-korea',
    name: 'South Korea',
    emoji: '🇰🇷',
    facts: {
      population: { value: 52000000, unit: 'people', source: 'UN World Population Prospects', asOf: '2024' },
    },
  },
  {
    id: 'canada',
    name: 'Canada',
    emoji: '🇨🇦',
    facts: {
      population: { value: 41000000, unit: 'people', source: 'Statistics Canada', asOf: '2024' },
    },
  },
  {
    id: 'australia',
    name: 'Australia',
    emoji: '🇦🇺',
    facts: {
      population: { value: 26000000, unit: 'people', source: 'ABS', asOf: '2024' },
    },
  },
  {
    id: 'mexico',
    name: 'Mexico',
    emoji: '🇲🇽',
    facts: {
      population: { value: 130000000, unit: 'people', source: 'UN World Population Prospects', asOf: '2024' },
    },
  },
  {
    id: 'nigeria',
    name: 'Nigeria',
    emoji: '🇳🇬',
    facts: {
      population: { value: 230000000, unit: 'people', source: 'UN World Population Prospects', asOf: '2024' },
    },
  },
  {
    id: 'egypt',
    name: 'Egypt',
    emoji: '🇪🇬',
    facts: {
      population: { value: 105000000, unit: 'people', source: 'UN World Population Prospects', asOf: '2024' },
    },
  },
  {
    id: 'thailand',
    name: 'Thailand',
    emoji: '🇹🇭',
    facts: {
      population: { value: 72000000, unit: 'people', source: 'UN World Population Prospects', asOf: '2024' },
    },
  },
  {
    id: 'spain',
    name: 'Spain',
    emoji: '🇪🇸',
    facts: {
      population: { value: 48000000, unit: 'people', source: 'UN World Population Prospects', asOf: '2024' },
    },
  },
  {
    id: 'argentina',
    name: 'Argentina',
    emoji: '🇦🇷',
    facts: {
      population: { value: 46000000, unit: 'people', source: 'UN World Population Prospects', asOf: '2024' },
    },
  },
  {
    id: 'new-zealand',
    name: 'New Zealand',
    emoji: '🇳🇿',
    facts: {
      population: { value: 5200000, unit: 'people', source: 'Stats NZ', asOf: '2024' },
    },
  },
  {
    id: 'iceland',
    name: 'Iceland',
    emoji: '🇮🇸',
    facts: {
      population: { value: 383000, unit: 'people', source: 'Statistics Iceland', asOf: '2024' },
    },
  },

  // === MOVIES (rotten_tomatoes) ===
  {
    id: 'the-shawshank-redemption',
    name: 'Shawshank Redemption',
    emoji: '🎬',
    facts: {
      rotten_tomatoes: { value: 91, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
  {
    id: 'the-dark-knight',
    name: 'The Dark Knight',
    emoji: '🦇',
    facts: {
      rotten_tomatoes: { value: 94, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
  {
    id: 'pulp-fiction',
    name: 'Pulp Fiction',
    emoji: '🎬',
    facts: {
      rotten_tomatoes: { value: 92, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
  {
    id: 'forrest-gump',
    name: 'Forrest Gump',
    emoji: '🏃',
    facts: {
      rotten_tomatoes: { value: 71, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
  {
    id: 'the-lion-king',
    name: 'The Lion King (1994)',
    emoji: '🦁',
    facts: {
      rotten_tomatoes: { value: 93, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
  {
    id: 'titanic',
    name: 'Titanic',
    emoji: '🚢',
    facts: {
      rotten_tomatoes: { value: 88, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
  {
    id: 'jurassic-park',
    name: 'Jurassic Park',
    emoji: '🦕',
    facts: {
      rotten_tomatoes: { value: 93, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
  {
    id: 'the-matrix',
    name: 'The Matrix',
    emoji: '💊',
    facts: {
      rotten_tomatoes: { value: 83, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
  {
    id: 'fight-club',
    name: 'Fight Club',
    emoji: '🥊',
    facts: {
      rotten_tomatoes: { value: 79, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
  {
    id: 'inception',
    name: 'Inception',
    emoji: '💭',
    facts: {
      rotten_tomatoes: { value: 87, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
  {
    id: 'toy-story',
    name: 'Toy Story',
    emoji: '🤠',
    facts: {
      rotten_tomatoes: { value: 100, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
  {
    id: 'finding-nemo',
    name: 'Finding Nemo',
    emoji: '🐟',
    facts: {
      rotten_tomatoes: { value: 99, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
  {
    id: 'the-avengers',
    name: 'The Avengers (2012)',
    emoji: '🦸',
    facts: {
      rotten_tomatoes: { value: 91, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
  {
    id: 'frozen',
    name: 'Frozen',
    emoji: '❄️',
    facts: {
      rotten_tomatoes: { value: 90, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
  {
    id: 'star-wars-new-hope',
    name: 'Star Wars: A New Hope',
    emoji: '⭐',
    facts: {
      rotten_tomatoes: { value: 93, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
  {
    id: 'the-godfather',
    name: 'The Godfather',
    emoji: '🎬',
    facts: {
      rotten_tomatoes: { value: 97, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
  {
    id: 'jaws',
    name: 'Jaws',
    emoji: '🦈',
    facts: {
      rotten_tomatoes: { value: 97, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
  {
    id: 'batman-v-superman',
    name: 'Batman v Superman',
    emoji: '🦇',
    facts: {
      rotten_tomatoes: { value: 29, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
  {
    id: 'transformers-2',
    name: 'Transformers: Revenge',
    emoji: '🤖',
    facts: {
      rotten_tomatoes: { value: 20, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
  {
    id: 'twilight',
    name: 'Twilight',
    emoji: '🧛',
    facts: {
      rotten_tomatoes: { value: 49, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
  {
    id: 'cats-2019',
    name: 'Cats (2019)',
    emoji: '🐱',
    facts: {
      rotten_tomatoes: { value: 19, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
  {
    id: 'superbad',
    name: 'Superbad',
    emoji: '🎉',
    facts: {
      rotten_tomatoes: { value: 88, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
  {
    id: 'parasite',
    name: 'Parasite',
    emoji: '🏠',
    facts: {
      rotten_tomatoes: { value: 99, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
  {
    id: 'get-out',
    name: 'Get Out',
    emoji: '🫣',
    facts: {
      rotten_tomatoes: { value: 98, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
  {
    id: 'mean-girls',
    name: 'Mean Girls',
    emoji: '💅',
    facts: {
      rotten_tomatoes: { value: 84, unit: '%', source: 'Rotten Tomatoes', asOf: '2024' },
    },
  },
]
