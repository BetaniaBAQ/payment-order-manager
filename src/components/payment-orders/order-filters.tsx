import { CalendarIcon, MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react'
import { format } from 'date-fns'
import type { Id } from 'convex/_generated/dataModel'
import type { PaymentOrderStatus } from 'convex/schema'


import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
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

const STATUS_OPTIONS: Array<{ value: PaymentOrderStatus; label: string }> = [
  { value: 'CREATED', label: 'Created' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'NEEDS_SUPPORT', label: 'Needs Support' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PAID', label: 'Paid' },
  { value: 'RECONCILED', label: 'Reconciled' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

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
      {/* Search input */}
      <div className="relative">
        <MagnifyingGlassIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-2">
        {/* Status filter */}
        <Select
          value={status ?? ''}
          onValueChange={(value) =>
            setStatus(value ? (value as PaymentOrderStatus) : undefined)
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tag filter */}
        {tags.length > 0 && (
          <Select
            value={tagId ?? ''}
            onValueChange={(value) =>
              setTagId(value ? (value as Id<'tags'>) : undefined)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              {tags.map((tag) => (
                <SelectItem key={tag._id} value={tag._id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Date from */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                className={cn(
                  'w-[140px] justify-start text-left font-normal',
                  !dateFrom && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, 'MMM d, yyyy') : 'From'}
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateFrom}
              onSelect={setDateFrom}
              disabled={(date) => (dateTo ? date > dateTo : false)}
            />
          </PopoverContent>
        </Popover>

        {/* Date to */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                className={cn(
                  'w-[140px] justify-start text-left font-normal',
                  !dateTo && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, 'MMM d, yyyy') : 'To'}
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateTo}
              onSelect={setDateTo}
              disabled={(date) => (dateFrom ? date < dateFrom : false)}
            />
          </PopoverContent>
        </Popover>

        {/* Creator filter - only for admins/owners */}
        {showCreatorFilter && creators.length > 0 && (
          <Select
            value={creatorId ?? ''}
            onValueChange={(value) =>
              setCreatorId(value ? (value as Id<'users'>) : undefined)
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Creator" />
            </SelectTrigger>
            <SelectContent>
              {creators.map((creator) => (
                <SelectItem key={creator._id} value={creator._id}>
                  {creator.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Clear filters */}
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
