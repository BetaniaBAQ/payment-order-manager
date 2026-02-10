import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('orders')

  if (tags.length === 0) return null

  const selectedTag = tags.find((tag) => tag._id === value)

  return (
    <Select
      value={value ?? ''}
      onValueChange={(v) => onChange(v ? (v as Id<'tags'>) : undefined)}
    >
      <SelectTrigger>
        <SelectValue placeholder={t('filters.tag')}>
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
