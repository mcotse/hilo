import { motion } from 'motion/react'
import type { Item, Category } from '@/engine/types'
import { Confetti } from './Confetti'
import { useIsMobile } from '@/hooks/useIsMobile'

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
  const isMobile = useIsMobile()

  return (
    <>
      {isNewRecord && <Confetti />}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center z-50"
        style={{
          height: isMobile ? '85%' : '70%',
          gap: isMobile ? '16px' : '24px',
          padding: isMobile ? '24px 16px' : undefined,
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
            fontSize: isMobile ? 'clamp(40px, 10vw, 52px)' : 'clamp(56px, 5vw, 72px)',
            color: 'var(--text)',
            margin: 0,
          }}
        >
          GAME OVER
        </h2>

        {/* Fatal comparison */}
        <div className="flex items-center" style={{ gap: isMobile ? '16px' : '32px' }}>
          <div className="flex flex-col items-center gap-1">
            <span style={{ fontSize: isMobile ? '24px' : '32px' }}>{anchor.emoji}</span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: isMobile ? '12px' : '14px', color: 'var(--text)' }}>
              {anchor.name}
            </span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: isMobile ? '14px' : '18px', color: 'var(--cat-color)', fontVariantNumeric: 'tabular-nums' }}>
              {category.formatValue(anchorVal)}
            </span>
          </div>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: isMobile ? '12px' : '16px' }}>vs</span>
          <div className="flex flex-col items-center gap-1">
            <span style={{ fontSize: isMobile ? '24px' : '32px' }}>{challenger.emoji}</span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: isMobile ? '12px' : '14px', color: 'var(--text)' }}>
              {challenger.name}
            </span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: isMobile ? '14px' : '18px', color: 'var(--wrong)', fontVariantNumeric: 'tabular-nums' }}>
              {category.formatValue(challengerVal)}
            </span>
          </div>
        </div>

        {/* Streak */}
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: isMobile ? '16px' : '18px', color: 'var(--text)', margin: 0 }}>
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
            fontSize: isMobile ? '20px' : '24px',
            color: 'var(--cat-color)',
            margin: 0,
          }}>
            NEW RECORD!
          </p>
        ) : (
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: isMobile ? '12px' : '14px', color: 'var(--text-muted)', margin: 0 }}>
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
            padding: isMobile ? '14px 40px' : '14px 48px',
            background: 'color-mix(in srgb, var(--cat-color) 15%, transparent)',
            border: '1px solid color-mix(in srgb, var(--cat-color) 30%, transparent)',
            borderRadius: '12px',
            color: 'var(--cat-color)',
            transition: 'transform 0.15s ease, background 0.15s ease',
            marginTop: '8px',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
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
    </>
  )
}
