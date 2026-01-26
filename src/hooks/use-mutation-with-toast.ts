import { useMutation } from '@tanstack/react-query'

import { toast } from 'sonner'

import { useConvexAction, useConvexMutation } from '@/lib/convex'

type ConvexMutationFn = Parameters<typeof useConvexMutation>[0]
type ConvexActionFn = Parameters<typeof useConvexAction>[0]

interface MutationWithToastOptions<TData = unknown> {
  /** Message shown on success toast */
  successMessage: string
  /** Fallback message if error has no message */
  errorMessage?: string
  /** Callback after successful mutation - receives mutation result */
  onSuccess?: (data: TData) => void
}

/**
 * Wrapper around useMutation + useConvexMutation that handles:
 * - Success toast
 * - Error toast with fallback message
 * - Optional onSuccess callback with mutation result
 *
 * Note: Convex queries are reactive, so manual query invalidation is not needed.
 *
 * @example
 * ```tsx
 * const deleteMutation = useMutationWithToast(api.tags.delete_, {
 *   successMessage: 'Tag deleted',
 *   errorMessage: 'Failed to delete tag',
 * })
 *
 * const createMutation = useMutationWithToast(api.tags.create, {
 *   successMessage: 'Tag created!',
 *   onSuccess: () => onOpenChange(false),
 * })
 * ```
 */
export function useMutationWithToast<
  T extends ConvexMutationFn,
  TData = unknown,
>(mutationFn: T, options: MutationWithToastOptions<TData>) {
  const convexMutation = useConvexMutation(mutationFn)

  const { successMessage, errorMessage, onSuccess } = options

  return useMutation({
    mutationFn: (args: Parameters<typeof convexMutation>[0]) =>
      convexMutation(args),
    onSuccess: (data) => {
      toast.success(successMessage)
      onSuccess?.(data as TData)
    },
    onError: (error: Error) => {
      toast.error(error.message || errorMessage || 'Operation failed')
    },
  })
}

/**
 * Wrapper around useMutation + useConvexAction that handles:
 * - Success toast
 * - Error toast with fallback message
 * - Optional onSuccess callback with action result
 *
 * Same as useMutationWithToast but for Convex actions instead of mutations.
 *
 * Note: Convex queries are reactive, so manual query invalidation is not needed.
 *
 * @example
 * ```tsx
 * const inviteAction = useActionWithToast(api.organizationInvites.create, {
 *   successMessage: 'Invite sent!',
 *   onSuccess: () => onOpenChange(false),
 * })
 * ```
 */
export function useActionWithToast<T extends ConvexActionFn, TData = unknown>(
  actionFn: T,
  options: MutationWithToastOptions<TData>,
) {
  const convexAction = useConvexAction(actionFn)

  const { successMessage, errorMessage, onSuccess } = options

  return useMutation({
    mutationFn: (args: Parameters<typeof convexAction>[0]) =>
      convexAction(args),
    onSuccess: (data) => {
      toast.success(successMessage)
      onSuccess?.(data as TData)
    },
    onError: (error: Error) => {
      toast.error(error.message || errorMessage || 'Operation failed')
    },
  })
}
