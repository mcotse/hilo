# HIGHER / LOWER — Complete Build Specification

> **Purpose of this document:** This is a combined product spec, design spec, and technical spec for a web-based trivia game. It is written to be consumed by an LLM coding agent as a single source of truth for implementation. Every decision has been made. Do not deviate from this spec unless you encounter a technical impossibility, in which case document the deviation.

---

## 1. PRODUCT SPEC

### 1.1 What Is This?

A daily team bonding game played during Zoom standup. One person screen-shares and controls the game. 6-7 others watch and participate verbally by debating answers. Target session length: 3-5 minutes.

### 1.2 Core Game Loop

Two items appear on screen with a shared metric (e.g., calories, population, price). Item A's value is revealed. Item B's value is hidden. The team debates which item has the HIGHER value for that metric. The controller clicks HIGHER or LOWER. The answer is revealed with a count-up animation. If correct, the streak continues — Item B slides left to become the new Item A, and a new Item B enters from the right. If wrong, game over.

### 1.3 Goal

Beat the team's all-time record streak. The record persists in localStorage.

### 1.4 Game States (State Machine)

```
START → COMPARING → REVEALING → COMPARING (if correct)
                  → GAME_OVER (if wrong)
GAME_OVER → START
```

Four states only. The reveal sub-phases (commitment pause, count-up, verdict) are handled by the animation sequence, NOT by React state.

```typescript
type GamePhase = 'start' | 'comparing' | 'revealing' | 'game_over'

type GameState = {
  phase: GamePhase
  currentPair: [Item, Item] | null  // [anchor, challenger]
  category: Category
  streak: number
  record: number
  choice: 'higher' | 'lower' | null
  history: string[]  // item IDs seen this session (for dedup)
}
```

### 1.5 Difficulty Ramp

Difficulty is determined by the ratio between the two values. Closer values = harder.

| Streak | Difficulty | Value Ratio Range | Example |
|--------|-----------|-------------------|---------|
| 0-2 | Easy | 0.00 – 0.35 | Pizza (285 cal) vs Chipotle Burrito (1,070 cal) |
| 3-5 | Medium | 0.25 – 0.65 | Big Mac (563 cal) vs Pad Thai (630 cal) |
| 6+ | Hard | 0.55 – 0.85 | Croissant (406 cal) vs Bagel (360 cal) |

**IMPORTANT:** Never exceed 0.85 ratio. Above that, comparisons become pure coin flips, which feel unfair. The overlapping ranges allow the pairing engine to find matches more easily.

### 1.6 Pairing Algorithm

```typescript
function selectPair(
  items: Item[],
  category: Category,
  streak: number,
  history: string[]
): [Item, Item] {
  // 1. Filter items that have a value for this category
  // 2. Remove items in history (seen this session)
  // 3. Compute all possible pairs and their ratios
  //    ratio = min(a, b) / max(a, b)
  // 4. Get difficulty band for current streak
  // 5. Filter pairs within the ratio range
  // 6. If no pairs found, widen the range by 0.1 in each direction
  // 7. Pick a random pair from the filtered set
  // 8. Randomly assign which is anchor (value shown) and which is challenger
  // Return [anchor, challenger]
}
```

### 1.7 Content Data Model

```typescript
type Item = {
  id: string                    // kebab-case unique ID, e.g. "big-mac"
  name: string                  // Display name, e.g. "Big Mac"
  emoji: string                 // Single emoji, e.g. "🍔"
  facts: Record<string, {
    value: number               // The numeric value
    unit: string                // Display unit, e.g. "cal", "people", "$"
    source: string              // Where this data comes from
    asOf?: string               // Year/date of the data
  }>
}

type Category = {
  id: string                    // e.g. "calories"
  label: string                 // e.g. "Calories"
  question: string              // e.g. "Which has more calories?"
  metricKey: string             // Key into Item.facts, e.g. "calories"
  color: string                 // Hex color for this category
  formatValue: (n: number) => string  // e.g. (n) => `${n.toLocaleString()} cal`
}
```

### 1.8 Content Requirements

**Minimum for v1 launch:** 150+ items across 4-5 categories.

**Categories to implement (in priority order):**

