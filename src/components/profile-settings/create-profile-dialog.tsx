import { useState } from 'react'

import { useNavigate } from '@tanstack/react-router'

import { api } from 'convex/_generated/api'
import { useTranslation } from 'react-i18next'
import type { Id } from 'convex/_generated/dataModel'


import { FormDialog } from '@/components/forms/form-dialog'
import { FormInput } from '@/components/forms/form-input'
import { Button } from '@/components/ui/button'
import { useMutationWithToast } from '@/hooks/use-mutation-with-toast'
import { useForm } from '@/lib/form'
import { requiredString } from '@/lib/validators'

interface CreateProfileDialogProps {
  organizationId: Id<'organizations'>
  authKitId: string
  orgSlug: string
}

export function CreateProfileDialog({
  organizationId,
  authKitId,
  orgSlug,
}: CreateProfileDialogProps) {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation('settings')
  const navigate = useNavigate()

  const createMutation = useMutationWithToast(api.paymentOrderProfiles.create, {
    successMessage: t('toast.profileCreated'),
    errorMessage: t('toast.profileCreatedError'),
    onSuccess: (profile) => {
      setOpen(false)
      form.reset()
      // Navigate to new profile page
      const createdProfile = profile as { slug: string } | null
      if (createdProfile) {
        navigate({
          to: '/orgs/$slug/profiles/$profileSlug',
          params: { slug: orgSlug, profileSlug: createdProfile.slug },
        })
      }
    },
  })

  const form = useForm({
    defaultValues: {
      name: '',
    },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync({
        authKitId,
        organizationId,
        name: value.name,
      })
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      title={t('profile.createTitle')}
      description={t('profile.createDescription')}
      trigger={<Button>{t('profile.createButton')}</Button>}
      form={form}
      submitLabel={t('profile.createSubmit')}
      submittingLabel={t('profile.createSubmitting')}
    >
      <FormInput
        form={form}
        name="name"
        label={t('profile.nameField')}
        placeholder={t('profile.namePlaceholder')}
        validator={requiredString}
      />
    </FormDialog>
  )
}
