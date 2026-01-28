import { XIcon } from '@phosphor-icons/react'
import type { Id } from 'convex/_generated/dataModel'


import {
  CreatorFilter,
  DateFilter,
  SearchFilter,
  StatusFilter,
  TagFilter,
} from '@/components/filters'
import { Button } from '@/components/ui/button'
import {
  useOrderFilterCreatorId,
  useOrderFilterDateFrom,
  useOrderFilterDateTo,
  useOrderFilterSearch,
  useOrderFilterStatus,
  useOrderFilterTagId,
  useOrderFiltersActions,
} from '@/stores/orderFiltersStore'

interface Tag {
  _id: Id<'tags'>
  name: string
  color: string
}

interface Creator {
  _id: Id<'users'>
  name: string
  email: string
}

interface OrderFiltersProps {
  tags: Array<Tag>
  creators: Array<Creator>
  showCreatorFilter: boolean
}

export function OrderFilters({
  tags,
  creators,
  showCreatorFilter,
}: OrderFiltersProps) {
  // Read filter state from store
  const search = useOrderFilterSearch()
  const status = useOrderFilterStatus()
  const tagId = useOrderFilterTagId()
  const dateFrom = useOrderFilterDateFrom()
  const dateTo = useOrderFilterDateTo()
  const creatorId = useOrderFilterCreatorId()
  const {
    setSearch,
    setStatus,
    setTagId,
    setDateFrom,
    setDateTo,
    setCreatorId,
    clearFilters,
  } = useOrderFiltersActions()

  const hasFilters =
    search || status || tagId || dateFrom || dateTo || creatorId

  return (
    <div className="space-y-3">
      <SearchFilter
        value={search}
        onChange={setSearch}
        placeholder="Search orders..."
      />

      <div className="flex flex-wrap gap-2">
        <StatusFilter value={status} onChange={setStatus} />
        <TagFilter tags={tags} value={tagId} onChange={setTagId} />
        <DateFilter
          value={dateFrom}
          onChange={setDateFrom}
          placeholder="From"
          disabledDate={(date) => (dateTo ? date > dateTo : false)}
        />
        <DateFilter
          value={dateTo}
          onChange={setDateTo}
          placeholder="To"
          disabledDate={(date) => (dateFrom ? date < dateFrom : false)}
        />
        {showCreatorFilter && (
          <CreatorFilter
            creators={creators}
            value={creatorId}
            onChange={setCreatorId}
          />
        )}

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <XIcon className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