1. **Food — Calories** (`#ffb380`): Most universally relatable. Everyone has intuitions about food. Source: USDA FoodData Central.
2. **Geography — Population** (`#80c4ff`): Countries and major cities. Surprisingly tricky. Source: UN World Population Prospects 2024.
3. **Entertainment — Rotten Tomatoes Score** (`#c8a2ff`): Movies everyone knows. Generates conversation. Source: Rotten Tomatoes.
4. **Animals — Top Speed (mph)** (`#5ce0d6`): Fun and educational. Source: Various wildlife references.
5. **Money — Average Price ($)** (`#6ee7a0`): Everyday items, cars, houses, tech products. Source: Various retail/market data.

**Content quality rules:**
- Every item must have a verifiable source
- Favor well-known items (the team should have intuitions)
- Avoid pure trivia nobody could reason about
- Multi-dimensional items are ideal (a Big Mac can appear in calories, price, sodium, etc.)

### 1.9 Natural Pacing

No timer. The team's debate IS the pacing mechanism.
- Easy rounds: ~15 sec (obvious answer, quick click)
- Medium rounds: ~30 sec (some debate)
- Hard rounds: ~45-60 sec (heated debate)
- A 5-round game ≈ 2 min. A 12-round game ≈ 5 min.
- Sweet spot naturally lands at 3-5 minutes.

### 1.10 Persistence

- **Team record:** `localStorage.getItem('higher-lower-record')` — single number
- **Session history:** In-memory only (resets on page load)
- **No backend, no auth, no user accounts for v1**

---

## 2. DESIGN SPEC

### 2.1 Design Direction — One Sentence

**"Dark Glassmorphism meets Late-Night Game Show."**

Think Spotify Wrapped's bold data typography over moody gradients, crossed with Linear's calm dark UI and frosted glass panels. It's warm, premium, and sophisticated — not cyberpunk neon, not flat material, not skeuomorphic game UI. Like a trivia night at a cocktail bar, not an arcade.

### 2.2 Vibe References

| Reference | What to Steal |
|-----------|---------------|
| **Spotify Wrapped** | Data as spectacle. Big numbers as hero content. Gradient backgrounds. |
| **Linear App** | Glass card surfaces. Off-black backgrounds. Restraint. Quiet luxury. |
| **Apple Music Replay** | Ambient color washes that shift per context. Backgrounds that feel alive. |
| **Monkeytype** | Game UI that doesn't look "gamey". Clean, typographic, grown-up. |
| **Arc Browser** | Category color theming. Color as personality/context. |
| **Vercel Dashboard** | Monospace numbers. Opacity-based hierarchy. Precision. |

### 2.3 What This Is NOT

- **NOT neon cyberpunk** — no glowing text-shadows, no Tron lines, no electric blue on black
- **NOT flat/material** — no Google-style color blocks, no rounded pastel buttons on white
- **NOT skeuomorphic** — no wooden textures, no metallic badges, no faux-3D casino buttons
- **NOT generic AI slop** — no purple gradients on white, no Inter/Roboto, no cookie-cutter layouts

### 2.4 Color System

#### Base Palette

| Token | Hex | Name | Usage |
|-------|-----|------|-------|
| `--bg` | `#0c0c14` | Void | Primary background |
| `--bg-card` | `#13131d` | Ink | Card/panel background |
| `--bg-elevated` | `#1c1c2a` | Slate | Hover states, elevated surfaces |
| `--text` | `#e8e6f0` | Mist | Primary text |
| `--text-muted` | `#7a7694` | Haze | Secondary text, labels |
| `--border` | `rgba(255,255,255,0.06)` | Glass | Borders, dividers |
| `--glass-bg` | `rgba(255,255,255,0.04)` | — | Card glass fill |
| `--glass-bg-hover` | `rgba(255,255,255,0.07)` | — | Card glass fill on hover |

**Key dark mode rules:**
- NEVER use pure black (`#000000`). The `#0c0c14` base is slightly blue-shifted for an "inky" premium quality.
- NEVER use pure white (`#ffffff`) for body text. Use off-white `#e8e6f0` to reduce eye strain.
- Accent colors need 10-20% MORE saturation than you'd use on light backgrounds.

#### Category Colors

| Category | Hex | Token Name | Propagation |
|----------|-----|------------|-------------|
| Food | `#ffb380` | `--cat-food` | Warm saffron orange |
| Geography | `#80c4ff` | `--cat-geography` | Cool atlas blue |
| Money | `#6ee7a0` | `--cat-money` | Fresh mint green |
| Entertainment | `#c8a2ff` | `--cat-entertainment` | Soft amethyst purple |
| Science/Animals | `#5ce0d6` | `--cat-science` | Reef teal |
| Sports | `#ff8a8a` | `--cat-sports` | Warm coral |

