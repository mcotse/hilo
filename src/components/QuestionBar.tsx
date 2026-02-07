type QuestionBarProps = {
  questionPrefix: string
  categoryLabel: string
  catColor: string
}

export function QuestionBar({ questionPrefix, categoryLabel, catColor }: QuestionBarProps) {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        minHeight: '16vh',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 'clamp(16px, 1.3vw, 18px)',
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
