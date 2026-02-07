import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'

type CardArenaProps = {
  anchorCard: ReactNode
  challengerCard: ReactNode
  anchorKey: string
  challengerKey: string
}

export function CardArena({ anchorCard, challengerCard, anchorKey, challengerKey }: CardArenaProps) {
  return (
    <div
      className="flex items-center justify-center flex-1"
      style={{ gap: 'clamp(24px, 3vw, 48px)' }}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`anchor-${anchorKey}`}
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {anchorCard}
        </motion.div>
      </AnimatePresence>

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

      <AnimatePresence mode="popLayout">
        <motion.div
          key={`challenger-${challengerKey}`}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {challengerCard}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
