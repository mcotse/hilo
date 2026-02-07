# Mobile-Responsive iPhone Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the Higher/Lower game fully responsive and playable on iPhone (375px–430px widths), with a vertical card stack replacing the side-by-side desktop layout on small screens.

**Architecture:** Add a `useIsMobile` hook using `matchMedia` for a 640px breakpoint. On mobile: stack cards vertically, shrink card dimensions, reduce padding/spacing throughout, and add `touch-action` / safe-area-inset support for iPhone notch/home-bar. Keep desktop layout untouched — all changes are additive behind the mobile breakpoint. Admin layout gets a collapsible hamburger sidebar.

**Tech Stack:** React hooks, CSS media queries, Tailwind responsive classes, `env(safe-area-inset-*)` for iPhone notch/home-bar

---

### Task 1: Viewport meta + safe area CSS foundation

**Files:**
- Modify: `index.html:6`
- Modify: `src/index.css:20-27`

**Step 1: Update viewport meta for iPhone safe areas**

In `index.html`, change line 6 from:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```
to:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

**Step 2: Add safe-area padding and mobile body styles to `src/index.css`**

After the existing `body` block (line 27), add:
```css
/* Safe area support for iPhone notch / home bar */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  body {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
}
```

**Step 3: Run dev server to verify no regressions**

Run: `npx vite --open`
Expected: App loads identically to before on desktop

**Step 4: Commit**

```bash
git add index.html src/index.css
git commit -m "feat: add viewport-fit=cover and safe-area CSS for iPhone"
```

---

### Task 2: Create `useIsMobile` hook

**Files:**
- Create: `src/hooks/useIsMobile.ts`

**Step 1: Write the hook**

```typescript
import { useSyncExternalStore } from 'react'

const MOBILE_BREAKPOINT = 640

function subscribe(callback: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT
}

function getServerSnapshot() {
  return false
}

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
```

**Step 2: Commit**

```bash
git add src/hooks/useIsMobile.ts
git commit -m "feat: add useIsMobile hook with matchMedia"
```

---

### Task 3: Make `GameShell` responsive

**Files:**
- Modify: `src/components/GameShell.tsx`

**Step 1: Import hook and apply mobile styles**

Replace the entire `GameShell.tsx` with:

```typescript
import type { ReactNode } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'

type GameShellProps = {
  catColor: string
  children: ReactNode
}