**How the category color propagates** — set `--cat-color` CSS variable on the game shell:
- Background gradient orbs: `var(--cat-color)` at 5-8% opacity
- Challenger card border: `var(--cat-color)` at 15% opacity
- Challenger card box-shadow: `0 0 40px var(--cat-color)` at 5% opacity
- HIGHER button: fill at 10%, border at 30%
- Category keyword in question bar: full saturation
- Everything else untouched — the tint should be subtle and atmospheric

#### Semantic Colors

| Purpose | Hex | Usage |
|---------|-----|-------|
| Correct | `#6ee7a0` | Green flash + ✓ icon on correct answer |
| Wrong | `#ff6b8a` | Red flash + ✗ icon on wrong answer |
| Streak Low (3-5) | `#ffd074` | Warm amber streak number + 🔥 |
| Streak Mid (6-9) | `#ffaa44` | Orange glow streak number + 🔥🔥 |
| Streak High (10+) | `#ff7744` | Deep orange streak number + 🔥🔥🔥 |

### 2.5 Typography

Three fonts, each with a clear role. Load from Google Fonts.

#### Font Stack

| Font | Role | Weights | Usage |
|------|------|---------|-------|
| **Bebas Neue** | Display / Hero | 400 | Game title, "GAME OVER", "NEW RECORD". All-caps condensed. The game show announcer voice. |
| **Space Grotesk** | UI / Labels | 400, 500, 600, 700 | Item names, button labels, streak counter, category keywords. Geometric, modern, techy. |
| **Space Mono** | Data / Numbers | 400, 700 | All numeric values, the count-up animation, record display. Monospace is CRITICAL — equal-width digits prevent layout jank during count-up. |

#### Type Scale (Zoom-optimized — everything is oversized)

| Element | Font | Weight | Size | Notes |
|---------|------|--------|------|-------|
| Streak number | Space Grotesk | 700 | 48-64px | Largest persistent element |
| Revealed value | Space Mono | 700 | 32-40px | Hero moment during reveal |
| Game title | Bebas Neue | 400 | 48-64px | Start screen only |
| "GAME OVER" | Bebas Neue | 400 | 56-72px | Game over overlay |
| Item name | Space Grotesk | 600 | 18-22px | On each card |
| Button label | Space Grotesk | 600 | 14-16px | HIGHER / LOWER |
| Category question | Space Grotesk + DM Sans | 400/600 | 16-18px | Bottom bar |
| Record / metadata | Space Mono | 400 | 14px | Top-right corner |
| Emoji | System | — | 48-56px | Top of each card |

### 2.6 Layout

**Full viewport. No scrolling. No browser chrome visible.** The game fills `100vh × 100vw` like a presentation slide. This is a **"stage" layout** — a game show set.

#### Three Horizontal Bands

```
┌─────────────────────────────────────────────────────────┐
│  🔥 7  streak                           record  12      │  ← Band 1: Top Bar (~8% height)
│                                                         │
│                                                         │
│     ┌───────────┐          ┌───────────┐                │
│     │    🍕     │          │    🌮     │                │
│     │           │          │           │                │  ← Band 2: Card Arena (~76% height)
│     │ Slice of  │   VS     │ Chipotle  │                │     Two cards, horizontally centered
│     │  Pizza    │          │ Burrito   │                │     with generous breathing room
│     │           │          │           │                │
│     │  285 cal  │          │ ▲ HIGHER  │                │
│     │           │          │ ▼ LOWER   │                │
│     └───────────┘          └───────────┘                │
│                                                         │
│                                                         │
│            Which has more  calories  ?                   │  ← Band 3: Question Bar (~16% height)
└─────────────────────────────────────────────────────────┘
```

#### Band 1 — Top Bar
- **Left:** Current streak (Space Grotesk 700, 48-64px). Fire emoji appears at streak 3+.
- **Right:** All-time record (Space Mono 400, 14px, 40% opacity). Quiet reference point.
- Streak color escalates: white (0-2) → amber `#ffd074` (3-5) → orange `#ffaa44` (6-9) → deep orange `#ff7744` (10+)
- When streak equals record: both numbers pulse (subtle scale animation)
- When streak beats record: confetti triggers

