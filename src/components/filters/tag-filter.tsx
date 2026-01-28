import type { Id } from 'convex/_generated/dataModel'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Tag {
  _id: Id<'tags'>
  name: string
  color: string
}

interface TagFilterProps {
  tags: Array<Tag>
  value: Id<'tags'> | undefined
  onChange: (value: Id<'tags'> | undefined) => void
}

export function TagFilter({ tags, value, onChange }: TagFilterProps) {
  if (tags.length === 0) return null

  const selectedTag = tags.find((t) => t._id === value)

  return (
    <Select
      value={value ?? ''}
      onValueChange={(v) => onChange(v ? (v as Id<'tags'>) : undefined)}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Tag">
          {selectedTag && (
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: selectedTag.color }}
              />
              {selectedTag.name}
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {tags.map((tag) => (
          <SelectItem key={tag._id} value={tag._id}>
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
