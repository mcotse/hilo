import { useSyncExternalStore } from 'react'

const mql =
  typeof window !== 'undefined'
    ? window.matchMedia('(max-width: 639px)')
    : null

function subscribe(callback: () => void) {
  if (!mql) return () => {}
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getSnapshot() {
  return mql?.matches ?? false
}

function getServerSnapshot() {
  return false
}

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
