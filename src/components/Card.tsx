import type { Item, Category } from '@/engine/types'
import type { ReactNode } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'

type CardProps = {
  item: Item
  category: Category
  variant: 'anchor' | 'challenger'
  children?: ReactNode
  showFlag?: boolean
  onFlag?: () => void
}

function FlagIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  )
}

export function Card({ item, category, variant, children, showFlag, onFlag }: CardProps) {
  const value = item.facts[category.metricKey]?.value
  const isAnchor = variant === 'anchor'
  const isMobile = useIsMobile()

  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-2xl"
      style={{
        position: 'relative',
        width: isMobile ? 'clamp(260px, 75vw, 320px)' : 'clamp(280px, 20vw, 320px)',
        height: isMobile ? 'clamp(180px, 28vh, 220px)' : 'clamp(360px, 35vh, 420px)',
        padding: isMobile ? '16px' : '28px',
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
      {/* Flag button */}
      {showFlag && onFlag && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onFlag()
          }}
          aria-label="Flag fact"
          className="dispute-flag-btn"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.25)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.15s ease, background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.25)'
            e.currentTarget.style.background = 'none'
          }}
        >
          <FlagIcon />
        </button>
      )}
      {/* Emoji */}
      <span style={{ fontSize: isMobile ? 'clamp(28px, 6vw, 36px)' : 'clamp(48px, 4vw, 56px)' }}>
        {item.emoji}
      </span>

      {/* Item name */}
      <span
        className="text-center"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: isMobile ? 'clamp(14px, 3.5vw, 16px)' : 'clamp(16px, 1.2vw, 22px)',
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
                fontSize: isMobile ? 'clamp(20px, 5vw, 28px)' : 'clamp(28px, 2.5vw, 40px)',
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
