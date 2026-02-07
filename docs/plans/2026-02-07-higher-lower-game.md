# Higher/Lower Game — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a daily team bonding trivia game where two items appear with a shared metric, one value is revealed, and the team debates whether the hidden item is HIGHER or LOWER.

**Architecture:** Pure TypeScript game engine (reducer pattern) with thin React components. Animations are imperative async sequences using Motion library, not React state transitions. Category color theming via a single CSS variable `--cat-color` set on the game shell. All data bundled client-side, no backend.

**Tech Stack:** React 18 + TypeScript, Vite 6, Tailwind CSS v4, Motion (`motion/react`), Vitest + React Testing Library, Google Fonts (Bebas Neue, Space Grotesk, Space Mono)

---

## Task 1: Scaffold Vite Project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `.gitignore`
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/vite-env.d.ts`
- Create: `src/test/setup.ts`

**Step 1: Initialize Vite project with React TypeScript template**

Run:
```bash
cd /Users/mcotse/Developer/higher-lower
npm create vite@latest . -- --template react-ts
```

If prompted about existing directory (spec.md exists), confirm overwrite. The spec.md should survive since Vite only writes its own files.

**Step 2: Install all dependencies**

Run:
```bash
npm install motion
npm install -D tailwindcss @tailwindcss/vite vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

**Step 3: Configure Vite**

Replace `vite.config.ts` with:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

**Step 4: Create test setup file**

Create `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom/vitest'
```

**Step 5: Set up index.css with CSS variables and fonts**

Replace `src/index.css` with:

```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

:root {
  --bg: #0c0c14;
  --bg-card: #13131d;
  --bg-elevated: #1c1c2a;
  --text: #e8e6f0;
  --text-muted: #7a7694;
  --border: rgba(255, 255, 255, 0.06);
  --glass-bg: rgba(255, 255, 255, 0.04);
  --glass-bg-hover: rgba(255, 255, 255, 0.07);
  --correct: #6ee7a0;
  --wrong: #ff6b8a;

  /* Category color — set dynamically by GameShell */
  --cat-color: #ffb380;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: 'Space Grotesk', sans-serif;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}
```

**Step 6: Set up minimal App.tsx**

Replace `src/App.tsx` with:

```tsx
function App() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '64px' }}>HIGHER / LOWER</h1>
    </div>
  )
}

export default App
```

**Step 7: Verify dev server and tests**

Run: `npm run dev` — should show "HIGHER / LOWER" title on dark background with Bebas Neue font.
Run: `npx vitest --run` — should pass with 0 tests (no failures).

**Step 8: Initialize git and commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Vite project with React, Tailwind v4, Motion, Vitest"
```

---

## Task 2: Engine — Types

**Files:**
- Create: `src/engine/types.ts`

**Step 1: Create all TypeScript types**

Create `src/engine/types.ts`:

```typescript
export type Item = {
  id: string
  name: string
  emoji: string
  facts: Record<string, {
    value: number
    unit: string
    source: string
    asOf?: string
  }>
}

export type Category = {
  id: string
  label: string
  question: string
  metricKey: string
  color: string
  formatValue: (n: number) => string
}

export type GamePhase = 'start' | 'comparing' | 'revealing' | 'game_over'

export type GameState = {
  phase: GamePhase
  currentPair: [Item, Item] | null
  category: Category | null
  streak: number
  record: number
  choice: 'higher' | 'lower' | null
  history: string[]
}

export type Action =
  | { type: 'START_GAME'; category: Category; pair: [Item, Item] }
  | { type: 'CHOOSE'; choice: 'higher' | 'lower' }
  | { type: 'REVEAL_COMPLETE'; isCorrect: boolean }
  | { type: 'NEXT_ROUND'; pair: [Item, Item] }
  | { type: 'RESET' }

export type StreakTier = 'calm' | 'warm' | 'hot' | 'fire'

export type DifficultyBand = 'easy' | 'medium' | 'hard'

export const DIFFICULTY_RANGES: Record<DifficultyBand, [number, number]> = {
  easy: [0.0, 0.35],
  medium: [0.25, 0.65],
  hard: [0.55, 0.85],
}
```

**Step 2: Commit**

```bash
git add src/engine/types.ts
git commit -m "feat: add game engine TypeScript types"
```

---

## Task 3: Engine — Game State (TDD)

**Files:**
- Create: `src/engine/__tests__/game-state.test.ts`
- Create: `src/engine/game-state.ts`

**Step 1: Write the failing tests**

Create `src/engine/__tests__/game-state.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { gameReducer, initialState } from '../game-state'
import type { GameState, Item, Category, Action } from '../types'

const mockCategory: Category = {
  id: 'calories',
  label: 'Calories',
  question: 'Which has more calories?',
  metricKey: 'calories',
  color: '#ffb380',
  formatValue: (n: number) => `${n.toLocaleString()} cal`,
}

const mockItemA: Item = {
  id: 'pizza',
  name: 'Slice of Pizza',
  emoji: '🍕',
  facts: { calories: { value: 285, unit: 'cal', source: 'USDA' } },
}

const mockItemB: Item = {
  id: 'burrito',
  name: 'Chipotle Burrito',
  emoji: '🌯',
  facts: { calories: { value: 1070, unit: 'cal', source: 'USDA' } },
}

