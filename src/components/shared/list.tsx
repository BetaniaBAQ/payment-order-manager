import { useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import type { ReactNode } from 'react'


import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ListProps<T> {
  items: Array<T>
  keyExtractor: (item: T) => string
  renderItem: (item: T) => ReactNode
  renderActions?: (item: T) => ReactNode
  emptyState?: ReactNode
  searchExtractor?: (item: T) => string
  searchPlaceholder?: string
  className?: string
}

export function List<T>({
  items,
  keyExtractor,
  renderItem,
  renderActions,
  emptyState,
  searchExtractor,
  searchPlaceholder = 'Search...',
  className,
}: ListProps<T>) {
  const [search, setSearch] = useState('')

  const filteredItems = searchExtractor
    ? items.filter((item) =>
        searchExtractor(item).toLowerCase().includes(search.toLowerCase()),
      )
    : items

  if (items.length === 0) {
    return emptyState ?? null
  }

  return (
    <div className={cn('space-y-4', className)}>
      {searchExtractor && (
        <div className="relative">
          <MagnifyingGlass className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}
      {filteredItems.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center text-sm">
          No results found
        </p>
      ) : (
        <div className="divide-y">
          {filteredItems.map((item) => (
            <div
              key={keyExtractor(item)}
              className="-mx-2 flex items-center justify-between rounded-md px-2 py-4 first:pt-0 last:pb-0"
            >
              <div className="flex flex-1 items-center gap-3">
                {renderItem(item)}
              </div>
              {renderActions && (
                <div className="flex items-center gap-2">
                  {renderActions(item)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
