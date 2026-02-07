# Higher / Lower

A trivia game where you guess whether one thing is **higher** or **lower** than another. Build your streak, set records, and learn surprising facts along the way.

Built with React, TypeScript, Vite, and Motion.

## Game Flow

### Start Screen

Pick a category and jump in.

<img src="docs/screenshots/01-start-screen.png" alt="Start Screen" width="400" />

### Gameplay

Two items are shown side-by-side. The anchor card reveals its value — guess whether the challenger is **higher** or **lower**.

<img src="docs/screenshots/02-gameplay.png" alt="Gameplay" width="400" />

### Pause

Tap the pause icon in the top bar to take a break. Resume to keep going, or quit back to the start screen (your record is preserved, but the current streak is lost).

<img src="docs/screenshots/03-pause-overlay.png" alt="Pause Overlay" width="400" />

### Game Over

Get it wrong and the game ends. See the fatal comparison, your streak, and whether you set a new record.

<img src="docs/screenshots/05-game-over.png" alt="Game Over" width="400" />

## Getting Started

```bash
npm install
npm run dev
```

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** for dev/build
- **Motion** (Framer Motion) for animations
- **Tailwind CSS** for utility styles