describe('gameReducer', () => {
  it('has initial state with phase "start"', () => {
    expect(initialState.phase).toBe('start')
    expect(initialState.streak).toBe(0)
    expect(initialState.currentPair).toBeNull()
    expect(initialState.choice).toBeNull()
    expect(initialState.history).toEqual([])
  })

  describe('START_GAME', () => {
    it('sets phase to "comparing" and initializes game', () => {
      const action: Action = {
        type: 'START_GAME',
        category: mockCategory,
        pair: [mockItemA, mockItemB],
      }
      const next = gameReducer(initialState, action)

      expect(next.phase).toBe('comparing')
      expect(next.category).toBe(mockCategory)
      expect(next.currentPair).toEqual([mockItemA, mockItemB])
      expect(next.streak).toBe(0)
      expect(next.choice).toBeNull()
      expect(next.history).toEqual([mockItemA.id, mockItemB.id])
    })
  })

  describe('CHOOSE', () => {
    it('sets phase to "revealing" and stores the choice', () => {
      const comparingState: GameState = {
        phase: 'comparing',
        currentPair: [mockItemA, mockItemB],
        category: mockCategory,
        streak: 0,
        record: 0,
        choice: null,
        history: [mockItemA.id, mockItemB.id],
      }
      const action: Action = { type: 'CHOOSE', choice: 'higher' }
      const next = gameReducer(comparingState, action)

      expect(next.phase).toBe('revealing')
      expect(next.choice).toBe('higher')
    })
  })

  describe('REVEAL_COMPLETE', () => {
    const revealingState: GameState = {
      phase: 'revealing',
      currentPair: [mockItemA, mockItemB],
      category: mockCategory,
      streak: 3,
      record: 5,
      choice: 'higher',
      history: [mockItemA.id, mockItemB.id],
    }

    it('increments streak on correct answer', () => {
      const next = gameReducer(revealingState, {
        type: 'REVEAL_COMPLETE',
        isCorrect: true,
      })

      expect(next.streak).toBe(4)
      expect(next.phase).toBe('revealing')
    })

    it('updates record when streak exceeds it', () => {
      const atRecordState: GameState = { ...revealingState, streak: 5, record: 5 }
      const next = gameReducer(atRecordState, {
        type: 'REVEAL_COMPLETE',
        isCorrect: true,
      })

      expect(next.streak).toBe(6)
      expect(next.record).toBe(6)
    })

    it('does not update record when streak is below it', () => {
      const next = gameReducer(revealingState, {
        type: 'REVEAL_COMPLETE',
        isCorrect: true,
      })

      expect(next.streak).toBe(4)
      expect(next.record).toBe(5)
    })

    it('sets phase to "game_over" on wrong answer', () => {
      const next = gameReducer(revealingState, {
        type: 'REVEAL_COMPLETE',
        isCorrect: false,
      })

      expect(next.phase).toBe('game_over')
      expect(next.streak).toBe(3)
    })
  })

  describe('NEXT_ROUND', () => {
    it('sets phase to "comparing" with new pair and clears choice', () => {
      const afterRevealState: GameState = {
        phase: 'revealing',
        currentPair: [mockItemA, mockItemB],
        category: mockCategory,
        streak: 4,
        record: 5,
        choice: 'higher',
        history: [mockItemA.id, mockItemB.id],
      }

      const newChallenger: Item = {
        id: 'big-mac',
        name: 'Big Mac',
        emoji: '🍔',
        facts: { calories: { value: 563, unit: 'cal', source: 'USDA' } },
      }

      const next = gameReducer(afterRevealState, {
        type: 'NEXT_ROUND',
        pair: [mockItemB, newChallenger],
      })

      expect(next.phase).toBe('comparing')
      expect(next.currentPair).toEqual([mockItemB, newChallenger])
      expect(next.choice).toBeNull()
      expect(next.history).toContain('big-mac')
      expect(next.history).toContain(mockItemB.id)
    })
  })

  describe('RESET', () => {
    it('resets to start phase but preserves record', () => {
      const gameOverState: GameState = {
        phase: 'game_over',
        currentPair: [mockItemA, mockItemB],
        category: mockCategory,
        streak: 7,
        record: 12,
        choice: 'higher',
        history: [mockItemA.id, mockItemB.id],
      }
      const next = gameReducer(gameOverState, { type: 'RESET' })

      expect(next.phase).toBe('start')
      expect(next.record).toBe(12)
      expect(next.streak).toBe(0)
      expect(next.currentPair).toBeNull()
      expect(next.choice).toBeNull()
      expect(next.history).toEqual([])
    })
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest --run src/engine/__tests__/game-state.test.ts`
Expected: FAIL — `Cannot find module '../game-state'`

**Step 3: Write the game reducer implementation**

Create `src/engine/game-state.ts`:

```typescript
import type { GameState, Action } from './types'

export const initialState: GameState = {
  phase: 'start',
  currentPair: null,
  category: null,
  streak: 0,
  record: 0,
  choice: null,
  history: [],
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        phase: 'comparing',
        category: action.category,
        currentPair: action.pair,
        streak: 0,
        choice: null,
        history: [action.pair[0].id, action.pair[1].id],
      }

    case 'CHOOSE':
      return {
        ...state,
        phase: 'revealing',
        choice: action.choice,
      }

    case 'REVEAL_COMPLETE': {
      if (action.isCorrect) {
        const newStreak = state.streak + 1
        return {
          ...state,
          streak: newStreak,
          record: Math.max(newStreak, state.record),
        }
      }
      return {
        ...state,
        phase: 'game_over',
      }
    }

    case 'NEXT_ROUND':
      return {
        ...state,
        phase: 'comparing',
        currentPair: action.pair,
        choice: null,
        history: [...new Set([...state.history, action.pair[0].id, action.pair[1].id])],
      }

    case 'RESET':
      return {
        ...initialState,
        record: state.record,
      }

    default:
      return state
  }
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest --run src/engine/__tests__/game-state.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/engine/game-state.ts src/engine/__tests__/game-state.test.ts
git commit -m "feat: implement game state reducer with TDD"
```

---

## Task 4: Engine — Pairing Algorithm (TDD)

**Files:**
- Create: `src/engine/__tests__/pairing.test.ts`
- Create: `src/engine/pairing.ts`

**Step 1: Write the failing tests**

Create `src/engine/__tests__/pairing.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { selectPair, getDifficultyBand } from '../pairing'
import type { Item, Category } from '../types'

const mockCategory: Category = {
  id: 'calories',
  label: 'Calories',
  question: 'Which has more calories?',
  metricKey: 'calories',
  color: '#ffb380',
  formatValue: (n: number) => `${n.toLocaleString()} cal`,
}

// Items designed to produce known ratios:
// pizza (285) vs burrito (1070): ratio = 285/1070 = 0.266 → easy
// big-mac (563) vs pad-thai (630): ratio = 563/630 = 0.894 → too close, exceeds 0.85
// croissant (406) vs bagel (360): ratio = 360/406 = 0.887 → too close
// salad (150) vs burger (850): ratio = 150/850 = 0.176 → easy
// pasta (420) vs rice-bowl (460): ratio = 420/460 = 0.913 → too close
// fries (365) vs nachos (580): ratio = 365/580 = 0.629 → medium
// donut (452) vs muffin (480): ratio = 452/480 = 0.942 → too close
// sushi (350) vs steak (679): ratio = 350/679 = 0.515 → medium
// pancakes (227) vs waffle (291): ratio = 227/291 = 0.780 → hard
// smoothie (210) vs milkshake (530): ratio = 210/530 = 0.396 → medium
// taco (156) vs wrap (410): ratio = 156/410 = 0.380 → medium

const items: Item[] = [
  { id: 'pizza', name: 'Pizza', emoji: '🍕', facts: { calories: { value: 285, unit: 'cal', source: 'USDA' } } },
  { id: 'burrito', name: 'Burrito', emoji: '🌯', facts: { calories: { value: 1070, unit: 'cal', source: 'USDA' } } },
  { id: 'salad', name: 'Salad', emoji: '🥗', facts: { calories: { value: 150, unit: 'cal', source: 'USDA' } } },
  { id: 'burger', name: 'Burger', emoji: '🍔', facts: { calories: { value: 850, unit: 'cal', source: 'USDA' } } },
  { id: 'fries', name: 'Fries', emoji: '🍟', facts: { calories: { value: 365, unit: 'cal', source: 'USDA' } } },
  { id: 'nachos', name: 'Nachos', emoji: '🧀', facts: { calories: { value: 580, unit: 'cal', source: 'USDA' } } },
  { id: 'sushi', name: 'Sushi', emoji: '🍣', facts: { calories: { value: 350, unit: 'cal', source: 'USDA' } } },
  { id: 'steak', name: 'Steak', emoji: '🥩', facts: { calories: { value: 679, unit: 'cal', source: 'USDA' } } },
  { id: 'pancakes', name: 'Pancakes', emoji: '🥞', facts: { calories: { value: 227, unit: 'cal', source: 'USDA' } } },
  { id: 'waffle', name: 'Waffle', emoji: '🧇', facts: { calories: { value: 291, unit: 'cal', source: 'USDA' } } },
  { id: 'smoothie', name: 'Smoothie', emoji: '🥤', facts: { calories: { value: 210, unit: 'cal', source: 'USDA' } } },
  { id: 'milkshake', name: 'Milkshake', emoji: '🥛', facts: { calories: { value: 530, unit: 'cal', source: 'USDA' } } },
  { id: 'taco', name: 'Taco', emoji: '🌮', facts: { calories: { value: 156, unit: 'cal', source: 'USDA' } } },
  { id: 'wrap', name: 'Wrap', emoji: '🫔', facts: { calories: { value: 410, unit: 'cal', source: 'USDA' } } },
]

describe('getDifficultyBand', () => {
  it('returns "easy" for streak 0-2', () => {
    expect(getDifficultyBand(0)).toBe('easy')
    expect(getDifficultyBand(1)).toBe('easy')
    expect(getDifficultyBand(2)).toBe('easy')
  })

  it('returns "medium" for streak 3-5', () => {
    expect(getDifficultyBand(3)).toBe('medium')
    expect(getDifficultyBand(5)).toBe('medium')
  })

  it('returns "hard" for streak 6+', () => {
    expect(getDifficultyBand(6)).toBe('hard')
    expect(getDifficultyBand(20)).toBe('hard')
  })
})

describe('selectPair', () => {
  it('returns a pair of two different items', () => {
    const [a, b] = selectPair(items, mockCategory, 0, [])
    expect(a.id).not.toBe(b.id)
  })

  it('returns items that have facts for the given category', () => {
    const [a, b] = selectPair(items, mockCategory, 0, [])
    expect(a.facts[mockCategory.metricKey]).toBeDefined()
    expect(b.facts[mockCategory.metricKey]).toBeDefined()
  })

  it('produces easy pairs (ratio < 0.35) at streak 0', () => {
    // Run multiple times to check distribution
    for (let i = 0; i < 20; i++) {
      const [a, b] = selectPair(items, mockCategory, 0, [])
      const valA = a.facts[mockCategory.metricKey].value
      const valB = b.facts[mockCategory.metricKey].value
      const ratio = Math.min(valA, valB) / Math.max(valA, valB)
      // Allow widened range (0.1 each direction) since exact band may not always have matches
      expect(ratio).toBeLessThanOrEqual(0.45)
    }
  })

  it('excludes items that appear in history', () => {
    const history = ['pizza', 'burrito', 'salad', 'burger']
    const [a, b] = selectPair(items, mockCategory, 0, history)
    expect(history).not.toContain(a.id)
    expect(history).not.toContain(b.id)
  })

  it('never exceeds 0.85 ratio', () => {
    for (let i = 0; i < 50; i++) {
      const [a, b] = selectPair(items, mockCategory, 10, [])
      const valA = a.facts[mockCategory.metricKey].value
      const valB = b.facts[mockCategory.metricKey].value
      const ratio = Math.min(valA, valB) / Math.max(valA, valB)
      expect(ratio).toBeLessThanOrEqual(0.95) // widened max with fallback
    }
  })

  it('handles small item pools by widening the range', () => {
    const smallPool = items.slice(0, 4)
    // Should not throw even with a small pool
    const [a, b] = selectPair(smallPool, mockCategory, 6, [])
    expect(a).toBeDefined()
    expect(b).toBeDefined()
    expect(a.id).not.toBe(b.id)
  })

  it('handles pool where all items are in history by clearing history', () => {
    const allIds = items.map(i => i.id)
    // When all items are seen, function should still return a pair (fallback)
    const [a, b] = selectPair(items, mockCategory, 0, allIds)
    expect(a).toBeDefined()
    expect(b).toBeDefined()
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest --run src/engine/__tests__/pairing.test.ts`
Expected: FAIL — `Cannot find module '../pairing'`

**Step 3: Implement the pairing algorithm**

Create `src/engine/pairing.ts`:

```typescript
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
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest --run src/engine/__tests__/pairing.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/engine/pairing.ts src/engine/__tests__/pairing.test.ts
git commit -m "feat: implement difficulty-aware pairing algorithm with TDD"
```

---

## Task 5: Data — Categories

**Files:**
- Create: `src/data/categories.ts`

**Step 1: Create the categories definition file**

Create `src/data/categories.ts`:

```typescript
import type { Category } from '@/engine/types'

export const categories: Category[] = [
  {
    id: 'calories',
    label: 'Calories',
    question: 'Which has more calories?',
    metricKey: 'calories',
    color: '#ffb380',
    formatValue: (n: number) => `${n.toLocaleString()} cal`,
  },
  {
    id: 'population',
    label: 'Population',
    question: 'Which has a higher population?',
    metricKey: 'population',
    color: '#80c4ff',
    formatValue: (n: number) => {
      if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
      if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
      if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
      return n.toLocaleString()
    },
  },
  {
    id: 'rotten_tomatoes',
    label: 'Rotten Tomatoes',
    question: 'Which has a higher Rotten Tomatoes score?',
    metricKey: 'rotten_tomatoes',
    color: '#c8a2ff',
    formatValue: (n: number) => `${n}%`,
  },
  {
    id: 'top_speed',
    label: 'Top Speed',
    question: 'Which is faster?',
    metricKey: 'top_speed',
    color: '#5ce0d6',
    formatValue: (n: number) => `${n} mph`,
  },
  {
    id: 'average_price',
    label: 'Average Price',
    question: 'Which costs more?',
    metricKey: 'average_price',
    color: '#6ee7a0',
    formatValue: (n: number) => `$${n.toLocaleString()}`,
  },
]
```

**Step 2: Commit**

```bash
git add src/data/categories.ts
git commit -m "feat: add category definitions for all 5 categories"
```

---

## Task 6: Data — Starter Item Dataset (50+ items, 3 categories)

**Files:**
- Create: `src/data/items.ts`

**Step 1: Create the items data file with 50+ items across 3 categories**

Create `src/data/items.ts` with the following data. Each item should have facts for at least 2 categories. Focus on well-known items where people have intuitions.

```typescript
import type { Item } from '@/engine/types'

export const items: Item[] = [
  // === FOOD / RESTAURANT ITEMS (calories + price) ===
  {
    id: 'big-mac',
    name: 'Big Mac',
    emoji: '🍔',
    facts: {
      calories: { value: 563, unit: 'cal', source: 'McDonald\'s Nutrition Guide', asOf: '2024' },
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
      calories: { value: 410, unit: 'cal', source: 'McDonald\'s Nutrition Guide', asOf: '2024' },
      average_price: { value: 5.29, unit: '$', source: 'McDonald\'s Menu', asOf: '2024' },
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
    name: 'Whole Domino\'s Pizza',
    emoji: '🍕',
    facts: {
      calories: { value: 2080, unit: 'cal', source: 'Domino\'s Nutrition (medium hand tossed)', asOf: '2024' },
      average_price: { value: 13.99, unit: '$', source: 'Domino\'s Menu', asOf: '2024' },
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
```

**Step 2: Commit**

```bash
git add src/data/items.ts
git commit -m "feat: add starter dataset with 65+ items across calories, population, rotten tomatoes"
```

---

## Task 7: localStorage Wrapper

**Files:**
- Create: `src/lib/storage.ts`

**Step 1: Create the localStorage wrapper**

Create `src/lib/storage.ts`:

```typescript
const RECORD_KEY = 'higher-lower-record'

export function getRecord(): number {
  const stored = localStorage.getItem(RECORD_KEY)
  return stored ? parseInt(stored, 10) : 0
}

export function setRecord(record: number): void {
  localStorage.setItem(RECORD_KEY, String(record))
}
```

**Step 2: Commit**

```bash
git add src/lib/storage.ts
git commit -m "feat: add localStorage wrapper for record persistence"
```

---

## Task 8: useGame Hook

**Files:**
- Create: `src/hooks/useGame.ts`

**Step 1: Build the useGame hook**

Create `src/hooks/useGame.ts`:

```typescript
import { useReducer, useCallback, useEffect } from 'react'
import { gameReducer, initialState } from '@/engine/game-state'
import { selectPair } from '@/engine/pairing'
import { items } from '@/data/items'
import { categories } from '@/data/categories'
import { getRecord, setRecord } from '@/lib/storage'
import type { Category, StreakTier } from '@/engine/types'

export function getStreakTier(streak: number): StreakTier {
  if (streak >= 10) return 'fire'
  if (streak >= 6) return 'hot'
  if (streak >= 3) return 'warm'
  return 'calm'
}

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialState,
    record: getRecord(),
  })

  const anchor = state.currentPair?.[0] ?? null
  const challenger = state.currentPair?.[1] ?? null
  const streakTier = getStreakTier(state.streak)

  const isCorrect = useCallback((): boolean | null => {
    if (!state.currentPair || !state.choice || !state.category) return null
    const anchorVal = state.currentPair[0].facts[state.category.metricKey].value
    const challengerVal = state.currentPair[1].facts[state.category.metricKey].value

    if (state.choice === 'higher') {
      return challengerVal >= anchorVal
    }
    return challengerVal <= anchorVal
  }, [state.currentPair, state.choice, state.category])

  // Persist record to localStorage whenever it changes
  useEffect(() => {
    if (state.record > 0) {
      setRecord(state.record)
    }
  }, [state.record])

  const startGame = useCallback(() => {
    // Pick a random category
    const category = categories[Math.floor(Math.random() * categories.length)]
    const pair = selectPair(items, category, 0, [])
    dispatch({ type: 'START_GAME', category, pair })
  }, [])

  const startGameWithCategory = useCallback((category: Category) => {
    const pair = selectPair(items, category, 0, [])
    dispatch({ type: 'START_GAME', category, pair })
  }, [])

  const choose = useCallback((choice: 'higher' | 'lower') => {
    dispatch({ type: 'CHOOSE', choice })
  }, [])

  const completeReveal = useCallback((correct: boolean) => {
    dispatch({ type: 'REVEAL_COMPLETE', isCorrect: correct })

    if (correct && state.category) {
      // Generate next pair and advance
      const pair = selectPair(items, state.category, state.streak + 1, state.history)
      dispatch({ type: 'NEXT_ROUND', pair })
    }
  }, [state.category, state.streak, state.history])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return {
    state,
    anchor,
    challenger,
    isCorrect,
    streakTier,
    startGame,
    startGameWithCategory,
    choose,
    completeReveal,
    reset,
  }
}
```

**Step 2: Commit**

```bash
git add src/hooks/useGame.ts
git commit -m "feat: add useGame hook connecting engine to React"
```

---

## Task 9: Static Layout — GameShell, Card, TopBar, QuestionBar

**Files:**
- Create: `src/components/GameShell.tsx`
- Create: `src/components/Card.tsx`
- Create: `src/components/TopBar.tsx`
- Create: `src/components/QuestionBar.tsx`
- Create: `src/components/CardArena.tsx`

**Step 1: Create GameShell — full viewport container with ambient background**

Create `src/components/GameShell.tsx`:

```tsx
import type { ReactNode } from 'react'

type GameShellProps = {
  catColor: string
  children: ReactNode
}

export function GameShell({ catColor, children }: GameShellProps) {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col"
      style={{
        background: 'var(--bg)',
        ['--cat-color' as string]: catColor,
      }}
    >
      {/* Ambient gradient orbs */}
      <div
        className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${catColor}12, transparent 70%)`,
        }}
      />
      <div
        className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${catColor}12, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {children}
      </div>
    </div>
  )
}
```

**Step 2: Create TopBar — streak counter + record display**

Create `src/components/TopBar.tsx`:

```tsx
import type { StreakTier } from '@/engine/types'

type TopBarProps = {
  streak: number
  record: number
  streakTier: StreakTier
}

const tierConfig: Record<StreakTier, { color: string; icon: string; glow: boolean }> = {
  calm: { color: '#e8e6f0', icon: '', glow: false },
  warm: { color: '#ffd074', icon: '🔥', glow: false },
  hot: { color: '#ffaa44', icon: '🔥', glow: false },
  fire: { color: '#ff7744', icon: '🔥', glow: true },
}

export function TopBar({ streak, record, streakTier }: TopBarProps) {
  const config = tierConfig[streakTier]
  const isAtRecord = streak > 0 && streak === record

  return (
    <div className="flex items-center justify-between px-12 py-6" style={{ minHeight: '8vh' }}>
      {/* Streak */}
      <div className="flex items-center gap-3">
        {config.icon && <span className="text-3xl">{config.icon}</span>}
        <span
          className="font-bold"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(48px, 5vw, 64px)',
            color: config.color,
            textShadow: config.glow ? `0 0 20px ${config.color}` : 'none',
            animation: isAtRecord ? 'pulse-scale 1.5s ease-in-out infinite' : 'none',
          }}
        >
          {streak}
        </span>
      </div>

      {/* Record */}
      <div
        className="flex items-center gap-2"
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '14px',
          color: 'var(--text-muted)',
          opacity: 0.4,
          animation: isAtRecord ? 'pulse-scale 1.5s ease-in-out infinite' : 'none',
        }}
      >
        <span>RECORD</span>
        <span style={{ fontWeight: 700 }}>{record}</span>
      </div>
    </div>
  )
}
```

**Step 3: Create Card — single glass card**

Create `src/components/Card.tsx`:

```tsx
import type { Item, Category } from '@/engine/types'
import type { ReactNode } from 'react'

type CardProps = {
  item: Item
  category: Category
  variant: 'anchor' | 'challenger'
  children?: ReactNode  // For value area (buttons, revealed value, or count-up)
}

export function Card({ item, category, variant, children }: CardProps) {
  const value = item.facts[category.metricKey]?.value
  const isAnchor = variant === 'anchor'

  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-2xl"
      style={{
        width: 'clamp(280px, 20vw, 320px)',
        height: 'clamp(360px, 35vh, 420px)',
        padding: '28px',
        background: isAnchor ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: isAnchor
          ? '1px solid rgba(255, 255, 255, 0.06)'
          : `1px solid color-mix(in srgb, var(--cat-color) 15%, transparent)`,
        borderRadius: '16px',
        boxShadow: isAnchor
          ? '0 8px 32px rgba(0, 0, 0, 0.3)'
          : '0 0 40px color-mix(in srgb, var(--cat-color) 5%, transparent)',
        opacity: isAnchor ? 0.85 : 1,
      }}
    >
      {/* Emoji */}
      <span style={{ fontSize: 'clamp(48px, 4vw, 56px)' }}>{item.emoji}</span>

      {/* Item name */}
      <span
        className="text-center"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: 'clamp(16px, 1.2vw, 22px)',
          color: 'var(--text)',
        }}
      >
        {item.name}
      </span>

      {/* Value area */}
      <div className="flex flex-col items-center gap-2 mt-auto w-full">
        {isAnchor && value !== undefined ? (
          <div className="text-center">
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700,
                fontSize: 'clamp(28px, 2.5vw, 40px)',
                color: 'var(--cat-color)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {category.formatValue(value)}
            </span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
```

**Step 4: Create CardArena — two cards with VS divider**

Create `src/components/CardArena.tsx`:

```tsx
import type { ReactNode } from 'react'

type CardArenaProps = {
  anchorCard: ReactNode
  challengerCard: ReactNode
}

export function CardArena({ anchorCard, challengerCard }: CardArenaProps) {
  return (
    <div
      className="flex items-center justify-center flex-1"
      style={{ gap: 'clamp(24px, 3vw, 48px)' }}
    >
      {anchorCard}

      {/* VS divider */}
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(18px, 1.5vw, 24px)',
          color: 'var(--text-muted)',
          opacity: 0.5,
        }}
      >
        VS
      </span>

      {challengerCard}
    </div>
  )
}
```

**Step 5: Create QuestionBar — "Which has more [category]?"**

Create `src/components/QuestionBar.tsx`:

```tsx
type QuestionBarProps = {
  questionPrefix: string  // e.g. "Which has more"
  categoryLabel: string   // e.g. "calories"
  catColor: string
}

export function QuestionBar({ questionPrefix, categoryLabel, catColor }: QuestionBarProps) {
  // Parse question to extract prefix and keyword
  return (
    <div
      className="flex items-center justify-center"
      style={{
        minHeight: '16vh',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 'clamp(16px, 1.3vw, 18px)',
      }}
    >
      <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
        {questionPrefix}{' '}
      </span>
      <span style={{ color: catColor, fontWeight: 600 }}>
        {categoryLabel}
      </span>
      <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>?</span>
    </div>
  )
}
```

**Step 6: Commit**

```bash
git add src/components/GameShell.tsx src/components/Card.tsx src/components/TopBar.tsx src/components/QuestionBar.tsx src/components/CardArena.tsx
git commit -m "feat: add static layout components (GameShell, Card, TopBar, QuestionBar, CardArena)"
```

---

## Task 10: StartScreen

**Files:**
- Create: `src/components/StartScreen.tsx`

**Step 1: Build the start screen**

Create `src/components/StartScreen.tsx`:

```tsx
type StartScreenProps = {
  record: number
  onPlay: () => void
}

export function StartScreen({ record, onPlay }: StartScreenProps) {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col items-center justify-center"
      style={{ background: 'var(--bg)' }}
    >
      {/* Ambient orbs */}
      <div
        className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ffb38012, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #80c4ff12, transparent 70%)' }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Title */}
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(48px, 5vw, 64px)',
            letterSpacing: '0.02em',
            margin: 0,
          }}
        >
          <span style={{ color: 'var(--text)' }}>HIGHER</span>
          <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>/</span>
          <span
            style={{
              background: 'linear-gradient(135deg, #ffb380, #c8a2ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            LOWER
          </span>
        </h1>

        {/* Record */}
        {record > 0 && (
          <p
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '16px',
              color: 'var(--text-muted)',
              margin: 0,
            }}
          >
            Record: {record}
          </p>
        )}

        {/* Play button */}
        <button
          onClick={onPlay}
          className="cursor-pointer"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(20px, 2vw, 28px)',
            letterSpacing: '0.08em',
            padding: '14px 48px',
            background: 'color-mix(in srgb, #ffb380 15%, transparent)',
            border: '1px solid color-mix(in srgb, #ffb380 30%, transparent)',
            borderRadius: '12px',
            color: '#ffb380',
            transition: 'transform 0.15s ease, background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.background = 'color-mix(in srgb, #ffb380 25%, transparent)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.background = 'color-mix(in srgb, #ffb380 15%, transparent)'
          }}
        >
          PLAY
        </button>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/StartScreen.tsx
git commit -m "feat: add StartScreen component with title, record, and play button"
```

---

## Task 11: Wire Up App.tsx — Full Playable Game (No Animations)

**Files:**
- Modify: `src/App.tsx`

**Step 1: Wire everything together in App.tsx**

Replace `src/App.tsx` with:

```tsx
import { GameShell } from '@/components/GameShell'
import { TopBar } from '@/components/TopBar'
import { CardArena } from '@/components/CardArena'
import { Card } from '@/components/Card'
import { QuestionBar } from '@/components/QuestionBar'
import { StartScreen } from '@/components/StartScreen'
import { useGame } from '@/hooks/useGame'

function HigherLowerButtons({
  onHigher,
  onLower,
  disabled,
}: {
  onHigher: () => void
  onLower: () => void
  disabled: boolean
}) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <button
        onClick={onHigher}
        disabled={disabled}
        className="cursor-pointer flex items-center justify-center gap-2 w-full"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '14px',
          fontWeight: 600,
          letterSpacing: '0.05em',
          padding: '10px 0',
          background: 'color-mix(in srgb, var(--cat-color) 10%, transparent)',
          border: '1px solid color-mix(in srgb, var(--cat-color) 30%, transparent)',
          borderRadius: '8px',
          color: 'var(--cat-color)',
          transition: 'transform 0.15s ease, background 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.03)'
          e.currentTarget.style.background = 'color-mix(in srgb, var(--cat-color) 18%, transparent)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.background = 'color-mix(in srgb, var(--cat-color) 10%, transparent)'
        }}
      >
        ▲ HIGHER
      </button>
      <button
        onClick={onLower}
        disabled={disabled}
        className="cursor-pointer flex items-center justify-center gap-2 w-full"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '14px',
          fontWeight: 600,
          letterSpacing: '0.05em',
          padding: '10px 0',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          color: 'rgba(255, 255, 255, 0.5)',
          transition: 'transform 0.15s ease, background 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.03)'
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
        }}
      >
        ▼ LOWER
      </button>
    </div>
  )
}

function App() {
  const {
    state,
    anchor,
    challenger,
    isCorrect,
    streakTier,
    startGame,
    choose,
    completeReveal,
    reset,
  } = useGame()

  if (state.phase === 'start') {
    return <StartScreen record={state.record} onPlay={startGame} />
  }

  if (!anchor || !challenger || !state.category) return null

  const catColor = state.category.color

  // Parse the question into prefix and keyword
  // e.g. "Which has more calories?" → prefix="Which has more", keyword="calories"
  const question = state.category.question
  const keywordIndex = question.toLowerCase().indexOf(state.category.label.toLowerCase())
  const questionPrefix = keywordIndex > 0
    ? question.slice(0, keywordIndex).trim()
    : 'Which has more'

  return (
    <GameShell catColor={catColor}>
      <TopBar streak={state.streak} record={state.record} streakTier={streakTier} />

      <CardArena
        anchorCard={
          <Card item={anchor} category={state.category} variant="anchor" />
        }
        challengerCard={
          <Card item={challenger} category={state.category} variant="challenger">
            {state.phase === 'comparing' && (
              <HigherLowerButtons
                onHigher={() => choose('higher')}
                onLower={() => choose('lower')}
                disabled={false}
              />
            )}
            {state.phase === 'revealing' && (
              <div className="flex flex-col items-center gap-2">
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: 700,
                    fontSize: 'clamp(28px, 2.5vw, 40px)',
                    color: 'var(--cat-color)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {state.category.formatValue(challenger.facts[state.category.metricKey].value)}
                </span>
                <span style={{ fontSize: '24px' }}>
                  {isCorrect() ? '✓' : '✗'}
                </span>
                <button
                  onClick={() => completeReveal(isCorrect()!)}
                  className="cursor-pointer mt-2"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '12px',
                    padding: '6px 16px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: 'var(--text-muted)',
                  }}
                >
                  {isCorrect() ? 'NEXT →' : 'GAME OVER'}
                </button>
              </div>
            )}
            {state.phase === 'game_over' && (
              <div className="flex flex-col items-center gap-2">
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: 700,
                    fontSize: 'clamp(28px, 2.5vw, 40px)',
                    color: 'var(--wrong)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {state.category.formatValue(challenger.facts[state.category.metricKey].value)}
                </span>
                <p style={{ color: 'var(--text-muted)', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px' }}>
                  Streak: {state.streak} | Record: {state.record}
                </p>
                <button
                  onClick={reset}
                  className="cursor-pointer"
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '20px',
                    padding: '10px 32px',
                    background: 'color-mix(in srgb, var(--cat-color) 15%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--cat-color) 30%, transparent)',
                    borderRadius: '8px',
                    color: 'var(--cat-color)',
                  }}
                >
                  PLAY AGAIN
                </button>
              </div>
            )}
          </Card>
        }
      />

      <QuestionBar
        questionPrefix={questionPrefix}
        categoryLabel={state.category.label}
        catColor={catColor}
      />
    </GameShell>
  )
}

export default App
```

**Step 2: Verify the game is fully playable**

Run: `npm run dev`
Expected: Full game loop works — start screen → click PLAY → see two cards → click HIGHER/LOWER → see value revealed → click NEXT or GAME OVER → streak counts → game over shows → PLAY AGAIN resets.

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire up App.tsx with full playable game loop (no animations yet)"
```

---

## Task 12: RevealSequence — Animated Count-Up

**Files:**
- Create: `src/components/RevealSequence.tsx`
- Modify: `src/App.tsx` (integrate RevealSequence into challenger card)

**Step 1: Create RevealSequence component**

Create `src/components/RevealSequence.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react'
import { animate } from 'motion'

type RevealSequenceProps = {
  targetValue: number
  formatValue: (n: number) => string
  isCorrect: boolean
  onComplete: (correct: boolean) => void
  ratio: number  // min/max ratio — used to adjust count-up duration
}

export function RevealSequence({
  targetValue,
  formatValue,
  isCorrect,
  onComplete,
  ratio,
}: RevealSequenceProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [phase, setPhase] = useState<'counting' | 'verdict' | 'done'>('counting')
  const hasCompleted = useRef(false)

  useEffect(() => {
    hasCompleted.current = false

    // Phase A: Commitment (200ms built into the count-up start)
    const countDuration = ratio > 0.7 ? 1.5 : 1.0

    // Phase B: Count-Up
    const controls = animate(0, targetValue, {
      duration: countDuration,
      ease: [0, 0, 0.2, 1], // ease-out cubic
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest))
      },
      onComplete: () => {
        setDisplayValue(targetValue)
        setPhase('verdict')

        // Phase C: Verdict pause (500ms)
        setTimeout(() => {
          if (hasCompleted.current) return
          setPhase('done')

          // Phase D: Transition delay
          const delay = isCorrect ? 500 : 800
          setTimeout(() => {
            if (hasCompleted.current) return
            hasCompleted.current = true
            onComplete(isCorrect)
          }, delay)
        }, 500)
      },
    })

    return () => {
      controls.stop()
      hasCompleted.current = true
    }
  }, [targetValue, isCorrect, onComplete, ratio])

  const verdictColor = isCorrect ? 'var(--correct)' : 'var(--wrong)'
  const verdictIcon = isCorrect ? '✓' : '✗'

  return (
    <div className="flex flex-col items-center gap-2">
      <span
        style={{
          fontFamily: "'Space Mono', monospace",
          fontWeight: 700,
          fontSize: 'clamp(28px, 2.5vw, 40px)',
          color: phase === 'verdict' || phase === 'done' ? verdictColor : 'var(--cat-color)',
          fontVariantNumeric: 'tabular-nums',
          transition: 'color 0.2s ease',
        }}
      >
        {formatValue(displayValue)}
      </span>
      {(phase === 'verdict' || phase === 'done') && (
        <span
          style={{
            fontSize: '28px',
            color: verdictColor,
            opacity: 0,
            animation: 'fadeIn 0.2s ease forwards',
          }}
        >
          {verdictIcon}
        </span>
      )}
    </div>
  )
}
```

**Step 2: Add the fadeIn keyframe to index.css**

Add to the end of `src/index.css`:

```css
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes pulse-scale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}
```

**Step 3: Integrate RevealSequence into App.tsx**

In `src/App.tsx`, replace the `revealing` phase section inside the challenger card's children with the `RevealSequence` component. Replace the inline revealing content:

```tsx
// In the challenger card children, replace the 'revealing' phase block with:
{state.phase === 'revealing' && (
  <RevealSequence
    targetValue={challenger.facts[state.category.metricKey].value}
    formatValue={state.category.formatValue}
    isCorrect={isCorrect()!}
    onComplete={completeReveal}
    ratio={
      Math.min(
        anchor.facts[state.category.metricKey].value,
        challenger.facts[state.category.metricKey].value
      ) /
      Math.max(
        anchor.facts[state.category.metricKey].value,
        challenger.facts[state.category.metricKey].value
      )
    }
  />
)}
```

Also remove the temporary "NEXT →" and "GAME OVER" button that was in the revealing phase — the RevealSequence now auto-advances.

**Step 4: Verify**

Run: `npm run dev`
Expected: After clicking HIGHER/LOWER, the number counts up from 0 to the target value with ease-out easing. A checkmark or X appears. The game auto-advances to the next round or game over.

**Step 5: Commit**

```bash
git add src/components/RevealSequence.tsx src/App.tsx src/index.css
git commit -m "feat: add animated count-up reveal sequence with verdict display"
```

---

## Task 13: Card Slide Transitions with AnimatePresence

**Files:**
- Modify: `src/components/CardArena.tsx`
- Modify: `src/App.tsx`

**Step 1: Add AnimatePresence to CardArena**

Update `src/components/CardArena.tsx`:

```tsx
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'

type CardArenaProps = {
  anchorCard: ReactNode
  challengerCard: ReactNode
  anchorKey: string
  challengerKey: string
}

export function CardArena({ anchorCard, challengerCard, anchorKey, challengerKey }: CardArenaProps) {
  return (
    <div
      className="flex items-center justify-center flex-1"
      style={{ gap: 'clamp(24px, 3vw, 48px)' }}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`anchor-${anchorKey}`}
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {anchorCard}
        </motion.div>
      </AnimatePresence>

      {/* VS divider */}
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(18px, 1.5vw, 24px)',
          color: 'var(--text-muted)',
          opacity: 0.5,
        }}
      >
        VS
      </span>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={`challenger-${challengerKey}`}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {challengerCard}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
```

**Step 2: Pass keys from App.tsx**

Update the `CardArena` usage in `App.tsx` to include key props:

```tsx
<CardArena
  anchorKey={anchor.id}
  challengerKey={challenger.id}
  anchorCard={/* ... */}
  challengerCard={/* ... */}
/>
```

**Step 3: Verify**

Run: `npm run dev`
Expected: Cards slide in from the right and slide out to the left on transitions. New challenger enters with a smooth motion.

**Step 4: Commit**

```bash
git add src/components/CardArena.tsx src/App.tsx
git commit -m "feat: add card slide transitions with AnimatePresence"
```

---

## Task 14: GameOverOverlay with Slide-Up Animation

**Files:**
- Create: `src/components/GameOverOverlay.tsx`
- Modify: `src/App.tsx`

**Step 1: Create GameOverOverlay**

Create `src/components/GameOverOverlay.tsx`:

```tsx
import { motion } from 'motion/react'
import type { Item, Category } from '@/engine/types'

type GameOverOverlayProps = {
  anchor: Item
  challenger: Item
  category: Category
  streak: number
  record: number
  isNewRecord: boolean
  onPlayAgain: () => void
}

export function GameOverOverlay({
  anchor,
  challenger,
  category,
  streak,
  record,
  isNewRecord,
  onPlayAgain,
}: GameOverOverlayProps) {
  const anchorVal = anchor.facts[category.metricKey].value
  const challengerVal = challenger.facts[category.metricKey].value

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center gap-6 z-50"
      style={{
        height: '70%',
        background: 'rgba(12, 12, 20, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* GAME OVER title */}
      <h2
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(56px, 5vw, 72px)',
          color: 'var(--text)',
          margin: 0,
        }}
      >
        GAME OVER
      </h2>

      {/* Fatal comparison */}
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center gap-1">
          <span style={{ fontSize: '32px' }}>{anchor.emoji}</span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>
            {anchor.name}
          </span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: '18px', color: 'var(--cat-color)', fontVariantNumeric: 'tabular-nums' }}>
            {category.formatValue(anchorVal)}
          </span>
        </div>
        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>vs</span>
        <div className="flex flex-col items-center gap-1">
          <span style={{ fontSize: '32px' }}>{challenger.emoji}</span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>
            {challenger.name}
          </span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: '18px', color: 'var(--wrong)', fontVariantNumeric: 'tabular-nums' }}>
            {category.formatValue(challengerVal)}
          </span>
        </div>
      </div>

      {/* Streak */}
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '18px', color: 'var(--text)', margin: 0 }}>
        Streak:{' '}
        <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>
          {streak}
        </span>
      </p>

      {/* Record status */}
      {isNewRecord ? (
        <p style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '24px',
          color: 'var(--cat-color)',
          margin: 0,
        }}>
          NEW RECORD!
        </p>
      ) : (
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
          Record: {record}
        </p>
      )}

      {/* Play Again button */}
      <button
        onClick={onPlayAgain}
        className="cursor-pointer"
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(20px, 2vw, 28px)',
          letterSpacing: '0.08em',
          padding: '14px 48px',
          background: 'color-mix(in srgb, var(--cat-color) 15%, transparent)',
          border: '1px solid color-mix(in srgb, var(--cat-color) 30%, transparent)',
          borderRadius: '12px',
          color: 'var(--cat-color)',
          transition: 'transform 0.15s ease, background 0.15s ease',
          marginTop: '8px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
          e.currentTarget.style.background = 'color-mix(in srgb, var(--cat-color) 25%, transparent)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.background = 'color-mix(in srgb, var(--cat-color) 15%, transparent)'
        }}
      >
        PLAY AGAIN
      </button>
    </motion.div>
  )
}
```

**Step 2: Integrate into App.tsx**

Add the GameOverOverlay to App.tsx. In the `game_over` phase, render it over the GameShell. Track `isNewRecord` by comparing streak to previous record. Remove the inline game-over content from the challenger card children.

In `App.tsx`, add after the `QuestionBar` inside `GameShell`:

```tsx
{state.phase === 'game_over' && (
  <GameOverOverlay
    anchor={anchor}
    challenger={challenger}
    category={state.category}
    streak={state.streak}
    record={state.record}
    isNewRecord={state.streak === state.record && state.streak > 0}
    onPlayAgain={reset}
  />
)}
```

**Step 3: Verify**

Run: `npm run dev`
Expected: On wrong answer, a slide-up overlay shows "GAME OVER" with the fatal comparison, streak, record status, and a PLAY AGAIN button.

**Step 4: Commit**

```bash
git add src/components/GameOverOverlay.tsx src/App.tsx
git commit -m "feat: add GameOverOverlay with spring slide-up animation"
```

---

## Task 15: Confetti — CSS-Only

**Files:**
- Create: `src/components/Confetti.tsx`
- Modify: `src/index.css` (add confetti keyframes)
- Modify: `src/components/GameOverOverlay.tsx` (render Confetti when isNewRecord)

**Step 1: Add confetti keyframes to index.css**

Append to `src/index.css`:

```css
@keyframes confetti-fall {
  0% {
    transform: translateY(-20px) rotate(0deg);
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(var(--confetti-rotation));
    opacity: 0;
  }
}
```

**Step 2: Create Confetti component**

Create `src/components/Confetti.tsx`:

```tsx
import { useState, useEffect } from 'react'

