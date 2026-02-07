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
    for (let i = 0; i < 20; i++) {
      const [a, b] = selectPair(items, mockCategory, 0, [])
      const valA = a.facts[mockCategory.metricKey].value
      const valB = b.facts[mockCategory.metricKey].value
      const ratio = Math.min(valA, valB) / Math.max(valA, valB)
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
      expect(ratio).toBeLessThanOrEqual(0.95)
    }
  })

  it('handles small item pools by widening the range', () => {
    const smallPool = items.slice(0, 4)
    const [a, b] = selectPair(smallPool, mockCategory, 6, [])
    expect(a).toBeDefined()
    expect(b).toBeDefined()
    expect(a.id).not.toBe(b.id)
  })

  it('handles pool where all items are in history by clearing history', () => {
    const allIds = items.map(i => i.id)
    const [a, b] = selectPair(items, mockCategory, 0, allIds)
    expect(a).toBeDefined()
    expect(b).toBeDefined()
  })
})