#### Band 2 — Card Arena
- Two glass cards side by side with a "VS" between them
- Cards are tall rectangles, approximately 280-320px wide × 360-420px tall at 1080p
- Centered horizontally with `gap: 24-32px`
- Left card (anchor) is slightly dimmed at 85% opacity
- Right card (challenger) is full brightness with category-colored border glow

#### Band 3 — Question Bar
- Centered text: "Which has more **calories**?"
- "Which has more" in `--text-muted` (Space Grotesk 400)
- Category keyword in `--cat-color` (Space Grotesk 600)
- This solves the "joining mid-game" problem — anyone looking at the screen instantly knows the context

#### Ambient Background
- The background is `#0c0c14`, NOT flat — 2-3 large radial gradient "orbs" at 5-8% opacity float behind the cards
- Orbs are colored with `var(--cat-color)` and positioned at edges (one top-left, one bottom-right)
- When category changes, orbs crossfade to new color
- On Zoom, this reads as subtle warmth, preventing the "dead black rectangle" problem
- Implementation: absolutely positioned `div` elements with `radial-gradient(circle, ${catColor}12, transparent 70%)`, width 300-400px, overflow hidden on the game shell

### 2.7 Glass Card Spec

```css
.card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  padding: 28px;
}

.card--challenger {
  background: rgba(255, 255, 255, 0.06);
  border-color: color-mix(in srgb, var(--cat-color) 15%, transparent);
  box-shadow: 0 0 40px color-mix(in srgb, var(--cat-color) 5%, transparent);
}

.card--anchor {
  opacity: 0.85;
}
```

#### Card Content Stack (top to bottom)
1. **Emoji** — 48-56px, centered
2. **Item name** — Space Grotesk 600, 18px, centered, `--text`
3. **Value area** — either:
   - Revealed value (Space Mono 700, 32px, `var(--cat-color)`) for anchor card
   - OR HIGHER/LOWER buttons for challenger card
   - OR count-up animation during reveal

### 2.8 Button Spec

Two buttons stacked vertically in the challenger card's value area.

```css
.btn-higher {
  background: color-mix(in srgb, var(--cat-color) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--cat-color) 30%, transparent);
  border-radius: 8px;
  padding: 10px 0;
  color: var(--cat-color);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.btn-higher:hover { transform: scale(1.03); background: color-mix(in srgb, var(--cat-color) 18%, transparent); }
.btn-higher:active { transform: scale(0.97); }

.btn-lower {
  /* Same structure, but muted: */
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
}
```

Content: `▲ HIGHER` and `▼ LOWER` (unicode arrows + text)

### 2.9 Animation Choreography

There are exactly **5 key animations**. All use the **Motion** library (`motion/react`). No other animations exist.

#### Animation 1: The Reveal Sequence (~2.5 seconds total)

Triggered when the controller clicks HIGHER or LOWER. This is an async sequence, NOT managed by React state transitions.

**Phase A — Commitment (200ms):**
- Buttons fade out (`opacity: 1 → 0`, 150ms ease-out)
- Challenger card border briefly pulses (`border-color` flashes to `var(--cat-color)` at 40% then back to 15%)
- Purpose: visual confirmation that a choice was locked

**Phase B — Count-Up (1000-1500ms):**
- A number appears in the challenger card's value area, counting from 0 to the real value
- Use Motion's `animate()` function with `useMotionValue` for the number
- Font: Space Mono 700, 32px, `var(--cat-color)`
- Easing: ease-out cubic — fast start, slow finish: `(t) => 1 - Math.pow(1 - t, 3)`
- Duration adjustment: if values are close (ratio > 0.7), extend duration to 1500ms for tension
- Display the unit label (e.g., "cal") throughout, statically positioned below or beside the number
- Numbers should be formatted with `toLocaleString()` for commas
- **CRITICAL:** Use `font-variant-numeric: tabular-nums` on Space Mono to prevent layout shift

**Phase C — Verdict (500ms):**
- Number lands at final value
- Brief 200ms pause (let it register)
- **If correct:** card border flashes `#6ee7a0`, a `✓` fades in beside the value, streak counter in top bar increments with a scale bounce (`1 → 1.15 → 1`, spring easing, 300ms)
- **If wrong:** card border flashes `#ff6b8a`, a `✗` fades in beside the value. No screen shake. Just the definitive red moment.

