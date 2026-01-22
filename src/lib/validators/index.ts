import { z } from 'zod'

// Re-export zod for convenience
export { z }

// Common string validators
export const requiredString = z.string().min(1, 'This field is required')

export const email = z
  .email('Invalid email address')
  .min(1, 'Email is required')

export const phone = z
  .string()
  .min(1, 'Phone is required')
  .regex(/^\+?[\d\s-()]+$/, 'Invalid phone number')

// Common number validators
export const positiveNumber = z.number().positive('Must be a positive number')

export const positiveInt = z
  .number()
  .int()
  .positive('Must be a positive integer')

// Common currency/money validator
export const currency = z
  .number()
  .nonnegative('Amount cannot be negative')
  .multipleOf(0.01, 'Amount must have at most 2 decimal places')
