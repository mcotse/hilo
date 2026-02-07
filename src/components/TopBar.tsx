import type { StreakTier } from '@/engine/types'
import { useIsMobile } from '@/hooks/useIsMobile'

type TopBarProps = {
  streak: number
  record: number
  streakTier: StreakTier
  onPause?: () => void
}

const tierConfig: Record<StreakTier, { color: string; icon: string; glow: boolean }> = {
  calm: { color: '#e8e6f0', icon: '', glow: false },
  warm: { color: '#ffd074', icon: '🔥', glow: false },
  hot: { color: '#ffaa44', icon: '🔥', glow: false },
  fire: { color: '#ff7744', icon: '🔥', glow: true },
}

export function TopBar({ streak, record, streakTier, onPause }: TopBarProps) {
  const config = tierConfig[streakTier]
  const isAtRecord = streak > 0 && streak === record
  const isMobile = useIsMobile()

  return (
    <div
      className="flex items-center justify-between"
      style={{
        minHeight: isMobile ? '6vh' : '8vh',
        padding: isMobile ? '12px 16px' : '24px 48px',
      }}
    >
      {/* Streak */}
      <div className="flex items-center gap-2">
        {config.icon && <span className={isMobile ? 'text-xl' : 'text-3xl'}>{config.icon}</span>}
        <span
          className="font-bold"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: isMobile ? 'clamp(32px, 8vw, 40px)' : 'clamp(48px, 5vw, 64px)',
            color: config.color,
            textShadow: config.glow ? `0 0 20px ${config.color}` : 'none',
            animation: isAtRecord ? 'pulse-scale 1.5s ease-in-out infinite' : 'none',
          }}
        >
          {streak}
        </span>
      </div>

      {/* Pause + Record */}
      <div className="flex items-center gap-4">
        {onPause && (
          <button
            onClick={onPause}
            className="cursor-pointer flex items-center justify-center"
            aria-label="Pause"
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              display: 'flex',
              gap: '3px',
              opacity: 0.35,
              transition: 'transform 0.15s ease, opacity 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.2)'
              e.currentTarget.style.opacity = '0.6'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.opacity = '0.35'
            }}
          >
            <span
              style={{
                display: 'block',
                width: '4px',
                height: '16px',
                backgroundColor: 'var(--text-muted)',
                borderRadius: '1px',
              }}
            />
            <span
              style={{
                display: 'block',
                width: '4px',
                height: '16px',
                backgroundColor: 'var(--text-muted)',
                borderRadius: '1px',
              }}
            />
          </button>
        )}

        {/* Record */}
        <div
          className="flex items-center gap-2"
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: isMobile ? '12px' : '14px',
            color: 'var(--text-muted)',
            opacity: 0.4,
            animation: isAtRecord ? 'pulse-scale 1.5s ease-in-out infinite' : 'none',
          }}
        >
          <span>RECORD</span>
          <span style={{ fontWeight: 700 }}>{record}</span>
        </div>
      </div>
    </div>
  )
}
