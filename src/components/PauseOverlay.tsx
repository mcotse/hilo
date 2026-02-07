import { motion } from 'motion/react'
import { useIsMobile } from '@/hooks/useIsMobile'

type PauseOverlayProps = {
  streak: number
  onResume: () => void
  onQuit: () => void
}

export function PauseOverlay({ streak, onResume, onQuit }: PauseOverlayProps) {
  const isMobile = useIsMobile()

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center gap-6 z-50"
      style={{
        height: isMobile ? '75%' : '70%',
        padding: isMobile ? '24px 16px' : undefined,
        background: 'rgba(12, 12, 20, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* PAUSED title */}
      <h2
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: isMobile ? 'clamp(40px, 10vw, 52px)' : 'clamp(56px, 5vw, 72px)',
          color: 'var(--text)',
          margin: 0,
        }}
      >
        PAUSED
      </h2>

      {/* Streak so far */}
      <p style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 600,
        fontSize: isMobile ? '16px' : '18px',
        color: 'var(--text)',
        margin: 0,
      }}>
        Streak:{' '}
        <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>
          {streak}
        </span>
      </p>

      {/* Warning */}
      <p style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: isMobile ? '12px' : '14px',
        color: 'var(--text-muted)',
        margin: 0,
      }}>
        Your streak will be lost.
      </p>

      {/* Buttons */}
      <div className="flex flex-col gap-3" style={{ width: isMobile ? '200px' : '220px', marginTop: '8px' }}>
        <button
          onClick={onQuit}
          className="cursor-pointer"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(20px, 2vw, 28px)',
            letterSpacing: '0.08em',
            padding: '14px 0',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: 'var(--text-muted)',
            transition: 'transform 0.15s ease, background 0.15s ease',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
          }}
        >
          QUIT
        </button>
        <button
          onClick={onResume}
          className="cursor-pointer"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(20px, 2vw, 28px)',
            letterSpacing: '0.08em',
            padding: '14px 0',
            background: 'color-mix(in srgb, var(--cat-color) 15%, transparent)',
            border: '1px solid color-mix(in srgb, var(--cat-color) 30%, transparent)',
            borderRadius: '12px',
            color: 'var(--cat-color)',
            transition: 'transform 0.15s ease, background 0.15s ease',
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
          RESUME
        </button>
      </div>
    </motion.div>
  )
}
