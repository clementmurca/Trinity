import cookieParser from 'cookie-parser'
import express from 'express'
import { validationResult } from 'express-validator'
import morgan from 'morgan'
export const configureBasicMiddleware = app => {
  // Parse JSON bodies
  app.use(express.json())

  // Parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true }))

  // Parse Cookie header and populate req.cookies
  app.use(cookieParser())

  // HTTP request logger
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
  }

  // Global sanitization for input fields
  app.use((req, res, next) => {
    try {
      // Sanitize and validate inputs manually where needed
      if (req.body && typeof req.body === 'object') {
        for (const key in req.body) {
          if (typeof req.body[key] === 'string') {
            req.body[key] = req.body[key].trim() // Remove whitespace
            req.body[key] = req.body[key].replace(/<[^>]*>/g, '') // Basic XSS protection
          }
        }
      }
      next()
    } catch (error) {
      console.error('Error sanitizing inputs:', error)
      return res.status(400).json({ success: false, message: 'Invalid input' })
    }
  })

  // Validate incoming data
  app.use((req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }
    next()
  })
}