export function GameShell({ catColor, children }: GameShellProps) {
  const isMobile = useIsMobile()

  return (
    <div
      className="relative w-screen overflow-hidden flex flex-col"
      style={{
        height: '100dvh',
        background: 'var(--bg)',
        ['--cat-color' as string]: catColor,
      }}
    >
      {/* Ambient gradient orbs */}
      <div
        className="absolute top-[-10%] left-[-5%] rounded-full pointer-events-none"
        style={{
          width: isMobile ? '250px' : '400px',
          height: isMobile ? '250px' : '400px',
          background: `radial-gradient(circle, ${catColor}12, transparent 70%)`,
        }}
      />
      <div
        className="absolute bottom-[-10%] right-[-5%] rounded-full pointer-events-none"
        style={{
          width: isMobile ? '250px' : '400px',
          height: isMobile ? '250px' : '400px',
          background: `radial-gradient(circle, ${catColor}12, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {children}
      </div>
    </div>
  )
}
```

Key changes:
- Use `100dvh` instead of Tailwind `h-screen` (fixes iOS Safari address bar issue)
- Shrink ambient gradient orbs on mobile to reduce overdraw

**Step 2: Verify no regressions on desktop**

Run: `npx vite --open`
Expected: Desktop layout identical

**Step 3: Commit**

```bash
git add src/components/GameShell.tsx
git commit -m "feat: make GameShell responsive with dvh and mobile orb sizing"
```

---

### Task 4: Make `TopBar` responsive

**Files:**
- Modify: `src/components/TopBar.tsx`

**Step 1: Add mobile-aware padding and sizing**

Import `useIsMobile` and adjust the layout. Replace the component:

```typescript
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
```

Key changes:
- Smaller padding on mobile (16px vs 48px)
- Smaller streak font on mobile
- Smaller fire emoji on mobile
- Reduced min-height

**Step 2: Verify on desktop and with browser DevTools mobile simulation**

Run: `npx vite --open`
Expected: Desktop identical. In DevTools iPhone view, TopBar fits with smaller padding.

**Step 3: Commit**

```bash
git add src/components/TopBar.tsx
git commit -m "feat: make TopBar responsive with tighter mobile spacing"
```

---

### Task 5: Make `Card` responsive

**Files:**
- Modify: `src/components/Card.tsx`

**Step 1: Add mobile-aware sizing**

Import `useIsMobile` and adjust card dimensions. The card is the critical piece — on iPhone it needs to be narrower and shorter to fit in a vertical stack.

```typescript
import type { Item, Category } from '@/engine/types'
import type { ReactNode } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'

type CardProps = {
  item: Item
  category: Category
  variant: 'anchor' | 'challenger'
  children?: ReactNode
  showFlag?: boolean
  onFlag?: () => void
}

function FlagIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  )
}

export function Card({ item, category, variant, children, showFlag, onFlag }: CardProps) {
  const value = item.facts[category.metricKey]?.value
  const isAnchor = variant === 'anchor'
  const isMobile = useIsMobile()

  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-2xl"
      style={{
        position: 'relative',
        width: isMobile ? 'clamp(260px, 75vw, 320px)' : 'clamp(280px, 20vw, 320px)',
        height: isMobile ? 'clamp(180px, 28vh, 220px)' : 'clamp(360px, 35vh, 420px)',
        padding: isMobile ? '16px' : '28px',
        background: isAnchor ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: isAnchor
          ? '1px solid rgba(255, 255, 255, 0.06)'
          : `1px solid color-mix(in srgb, var(--cat-color) 15%, transparent)`,
        borderRadius: '16px',
        boxShadow: isAnchor
          ? '0 8px 32px rgba(0, 0, 0, 0.3)'
          : '0 0 40px color-mix(in srgb, var(--cat-color) 5%, transparent)',
        opacity: isAnchor ? 0.85 : 1,
      }}
    >
      {/* Flag button */}
      {showFlag && onFlag && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onFlag()
          }}
          aria-label="Flag fact"
          className="dispute-flag-btn"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.25)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.15s ease, background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.25)'
            e.currentTarget.style.background = 'none'
          }}
        >
          <FlagIcon />
        </button>
      )}
      {/* Emoji */}
      <span style={{ fontSize: isMobile ? 'clamp(28px, 6vw, 36px)' : 'clamp(48px, 4vw, 56px)' }}>
        {item.emoji}
      </span>

      {/* Item name */}
      <span
        className="text-center"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: isMobile ? 'clamp(14px, 3.5vw, 16px)' : 'clamp(16px, 1.2vw, 22px)',
          color: 'var(--text)',
        }}
      >
        {item.name}
      </span>

      {/* Value area */}
      <div className="flex flex-col items-center gap-2 mt-auto w-full">
        {isAnchor && value !== undefined ? (
          <div className="text-center">
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700,
                fontSize: isMobile ? 'clamp(20px, 5vw, 28px)' : 'clamp(28px, 2.5vw, 40px)',
                color: 'var(--cat-color)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {category.formatValue(value)}
            </span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
```

Key changes:
- Mobile cards: wider relative to screen (75vw), but much shorter (28vh max 220px) to fit stacked
- Smaller emoji, name font, and value font on mobile
- Less padding on mobile

**Step 2: Verify cards render in DevTools mobile simulation**

Run: `npx vite --open`
Expected: Cards are smaller but readable on iPhone 14 Pro (393px) simulation

**Step 3: Commit**

```bash
git add src/components/Card.tsx
git commit -m "feat: make Card responsive with compact mobile sizing"
```

---

### Task 6: Make `CardArena` stack vertically on mobile

**Files:**
- Modify: `src/components/CardArena.tsx`

**Step 1: Stack cards vertically on mobile with reduced gap**

This is the most impactful change — transforms the side-by-side layout into a vertical stack.

```typescript
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'

type CardArenaProps = {
  anchorCard: ReactNode
  challengerCard: ReactNode
  anchorKey: string
  challengerKey: string
}

export function CardArena({ anchorCard, challengerCard, anchorKey, challengerKey }: CardArenaProps) {
  const isMobile = useIsMobile()

  return (
    <div
      className="flex items-center justify-center flex-1"
      style={{
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 'clamp(8px, 2vh, 16px)' : 'clamp(24px, 3vw, 48px)',
      }}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`anchor-${anchorKey}`}
          initial={{ x: isMobile ? 0 : -300, y: isMobile ? -100 : 0, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          exit={{ x: isMobile ? 0 : -300, y: isMobile ? -100 : 0, opacity: 0 }}
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
          fontSize: isMobile ? '14px' : 'clamp(18px, 1.5vw, 24px)',
          color: 'var(--text-muted)',
          opacity: 0.5,
        }}
      >
        VS
      </span>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={`challenger-${challengerKey}`}
          initial={{ x: isMobile ? 0 : 300, y: isMobile ? 100 : 0, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          exit={{ x: isMobile ? 0 : 300, y: isMobile ? 100 : 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {challengerCard}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
```

Key changes:
- `flexDirection: column` on mobile stacks cards top-to-bottom
- Animations slide vertically on mobile instead of horizontally
- Smaller gap and VS text on mobile

**Step 2: Test vertical stacking in DevTools iPhone simulation**

Run: `npx vite --open`
Expected: Cards stack vertically, VS between them, both visible without scrolling on iPhone 14 Pro (393×852)

**Step 3: Commit**

```bash
git add src/components/CardArena.tsx
git commit -m "feat: stack CardArena vertically on mobile"
```

---

### Task 7: Make `QuestionBar` responsive

**Files:**
- Modify: `src/components/QuestionBar.tsx`

**Step 1: Reduce height and adjust font on mobile**

```typescript
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
```

Key changes:
- Mobile: 8vh min-height (vs 16vh) — critical vertical space savings
- Smaller font size on mobile
- Side padding on mobile

**Step 2: Verify in DevTools**

Expected: Question bar is compact on mobile, readable

**Step 3: Commit**

```bash
git add src/components/QuestionBar.tsx
git commit -m "feat: make QuestionBar compact on mobile"
```

---

### Task 8: Make `HigherLowerButtons` touch-friendly

**Files:**
- Modify: `src/App.tsx:19-86` (the `HigherLowerButtons` component)

**Step 1: Increase button touch targets and font size on mobile**

Replace the `HigherLowerButtons` component (lines 19-86) with:

```typescript
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
    <div className="flex flex-col gap-2 w-full">
      <button
        onClick={onHigher}
        disabled={disabled}
        className="cursor-pointer flex items-center justify-center gap-2 w-full"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '14px',
          fontWeight: 600,
          letterSpacing: '0.05em',
          padding: '12px 0',
          background: 'color-mix(in srgb, var(--cat-color) 10%, transparent)',
          border: '1px solid color-mix(in srgb, var(--cat-color) 30%, transparent)',
          borderRadius: '8px',
          color: 'var(--cat-color)',
          transition: 'transform 0.15s ease, background 0.15s ease',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
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
          padding: '12px 0',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          color: 'rgba(255, 255, 255, 0.5)',
          transition: 'transform 0.15s ease, background 0.15s ease',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
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
```

Key changes:
- `WebkitTapHighlightColor: 'transparent'` — removes iOS blue tap flash
- `touchAction: 'manipulation'` — removes 300ms tap delay on iOS
- Slightly increased padding (12px vs 10px) for better touch targets
- Reduced gap (gap-2 vs gap-3) to save vertical space

**Step 2: Verify buttons work in DevTools touch simulation**

Expected: No blue flash, responsive taps

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: make HigherLowerButtons touch-friendly for mobile"
```

---

### Task 9: Make `GameOverOverlay` responsive

**Files:**
- Modify: `src/components/GameOverOverlay.tsx`

**Step 1: Adjust overlay sizing and spacing for mobile**

Import `useIsMobile` and adjust the layout:

```typescript
import { motion } from 'motion/react'
import type { Item, Category } from '@/engine/types'
import { Confetti } from './Confetti'
import { useIsMobile } from '@/hooks/useIsMobile'

type GameOverOverlayProps = {
  anchor: Item
  challenger: Item
  category: Category
  streak: number
  record: number
  isNewRecord: boolean
  onPlayAgain: () => void
}

export function GameOverOverlay({
  anchor,
  challenger,
  category,
  streak,
  record,
  isNewRecord,
  onPlayAgain,
}: GameOverOverlayProps) {
  const anchorVal = anchor.facts[category.metricKey].value
  const challengerVal = challenger.facts[category.metricKey].value
  const isMobile = useIsMobile()

  return (
    <>
      {isNewRecord && <Confetti />}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center z-50"
        style={{
          height: isMobile ? '85%' : '70%',
          gap: isMobile ? '16px' : '24px',
          padding: isMobile ? '24px 16px' : undefined,
          background: 'rgba(12, 12, 20, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        {/* GAME OVER title */}
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: isMobile ? 'clamp(40px, 10vw, 52px)' : 'clamp(56px, 5vw, 72px)',
            color: 'var(--text)',
            margin: 0,
          }}
        >
          GAME OVER
        </h2>

        {/* Fatal comparison */}
        <div className="flex items-center" style={{ gap: isMobile ? '16px' : '32px' }}>
          <div className="flex flex-col items-center gap-1">
            <span style={{ fontSize: isMobile ? '24px' : '32px' }}>{anchor.emoji}</span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: isMobile ? '12px' : '14px', color: 'var(--text)' }}>
              {anchor.name}
            </span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: isMobile ? '14px' : '18px', color: 'var(--cat-color)', fontVariantNumeric: 'tabular-nums' }}>
              {category.formatValue(anchorVal)}
            </span>
          </div>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: isMobile ? '12px' : '16px' }}>vs</span>
          <div className="flex flex-col items-center gap-1">
            <span style={{ fontSize: isMobile ? '24px' : '32px' }}>{challenger.emoji}</span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: isMobile ? '12px' : '14px', color: 'var(--text)' }}>
              {challenger.name}
            </span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: isMobile ? '14px' : '18px', color: 'var(--wrong)', fontVariantNumeric: 'tabular-nums' }}>
              {category.formatValue(challengerVal)}
            </span>
          </div>
        </div>

        {/* Streak */}
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: isMobile ? '16px' : '18px', color: 'var(--text)', margin: 0 }}>
          Streak:{' '}
          <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>
            {streak}
          </span>
        </p>

        {/* Record status */}
        {isNewRecord ? (
          <p style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: isMobile ? '20px' : '24px',
            color: 'var(--cat-color)',
            margin: 0,
          }}>
            NEW RECORD!
          </p>
        ) : (
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: isMobile ? '12px' : '14px', color: 'var(--text-muted)', margin: 0 }}>
            Record: {record}
          </p>
        )}

        {/* Play Again button */}
        <button
          onClick={onPlayAgain}
          className="cursor-pointer"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(20px, 2vw, 28px)',
            letterSpacing: '0.08em',
            padding: isMobile ? '14px 40px' : '14px 48px',
            background: 'color-mix(in srgb, var(--cat-color) 15%, transparent)',
            border: '1px solid color-mix(in srgb, var(--cat-color) 30%, transparent)',
            borderRadius: '12px',
            color: 'var(--cat-color)',
            transition: 'transform 0.15s ease, background 0.15s ease',
            marginTop: '8px',
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
          PLAY AGAIN
        </button>
      </motion.div>
    </>
  )
}
```

Key changes:
- Overlay covers 85% on mobile (vs 70%) to give more room
- Smaller emoji, fonts, gaps throughout
- Touch-friendly button
- Side padding on mobile

**Step 2: Verify overlay fits iPhone screen in DevTools**

Expected: All content visible without scrolling on iPhone 14 Pro

**Step 3: Commit**

```bash
git add src/components/GameOverOverlay.tsx
git commit -m "feat: make GameOverOverlay responsive for mobile"
```

---

### Task 10: Make `PauseOverlay` responsive

**Files:**
- Modify: `src/components/PauseOverlay.tsx`

**Step 1: Add mobile sizing with touch-friendly buttons**

```typescript
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
```

Key changes:
- Touch-friendly buttons (tap highlight, manipulation)
- Slightly taller overlay on mobile (75%)
- Smaller fonts

**Step 2: Commit**

```bash
git add src/components/PauseOverlay.tsx
git commit -m "feat: make PauseOverlay responsive for mobile"
```

---

### Task 11: Make `StartScreen` responsive

**Files:**
- Modify: `src/components/StartScreen.tsx`

**Step 1: Add mobile sizing and touch-friendly play button**

```typescript
import { useIsMobile } from '@/hooks/useIsMobile'