**Phase D — Transition (500ms, only if correct):**
- After verdict, if correct: proceed to Animation 2 (card slide)
- If wrong: after a 800ms pause (let it sink in), trigger the game over overlay (Animation 4)

#### Animation 2: Card Slide Transition (400ms)

Uses Motion's `AnimatePresence` with `mode="popLayout"`.

```tsx
<AnimatePresence mode="popLayout">
  <motion.div
    key={challenger.id}  // Key change triggers exit/enter
    initial={{ x: 300, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -300, opacity: 0 }}
    transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
  >
    <Card item={challenger} />
  </motion.div>
</AnimatePresence>
```

The right card (now revealed) slides left to become the new anchor. A new challenger card enters from the right with a slight overshoot.

#### Animation 3: Streak Visual Escalation

Not a single animation but a visual state that changes with the streak:

| Streak | Color | Icon | Extra |
|--------|-------|------|-------|
| 0-2 | `#e8e6f0` (white) | None | Clean, calm |
| 3-5 | `#ffd074` (amber) | 🔥 | Warm glow appears |
| 6-9 | `#ffaa44` (orange) | 🔥 | Glow intensifies |
| 10+ | `#ff7744` (deep orange) | 🔥 | Full intensity, subtle `text-shadow: 0 0 20px` |

When streak equals the record: both streak and record numbers pulse with a gentle `scale(1.02)` oscillation at 1.5s interval.

**NO screen shake. NO particle effects on streak increment.** The escalation is warm and inviting, like a campfire getting warmer. Not aggressive.

#### Animation 4: Game Over Overlay

- Slides up from the bottom, covering the lower ~70% of the screen
- `motion.div` with `initial={{ y: '100%' }}` `animate={{ y: 0 }}` `transition={{ type: 'spring', damping: 25, stiffness: 200 }}`
- Background: `rgba(12, 12, 20, 0.85)` with `backdrop-filter: blur(20px)`
- Content (vertically stacked, centered):
  - "GAME OVER" — Bebas Neue 400, 56-72px, `--text`
  - The fatal comparison shown: both items with both values revealed
  - "Streak: **7**" — Space Grotesk 600 with Space Mono for the number
  - If new record: "NEW RECORD!" in `--cat-color` + confetti (Animation 5)
  - If not new record: "Record: 12" in `--text-muted`
  - **PLAY AGAIN** button — large, `var(--cat-color)` fill, Bebas Neue, centered

#### Animation 5: Confetti (CSS-only, no library)

Triggered ONLY when a new record is set.

- 20-25 `div` elements absolutely positioned at the top of the viewport
- Each particle has randomized: `left` (0-100%), `animation-duration` (1.5-3.5s), `animation-delay` (0-500ms), `background-color` (picked from category color palette + gold + white), `transform: rotate()` (random ±360deg), `width/height` (6-12px), `border-radius` (50% for circles, 0 for squares — randomize)
- Keyframe animation: `translateY(-20px) → translateY(100vh)`, `rotate(0) → rotate(±720deg)`, `opacity: 1 → 0` (fade out in last 30%)
- Remove from DOM after `animationend`
- **No confetti library.** Pure CSS animations.

### 2.10 Start Screen

Minimal. Goal: < 3 seconds from URL load to first comparison.

- Game title: "HIGHER / LOWER" — Bebas Neue 400, 48-64px
  - "HIGHER" in `--text`, "/" in `--text-muted`, "LOWER" in gradient (`--cat-color` to `--accent-warm`)
- Team record display: "Record: 12" — Space Mono 400, 16px, `--text-muted`
- Single **PLAY** button — large, centered, category-colored fill
- Same ambient gradient background as the game

### 2.11 Responsive Behavior

The primary target is a **1920×1080 desktop screen shared via Zoom**. This is the ONLY layout to optimize for. Do not build mobile breakpoints for v1. Use `vw`/`vh` units and clamp() for sizing so it scales reasonably on different desktop resolutions, but don't add media queries for mobile.

---

## 3. TECHNICAL SPEC

### 3.1 Stack

| Layer | Choice | Version/Notes |
|-------|--------|---------------|
| Framework | React 18+ | With TypeScript, strict mode |
| Build | Vite | `npm create vite@latest higher-lower -- --template react-ts` |
| Styling | Tailwind CSS v4 | Utility-first. CSS variables for category theming. |
| Animation | Motion (`motion/react`) | For card transitions, count-up, overlays. Free tier only. |
| Testing | Vitest + React Testing Library | Jest-compatible API, native Vite integration |
| Deployment | Cloudflare Pages | Free tier, unlimited bandwidth, auto-detects Vite |
| Fonts | Google Fonts | Bebas Neue, Space Grotesk (400-700), Space Mono (400, 700) |

