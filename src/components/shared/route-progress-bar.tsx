'use client'

import { useEffect, useRef, useState } from 'react'

import { useRouterState } from '@tanstack/react-router'

import { Progress as ProgressPrimitive } from '@base-ui/react/progress'

import { cn } from '@/lib/utils'

export function RouteProgressBar() {
  const isNavigating = useRouterState({
    select: (s) => s.status === 'pending',
  })

  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const wasNavigating = useRef(false)

  useEffect(() => {
    // Navigation started
    if (isNavigating && !wasNavigating.current) {
      wasNavigating.current = true
      queueMicrotask(() => {
        setVisible(true)
        setProgress(80)
      })
      return undefined
    }

    // Navigation completed
    if (!isNavigating && wasNavigating.current) {
      wasNavigating.current = false
      queueMicrotask(() => {
        setProgress(100)
      })
      const timeout = setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 200)
      return () => clearTimeout(timeout)
    }

    return undefined
  }, [isNavigating])

  if (typeof window === 'undefined') return null

  return (
    <ProgressPrimitive.Root value={progress}>
      <ProgressPrimitive.Track
        aria-hidden={!visible}
        className={cn(
          'fixed top-0 right-0 left-0 z-[100] h-0.5 rounded-none bg-transparent',
          'pointer-events-none transition-opacity duration-200',
          visible ? 'opacity-100' : 'opacity-0',
        )}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            'bg-primary h-full',
            visible && 'transition-[width] duration-300 ease-out',
          )}
          style={{ width: `${progress}%` }}
        />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  )
}