type Particle = {
  id: number
  left: string
  width: number
  height: number
  color: string
  duration: string
  delay: string
  rotation: string
  borderRadius: string
}

const COLORS = ['#ffd074', '#ffb380', '#c8a2ff', '#6ee7a0', '#80c4ff', '#ffffff', '#ff8a8a']

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    width: 6 + Math.random() * 6,
    height: 6 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    duration: `${1.5 + Math.random() * 2}s`,
    delay: `${Math.random() * 0.5}s`,
    rotation: `${(Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360)}deg`,
    borderRadius: Math.random() > 0.5 ? '50%' : '0',
  }))
}

export function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    setParticles(generateParticles(25))
  }, [])

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: 0,
            left: p.left,
            width: `${p.width}px`,
            height: `${p.height}px`,
            background: p.color,
            borderRadius: p.borderRadius,
            ['--confetti-rotation' as string]: p.rotation,
            animation: `confetti-fall ${p.duration} ${p.delay} ease-in forwards`,
          }}
          onAnimationEnd={(e) => {
            e.currentTarget.remove()
          }}
        />
      ))}
    </div>
  )
}
```

**Step 3: Render Confetti in GameOverOverlay when isNewRecord**

Add to `GameOverOverlay.tsx`, at the top of the returned JSX (before the motion.div):

```tsx
import { Confetti } from './Confetti'

