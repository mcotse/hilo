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

  // === ANIMALS — TOP SPEED ===
  {
    id: 'cheetah',
    name: 'Cheetah',
    emoji: '🐆',
    facts: {
      top_speed: { value: 70, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'peregrine-falcon',
    name: 'Peregrine Falcon',
    emoji: '🦅',
    facts: {
      top_speed: { value: 240, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'lion',
    name: 'Lion',
    emoji: '🦁',
    facts: {
      top_speed: { value: 50, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'grizzly-bear',
    name: 'Grizzly Bear',
    emoji: '🐻',
    facts: {
      top_speed: { value: 35, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'usain-bolt',
    name: 'Usain Bolt',
    emoji: '🏃',
    facts: {
      top_speed: { value: 28, unit: 'mph', source: 'World Athletics', asOf: '2024' },
    },
  },
  {
    id: 'horse',
    name: 'Horse',
    emoji: '🐎',
    facts: {
      top_speed: { value: 55, unit: 'mph', source: 'Guinness World Records', asOf: '2024' },
    },
  },
  {
    id: 'greyhound',
    name: 'Greyhound',
    emoji: '🐕',
    facts: {
      top_speed: { value: 45, unit: 'mph', source: 'American Kennel Club', asOf: '2024' },
    },
  },
  {
    id: 'dolphin',
    name: 'Dolphin',
    emoji: '🐬',
    facts: {
      top_speed: { value: 37, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'sailfish',
    name: 'Sailfish',
    emoji: '🐟',
    facts: {
      top_speed: { value: 68, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'black-mamba',
    name: 'Black Mamba',
    emoji: '🐍',
    facts: {
      top_speed: { value: 12, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'ostrich',
    name: 'Ostrich',
    emoji: '🦩',
    facts: {
      top_speed: { value: 45, unit: 'mph', source: 'San Diego Zoo', asOf: '2024' },
    },
  },
  {
    id: 'kangaroo',
    name: 'Kangaroo',
    emoji: '🦘',
    facts: {
      top_speed: { value: 44, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'elephant',
    name: 'Elephant',
    emoji: '🐘',
    facts: {
      top_speed: { value: 25, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'hippo',
    name: 'Hippo',
    emoji: '🦛',
    facts: {
      top_speed: { value: 19, unit: 'mph', source: 'San Diego Zoo', asOf: '2024' },
    },
  },
  {
    id: 'crocodile',
    name: 'Crocodile',
    emoji: '🐊',
    facts: {
      top_speed: { value: 22, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'rabbit',
    name: 'Rabbit',
    emoji: '🐇',
    facts: {
      top_speed: { value: 35, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'house-cat',
    name: 'House Cat',
    emoji: '🐱',
    facts: {
      top_speed: { value: 30, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'chicken',
    name: 'Chicken',
    emoji: '🐔',
    facts: {
      top_speed: { value: 9, unit: 'mph', source: 'Smithsonian', asOf: '2024' },
    },
  },
  {
    id: 'pig',
    name: 'Pig',
    emoji: '🐷',
    facts: {
      top_speed: { value: 11, unit: 'mph', source: 'Smithsonian', asOf: '2024' },
    },
  },
  {
    id: 'sloth',
    name: 'Sloth',
    emoji: '🦥',
    facts: {
      top_speed: { value: 0.15, unit: 'mph', source: 'World Wildlife Fund', asOf: '2024' },
    },
  },
  {
    id: 'tortoise',
    name: 'Tortoise',
    emoji: '🐢',
    facts: {
      top_speed: { value: 0.3, unit: 'mph', source: 'Guinness World Records', asOf: '2024' },
    },
  },
  {
    id: 'great-white-shark',
    name: 'Great White Shark',
    emoji: '🦈',
    facts: {
      top_speed: { value: 35, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'moose',
    name: 'Moose',
    emoji: '🫎',
    facts: {
      top_speed: { value: 35, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'giraffe',
    name: 'Giraffe',
    emoji: '🦒',
    facts: {
      top_speed: { value: 37, unit: 'mph', source: 'San Diego Zoo', asOf: '2024' },
    },
  },
  {
    id: 'wolf',
    name: 'Wolf',
    emoji: '🐺',
    facts: {
      top_speed: { value: 40, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'coyote',
    name: 'Coyote',
    emoji: '🐺',
    facts: {
      top_speed: { value: 43, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'red-fox',
    name: 'Red Fox',
    emoji: '🦊',
    facts: {
      top_speed: { value: 30, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'bald-eagle',
    name: 'Bald Eagle',
    emoji: '🦅',
    facts: {
      top_speed: { value: 100, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'hummingbird',
    name: 'Hummingbird',
    emoji: '🐦',
    facts: {
      top_speed: { value: 30, unit: 'mph', source: 'Cornell Lab of Ornithology', asOf: '2024' },
    },
  },
  {
    id: 'cobra',
    name: 'Cobra',
    emoji: '🐍',
    facts: {
      top_speed: { value: 12, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'chimpanzee',
    name: 'Chimpanzee',
    emoji: '🐒',
    facts: {
      top_speed: { value: 25, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'brown-bear',
    name: 'Brown Bear',
    emoji: '🐻',
    facts: {
      top_speed: { value: 30, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'polar-bear',
    name: 'Polar Bear',
    emoji: '🐻‍❄️',
    facts: {
      top_speed: { value: 25, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'african-wild-dog',
    name: 'African Wild Dog',
    emoji: '🐕',
    facts: {
      top_speed: { value: 44, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'pronghorn-antelope',
    name: 'Pronghorn Antelope',
    emoji: '🦌',
    facts: {
      top_speed: { value: 55, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'wildebeest',
    name: 'Wildebeest',
    emoji: '🐃',
    facts: {
      top_speed: { value: 50, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'garden-snail',
    name: 'Garden Snail',
    emoji: '🐌',
    facts: {
      top_speed: { value: 0.03, unit: 'mph', source: 'Guinness World Records', asOf: '2024' },
    },
  },
  {
    id: 'komodo-dragon',
    name: 'Komodo Dragon',
    emoji: '🦎',
    facts: {
      top_speed: { value: 13, unit: 'mph', source: 'Smithsonian', asOf: '2024' },
    },
  },
  {
    id: 'domestic-dog-average',
    name: 'Domestic Dog (Average)',
    emoji: '🐶',
    facts: {
      top_speed: { value: 20, unit: 'mph', source: 'American Kennel Club', asOf: '2024' },
    },
  },
  {
    id: 'iguana',
    name: 'Iguana',
    emoji: '🦎',
    facts: {
      top_speed: { value: 21, unit: 'mph', source: 'San Diego Zoo', asOf: '2024' },
    },
  },
  {
    id: 'zebra',
    name: 'Zebra',
    emoji: '🦓',
    facts: {
      top_speed: { value: 40, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'penguin',
    name: 'Penguin',
    emoji: '🐧',
    facts: {
      top_speed: { value: 22, unit: 'mph', source: 'National Geographic', asOf: '2024' },
    },
  },
  {
    id: 'squirrel',
    name: 'Squirrel',
    emoji: '🐿️',
    facts: {
      top_speed: { value: 20, unit: 'mph', source: 'National Wildlife Federation', asOf: '2024' },
    },
  },

  // === MONEY — AVERAGE PRICE ===
  {
    id: 'iphone-16-pro',
    name: 'iPhone 16 Pro',
    emoji: '📱',
    facts: {
      average_price: { value: 1199, unit: '$', source: 'Apple', asOf: '2024' },
    },
  },
  {
    id: 'macbook-pro',
    name: 'MacBook Pro',
    emoji: '💻',
    facts: {
      average_price: { value: 1999, unit: '$', source: 'Apple', asOf: '2024' },
    },
  },
  {
    id: 'tesla-model-3',
    name: 'Tesla Model 3',
    emoji: '🚗',
    facts: {
      average_price: { value: 38990, unit: '$', source: 'Tesla', asOf: '2024' },
    },
  },
  {
    id: 'toyota-camry',
    name: 'Toyota Camry',
    emoji: '🚙',
    facts: {
      average_price: { value: 28855, unit: '$', source: 'Toyota', asOf: '2024' },
    },
  },
  {
    id: 'cup-of-coffee',
    name: 'Cup of Coffee',
    emoji: '☕',
    facts: {
      average_price: { value: 5.50, unit: '$', source: 'National Coffee Association', asOf: '2024' },
    },
  },
  {
    id: 'netflix-monthly',
    name: 'Netflix Monthly',
    emoji: '📺',
    facts: {
      average_price: { value: 15.49, unit: '$', source: 'Netflix', asOf: '2024' },
    },
  },
  {
    id: 'gallon-of-gas',
    name: 'Gallon of Gas',
    emoji: '⛽',
    facts: {
      average_price: { value: 3.50, unit: '$', source: 'AAA Gas Prices', asOf: '2024' },
    },
  },
  {
    id: 'dozen-eggs',
    name: 'Dozen Eggs',
    emoji: '🥚',
    facts: {
      average_price: { value: 4.50, unit: '$', source: 'USDA Average Retail Price', asOf: '2024' },
    },
  },
  {
    id: 'costco-hot-dog',
    name: 'Costco Hot Dog',
    emoji: '🌭',
    facts: {
      average_price: { value: 1.50, unit: '$', source: 'Costco', asOf: '2024' },
    },
  },
  {
    id: 'movie-ticket',
    name: 'Movie Ticket',
    emoji: '🎟️',
    facts: {
      average_price: { value: 11.00, unit: '$', source: 'National Association of Theatre Owners', asOf: '2024' },
    },
  },
  {
    id: 'pair-of-levis',
    name: 'Pair of Levis',
    emoji: '👖',
    facts: {
      average_price: { value: 69, unit: '$', source: "Levi's", asOf: '2024' },
    },
  },
  {
    id: 'nike-air-max',
    name: 'Nike Air Max',
    emoji: '👟',
    facts: {
      average_price: { value: 130, unit: '$', source: 'Nike', asOf: '2024' },
    },
  },
  {
    id: 'airpods-pro',
    name: 'AirPods Pro',
    emoji: '🎧',
    facts: {
      average_price: { value: 249, unit: '$', source: 'Apple', asOf: '2024' },
    },
  },
  {
    id: 'ps5',
    name: 'PS5',
    emoji: '🎮',
    facts: {
      average_price: { value: 499, unit: '$', source: 'Sony', asOf: '2024' },
    },
  },
  {
    id: 'nintendo-switch',
    name: 'Nintendo Switch',
    emoji: '🎮',
    facts: {
      average_price: { value: 299, unit: '$', source: 'Nintendo', asOf: '2024' },
    },
  },
  {
    id: 'broadway-ticket',
    name: 'Broadway Ticket',
    emoji: '🎭',
    facts: {
      average_price: { value: 150, unit: '$', source: 'Broadway League', asOf: '2024' },
    },
  },
  {
    id: 'disneyland-ticket',
    name: 'Disneyland Ticket',
    emoji: '🏰',
    facts: {
      average_price: { value: 104, unit: '$', source: 'Disneyland', asOf: '2024' },
    },
  },
  {
    id: 'rolex-submariner',
    name: 'Rolex Submariner',
    emoji: '⌚',
    facts: {
      average_price: { value: 10100, unit: '$', source: 'Rolex', asOf: '2024' },
    },
  },
  {
    id: 'ray-ban-wayfarers',
    name: 'Ray-Ban Wayfarers',
    emoji: '🕶️',
    facts: {
      average_price: { value: 163, unit: '$', source: 'Ray-Ban', asOf: '2024' },
    },
  },
  {
    id: 'spotify-monthly',
    name: 'Spotify Monthly',
    emoji: '🎵',
    facts: {
      average_price: { value: 11.99, unit: '$', source: 'Spotify', asOf: '2024' },
    },
  },
  {
    id: 'uber-ride-average',
    name: 'Uber Ride Average',
    emoji: '🚕',
    facts: {
      average_price: { value: 25, unit: '$', source: 'Uber', asOf: '2024' },
    },
  },
  {
    id: 'gym-membership-monthly',
    name: 'Gym Membership Monthly',
    emoji: '💪',
    facts: {
      average_price: { value: 53, unit: '$', source: 'IHRSA', asOf: '2024' },
    },
  },
  {
    id: 'costco-membership',
    name: 'Costco Membership',
    emoji: '🛒',
    facts: {
      average_price: { value: 65, unit: '$', source: 'Costco', asOf: '2024' },
    },
  },
  {
    id: 'amazon-prime-annual',
    name: 'Amazon Prime Annual',
    emoji: '📦',
    facts: {
      average_price: { value: 139, unit: '$', source: 'Amazon', asOf: '2024' },
    },
  },
  {
    id: 'wedding-average',
    name: 'Wedding Average',
    emoji: '💒',
    facts: {
      average_price: { value: 33000, unit: '$', source: 'The Knot', asOf: '2024' },
    },
  },
  {
    id: 'college-textbook',
    name: 'College Textbook',
    emoji: '📚',
    facts: {
      average_price: { value: 105, unit: '$', source: 'College Board', asOf: '2024' },
    },
  },
  {
    id: 'starbucks-latte',
    name: 'Starbucks Latte',
    emoji: '☕',
    facts: {
      average_price: { value: 5.75, unit: '$', source: 'Starbucks Menu', asOf: '2024' },
    },
  },
  {
    id: 'avocado',
    name: 'Avocado',
    emoji: '🥑',
    facts: {
      average_price: { value: 1.50, unit: '$', source: 'USDA Average Retail Price', asOf: '2024' },
    },
  },
  {
    id: 'gallon-of-milk',
    name: 'Gallon of Milk',
    emoji: '🥛',
    facts: {
      average_price: { value: 4.25, unit: '$', source: 'USDA Average Retail Price', asOf: '2024' },
    },
  },
  {
    id: 'loaf-of-bread',
    name: 'Loaf of Bread',
    emoji: '🍞',
    facts: {
      average_price: { value: 3.50, unit: '$', source: 'Bureau of Labor Statistics', asOf: '2024' },
    },
  },
  {
    id: 'honda-civic',
    name: 'Honda Civic',
    emoji: '🚗',
    facts: {
      average_price: { value: 24950, unit: '$', source: 'Honda', asOf: '2024' },
    },
  },
  {
    id: 'ipad',
    name: 'iPad',
    emoji: '📱',
    facts: {
      average_price: { value: 449, unit: '$', source: 'Apple', asOf: '2024' },
    },
  },
  {
    id: 'lego-millennium-falcon',
    name: 'LEGO Millennium Falcon',
    emoji: '🧱',
    facts: {
      average_price: { value: 849, unit: '$', source: 'LEGO', asOf: '2024' },
    },
  },
  {
    id: 'yeti-tumbler',
    name: 'YETI Tumbler',
    emoji: '🥤',
    facts: {
      average_price: { value: 38, unit: '$', source: 'YETI', asOf: '2024' },
    },
  },
  {
    id: 'stanley-cup-tumbler',
    name: 'Stanley Cup Tumbler',
    emoji: '🥤',
    facts: {
      average_price: { value: 45, unit: '$', source: 'Stanley', asOf: '2024' },
    },
  },
  {
    id: 'nfl-jersey',
    name: 'NFL Jersey',
    emoji: '🏈',
    facts: {
      average_price: { value: 130, unit: '$', source: 'NFL Shop', asOf: '2024' },
    },
  },
  {
    id: 'plane-ticket-domestic',
    name: 'Domestic Plane Ticket',
    emoji: '✈️',
    facts: {
      average_price: { value: 360, unit: '$', source: 'Bureau of Transportation Statistics', asOf: '2024' },
    },
  },
  {
    id: 'annual-car-insurance',
    name: 'Annual Car Insurance',
    emoji: '🚙',
    facts: {
      average_price: { value: 2150, unit: '$', source: 'Insurance Information Institute', asOf: '2024' },
    },
  },
  {
    id: 'gopro-hero',
    name: 'GoPro Hero',
    emoji: '📷',
    facts: {
      average_price: { value: 399, unit: '$', source: 'GoPro', asOf: '2024' },
    },
  },
  {
    id: 'electric-scooter',
    name: 'Electric Scooter',
    emoji: '🛴',
    facts: {
      average_price: { value: 450, unit: '$', source: 'Consumer Reports', asOf: '2024' },
    },
  },
  {
    id: 'dyson-vacuum',
    name: 'Dyson Vacuum',
    emoji: '🧹',
    facts: {
      average_price: { value: 499, unit: '$', source: 'Dyson', asOf: '2024' },
    },
  },
  {
    id: 'kindle',
    name: 'Kindle',
    emoji: '📖',
    facts: {
      average_price: { value: 99, unit: '$', source: 'Amazon', asOf: '2024' },
    },
  },
]
