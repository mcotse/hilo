const REQUIRED_VARS = [
  'VITE_CONVEX_URL',
  'VITE_CLERK_PUBLISHABLE_KEY',
] as const

type EnvKey = (typeof REQUIRED_VARS)[number]
type Env = Record<EnvKey, string>

export function getEnv(): Env {
  const missing: string[] = []

  for (const key of REQUIRED_VARS) {
    const val = import.meta.env[key]
    if (val === undefined || val === '') {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}\n\nCopy .env.example to .env.local and fill in the values.`
    )
  }

  return Object.fromEntries(
    REQUIRED_VARS.map((key) => [key, import.meta.env[key] as string])
  ) as Env
}
