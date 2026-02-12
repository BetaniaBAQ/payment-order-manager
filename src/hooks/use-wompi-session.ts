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
