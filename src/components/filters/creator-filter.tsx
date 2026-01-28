import type { Id } from 'convex/_generated/dataModel'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Creator {
  _id: Id<'users'>
  name: string
  email: string
}

interface CreatorFilterProps {
  creators: Array<Creator>
  value: Id<'users'> | undefined
  onChange: (value: Id<'users'> | undefined) => void
}

export function CreatorFilter({
  creators,
  value,
  onChange,
}: CreatorFilterProps) {
  if (creators.length === 0) return null

  return (
    <Select
      value={value ?? ''}
      onValueChange={(v) => onChange(v ? (v as Id<'users'>) : undefined)}
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
  )
}
