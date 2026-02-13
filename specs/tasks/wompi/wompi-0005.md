# 0005: Wompi JS fingerprinting hook

## Context

Wompi JS library provides fraud prevention via device fingerprinting. It exposes `$wompi.initialize()` which returns a `sessionId` and `deviceId`. These should be available to the checkout component to pass along when the Widget is opened, improving fraud detection for Colombian payments.

## Dependencies

- wompi-0001 (Wompi JS script loaded in head)

## Files

- `src/hooks/use-wompi-session.ts` (new)
- `src/components/billing/wompi-checkout.tsx` (edit — consume hook)

## Requirements

### Create `useWompiSession` hook

```typescript
import { useEffect, useState } from 'react'

interface WompiSession {
  sessionId: string
  deviceId: string
}

export function useWompiSession() {
  const [session, setSession] = useState<WompiSession | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (typeof $wompi === 'undefined') return

    $wompi.initialize((data, error) => {
      if (error) return
      setSession({
        sessionId: data.sessionId,
        deviceId: data.deviceData.deviceID,
      })
    })
  }, [])

  return session
}
```

- Guard for SSR (`typeof window`)
- Guard for script not loaded (`typeof $wompi`)
- Initialize once on mount
- Returns `null` until initialized

### Consume in WompiCheckout

The Wompi Widget doesn't accept `sessionId` directly in its constructor config (that's for the REST API). However, if we ever need server-side transaction creation (recurring billing), the session data will be available.

For now, store the hook in the checkout component for future use:

```typescript
const session = useWompiSession()
// session.sessionId and session.deviceId available for future API calls
```

## Definition of Done

- [ ] `src/hooks/use-wompi-session.ts` created and exports `useWompiSession`
- [ ] Hook initializes `$wompi` on mount and returns `{ sessionId, deviceId }`
- [ ] SSR-safe (no window/document access during SSR)
- [ ] Hook consumed in `wompi-checkout.tsx`
- [ ] No TypeScript errors
