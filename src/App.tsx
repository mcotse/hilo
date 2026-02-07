import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { GameShell } from '@/components/GameShell'
import { TopBar } from '@/components/TopBar'
import { CardArena } from '@/components/CardArena'
import { Card } from '@/components/Card'
import { QuestionBar } from '@/components/QuestionBar'
import { StartScreen } from '@/components/StartScreen'
import { RevealSequence } from '@/components/RevealSequence'
import { GameOverOverlay } from '@/components/GameOverOverlay'
import { PauseOverlay } from '@/components/PauseOverlay'
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
    quit,
  } = useGame()

  const [paused, setPaused] = useState(false)

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
      <TopBar streak={state.streak} record={state.record} streakTier={streakTier} onPause={() => setPaused(true)} />

      <CardArena
        anchorKey={anchor.id}
        challengerKey={challenger.id}
        anchorCard={
          <Card item={anchor} category={state.category} variant="anchor" />
        }
        challengerCard={
          <Card item={challenger} category={state.category} variant="challenger">
            {state.phase === 'comparing' && (
              <HigherLowerButtons
                onHigher={() => choose('higher')}
                onLower={() => choose('lower')}
                disabled={paused}
              />
            )}
            {state.phase === 'revealing' && (
              <RevealSequence
                targetValue={challenger.facts[state.category.metricKey].value}
                formatValue={state.category.formatValue}
                isCorrect={isCorrect()!}
                onComplete={completeReveal}
                ratio={
                  Math.min(
                    anchor.facts[state.category.metricKey].value,
                    challenger.facts[state.category.metricKey].value
                  ) /
                  Math.max(
                    anchor.facts[state.category.metricKey].value,
                    challenger.facts[state.category.metricKey].value
                  )
                }
              />
            )}
          </Card>
        }
      />

      <QuestionBar
        questionPrefix={questionPrefix}
        categoryLabel={state.category.label}
        catColor={catColor}
      />

      <AnimatePresence>
        {paused && (state.phase === 'comparing' || state.phase === 'revealing') && (
          <PauseOverlay
            streak={state.streak}
            onResume={() => setPaused(false)}
            onQuit={() => { setPaused(false); quit() }}
          />
        )}
      </AnimatePresence>

      {state.phase === 'game_over' && (
        <GameOverOverlay
          anchor={anchor}
          challenger={challenger}
          category={state.category}
          streak={state.streak}
          record={state.record}
          isNewRecord={state.streak === state.record && state.streak > 0}
          onPlayAgain={reset}
        />
      )}
    </GameShell>
  )
}

export default App
