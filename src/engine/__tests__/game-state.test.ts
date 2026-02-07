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
