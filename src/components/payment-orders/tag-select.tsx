import { useTranslation } from 'react-i18next'
import type { Id } from 'convex/_generated/dataModel'


import type { FieldApi } from '@/components/forms/form-field-types'
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
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

interface TagSelectProps {
  field: FieldApi
  tags: Array<Tag>
  label: string
  placeholder?: string
}

function TagColorDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-3 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  )
}

export function TagSelect({ field, tags, label, placeholder }: TagSelectProps) {
  const { t } = useTranslation('orders')
  const selectedTag = tags.find((tag) => tag._id === field.state.value)
  const placeholderText = placeholder ?? t('create.tagPlaceholder')

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <FieldContent>
        <Select
          value={(field.state.value as string) || undefined}
          onValueChange={(value) => {
            if (value) field.handleChange(value)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholderText}>
              {selectedTag ? (
                <span className="flex items-center gap-2">
                  <TagColorDot color={selectedTag.color} />
                  {selectedTag.name}
                </span>
              ) : null}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {tags.map((tag) => (
              <SelectItem key={tag._id} value={tag._id}>
                <span className="flex items-center gap-2">
                  <TagColorDot color={tag.color} />
                  {tag.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError errors={field.state.meta.errors} />
      </FieldContent>
    </Field>
  )
}
