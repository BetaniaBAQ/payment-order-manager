import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'


import { cn } from '@/lib/utils'

interface ListItemLinkProps {
  to: string
  params?: Record<string, string>
  children: ReactNode
  className?: string
}

/**
 * Styled link component for use in List renderItem.
 * Provides consistent hover styles and layout for list item links.
 */
export function ListItemLink({
  to,
  params,
  children,
  className,
}: ListItemLinkProps) {
  return (
    <Link
      to={to}
      params={params}
      className={cn(
        'hover:bg-muted/50 flex flex-1 items-center justify-between rounded-md py-1 pr-2 transition-colors',
        className,
      )}
    >
      {children}
    </Link>
  )
}