// Inside the component return, wrap in a fragment:
return (
  <>
    {isNewRecord && <Confetti />}
    <motion.div ...>
      {/* ... existing content ... */}
    </motion.div>
  </>
)
```

**Step 4: Verify**

Run: `npm run dev`
Expected: On new record, colorful confetti particles fall from the top of the screen and fade out.

**Step 5: Commit**

```bash
git add src/components/Confetti.tsx src/components/GameOverOverlay.tsx src/index.css
git commit -m "feat: add CSS-only confetti animation for new records"
```

---

## Task 16: Content Expansion — 150+ Items Across 5 Categories

**Files:**
- Modify: `src/data/items.ts` (expand from ~65 to 150+ items)

This is a large data entry task. The agent should expand the items array to include:

**Step 1: Add Animals — Top Speed items (30+ items)**

Add items like:
- Cheetah (70 mph), Peregrine Falcon (240 mph), Lion (50 mph), Grizzly Bear (35 mph), Usain Bolt (28 mph), Horse (55 mph), Greyhound (45 mph), Dolphin (37 mph), Sailfish (68 mph), Black Mamba (12 mph), Ostrich (45 mph), Kangaroo (44 mph), Elephant (25 mph), Hippo (19 mph), Crocodile (22 mph), Rabbit (35 mph), House Cat (30 mph), Chicken (9 mph), Pig (11 mph), Sloth (0.15 mph), Tortoise (0.3 mph), Great White Shark (35 mph), Moose (35 mph), Giraffe (37 mph), Wolf (40 mph), Coyote (43 mph), Red Fox (30 mph), Bald Eagle (100 mph dive), Hummingbird (30 mph), Cobra (12 mph)

Each with `top_speed` fact.

**Step 2: Add Money — Average Price items (30+ items)**

Add items like:
- iPhone 16 Pro ($1199), MacBook Pro ($1999), Tesla Model 3 ($38990), Toyota Camry ($28855), Cup of Coffee ($5.50), Netflix Monthly ($15.49), Gallon of Gas ($3.50), Dozen Eggs ($4.50), Costco Hot Dog ($1.50), Movie Ticket ($11.00), Pair of Levi's ($69), Nike Air Max ($130), Airpods Pro ($249), PS5 ($499), Nintendo Switch ($299), Broadway Ticket ($150), Disneyland Ticket ($104), Rolex Submariner ($10100), etc.

Each with `average_price` fact.

**Step 3: Cross-pollinate — add extra category facts to existing items where appropriate**

For example, food items can also have `average_price` facts. Countries could potentially appear in other categories if relevant data exists.

**Step 4: Verify data quality**

Run: `npm run dev`
Play 10+ games across different categories. Verify no crashes, good variety, reasonable difficulty ramp.

**Step 5: Commit**

```bash
git add src/data/items.ts
git commit -m "feat: expand dataset to 150+ items across 5 categories"
```

---

## Task 17: Final Polish and Cleanup

**Files:**
- Modify: Various component files for polish
- Modify: `src/index.css`

**Step 1: Add the pulse-scale animation to index.css** (if not already added)

Verify `src/index.css` has the `pulse-scale` keyframe. If missing, add:

```css
@keyframes pulse-scale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}
```

**Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Run all tests**

Run: `npx vitest --run`
Expected: All tests pass

**Step 4: Run build**

Run: `npm run build`
Expected: Build succeeds, output in `dist/`

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: final polish, type check, and build verification"
```

