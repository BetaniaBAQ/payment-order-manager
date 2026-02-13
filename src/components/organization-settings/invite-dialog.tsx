import { api } from 'convex/_generated/api'

import { useTranslation } from 'react-i18next'

import { DEFAULT_INVITE_ROLE, MEMBER_ROLE_OPTION_KEYS } from './constants'
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
  const { t } = useTranslation('settings')
  const { t: tc } = useTranslation('common')

  const roleOptions = MEMBER_ROLE_OPTION_KEYS.map((opt) => ({
    value: opt.value,
    label: t(opt.labelKey),
  }))

  const inviteAction = useActionWithToast(api.organizationInvites.create, {
    successMessage: t('toast.inviteSent'),
    errorMessage: t('toast.inviteSentError'),
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
      <DialogTrigger render={<Button>{t('invite.button')}</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('invite.title')}</DialogTitle>
          <DialogDescription>
            {t('invite.description', { orgName: org.name })}
          </DialogDescription>
        </DialogHeader>
        <Form onSubmit={form.handleSubmit} className="space-y-4">
          <FormInput
            form={form}
            name="email"
            label={t('invite.emailField')}
            type="email"
            placeholder={t('invite.emailPlaceholder')}
            validator={emailValidator}
          />

          <FormSelect
            form={form}
            name="role"
            label={t('invite.roleField')}
            options={roleOptions}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tc('actions.cancel')}
            </Button>
            <FormSubmitButton
              form={form}
              label={t('invite.submit')}
              loadingLabel={t('invite.submitting')}
            />
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
