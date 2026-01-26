/**
 * Type definitions for form field components.
 * Using permissive types to work with TanStack Form's complex generics.
 */

export type FieldState = {
  value: unknown
  meta: {
    errors: Array<{ message?: string } | undefined>
  }
}

export type FieldApi = {
  name: string
  state: FieldState
  handleBlur: () => void

  handleChange: (value: any) => void
}

/**
 * Helper type to extract keys from form data as string literals.
 * Provides autocomplete for the `name` prop.
 */
export type FormFieldName<TFormData> = keyof TFormData & string

/**
 * Generic form type that provides autocomplete for field names.
 * The actual form type is permissive to work with TanStack Form's complex generics.
 * The generic parameter is used only for inference in FormFieldName.
 */
export interface FormWithFields<TFormData> {
  Field: any
  /** @internal Phantom property for type inference - never actually used at runtime */
  readonly __formData?: TFormData
}
