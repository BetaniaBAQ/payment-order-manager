import type { ComponentProps } from 'react'

import type { StandardSchemaV1 } from '@tanstack/react-form'

import type {
  FieldApi,
  FormFieldName,
  FormWithFields,
} from './form-field-types'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'


type FormTextareaProps<TFormData> = {
  form: FormWithFields<TFormData>
  name: FormFieldName<TFormData>
  label: string
  description?: string
  placeholder?: string
  validator?: StandardSchemaV1<string>
  disabled?: boolean
  autoFocus?: boolean
  rows?: number
  className?: string
} & Omit<
  ComponentProps<typeof Textarea>,
  'id' | 'name' | 'value' | 'onChange' | 'onBlur' | 'form'
>

/**
 * Form textarea field with automatic label, error handling, and TanStack Form integration.
 *
 * @example
 * ```tsx
 * <FormTextarea
 *   form={form}
 *   name="description"
 *   label="Description"
 *   placeholder="Enter a description..."
 *   rows={4}
 * />
 * ```
 */
export function FormTextarea<TFormData>({
  form,
  name,
  label,
  description,
  placeholder,
  validator,
  disabled,
  autoFocus,
  rows = 3,
  className,
  ...textareaProps
}: FormTextareaProps<TFormData>) {
  return (
    <form.Field
      name={name}
      validators={validator ? { onChange: validator } : undefined}
    >
      {(field: FieldApi) => (
        <Field>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <FieldContent>
            <Textarea
              id={field.name}
              name={field.name}
              value={field.state.value as string}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              autoFocus={autoFocus}
              rows={rows}
              className={className}
              aria-invalid={field.state.meta.errors.length > 0}
              {...textareaProps}
            />
            {description && <FieldDescription>{description}</FieldDescription>}
            <FieldError errors={field.state.meta.errors} />
          </FieldContent>
        </Field>
      )}
    </form.Field>
  )
}