type StartScreenProps = {
  record: number
  onPlay: () => void
}

export function StartScreen({ record, onPlay }: StartScreenProps) {
  const isMobile = useIsMobile()

  return (
    <div
      className="relative w-screen overflow-hidden flex flex-col items-center justify-center"
      style={{ height: '100dvh', background: 'var(--bg)' }}
    >
      {/* Ambient orbs */}
      <div
        className="absolute top-[-10%] left-[-5%] rounded-full pointer-events-none"
        style={{
          width: isMobile ? '250px' : '400px',
          height: isMobile ? '250px' : '400px',
          background: 'radial-gradient(circle, #ffb38012, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-[-10%] right-[-5%] rounded-full pointer-events-none"
        style={{
          width: isMobile ? '250px' : '400px',
          height: isMobile ? '250px' : '400px',
          background: 'radial-gradient(circle, #80c4ff12, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Title */}
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: isMobile ? 'clamp(36px, 10vw, 48px)' : 'clamp(48px, 5vw, 64px)',
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
              fontSize: isMobile ? '14px' : '16px',
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
            padding: isMobile ? '14px 40px' : '14px 48px',
            background: 'color-mix(in srgb, #ffb380 15%, transparent)',
            border: '1px solid color-mix(in srgb, #ffb380 30%, transparent)',
            borderRadius: '12px',
            color: '#ffb380',
            transition: 'transform 0.15s ease, background 0.15s ease',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
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
```

Key changes:
- `100dvh` instead of `h-screen` (fixes iOS Safari)
- Smaller title, orbs, and button on mobile
- Touch-friendly play button

**Step 2: Commit**

```bash
git add src/components/StartScreen.tsx
git commit -m "feat: make StartScreen responsive for mobile"
```

---

### Task 12: Make `RevealSequence` responsive

**Files:**
- Modify: `src/components/RevealSequence.tsx`

**Step 1: Import hook and add mobile font sizing**

Only one line needs to change — the value font size. Add `useIsMobile` import at top:

```typescript
import { useIsMobile } from '@/hooks/useIsMobile'
```

Inside the component, add:
```typescript
const isMobile = useIsMobile()
```

Change the font-size on line 67 from:
```typescript
fontSize: 'clamp(28px, 2.5vw, 40px)',
```
to:
```typescript
fontSize: isMobile ? 'clamp(20px, 5vw, 28px)' : 'clamp(28px, 2.5vw, 40px)',
```

And the verdict icon `fontSize` on line 78 from `'28px'` to `isMobile ? '22px' : '28px'`.

**Step 2: Commit**

```bash
git add src/components/RevealSequence.tsx
git commit -m "feat: make RevealSequence responsive for mobile"
```

---

### Task 13: Make `DisputeSheet` mobile-safe

**Files:**
- Modify: `src/components/DisputeSheet.tsx`

**Step 1: Add safe-area bottom padding**

The bottom sheet already has `maxWidth: 420px` and works well on mobile. The only change needed is adding safe-area padding for the iPhone home bar.

In the sheet `<div>` (line 102-113), change the `padding` from `'24px'` to:
```typescript
padding: '24px 24px calc(24px + env(safe-area-inset-bottom, 0px))',
```

Also add touch-friendly styles to the submit button (line 258-277):
```typescript
WebkitTapHighlightColor: 'transparent',
touchAction: 'manipulation',
```

**Step 2: Commit**

```bash
git add src/components/DisputeSheet.tsx
git commit -m "feat: add safe-area padding to DisputeSheet for iPhone"
```

---

### Task 14: Make `AdminLayout` responsive with hamburger menu

**Files:**
- Modify: `src/admin/AdminLayout.tsx`

**Step 1: Add mobile sidebar toggle**

```typescript
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { useAuth, SignIn, UserButton } from '@clerk/clerk-react'
import { useIsMobile } from '@/hooks/useIsMobile'

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/items', label: 'Items' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/disputes', label: 'Disputes' },
  { to: '/admin/sources', label: 'Sources' },
]

export function AdminLayout() {
  const { isLoaded, isSignedIn } = useAuth()
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <p className="text-white/50">Loading…</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <SignIn routing="hash" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-neutral-950 text-white">
      {/* Mobile header bar */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-white/10">
          <h1 className="text-lg font-bold tracking-wide">Admin</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-white/60"
            aria-label="Toggle menu"
            style={{ background: 'none', border: 'none', fontSize: '20px' }}
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
        </div>
      )}

      {/* Backdrop for mobile sidebar */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${isMobile ? 'fixed top-0 left-0 z-50 h-full' : ''} w-60 shrink-0 border-r border-white/10 bg-neutral-900 flex flex-col`}
        style={{
          ...(isMobile ? {
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.2s ease',
          } : {}),
        }}
      >
        <div className="px-6 py-5 border-b border-white/10">
          <h1 className="text-lg font-bold tracking-wide">Admin</h1>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-3">
            <UserButton afterSignOutUrl="/admin" />
            <span className="text-sm text-white/50">Account</span>
          </div>
          <NavLink
            to="/"
            className="block px-3 py-2 rounded-md text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            &larr; Back to Game
          </NavLink>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1" style={{ padding: isMobile ? '64px 16px 16px' : '32px' }}>
        <Outlet />
      </main>
    </div>
  )
}
```

Key changes:
- Mobile: fixed hamburger header bar at top
- Sidebar slides in from left as overlay with backdrop
- NavLinks close the sidebar on mobile tap
- Main content gets top padding to account for the fixed header

**Step 2: Verify admin on mobile in DevTools**

Expected: Hamburger menu opens/closes sidebar as drawer overlay

**Step 3: Commit**

```bash
git add src/admin/AdminLayout.tsx
git commit -m "feat: add responsive hamburger menu to AdminLayout"
```

---

### Task 15: Prevent iOS zoom on input focus + global touch fixes

**Files:**
- Modify: `src/index.css`

**Step 1: Add global mobile touch fixes**

After the `@supports` block added in Task 1, add:

```css
/* Prevent iOS zoom on input focus (requires font-size >= 16px) */
@media (max-width: 639px) {
  input, textarea, select {
    font-size: 16px !important;
  }
}

/* Disable pull-to-refresh on game screens */
html {
  overscroll-behavior: none;
}
```

**Step 2: Commit**

```bash
git add src/index.css
git commit -m "feat: add iOS input zoom fix and overscroll prevention"
```

---

### Task 16: Final smoke test across all screens

**Files:** None (testing only)

**Step 1: Run build to confirm no type errors**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 2: Run lint**

Run: `npx eslint src/`
Expected: No errors

**Step 3: Test all screens in Chrome DevTools at iPhone 14 Pro (393x852)**

Manual checklist:
- [ ] StartScreen: title, record, play button all visible and centered
- [ ] Game: cards stacked vertically, both visible without scrolling
- [ ] Higher/Lower buttons: tappable, no blue flash
- [ ] Reveal animation: fits within card
- [ ] Game Over overlay: all content visible, play again tappable
- [ ] Pause overlay: buttons tappable, content fits
- [ ] Dispute sheet: opens from bottom, safe-area padding visible
- [ ] Admin: hamburger toggles sidebar drawer
- [ ] No horizontal scroll anywhere

**Step 4: Test at iPhone SE (375x667) — smallest target**

Same checklist as above. Verify nothing overflows.

**Step 5: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: final mobile responsiveness adjustments"
```
