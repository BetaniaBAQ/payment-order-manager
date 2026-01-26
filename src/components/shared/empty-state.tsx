import type { ReactNode } from 'react'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'

interface EmptyStateProps {
  /** Main message */
  title?: string
  /** Secondary message */
  description?: string
  /** Optional content below the header (e.g., action button) */
  children?: ReactNode
}

/**
 * Simplified empty state component for consistent "no data" messaging.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   title="No tags yet"
 *   description="Create tags to categorize payment orders"
 * />
 * ```
 */
export function EmptyState({ title, description, children }: EmptyStateProps) {
  if (!title && !description && !children) {
    return null
  }

  return (
    <Empty>
      {(title || description) && (
        <EmptyHeader>
          {title && <EmptyTitle>{title}</EmptyTitle>}
          {description && <EmptyDescription>{description}</EmptyDescription>}
        </EmptyHeader>
      )}
      {children}
    </Empty>
  )
}
