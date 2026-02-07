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

  const quit = useCallback(() => {
    dispatch({ type: 'QUIT' })
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
    quit,
  }
}
