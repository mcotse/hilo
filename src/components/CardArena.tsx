import type { ReactNode } from 'react'

type CardArenaProps = {
  anchorCard: ReactNode
  challengerCard: ReactNode
}

export function CardArena({ anchorCard, challengerCard }: CardArenaProps) {
  return (
    <div
      className="flex items-center justify-center flex-1"
      style={{ gap: 'clamp(24px, 3vw, 48px)' }}
    >
      {anchorCard}

      {/* VS divider */}
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(18px, 1.5vw, 24px)',
          color: 'var(--text-muted)',
          opacity: 0.5,
        }}
      >
        VS
      </span>

      {challengerCard}
    </div>
  )
}
