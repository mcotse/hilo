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
