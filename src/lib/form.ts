/**
 * TanStack Form utilities for the application.
 *
 * Zod 4 supports Standard Schema natively, so no adapter is needed.
 * Simply pass Zod schemas directly to validators.
 *
 * Usage:
 * ```tsx
 * import { useForm } from '@tanstack/react-form'
 * import { z } from '@/lib/validators'
 *
 * const form = useForm({
 *   defaultValues: { email: '' },
 *   onSubmit: async ({ value }) => { ... }
 * })
 *
 * <form.Field
 *   name="email"
 *   validators={{ onChange: z.string().email() }}
 * >
 *   {(field) => <Input ... />}
 * </form.Field>
 * ```
 */

// Re-export useForm for convenience
export { useForm } from '@tanstack/react-form'
