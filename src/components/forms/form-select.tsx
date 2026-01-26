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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'


type SelectOption = {
  value: string
  label: string
}

type FormSelectProps<TFormData> = {
  form: FormWithFields<TFormData>
  name: FormFieldName<TFormData>
  label: string
  options?: Array<SelectOption>
  description?: string
  placeholder?: string
  validator?: StandardSchemaV1<string>
  disabled?: boolean
  className?: string
}

/**
 * Form select field with automatic label, error handling, and TanStack Form integration.
 *
 * @example
 * ```tsx
 * <FormSelect
 *   form={form}
 *   name="role"
 *   label="Role"
 *   placeholder="Select a role"
 *   options={[
 *     { value: 'member', label: 'Member' },
 *     { value: 'admin', label: 'Admin' },
 *   ]}
 * />
 * ```
 */
export function FormSelect<TFormData>({
  form,
  name,
  label,
  options = [],
  description,
  placeholder,
  validator,
  disabled,
  className,
}: FormSelectProps<TFormData>) {
  return (
    <form.Field
      name={name}
      validators={validator ? { onChange: validator } : undefined}
    >
      {(field: FieldApi) => (
        <Field>
          <FieldLabel>{label}</FieldLabel>
          <FieldContent>
            <Select
              value={field.state.value as string}
              onValueChange={(value) => {
                if (value) field.handleChange(value)
              }}
              disabled={disabled}
            >
              <SelectTrigger className={className}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {description && <FieldDescription>{description}</FieldDescription>}
            <FieldError errors={field.state.meta.errors} />
          </FieldContent>
        </Field>
      )}
    </form.Field>
  )
}
