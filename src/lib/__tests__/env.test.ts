import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getEnv } from '../env'

describe('getEnv', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns valid env when all variables are set', () => {
    vi.stubEnv('VITE_CONVEX_URL', 'https://test.convex.cloud')
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_abc')

    const env = getEnv()
    expect(env.VITE_CONVEX_URL).toBe('https://test.convex.cloud')
    expect(env.VITE_CLERK_PUBLISHABLE_KEY).toBe('pk_test_abc')
  })

  it('throws when VITE_CONVEX_URL is missing', () => {
    vi.stubEnv('VITE_CONVEX_URL', '')
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_abc')

    expect(() => getEnv()).toThrow('VITE_CONVEX_URL')
  })

  it('throws when VITE_CLERK_PUBLISHABLE_KEY is missing', () => {
    vi.stubEnv('VITE_CONVEX_URL', 'https://test.convex.cloud')
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', '')

    expect(() => getEnv()).toThrow('VITE_CLERK_PUBLISHABLE_KEY')
  })
})
