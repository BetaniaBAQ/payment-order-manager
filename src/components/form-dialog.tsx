import type { ReactElement, ReactNode } from 'react'

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
  form: {
    handleSubmit: () => void
    Subscribe: React.ComponentType<{
      selector: (state: {
        canSubmit: boolean
        isSubmitting: boolean
      }) => [boolean, boolean]
      children: (values: [boolean, boolean]) => ReactNode
    }>
  }
  /** Submit button label (default: "Save") */
  submitLabel?: string
  /** Submit button label while submitting (default: "Saving...") */
  submittingLabel?: string
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
  children,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          {children}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state: {
                canSubmit: boolean
                isSubmitting: boolean
              }) => [state.canSubmit, state.isSubmitting] as [boolean, boolean]}
            >
              {([canSubmit, isSubmitting]: [boolean, boolean]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? submittingLabel : submitLabel}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
