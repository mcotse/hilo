import { useState } from 'react'

type Particle = {
  id: number
  left: string
  width: number
  height: number
  color: string
  duration: string
  delay: string
  rotation: string
  borderRadius: string
}

const COLORS = ['#ffd074', '#ffb380', '#c8a2ff', '#6ee7a0', '#80c4ff', '#ffffff', '#ff8a8a']

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    width: 6 + Math.random() * 6,
    height: 6 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    duration: `${1.5 + Math.random() * 2}s`,
    delay: `${Math.random() * 0.5}s`,
    rotation: `${(Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360)}deg`,
    borderRadius: Math.random() > 0.5 ? '50%' : '0',
  }))
}

export function Confetti() {
  const [particles] = useState(() => generateParticles(25))

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: 0,
            left: p.left,
            width: `${p.width}px`,
            height: `${p.height}px`,
            background: p.color,
            borderRadius: p.borderRadius,
            ['--confetti-rotation' as string]: p.rotation,
            animation: `confetti-fall ${p.duration} ${p.delay} ease-in forwards`,
          }}
          onAnimationEnd={(e) => {
            e.currentTarget.remove()
          }}
        />
      ))}
    </div>
  )
}
