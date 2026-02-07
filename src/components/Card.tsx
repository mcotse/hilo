import type { Item, Category } from '@/engine/types'
import type { ReactNode } from 'react'

type CardProps = {
  item: Item
  category: Category
  variant: 'anchor' | 'challenger'
  children?: ReactNode
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
