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
  | { type: 'QUIT' }

export type StreakTier = 'calm' | 'warm' | 'hot' | 'fire'

export type DifficultyBand = 'easy' | 'medium' | 'hard'

export const DIFFICULTY_RANGES: Record<DifficultyBand, [number, number]> = {
  easy: [0.0, 0.35],
  medium: [0.25, 0.65],
  hard: [0.55, 0.85],
}
