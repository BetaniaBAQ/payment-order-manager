import { useState } from 'react'


import { FunnelIcon, XIcon } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import type { Id } from 'convex/_generated/dataModel'

import {
  CreatorFilter,
  DateFilter,
  SearchFilter,
  StatusFilter,
  TagFilter,
} from '@/components/filters'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
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
  const { t } = useTranslation('orders')
  const { t: tc } = useTranslation('common')
  const [drawerOpen, setDrawerOpen] = useState(false)

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

  const activeFilterCount = [
    status,
    tagId,
    dateFrom,
    dateTo,
    showCreatorFilter ? creatorId : undefined,
  ].filter(Boolean).length

  const filterControls = (
    <>
      <StatusFilter value={status} onChange={setStatus} />
      <TagFilter tags={tags} value={tagId} onChange={setTagId} />
      <DateFilter
        value={dateFrom}
        onChange={setDateFrom}
        placeholder={t('filters.from')}
        disabledDate={(date) => (dateTo ? date > dateTo : false)}
      />
      <DateFilter
        value={dateTo}
        onChange={setDateTo}
        placeholder={t('filters.to')}
        disabledDate={(date) => (dateFrom ? date < dateFrom : false)}
      />
      {showCreatorFilter && (
        <CreatorFilter
          creators={creators}
          value={creatorId}
          onChange={setCreatorId}
        />
      )}
    </>
  )

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <SearchFilter
            value={search}
            onChange={setSearch}
            placeholder={t('filters.search')}
          />
        </div>

        {/* Mobile: Drawer trigger */}
        <Button
          variant="outline"
          className="sm:hidden"
          onClick={() => setDrawerOpen(true)}
        >
          <FunnelIcon className="h-4 w-4" />
          {t('filters.title')}
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Desktop: inline filters */}
      <div className="hidden flex-wrap gap-2 sm:flex">
        <div className="flex min-w-0 flex-1 flex-wrap gap-2 *:min-w-0 *:flex-1">
          {filterControls}
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <XIcon className="mr-1 h-4 w-4" />
            {tc('actions.clear')}
          </Button>
        )}
      </div>

      {/* Mobile: Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t('filters.title')}</DrawerTitle>
          </DrawerHeader>
          <div className="space-y-4 overflow-y-auto px-4 *:w-full">
            {filterControls}
          </div>
          <DrawerFooter className="flex-row gap-2">
            {hasFilters && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  clearFilters()
                  setDrawerOpen(false)
                }}
              >
                <XIcon className="mr-1 h-4 w-4" />
                {tc('actions.clear')}
              </Button>
            )}
            <DrawerClose
              render={<Button className="flex-1">{t('filters.apply')}</Button>}
            />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
