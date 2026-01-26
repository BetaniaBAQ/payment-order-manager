import type { ComponentProps } from 'react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

type FormSubscribe = {
  Subscribe: React.ComponentType<{
    selector: (state: {
      canSubmit: boolean
      isSubmitting: boolean
    }) => [boolean, boolean]
    children: (state: [boolean, boolean]) => React.ReactNode
  }>
}

type FormSubmitButtonProps = {
  form: FormSubscribe
  label: string
  loadingLabel?: string
} & Omit<
  ComponentProps<typeof Button>,
  'type' | 'disabled' | 'children' | 'form'
>

export function FormSubmitButton({
  form,
  label,
  loadingLabel,
  ...props
}: FormSubmitButtonProps) {
  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
      {([canSubmit, isSubmitting]) => (
        <Button type="submit" disabled={!canSubmit || isSubmitting} {...props}>
          {isSubmitting && <Spinner />}
          {isSubmitting ? (loadingLabel ?? label) : label}
        </Button>
      )}
    </form.Subscribe>
  )
}
