import type { ReactNode } from 'react'

type GameShellProps = {
  catColor: string
  children: ReactNode
}

export function GameShell({ catColor, children }: GameShellProps) {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col"
      style={{
        background: 'var(--bg)',
        ['--cat-color' as string]: catColor,
      }}
    >
      {/* Ambient gradient orbs */}
      <div
        className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${catColor}12, transparent 70%)`,
        }}
      />
      <div
        className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
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