### 3.2 Project Structure

```
higher-lower/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── GameShell.tsx          # Full-viewport container, ambient bg, layout grid
│   │   ├── TopBar.tsx             # Streak counter + record display
│   │   ├── CardArena.tsx          # Two cards + VS divider, AnimatePresence wrapper
│   │   ├── Card.tsx               # Single glass card (anchor or challenger variant)
│   │   ├── QuestionBar.tsx        # "Which has more [category]?" bottom bar
│   │   ├── RevealSequence.tsx     # Count-up animation + verdict display
│   │   ├── GameOverOverlay.tsx    # Slide-up overlay with results
│   │   ├── StartScreen.tsx        # Title + record + play button
│   │   └── Confetti.tsx           # CSS-only confetti particles
│   ├── engine/
│   │   ├── types.ts               # All TypeScript types (Item, Category, GameState, etc.)
│   │   ├── game-state.ts          # Pure state machine: dispatch(state, action) → newState
│   │   ├── pairing.ts             # Difficulty-aware item pairing algorithm
│   │   └── __tests__/
│   │       ├── game-state.test.ts
│   │       └── pairing.test.ts
│   ├── data/
│   │   ├── items.ts               # Item[] array with all facts
│   │   └── categories.ts          # Category[] array with colors and formatters
│   ├── hooks/
│   │   └── useGame.ts             # Connects engine to React: state, dispatch, derived values
│   ├── lib/
│   │   └── storage.ts             # localStorage wrapper for record persistence
│   ├── App.tsx                    # Root: renders StartScreen or GameShell based on phase
│   ├── main.tsx                   # Entry point
│   ├── index.css                  # Tailwind directives + CSS variables + Google Fonts import
│   └── test/
│       └── setup.ts               # Vitest setup (RTL matchers)
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── package.json
└── .gitignore
```

### 3.3 Architecture Principles

1. **Engine is pure TypeScript, zero React.** `game-state.ts` and `pairing.ts` are pure functions with no side effects, no hooks, no DOM. They are tested with Vitest directly.

2. **Components are thin.** They read state from `useGame()` hook and render. Business logic lives in the engine.

3. **Animations are imperative sequences, not state-driven.** The reveal sequence is an async function that chains Motion animations. React state only changes at the START (phase → 'revealing') and END (phase → 'comparing' or 'game_over') of the sequence.

4. **CSS variables for theming.** Category color is set once on `.game-shell` as `--cat-color`. All child components reference it. Changing category = changing one variable.

### 3.4 Key Files — Implementation Notes

#### `src/engine/types.ts`
All types as defined in section 1.7. Export everything. This is the shared vocabulary.

#### `src/engine/game-state.ts`
Pure reducer pattern:

```typescript
type Action =
  | { type: 'START_GAME'; category: Category }
  | { type: 'CHOOSE'; choice: 'higher' | 'lower' }
  | { type: 'REVEAL_COMPLETE'; isCorrect: boolean }
  | { type: 'NEXT_ROUND'; pair: [Item, Item] }
  | { type: 'RESET' }

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME':
      // → phase: 'comparing', streak: 0, generate first pair
    case 'CHOOSE':
      // → phase: 'revealing', store choice
    case 'REVEAL_COMPLETE':
      // If correct: streak++, check record, phase stays 'revealing' (transition handles next)
      // If wrong: phase → 'game_over'
    case 'NEXT_ROUND':
      // → phase: 'comparing', set new pair, add old challenger to history
    case 'RESET':
      // → phase: 'start'
  }
}
```

#### `src/engine/pairing.ts`
The pairing algorithm from section 1.6. Pure function, tested with known item sets to verify difficulty bucketing.

