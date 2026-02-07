import type { Item, Category, DifficultyBand } from './types'
import { DIFFICULTY_RANGES } from './types'

export function getDifficultyBand(streak: number): DifficultyBand {
  if (streak <= 2) return 'easy'
  if (streak <= 5) return 'medium'
  return 'hard'
}

function computeRatio(a: number, b: number): number {
  return Math.min(a, b) / Math.max(a, b)
}

export function selectPair(
  items: Item[],
  category: Category,
  streak: number,
  history: string[]
): [Item, Item] {
  const metricKey = category.metricKey

  // 1. Filter items that have a value for this category
  const eligible = items.filter(item => item.facts[metricKey] !== undefined)

  // 2. Remove items in history (seen this session)
  let available = eligible.filter(item => !history.includes(item.id))

  // If too few items available after history filter, reset history
  if (available.length < 2) {
    available = eligible
  }

  // 3. Get difficulty band for current streak
  const band = getDifficultyBand(streak)
  const [minRatio, maxRatio] = DIFFICULTY_RANGES[band]

  // 4. Compute all possible pairs and filter by ratio range
  type Pair = { a: Item; b: Item; ratio: number }
  const allPairs: Pair[] = []

  for (let i = 0; i < available.length; i++) {
    for (let j = i + 1; j < available.length; j++) {
      const valA = available[i].facts[metricKey].value
      const valB = available[j].facts[metricKey].value
      const ratio = computeRatio(valA, valB)
      allPairs.push({ a: available[i], b: available[j], ratio })
    }
  }

  // 5. Filter pairs within the ratio range
  let matchingPairs = allPairs.filter(p => p.ratio >= minRatio && p.ratio <= maxRatio)

  // 6. If no pairs found, widen the range by 0.1 in each direction (up to 3 times)
  let widen = 0
  while (matchingPairs.length === 0 && widen < 3) {
    widen++
    const widenedMin = Math.max(0, minRatio - widen * 0.1)
    const widenedMax = Math.min(0.95, maxRatio + widen * 0.1)
    matchingPairs = allPairs.filter(p => p.ratio >= widenedMin && p.ratio <= widenedMax)
  }

  // Final fallback: use any pair
  if (matchingPairs.length === 0) {
    matchingPairs = allPairs
  }

  // 7. Pick a random pair from the filtered set
  const chosen = matchingPairs[Math.floor(Math.random() * matchingPairs.length)]

  // 8. Randomly assign which is anchor (value shown) and which is challenger
  if (Math.random() < 0.5) {
    return [chosen.a, chosen.b]
  }
  return [chosen.b, chosen.a]
}
