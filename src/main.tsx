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
    <ClerkProvider
      publishableKey={env.VITE_CLERK_PUBLISHABLE_KEY}
      signInFallbackRedirectUrl={import.meta.env.BASE_URL + 'admin'}
      signUpFallbackRedirectUrl={import.meta.env.BASE_URL + 'admin'}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <Router />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </StrictMode>,
)
