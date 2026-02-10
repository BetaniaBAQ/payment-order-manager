import { useState } from 'react'

import { useNavigate } from '@tanstack/react-router'

import { api } from 'convex/_generated/api'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('orders')
  const { t: te } = useTranslation('errors')

  const createMutation = useMutationWithToast(api.paymentOrders.create, {
    successMessage: t('toast.created'),
    errorMessage: t('toast.createdError'),
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
      title={t('create.title')}
      description={t('create.description')}
      trigger={<Button>{t('create.button')}</Button>}
      form={form}
      submitLabel={t('create.submit')}
      submittingLabel={t('create.submitting')}
    >
      <FormInput
        form={form}
        name="title"
        label={t('create.titleField')}
        placeholder={t('create.titlePlaceholder')}
        validator={requiredString}
      />
      <FormTextarea
        form={form}
        name="description"
        label={t('create.descriptionField')}
        placeholder={t('create.descriptionPlaceholder')}
        rows={2}
      />
      <FormTextarea
        form={form}
        name="reason"
        label={t('create.reasonField')}
        placeholder={t('create.reasonPlaceholder')}
        validator={requiredString}
        rows={2}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          form={form}
          name="amount"
          label={t('create.amountField')}
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
            .min(1, te('validation.amountRequired'))
            .refine(
              (val) => parseFloat(val) > 0,
              te('validation.amountPositive'),
            )}
        />
        <FormSelect
          form={form}
          name="currency"
          label={t('create.currencyField')}
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
              label={t('create.tagField')}
              placeholder={t('create.tagPlaceholder')}
            />
          )}
        </form.Field>
      )}
    </FormDialog>
  )
}
