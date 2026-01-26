import type {
  FieldApi,
  FormFieldName,
  FormWithFields,
} from './form-field-types'
import { Field, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'


type FormSwitchProps<TFormData> = {
  form: FormWithFields<TFormData>
  name: FormFieldName<TFormData>
  label: string
  description?: string
  disabled?: boolean
  className?: string
}

/**
 * Form switch/toggle field with automatic label and TanStack Form integration.
 *
 * @example
 * ```tsx
 * <FormSwitch
 *   form={form}
 *   name="isPublic"
 *   label="Public Profile"
 *   description="Anyone can submit payment orders"
 * />
 * ```
 */
export function FormSwitch<TFormData>({
  form,
  name,
  label,
  description,
  disabled,
  className,
}: FormSwitchProps<TFormData>) {
  return (
    <form.Field name={name}>
      {(field: FieldApi) => (
        <Field className={className}>
          <div className="flex items-center justify-between">
            <div>
              <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
              {description && (
                <p className="text-muted-foreground text-sm">{description}</p>
              )}
            </div>
            <Switch
              id={field.name}
              checked={field.state.value as boolean}
              onCheckedChange={(checked) => field.handleChange(checked)}
              disabled={disabled}
            />
          </div>
        </Field>
      )}
    </form.Field>
  )
}
