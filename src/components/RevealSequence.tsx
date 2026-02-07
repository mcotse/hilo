import { useEffect, useRef, useState } from 'react'
import { animate } from 'motion'
import { useIsMobile } from '@/hooks/useIsMobile'

type RevealSequenceProps = {
  targetValue: number
  formatValue: (n: number) => string
  isCorrect: boolean
  onComplete: (correct: boolean) => void
  ratio: number
}

export function RevealSequence({
  targetValue,
  formatValue,
  isCorrect,
  onComplete,
  ratio,
}: RevealSequenceProps) {
  const isMobile = useIsMobile()
  const [displayValue, setDisplayValue] = useState(0)
  const [phase, setPhase] = useState<'counting' | 'verdict' | 'done'>('counting')
  const hasCompleted = useRef(false)

  useEffect(() => {
    hasCompleted.current = false

    const countDuration = ratio > 0.7 ? 1.5 : 1.0

    const controls = animate(0, targetValue, {
      duration: countDuration,
      ease: [0, 0, 0.2, 1],
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest))
      },
      onComplete: () => {
        setDisplayValue(targetValue)
        setPhase('verdict')

        setTimeout(() => {
          if (hasCompleted.current) return
          setPhase('done')

          const delay = isCorrect ? 500 : 800
          setTimeout(() => {
            if (hasCompleted.current) return
            hasCompleted.current = true
            onComplete(isCorrect)
          }, delay)
        }, 500)
      },
    })

    return () => {
      controls.stop()
      hasCompleted.current = true
    }
  }, [targetValue, isCorrect, onComplete, ratio])

  const verdictColor = isCorrect ? 'var(--correct)' : 'var(--wrong)'
  const verdictIcon = isCorrect ? '✓' : '✗'

  return (
    <div className="flex flex-col items-center gap-2">
      <span
        style={{
          fontFamily: "'Space Mono', monospace",
          fontWeight: 700,
          fontSize: isMobile ? 'clamp(20px, 5vw, 28px)' : 'clamp(28px, 2.5vw, 40px)',
          color: phase === 'verdict' || phase === 'done' ? verdictColor : 'var(--cat-color)',
          fontVariantNumeric: 'tabular-nums',
          transition: 'color 0.2s ease',
        }}
      >
        {formatValue(displayValue)}
      </span>
      {(phase === 'verdict' || phase === 'done') && (
        <span
          style={{
            fontSize: isMobile ? '22px' : '28px',
            color: verdictColor,
            opacity: 0,
            animation: 'fadeIn 0.2s ease forwards',
          }}
        >
          {verdictIcon}
        </span>
      )}
    </div>
  )
}
