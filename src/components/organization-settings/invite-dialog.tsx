import { api } from 'convex/_generated/api'

import { DEFAULT_INVITE_ROLE, MEMBER_ROLE_OPTIONS } from './constants'
import type { Organization } from './types'
import { Form } from '@/components/forms/form'
import { FormInput } from '@/components/forms/form-input'
import { FormSelect } from '@/components/forms/form-select'
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
import { useActionWithToast } from '@/hooks/use-mutation-with-toast'
import { TOAST_MESSAGES } from '@/lib/constants'
import { useForm } from '@/lib/form'
import { email as emailValidator } from '@/lib/validators'


type InviteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  org: Organization
  authKitId: string
}

export function InviteDialog({
  open,
  onOpenChange,
  org,
  authKitId,
}: InviteDialogProps) {
  const inviteAction = useActionWithToast(api.organizationInvites.create, {
    successMessage: TOAST_MESSAGES.invite.sent.success,
    errorMessage: TOAST_MESSAGES.invite.sent.error,
    onSuccess: () => onOpenChange(false),
  })

  const form = useForm({
    defaultValues: {
      email: '',
      role: DEFAULT_INVITE_ROLE as 'admin' | 'member',
    },
    onSubmit: async ({ value }) => {
      await inviteAction.mutateAsync({
        authKitId,
        organizationId: org._id,
        email: value.email,
        role: value.role,
      })
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button>+ Invite Member</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Send an invitation email to add someone to {org.name}
          </DialogDescription>
        </DialogHeader>
        <Form onSubmit={form.handleSubmit} className="space-y-4">
          <FormInput
            form={form}
            name="email"
            label="Email"
            type="email"
            placeholder="colleague@company.com"
            validator={emailValidator}
          />

          <FormSelect
            form={form}
            name="role"
            label="Role"
            options={MEMBER_ROLE_OPTIONS}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <FormSubmitButton
              form={form}
              label="Send Invite"
              loadingLabel="Sending..."
            />
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
