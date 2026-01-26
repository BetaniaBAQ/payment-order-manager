import { useState } from 'react'

import { api } from 'convex/_generated/api'
import { XIcon } from '@phosphor-icons/react'
import type { FunctionReturnType } from 'convex/server'


import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useMutationWithToast } from '@/hooks/use-mutation-with-toast'
import { TOAST_MESSAGES } from '@/lib/constants'

interface EmailWhitelistCardProps {
  profile: NonNullable<
    FunctionReturnType<typeof api.paymentOrderProfiles.getBySlug>
  >
  authKitId: string
}

export function EmailWhitelistCard({
  profile,
  authKitId,
}: EmailWhitelistCardProps) {
  const [newEmail, setNewEmail] = useState('')

  const addEmailMutation = useMutationWithToast(
    api.paymentOrderProfiles.updateAllowedEmails,
    {
      successMessage: TOAST_MESSAGES.profile.emailAdded.success,
      errorMessage: TOAST_MESSAGES.profile.emailAdded.error,
      onSuccess: () => setNewEmail(''),
    },
  )

  const removeEmailMutation = useMutationWithToast(
    api.paymentOrderProfiles.updateAllowedEmails,
    {
      successMessage: TOAST_MESSAGES.profile.emailRemoved.success,
      errorMessage: TOAST_MESSAGES.profile.emailRemoved.error,
    },
  )

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.trim()) return

    addEmailMutation.mutate({
      authKitId,
      id: profile._id,
      operation: 'add',
      emails: [newEmail.trim()],
    })
  }

  const handleRemoveEmail = (email: string) => {
    removeEmailMutation.mutate({
      authKitId,
      id: profile._id,
      operation: 'remove',
      emails: [email],
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Access Control</CardTitle>
        <CardDescription>
          Users with whitelisted emails can log in and submit payment orders to
          this profile. They will only see their own submitted orders.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAddEmail} className="flex max-w-md gap-2">
          <Input
            type="email"
            placeholder="email@example.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <Button
            type="submit"
            disabled={!newEmail.trim() || addEmailMutation.isPending}
          >
            Add
          </Button>
        </form>

        {profile.allowedEmails.length > 0 ? (
          <ul className="space-y-2">
            {profile.allowedEmails.map((email) => (
              <li
                key={email}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <span className="text-sm">{email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveEmail(email)}
                  disabled={removeEmailMutation.isPending}
                  aria-label={`Remove ${email}`}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            No emails whitelisted yet. Add emails above to grant access.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
