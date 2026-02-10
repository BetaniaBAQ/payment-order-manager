import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('orders')

  if (creators.length === 0) return null

  return (
    <Select
      value={value ?? ''}
      onValueChange={(v) => onChange(v ? (v as Id<'users'>) : undefined)}
    >
      <SelectTrigger>
        <SelectValue placeholder={t('filters.creator')} />
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
