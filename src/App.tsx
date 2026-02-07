import { GameShell } from '@/components/GameShell'
import { TopBar } from '@/components/TopBar'
import { CardArena } from '@/components/CardArena'
import { Card } from '@/components/Card'
import { QuestionBar } from '@/components/QuestionBar'
import { StartScreen } from '@/components/StartScreen'
import { useGame } from '@/hooks/useGame'

function HigherLowerButtons({
  onHigher,
  onLower,
  disabled,
}: {
  onHigher: () => void
  onLower: () => void
  disabled: boolean
}) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <button
        onClick={onHigher}
        disabled={disabled}
        className="cursor-pointer flex items-center justify-center gap-2 w-full"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '14px',
          fontWeight: 600,
          letterSpacing: '0.05em',
          padding: '10px 0',
          background: 'color-mix(in srgb, var(--cat-color) 10%, transparent)',
          border: '1px solid color-mix(in srgb, var(--cat-color) 30%, transparent)',
          borderRadius: '8px',
          color: 'var(--cat-color)',
          transition: 'transform 0.15s ease, background 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.03)'
          e.currentTarget.style.background = 'color-mix(in srgb, var(--cat-color) 18%, transparent)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.background = 'color-mix(in srgb, var(--cat-color) 10%, transparent)'
        }}
      >
        ▲ HIGHER
      </button>
      <button
        onClick={onLower}
        disabled={disabled}
        className="cursor-pointer flex items-center justify-center gap-2 w-full"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '14px',
          fontWeight: 600,
          letterSpacing: '0.05em',
          padding: '10px 0',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          color: 'rgba(255, 255, 255, 0.5)',
          transition: 'transform 0.15s ease, background 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.03)'
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
        }}
      >
        ▼ LOWER
      </button>
    </div>
  )
}

function App() {
  const {
    state,
    anchor,
    challenger,
    isCorrect,
    streakTier,
    startGame,
    choose,
    completeReveal,
    reset,
  } = useGame()

  if (state.phase === 'start') {
    return <StartScreen record={state.record} onPlay={startGame} />
  }

  if (!anchor || !challenger || !state.category) return null

  const catColor = state.category.color

  // Parse the question into prefix and keyword
  const question = state.category.question
  const keywordIndex = question.toLowerCase().indexOf(state.category.label.toLowerCase())
  const questionPrefix = keywordIndex > 0
    ? question.slice(0, keywordIndex).trim()
    : 'Which has more'

  return (
    <GameShell catColor={catColor}>
      <TopBar streak={state.streak} record={state.record} streakTier={streakTier} />

      <CardArena
        anchorCard={
          <Card item={anchor} category={state.category} variant="anchor" />
        }
        challengerCard={
          <Card item={challenger} category={state.category} variant="challenger">
            {state.phase === 'comparing' && (
              <HigherLowerButtons
                onHigher={() => choose('higher')}
                onLower={() => choose('lower')}
                disabled={false}
              />
            )}
            {state.phase === 'revealing' && (
              <div className="flex flex-col items-center gap-2">
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: 700,
                    fontSize: 'clamp(28px, 2.5vw, 40px)',
                    color: 'var(--cat-color)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {state.category.formatValue(challenger.facts[state.category.metricKey].value)}
                </span>
                <span style={{ fontSize: '24px' }}>
                  {isCorrect() ? '✓' : '✗'}
                </span>
                <button
                  onClick={() => completeReveal(isCorrect()!)}
                  className="cursor-pointer mt-2"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '12px',
                    padding: '6px 16px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: 'var(--text-muted)',
                  }}
                >
                  {isCorrect() ? 'NEXT →' : 'GAME OVER'}
                </button>
              </div>
            )}
            {state.phase === 'game_over' && (
              <div className="flex flex-col items-center gap-2">
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: 700,
                    fontSize: 'clamp(28px, 2.5vw, 40px)',
                    color: 'var(--wrong)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {state.category.formatValue(challenger.facts[state.category.metricKey].value)}
                </span>
                <p style={{ color: 'var(--text-muted)', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px' }}>
                  Streak: {state.streak} | Record: {state.record}
                </p>
                <button
                  onClick={reset}
                  className="cursor-pointer"
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '20px',
                    padding: '10px 32px',
                    background: 'color-mix(in srgb, var(--cat-color) 15%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--cat-color) 30%, transparent)',
                    borderRadius: '8px',
                    color: 'var(--cat-color)',
                  }}
                >
                  PLAY AGAIN
                </button>
              </div>
            )}
          </Card>
        }
      />

      <QuestionBar
        questionPrefix={questionPrefix}
        categoryLabel={state.category.label}
        catColor={catColor}
      />
    </GameShell>
  )
}

export default App
