import mongoose from 'mongoose'
import { ZodError } from 'zod'

// Graceful shutdown helper with proper error handling
const gracefulShutdown = async (server, source) => {
  console.log(`Initiating graceful shutdown (${source})...`)

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close(err => {
          if (err) return reject(err) // Ensure proper error handling
          console.log('Server closed')
          resolve()
        })
      })

      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close(false)
        console.log('Database connection closed')
      }
    }
  } catch (error) {
    console.error('Error during shutdown:', error)
  }

  // Set a timeout for force shutdown
  setTimeout(() => {
    console.error('Could not close connections in time, forcing shutdown')
    process.exit(1) // Use process.exit instead of throwing errors in async functions
  }, 10000)
}

// 404 Not Found Handler
export const notFound = (req, res, next) => {
  next(new AppError(`Not Found - ${req.originalUrl}`, 404))
}

// Centralized Error Handler Middleware
export const errorHandler = (err, req, res) => {
  // <-- Removed unused `next` to avoid ESLint warning
  let statusCode = err.statusCode || res.statusCode || 500
  let message = err.message
  let errors = null

  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      errors: err.errors
    })
  }

  if (err instanceof ZodError || err.name === 'ValidationError' || err.message === 'Invalid signup data') {
    statusCode = 400
    message = 'Validation failed'
    errors = Array.isArray(err.errors)
      ? err.errors.map(error => ({
          path: error.path ? error.path.join('.') : 'unknown', // Ensure path exists
          message: error.message || 'Validation error'
        }))
      : []

    const requiredFields = {
      lastName: 'Last name is required',
      email: 'Email is required',
      phoneNumber: 'Phone number is required',
      password: 'Password is required',
      'billing.address': 'Billing address is required',
      'billing.zipCode': 'Billing zip code is required',
      'billing.city': 'Billing city is required',
      'billing.country': 'Billing country is required'
    }

    for (const [field, msg] of Object.entries(requiredFields)) {
      const value = field.includes('.') ? field.split('.').reduce((obj, key) => obj && obj[key], req.body) : req.body[field]
      if (!value) errors.push({ path: field, message: msg })
    }
  } else if (err.code === 11000) {
    statusCode = 400
    message = 'Validation failed'
    errors = [{ path: Object.keys(err.keyPattern)[0], message: 'Already exists' }]
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400
    message = 'Validation failed'
    errors = [{ path: err.path, message: 'Invalid format' }]
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Invalid credentials'
  } else if (err.message === 'Not authorized, no token provided') {
    statusCode = 401
    message = err.message
  } else if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
    errors = err.errors
  } else {
    statusCode = 500
    message = 'An internal server error occurred'
    if (process.env.NODE_ENV === 'development') {
      errors = [{ path: 'server', message: err.message || 'Unexpected error' }]
    }
  }

  res.status(statusCode).json({ success: false, error: { status: statusCode, message, ...(errors && { errors }) } })
}

// Custom AppError class
export class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
    Error.captureStackTrace(this, this.constructor)
  }
}

// Async handler to catch errors
export const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// Setup Global Error Handlers
export const setupGlobalErrorHandlers = server => {
  process.on('uncaughtException', async error => {
    console.error('Uncaught Exception:', error)
    await gracefulShutdown(server, 'uncaught exception')
  })

  process.on('unhandledRejection', async error => {
    console.error('Unhandled Rejection:', error)
    await gracefulShutdown(server, 'unhandled rejection')
  })
}

export { gracefulShutdown }
