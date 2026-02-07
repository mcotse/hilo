type StartScreenProps = {
  record: number
  onPlay: () => void
}

export function StartScreen({ record, onPlay }: StartScreenProps) {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col items-center justify-center"
      style={{ background: 'var(--bg)' }}
    >
      {/* Ambient orbs */}
      <div
        className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ffb38012, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #80c4ff12, transparent 70%)' }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Title */}
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(48px, 5vw, 64px)',
            letterSpacing: '0.02em',
            margin: 0,
          }}
        >
          <span style={{ color: 'var(--text)' }}>HIGHER</span>
          <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>/</span>
          <span
            style={{
              background: 'linear-gradient(135deg, #ffb380, #c8a2ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            LOWER
          </span>
        </h1>

        {/* Record */}
        {record > 0 && (
          <p
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '16px',
              color: 'var(--text-muted)',
              margin: 0,
            }}
          >
            Record: {record}
          </p>
        )}

        {/* Play button */}
        <button
          onClick={onPlay}
          className="cursor-pointer"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(20px, 2vw, 28px)',
            letterSpacing: '0.08em',
            padding: '14px 48px',
            background: 'color-mix(in srgb, #ffb380 15%, transparent)',
            border: '1px solid color-mix(in srgb, #ffb380 30%, transparent)',
            borderRadius: '12px',
            color: '#ffb380',
            transition: 'transform 0.15s ease, background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.background = 'color-mix(in srgb, #ffb380 25%, transparent)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.background = 'color-mix(in srgb, #ffb380 15%, transparent)'
          }}
        >
          PLAY
        </button>
      </div>
    </div>
  )
}