#### `src/hooks/useGame.ts`
```typescript
function useGame() {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  // Derived values
  const anchor = state.currentPair?.[0]
  const challenger = state.currentPair?.[1]
  const isCorrect = /* compute from choice + values */
  const streakTier = getStreakTier(state.streak)  // 'calm' | 'warm' | 'hot' | 'fire'

  // Actions
  const startGame = (category: Category) => { /* dispatch START_GAME + generate first pair */ }
  const choose = (choice: 'higher' | 'lower') => { dispatch({ type: 'CHOOSE', choice }) }
  const completeReveal = () => { /* dispatch REVEAL_COMPLETE, then NEXT_ROUND if correct */ }
  const reset = () => { dispatch({ type: 'RESET' }) }

  return { state, anchor, challenger, isCorrect, streakTier, startGame, choose, completeReveal, reset }
}
```

#### `src/components/RevealSequence.tsx`
This is the most complex component. It orchestrates the 4-phase reveal animation:

```typescript
async function playReveal(
  targetValue: number,
  anchorValue: number,
  isCorrect: boolean,
  category: Category,
  onComplete: () => void
) {
  // Phase A: Commitment (200ms)
  // - Animate buttons out
  // - Flash challenger border

  // Phase B: Count-Up (1000-1500ms)
  // - Use motion's animate() to count from 0 to targetValue
  // - Adjust duration based on value ratio (close = slower)
  // - Update displayed number via useMotionValue

  // Phase C: Verdict (500ms)
  // - Show ✓ or ✗
  // - Flash border green or red
  // - If correct, bump streak counter

  // Phase D: Transition (500ms)
  // - If correct: trigger card slide (parent handles via AnimatePresence)
  // - If wrong: wait 800ms, then trigger game over overlay

  onComplete()
}
```

#### `src/index.css`
```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

:root {
  --bg: #0c0c14;
  --bg-card: #13131d;
  --bg-elevated: #1c1c2a;
  --text: #e8e6f0;
  --text-muted: #7a7694;
  --border: rgba(255, 255, 255, 0.06);
  --glass-bg: rgba(255, 255, 255, 0.04);
  --correct: #6ee7a0;
  --wrong: #ff6b8a;

  /* Category color — set dynamically by GameShell */
  --cat-color: #ffb380;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: 'Space Grotesk', sans-serif;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}
```

### 3.5 Vite Config

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

### 3.6 Testing Strategy

**Engine tests (strict TDD — write test first):**
- `game-state.test.ts`: Test every action/transition. Verify streak increments, record updates, phase transitions.
- `pairing.test.ts`: Test difficulty bucketing with known item sets. Verify ratio filtering. Test edge cases (no items left, very small item pool).

**Component tests (behavior-focused, not visual):**
- Test that clicking HIGHER dispatches the right action
- Test that game over overlay appears when phase is 'game_over'
- Test that start screen renders with record from localStorage

**What NOT to test:**
- Animation durations or CSS values
- Pixel positions or colors
- Verify visual correctness by playing the game

### 3.7 Build & Deploy

```bash
# Development
npm run dev          # Vite dev server, port 5173

# Test
npm test             # Vitest watch mode
npm test -- --run    # Single run (for CI)

# Build
npm run build        # Output to dist/

# Type check
npx tsc --noEmit
```

**Cloudflare Pages deployment:**
1. Connect GitHub repo to Cloudflare Pages
2. Build command: `npm run build`
3. Output directory: `dist`
4. Cloudflare auto-detects Vite — zero additional config

