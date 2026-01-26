import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toast } from 'sonner'

import { useConvexMutation } from '@/lib/convex'

type ConvexMutationFn = Parameters<typeof useConvexMutation>[0]

interface CRUDMutationOptions<TData = unknown> {
  /** Message shown on success toast */
  successMessage: string
  /** Fallback message if error has no message */
  errorMessage?: string
  /** Callback after successful mutation - receives mutation result */
  onSuccess?: (data: TData) => void
  /** Whether to invalidate all queries on success (default: true) */
  invalidateQueries?: boolean
}

/**
 * Wrapper around useMutation + useConvexMutation that handles:
 * - Success toast
 * - Error toast with fallback message
 * - Query invalidation
 * - Optional onSuccess callback with mutation result
 *
 * @example
 * ```tsx
 * const deleteMutation = useCRUDMutation(api.tags.delete_, {
 *   successMessage: 'Tag deleted',
 *   errorMessage: 'Failed to delete tag',
 * })
 *
 * const createMutation = useCRUDMutation(api.tags.create, {
 *   successMessage: 'Tag created!',
 *   errorMessage: 'Failed to create tag',
 *   onSuccess: () => onOpenChange(false),
 * })
 *
 * // With return value
 * const updateMutation = useCRUDMutation(api.orgs.update, {
 *   successMessage: 'Updated!',
 *   onSuccess: (result) => {
 *     if (result?.slug !== currentSlug) navigate(...)
 *   },
 * })
 * ```
 */
export function useCRUDMutation<T extends ConvexMutationFn, TData = unknown>(
  mutationFn: T,
  options: CRUDMutationOptions<TData>,
) {
  const queryClient = useQueryClient()
  const convexMutation = useConvexMutation(mutationFn)

  const {
    successMessage,
    errorMessage,
    onSuccess,
    invalidateQueries = true,
  } = options

  return useMutation({
    mutationFn: (args: Parameters<typeof convexMutation>[0]) =>
      convexMutation(args),
    onSuccess: (data) => {
      toast.success(successMessage)
      if (invalidateQueries) {
        queryClient.invalidateQueries()
      }
      onSuccess?.(data as TData)
    },
    onError: (error: Error) => {
      toast.error(error.message || errorMessage || 'Operation failed')
    },
  })
}
