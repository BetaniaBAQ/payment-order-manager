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
import { Input } from '@/components/ui/input'


type FormInputProps<TFormData> = {
  form: FormWithFields<TFormData>
  name: FormFieldName<TFormData>
  label: string
  description?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  validator?: StandardSchemaV1<string>
  disabled?: boolean
  autoFocus?: boolean
  className?: string
} & Omit<
  ComponentProps<typeof Input>,
  'id' | 'name' | 'value' | 'onChange' | 'onBlur' | 'form'
>

/**
 * Form input field with automatic label, error handling, and TanStack Form integration.
 *
 * @example
 * ```tsx
 * <FormInput
 *   form={form}
 *   name="email"
 *   label="Email Address"
 *   placeholder="you@example.com"
 *   validator={emailValidator}
 * />
 * ```
 */
export function FormInput<TFormData>({
  form,
  name,
  label,
  description,
  placeholder,
  type = 'text',
  validator,
  disabled,
  autoFocus,
  className,
  ...inputProps
}: FormInputProps<TFormData>) {
  return (
    <form.Field
      name={name}
      validators={validator ? { onChange: validator } : undefined}
    >
      {(field: FieldApi) => (
        <Field>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <FieldContent>
            <Input
              id={field.name}
              name={field.name}
              type={type}
              value={field.state.value as string}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              autoFocus={autoFocus}
              className={className}
              aria-invalid={field.state.meta.errors.length > 0}
              {...inputProps}
            />
            {description && <FieldDescription>{description}</FieldDescription>}
            <FieldError errors={field.state.meta.errors} />
          </FieldContent>
        </Field>
      )}
    </form.Field>
  )
}
