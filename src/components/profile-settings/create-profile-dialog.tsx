import { useState } from 'react'

import { useNavigate } from '@tanstack/react-router'

import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

import { FormDialog } from '@/components/forms/form-dialog'
import { FormInput } from '@/components/forms/form-input'
import { Button } from '@/components/ui/button'
import { useMutationWithToast } from '@/hooks/use-mutation-with-toast'
import { TOAST_MESSAGES } from '@/lib/constants'
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
  const navigate = useNavigate()

  const createMutation = useMutationWithToast(api.paymentOrderProfiles.create, {
    successMessage: TOAST_MESSAGES.profile.created.success,
    errorMessage: TOAST_MESSAGES.profile.created.error,
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
      title="New Profile"
      description="Create a new payment order profile"
      trigger={<Button>New Profile</Button>}
      form={form}
      submitLabel="Create Profile"
      submittingLabel="Creating..."
    >
      <FormInput
        form={form}
        name="name"
        label="Name"
        placeholder="e.g. Marketing Department"
        validator={requiredString}
      />
    </FormDialog>
  )
}
