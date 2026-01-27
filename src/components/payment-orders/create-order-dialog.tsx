import { useState } from 'react'

import { useNavigate } from '@tanstack/react-router'

import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

import type { FieldApi } from '@/components/forms/form-field-types'
import { CURRENCIES } from '@/constants/payment-orders'

import { FormDialog } from '@/components/forms/form-dialog'
import { FormInput } from '@/components/forms/form-input'
import { FormSelect } from '@/components/forms/form-select'
import { FormTextarea } from '@/components/forms/form-textarea'
import { TagSelect } from '@/components/payment-orders/tag-select'
import { Button } from '@/components/ui/button'
import { useMutationWithToast } from '@/hooks/use-mutation-with-toast'
import { TOAST_MESSAGES } from '@/lib/constants'
import { useForm } from '@/lib/form'
import { requiredString, z } from '@/lib/validators'

interface Tag {
  _id: Id<'tags'>
  name: string
  color: string
}

interface CreateOrderDialogProps {
  profileId: Id<'paymentOrderProfiles'>
  authKitId: string
  orgSlug: string
  profileSlug: string
  tags?: Array<Tag>
}

export function CreateOrderDialog({
  profileId,
  authKitId,
  orgSlug,
  profileSlug,
  tags = [],
}: CreateOrderDialogProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const createMutation = useMutationWithToast(api.paymentOrders.create, {
    successMessage: TOAST_MESSAGES.paymentOrder.created.success,
    errorMessage: TOAST_MESSAGES.paymentOrder.created.error,
    onSuccess: (order) => {
      setOpen(false)
      form.reset()
      // Navigate to order detail page to upload required documents
      const createdOrder = order as { _id: Id<'paymentOrders'> } | null
      if (createdOrder) {
        navigate({
          to: '/orgs/$slug/profiles/$profileSlug/orders/$orderId',
          params: { slug: orgSlug, profileSlug, orderId: createdOrder._id },
        })
      }
    },
  })

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      reason: '',
      amount: '',
      currency: 'COP',
      tagId: '',
    },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync({
        authKitId,
        profileId,
        title: value.title,
        description: value.description || undefined,
        reason: value.reason,
        amount: parseFloat(value.amount),
        currency: value.currency,
        tagId: value.tagId ? (value.tagId as Id<'tags'>) : undefined,
      })
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      title="New Payment Order"
      description="Create a new payment order request"
      trigger={<Button>New Order</Button>}
      form={form}
      submitLabel="Create Order"
      submittingLabel="Creating..."
    >
      <FormInput
        form={form}
        name="title"
        label="Title"
        placeholder="Brief description of the payment"
        validator={requiredString}
      />
      <FormTextarea
        form={form}
        name="description"
        label="Description"
        placeholder="Additional details (optional)"
        rows={2}
      />
      <FormTextarea
        form={form}
        name="reason"
        label="Reason"
        placeholder="Why is this payment needed?"
        validator={requiredString}
        rows={2}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          form={form}
          name="amount"
          label="Amount"
          type="number"
          placeholder="0.00"
          min="0.01"
          step="0.01"
          onKeyDown={(e) => {
            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
              e.preventDefault()
            }
          }}
          validator={z
            .string()
            .min(1, 'Amount is required')
            .refine((val) => parseFloat(val) > 0, 'Amount must be positive')}
        />
        <FormSelect
          form={form}
          name="currency"
          label="Currency"
          options={[...CURRENCIES]}
          validator={requiredString}
        />
      </div>
      {tags.length > 0 && (
        <form.Field name="tagId">
          {(field: FieldApi) => (
            <TagSelect
              field={field}
              tags={tags}
              label="Tag (optional)"
              placeholder="Select a tag"
            />
          )}
        </form.Field>
      )}
    </FormDialog>
  )
}
