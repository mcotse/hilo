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
