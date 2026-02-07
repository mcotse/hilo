# Dev/Prod Environment Setup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up proper dev and prod environment separation with env validation, Clerk prod instance, Convex prod deployment, and CI/CD secrets injection.

**Architecture:** Two-environment model (dev + prod). Client-side env vars (`VITE_*`) validated at app startup via a thin `src/lib/env.ts` module. Server-side Convex vars managed via `npx convex env set` per deployment. GitHub Actions injects prod secrets during the deploy workflow build step.

**Tech Stack:** Vite (env loading), Convex CLI (deployment management), Clerk CLI (prod instance setup), GitHub Actions (secrets injection)

---

### Task 1: Create `.env.example`

**Files:**
- Create: `.env.example`

**Step 1: Create the `.env.example` file**

```bash
# .env.example — Copy to .env.local and fill in real values

# ── Convex (client-side) ──────────────────────────
CONVEX_DEPLOYMENT=dev:your-deployment-name
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CONVEX_SITE_URL=https://your-deployment.convex.site

# ── Clerk (client-side) ───────────────────────────
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx

# ── Convex server-side (set via `npx convex env set`) ──
# These are NOT read from .env files. Set them on each
# Convex deployment via the CLI or dashboard:
#
#   npx convex env set CLERK_JWT_ISSUER_DOMAIN your-domain.clerk.accounts.dev
#   npx convex env set TMDB_API_KEY your-tmdb-api-key
```

**Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: add .env.example documenting required environment variables"
```

---

### Task 2: Add client-side env validation

**Files:**
- Create: `src/lib/env.ts`
- Modify: `src/main.tsx`

**Step 1: Write the test**

Create `src/lib/__tests__/env.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('validateEnv', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns valid env when all variables are set', () => {
    vi.stubEnv('VITE_CONVEX_URL', 'https://test.convex.cloud')
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_abc')

    // Re-import to pick up stubbed env
    return import('../env').then(({ getEnv }) => {
      const env = getEnv()
      expect(env.VITE_CONVEX_URL).toBe('https://test.convex.cloud')
      expect(env.VITE_CLERK_PUBLISHABLE_KEY).toBe('pk_test_abc')
    })
  })

  it('throws when VITE_CONVEX_URL is missing', () => {
    vi.stubEnv('VITE_CONVEX_URL', '')
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_abc')

    return import('../env').then(({ getEnv }) => {
      expect(() => getEnv()).toThrow('VITE_CONVEX_URL')
    })
  })

  it('throws when VITE_CLERK_PUBLISHABLE_KEY is missing', () => {
    vi.stubEnv('VITE_CONVEX_URL', 'https://test.convex.cloud')
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', '')

    return import('../env').then(({ getEnv }) => {
      expect(() => getEnv()).toThrow('VITE_CLERK_PUBLISHABLE_KEY')
    })
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/__tests__/env.test.ts
```

Expected: FAIL — module `../env` does not exist.

**Step 3: Write the env validation module**

Create `src/lib/env.ts`:

```typescript
const REQUIRED_VARS = [
  'VITE_CONVEX_URL',
  'VITE_CLERK_PUBLISHABLE_KEY',
] as const

type EnvKey = (typeof REQUIRED_VARS)[number]
type Env = Record<EnvKey, string>

export function getEnv(): Env {
  const missing: string[] = []

  for (const key of REQUIRED_VARS) {
    if (!import.meta.env[key]) {
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
```

**Step 4: Run test to verify it passes**

```bash
npx vitest run src/lib/__tests__/env.test.ts
```

Expected: PASS

**Step 5: Update `src/main.tsx` to use validated env**

Replace the raw `import.meta.env` usage:

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexReactClient } from 'convex/react'
import { Router } from './Router'
import { getEnv } from './lib/env'
import './index.css'

const env = getEnv()
const convex = new ConvexReactClient(env.VITE_CONVEX_URL)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={env.VITE_CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <Router />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </StrictMode>,
)
```

**Step 6: Run full test suite and dev server smoke test**

```bash
npx vitest run
npm run dev  # verify app still loads at http://localhost:5173/hilo/
```

**Step 7: Commit**

```bash
git add src/lib/env.ts src/lib/__tests__/env.test.ts src/main.tsx
git commit -m "feat: add client-side environment variable validation"
```

---

### Task 3: Set up Convex prod deployment

**Files:**
- No file changes — CLI operations only

**Step 1: Create a production deployment on Convex**

```bash
npx convex deploy --prod
```

This will:
- Create a new `prod:...` deployment for the project
- Push all Convex functions to the prod deployment
- Prompt for confirmation

Note the production deployment URL (e.g., `https://your-prod-name.convex.cloud`).

**Step 2: Set server-side env vars on the prod deployment**

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN <prod-clerk-domain> --prod
npx convex env set TMDB_API_KEY <your-tmdb-api-key> --prod
```

The `--prod` flag targets the production deployment. The Clerk domain will come from Task 4.

**Step 3: Verify dev deployment still works**

```bash
npx convex dev
```

This should still connect to `dev:adventurous-porcupine-735` as specified in `.env.local`.

**Step 4: Record the prod deployment URL**

Save the production `CONVEX_URL` — it will be needed for GitHub Secrets in Task 5.

---

### Task 4: Set up Clerk production instance

**Files:**
- No file changes — Clerk dashboard/CLI operations

**Step 1: Install Clerk CLI (if not already installed)**

```bash
npm install -g @clerk/cli
```

**Step 2: Create a production instance in Clerk**

Go to the Clerk Dashboard (https://dashboard.clerk.com):
1. Open the existing application
2. Navigate to **Production** instance (Clerk apps have Development and Production instances built-in)
3. Activate the Production instance
4. Note the **Production Publishable Key** (`pk_live_...`)
5. Note the **Production JWT Issuer Domain**

Alternatively, via CLI if supported:
```bash
clerk switch --instance production
```

**Step 3: Record prod Clerk values**

Save these for GitHub Secrets (Task 5) and Convex env (Task 3):
- `VITE_CLERK_PUBLISHABLE_KEY` = `pk_live_...`
- `CLERK_JWT_ISSUER_DOMAIN` = production domain from Clerk dashboard

**Step 4: Set the Clerk JWT issuer on Convex prod**

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN <prod-clerk-jwt-issuer-domain> --prod
```

---

### Task 5: Update GitHub Actions deploy workflow with prod secrets

**Files:**
- Modify: `.github/workflows/deploy.yml`

**Step 1: Add repository secrets in GitHub**

Go to the repo's Settings > Secrets and variables > Actions, and add:
- `VITE_CONVEX_URL` — prod Convex deployment URL
- `VITE_CONVEX_SITE_URL` — prod Convex site URL
- `VITE_CLERK_PUBLISHABLE_KEY` — prod Clerk publishable key (`pk_live_...`)

**Step 2: Update the deploy workflow to inject env vars**

Modify `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          VITE_CONVEX_URL: ${{ secrets.VITE_CONVEX_URL }}
          VITE_CONVEX_SITE_URL: ${{ secrets.VITE_CONVEX_SITE_URL }}
          VITE_CLERK_PUBLISHABLE_KEY: ${{ secrets.VITE_CLERK_PUBLISHABLE_KEY }}
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

The only change is adding the `env:` block to the `npm run build` step. Vite automatically picks up `VITE_*` env vars during build and inlines them.

**Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: inject prod environment variables from GitHub Secrets"
```

---

### Task 6: Add Convex deploy step to CI/CD

**Files:**
- Modify: `.github/workflows/deploy.yml`

Currently, Convex functions are deployed manually with `npx convex deploy`. This step adds automatic Convex prod deployment to the GitHub Actions workflow so that backend and frontend stay in sync.

**Step 1: Add `CONVEX_DEPLOY_KEY` to GitHub Secrets**

Generate a deploy key:
```bash
npx convex deploy-key create
```

Add the resulting key as a GitHub repository secret named `CONVEX_DEPLOY_KEY`.

**Step 2: Add Convex deploy step to the workflow**

Update `.github/workflows/deploy.yml` to add a Convex deploy step before the frontend build:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx convex deploy
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
      - run: npm run build
        env:
          VITE_CONVEX_URL: ${{ secrets.VITE_CONVEX_URL }}
          VITE_CONVEX_SITE_URL: ${{ secrets.VITE_CONVEX_SITE_URL }}
          VITE_CLERK_PUBLISHABLE_KEY: ${{ secrets.VITE_CLERK_PUBLISHABLE_KEY }}
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
```

**Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add automatic Convex prod deployment to deploy workflow"
```

---

### Task 7: Verify end-to-end

**Files:**
- No file changes — verification only

**Step 1: Verify local dev still works**

```bash
npm run dev
# App should load at http://localhost:5173/hilo/ using dev Convex + dev Clerk
```

**Step 2: Verify build works with prod-like env**

```bash
VITE_CONVEX_URL=https://test.convex.cloud VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx npm run build
```

Expected: Build succeeds. The env vars are inlined into the bundle.

**Step 3: Verify env validation catches missing vars**

```bash
VITE_CONVEX_URL= VITE_CLERK_PUBLISHABLE_KEY= npm run build
```

Note: Vite inlines env vars at build time, so missing vars would show up at runtime, not build time. Run the preview to verify:

```bash
npm run preview
# Open browser — should see an error about missing env vars in the console
```

**Step 4: Verify CI passes**

Push the branch and open a PR. The CI workflow should pass (it doesn't build, just type-checks and lints).

**Step 5: Verify deploy workflow**

After merging, the deploy workflow should:
1. Deploy Convex functions to prod
2. Build the frontend with prod secrets injected
3. Deploy to GitHub Pages

---

## Summary of what changes

| What | Dev | Prod |
|------|-----|------|
| **Convex deployment** | `dev:adventurous-porcupine-735` (via `.env.local`) | `prod:...` (via `npx convex deploy` in CI) |
| **Convex server env** | Set via `npx convex env set` on dev | Set via `npx convex env set --prod` |
| **Clerk instance** | Development (`pk_test_...`) | Production (`pk_live_...`) |
| **Frontend env vars** | `.env.local` (gitignored) | GitHub Secrets injected at build time |
| **Env validation** | `src/lib/env.ts` throws on missing vars | Same module, vars baked in at build |
| **Deploy** | `npm run dev` locally | GitHub Actions on push to main |

## Files created/modified

- **Created:** `.env.example`, `src/lib/env.ts`, `src/lib/__tests__/env.test.ts`
- **Modified:** `src/main.tsx`, `.github/workflows/deploy.yml`