### 3.8 Dependencies (package.json)

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "motion": "^12.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.6.0",
    "vite": "^6.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "vitest": "^2.1.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@testing-library/jest-dom": "^6.5.0",
    "jsdom": "^25.0.0"
  }
}
```

---

## 4. IMPLEMENTATION ORDER

Build in this exact sequence. Each step should result in a working (if incomplete) application.

### Step 1: Scaffold
- `npm create vite@latest higher-lower -- --template react-ts`
- Install all dependencies
- Configure Vite (aliases, test config)
- Configure Tailwind v4
- Set up `index.css` with CSS variables and Google Fonts
- Set up `src/test/setup.ts` for Vitest
- Verify: `npm run dev` shows a blank page, `npm test` runs

### Step 2: Engine — Types + Game State
- Create `src/engine/types.ts` with all types
- Create `src/engine/game-state.ts` with reducer
- Create `src/engine/game-state.test.ts` — write tests FIRST, then implement
- Tests to write: START_GAME sets phase to comparing, CHOOSE sets phase to revealing, REVEAL_COMPLETE with correct increments streak, REVEAL_COMPLETE with wrong sets phase to game_over, streak exceeding record updates record
- Verify: all tests pass

### Step 3: Engine — Pairing Algorithm
- Create `src/engine/pairing.ts`
- Create `src/engine/pairing.test.ts` — tests FIRST
- Tests to write: easy pairs have ratio < 0.35, hard pairs have ratio 0.55-0.85, recently seen items are excluded, function falls back to wider range when no pairs match, function handles small item pools gracefully
- Verify: all tests pass

### Step 4: Data — Starter Dataset
- Create `src/data/categories.ts` with 3 categories: calories, population, rotten_tomatoes
- Create `src/data/items.ts` with 50+ items, each having facts for at least 2 categories
- Every item needs: id, name, emoji, and facts with value, unit, source
- Focus on well-known items. Verify a few values manually.
- No test needed — data is verified by playing

### Step 5: Static Layout — GameShell + Cards
- Build `GameShell.tsx` — full viewport, three bands, ambient gradient orbs
- Build `Card.tsx` — glass card with emoji, name, value/buttons
- Build `TopBar.tsx` — streak + record
- Build `QuestionBar.tsx` — category question
- Hardcode two items and render the layout statically
- Verify: the layout looks correct at 1920×1080, fonts load, glass effect works

### Step 6: Hook — useGame + Interactivity
- Build `useGame.ts` connecting engine to React
- Build `App.tsx` routing between start/game/gameover phases
- Build `StartScreen.tsx`
- Wire up click handlers: HIGHER/LOWER buttons dispatch CHOOSE
- The game should be fully PLAYABLE at this point — just without animations
- Verify: clicking through a full game works, streak counts, game over triggers

### Step 7: Animations — Reveal Sequence
- Build `RevealSequence.tsx` with the 4-phase animation
- Implement count-up using Motion's animate() and useMotionValue
- Add correct/wrong verdict flash
- Verify: reveal plays smoothly, numbers count up, verdict shows

### Step 8: Animations — Card Transitions
- Add AnimatePresence to `CardArena.tsx`
- Implement card slide (right → left) on correct answer
- Implement new challenger enter from right
- Verify: transitions feel smooth, no layout jank

### Step 9: Polish — Streak Escalation + Game Over
- Add streak color/icon escalation in `TopBar.tsx`
- Build `GameOverOverlay.tsx` with slide-up animation
- Add record-beats-record detection and confetti
- Build `Confetti.tsx` (CSS-only)
- Add localStorage persistence for record
- Verify: full game loop feels polished

### Step 10: Content Expansion
- Expand items to 150+ across all 5 categories
- Add remaining categories (animals, money)
- Spot-check 10% of values against sources
- Verify: play 10+ games without seeing too many repeats

### Step 11: Deploy
- Push to GitHub
- Connect to Cloudflare Pages
- Verify: live URL works, game loads fast

---

## 5. IMPORTANT CONSTRAINTS & GOTCHAS

1. **No seeded PRNG.** Use `Math.random()`. The game is screen-shared by one person — nobody else plays independently. Daily seeds solve a non-problem.

2. **No audio.** People are talking over Zoom. Audio cues would be inaudible or annoying.

3. **No mobile layout.** This is ONLY played on desktop via Zoom screen share. Don't waste time on responsive breakpoints.

4. **No backend.** Zero infrastructure. Static SPA deployed to a CDN. All data is bundled in the JavaScript.

5. **No multiplayer.** One person clicks. Others shout. The social interaction happens in Zoom, not in the app.

6. **No timer.** The team's debate IS the pacing. Adding a timer would kill the social dynamic.

7. **Monospace numbers are non-negotiable.** The count-up animation WILL jank if digits have variable widths. Space Mono with `font-variant-numeric: tabular-nums` is required.

8. **Category color as CSS variable, not props.** Set `--cat-color` on the game shell once. All children inherit it. This is simpler and more performant than threading a color prop through every component.

9. **The reveal sequence is async, not state-driven.** Do NOT add 'reveal_commit', 'reveal_count', 'reveal_verdict' phases to the state machine. Those are animation stages, not game states. Use a single 'revealing' phase and let the animation function handle the choreography.

10. **Glass card backdrop-filter: test in Chrome.** `backdrop-filter: blur()` has performance implications. If it causes issues on Zoom screen share, fall back to a solid semi-transparent background without blur. The visual difference is small at Zoom compression levels.

11. **Content is the hard part.** The code is a weekend project. Curating 150+ accurate, well-sourced, surprising items across 5 categories is the actual work. Don't rush it.
