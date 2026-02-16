import { useTranslation } from 'react-i18next'
import type { ReactElement, ReactNode } from 'react'


import { Form } from '@/components/forms/form'
import { FormSubmitButton } from '@/components/forms/form-submit-button'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface FormDialogProps {
  /** Controlled open state */
  open: boolean
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void
  /** Dialog title */
  title: string
  /** Dialog description */
  description: string
  /** Optional trigger element (renders DialogTrigger) */
  trigger?: ReactElement
  /** TanStack Form instance - must have handleSubmit and Subscribe */
  form: Parameters<typeof FormSubmitButton>[0]['form'] & {
    handleSubmit: () => void
  }
  /** Submit button label (default: "Save") */
  submitLabel?: string
  /** Submit button label while submitting (default: "Saving...") */
  submittingLabel?: string
  /** Additional className forwarded to DialogContent */
  className?: string
  /** Form fields */
  children: ReactNode
}

/**
 * Reusable dialog component for forms with consistent styling and behavior.
 *
 * Handles:
 * - Dialog open/close state
 * - Form submit with preventDefault
 * - Cancel and Submit buttons with loading state
 *
 * @example
 * ```tsx
 * <FormDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Create Tag"
 *   description="Tags help categorize payment orders"
 *   trigger={<Button>+ New Tag</Button>}
 *   form={form}
 *   submitLabel="Create Tag"
 *   submittingLabel="Creating..."
 * >
 *   <form.Field name="name">
 *     {(field) => <Input {...field} />}
 *   </form.Field>
 * </FormDialog>
 * ```
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  trigger,
  form,
  submitLabel = 'Save',
  submittingLabel = 'Saving...',
  className,
  children,
}: FormDialogProps) {
  const { t } = useTranslation('common')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form onSubmit={form.handleSubmit} className="space-y-4">
          {children}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('actions.cancel')}
            </Button>
            <FormSubmitButton
              form={form}
              label={submitLabel}
              loadingLabel={submittingLabel}
            />
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