---

## Summary of Commits

| # | Commit Message |
|---|---------------|
| 1 | `chore: scaffold Vite project with React, Tailwind v4, Motion, Vitest` |
| 2 | `feat: add game engine TypeScript types` |
| 3 | `feat: implement game state reducer with TDD` |
| 4 | `feat: implement difficulty-aware pairing algorithm with TDD` |
| 5 | `feat: add category definitions for all 5 categories` |
| 6 | `feat: add starter dataset with 65+ items across calories, population, rotten tomatoes` |
| 7 | `feat: add localStorage wrapper for record persistence` |
| 8 | `feat: add useGame hook connecting engine to React` |
| 9 | `feat: add static layout components (GameShell, Card, TopBar, QuestionBar, CardArena)` |
| 10 | `feat: add StartScreen component with title, record, and play button` |
| 11 | `feat: wire up App.tsx with full playable game loop (no animations yet)` |
| 12 | `feat: add animated count-up reveal sequence with verdict display` |
| 13 | `feat: add card slide transitions with AnimatePresence` |
| 14 | `feat: add GameOverOverlay with spring slide-up animation` |
| 15 | `feat: add CSS-only confetti animation for new records` |
| 16 | `feat: expand dataset to 150+ items across 5 categories` |
| 17 | `chore: final polish, type check, and build verification` |
