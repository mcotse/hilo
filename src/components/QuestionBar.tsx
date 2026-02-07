import { useIsMobile } from '@/hooks/useIsMobile'

type QuestionBarProps = {
  questionPrefix: string
  categoryLabel: string
  catColor: string
}

export function QuestionBar({ questionPrefix, categoryLabel, catColor }: QuestionBarProps) {
  const isMobile = useIsMobile()

  return (
    <div
      className="flex items-center justify-center"
      style={{
        minHeight: isMobile ? '8vh' : '16vh',
        padding: isMobile ? '0 16px' : undefined,
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: isMobile ? 'clamp(13px, 3.5vw, 15px)' : 'clamp(16px, 1.3vw, 18px)',
      }}
    >
      <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
        {questionPrefix}{' '}
      </span>
      <span style={{ color: catColor, fontWeight: 600 }}>
        {categoryLabel}
      </span>
      <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>?</span>
    </div>
  )
}
