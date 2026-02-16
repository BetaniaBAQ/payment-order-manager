import type { ReactNode } from 'react'

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

interface EmptyStateProps {
  /** Main message */
  title?: string
  /** Secondary message */
  description?: string
  /** Phosphor icon rendered in a tinted circle */
  icon?: React.ElementType
  /** CTA rendered below the header */
  action?: ReactNode
  /** Optional content below the header (e.g., action button) */
  children?: ReactNode
}

/**
 * Simplified empty state component for consistent "no data" messaging.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={Folder}
 *   title="No profiles yet"
 *   description="Create a profile to get started"
 *   action={<Button>New Profile</Button>}
 * />
 * ```
 */
export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  children,
}: EmptyStateProps) {
  if (!title && !description && !children && !Icon && !action) {
    return null
  }

  return (
    <Empty>
      {Icon && (
        <EmptyMedia className="bg-primary/10 text-primary size-10 rounded-xl p-2.5">
          <Icon className="size-5" />
        </EmptyMedia>
      )}
      {(title || description) && (
        <EmptyHeader>
          {title && <EmptyTitle>{title}</EmptyTitle>}
          {description && <EmptyDescription>{description}</EmptyDescription>}
        </EmptyHeader>
      )}
      {action && <EmptyContent>{action}</EmptyContent>}
      {children}
    </Empty>
  )
}
