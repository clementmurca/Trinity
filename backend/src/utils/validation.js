// backend/src/utils/validation.js
import { z } from 'zod'

// Validation schemas using Zod
export const signupSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address'),
    phoneNumber: z
      .string()
      .regex(/^\+?[0-9]{8,15}$/, 'Invalid phone number')
      .optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    billing: z
      .object({
        address: z.string().min(5, 'Address must be at least 5 characters').optional(),
        zipCode: z.string().min(3, 'Invalid zip code').optional(),
        city: z.string().min(2, 'City must be at least 2 characters').optional(),
        country: z.string().min(2, 'Country must be at least 2 characters').optional()
      })
      .optional(),
    role: z.enum(['user', 'admin']).default('user')
  })
  .strict()

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone number is required'),
  password: z.string().min(1, 'Password is required').optional()
})

// Helper function to validate data
export const validateData = (schema, data) => {
  try {
    return { success: true, data: schema.parse(data) }
  } catch (error) {
    return {
      success: false,
      errors: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    }
  }
}

// Only validate billing if it exists and has non-empty values
const billingSchema = z
  .object({
    address: z.string().min(5, 'Address must be at least 5 characters').optional(),
    zipCode: z.string().min(3, 'Invalid zip code').optional(),
    city: z.string().min(2, 'City must be at least 2 characters').optional(),
    country: z.string().min(2, 'Country must be at least 2 characters').optional()
  })
  .optional() // Allows the entire billing object to be optional

export const updateUserSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
    phoneNumber: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
      .optional(),
    billing: billingSchema,
    role: z.enum(['user', 'admin']).optional(),
    status: z.enum(['customer', 'seller']).optional()
  })
  .strict()

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
})
