import { signupSchema, loginSchema, updateUserSchema, updatePasswordSchema } from '../utils/validation.js'
import { AppError } from './errorMiddleware.js'

const createValidationMiddleware =
  (schema = {}) =>
  (req, res, next) => {
    try {
      console.log('Incoming request body:', req.body) // Log raw request body

      const cleanBody = { ...req.body }
      console.log('Cleaned request body:', cleanBody) // Log cleaned body

      // If billing exists but is not an object, throw an error
      if (cleanBody.billing && typeof cleanBody.billing !== 'object') {
        console.error('Billing validation error: Billing is not an object.')
        throw new AppError('Validation failed', 400, [{ path: 'billing', message: 'Expected object, received non-object value' }])
      }

      const result = schema.safeParse(cleanBody)

      if (!result.success) {
        console.error('Validation errors:', result.error.issues)
        const errors = result.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
        return next(new AppError('Validation failed', 400, errors))
      }

      req.validatedData = result.data
      next()
    } catch (error) {
      console.error('Validation Error:', error)
      next(new AppError('Validation failed', 400))
    }
  }

export const validateSignup = (req, res, next) => {
  if (req.user?.googleId) return next()
  return createValidationMiddleware(signupSchema)(req, res, next)
}

export const validateLogin = createValidationMiddleware(loginSchema)
export const validateUpdateUser = createValidationMiddleware(updateUserSchema)
console.log('Validating update user request...')
export const validateUpdatePassword = createValidationMiddleware(updatePasswordSchema)
