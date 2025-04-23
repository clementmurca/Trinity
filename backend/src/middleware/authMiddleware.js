import asyncHandler from 'express-async-handler'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Protect routes - Verify JWT token or session token
export const protect = asyncHandler(async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]

      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      req.user = await User.findById(decoded.id).select('-password -refreshToken')

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists'
        })
      }

      next()
    } catch (error) {
      console.error('JWT verification error:', error)

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token' })
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired' })
      } else {
        return res.status(401).json({ success: false, message: 'Not authorized' })
      }
    }
  } else if (req.session && req.session.userId) {
    // Check for session token
    try {
      req.user = await User.findById(req.session.userId).select('-password')

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Session expired or user not found'
        })
      }

      next()
    } catch (error) {
      console.error('Session token validation error:', error)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token or session required'
    })
  }
})

// Admin middleware - Requires user to be an admin
export const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as admin' })
  }
})

// Optional authentication middleware
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-password')
    } catch (error) {
      console.error('Optional auth error:', error)
    }
  } else if (req.session && req.session.userId) {
    try {
      req.user = await User.findById(req.session.userId).select('-password')
    } catch (error) {
      console.error('Optional session auth error:', error)
    }
  }

  next()
})

// Verify refresh token middleware
export const verifyRefreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token required' })
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findOne({
      _id: decoded.id,
      refreshToken: refreshToken
    })

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Refresh token validation error:', error)
    return res.status(401).json({
      success: false,
      message: error.name === 'TokenExpiredError' ? 'Refresh token expired' : 'Invalid refresh token'
    })
  }
})

// Rate limiting per user middleware
export const userRateLimit = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    next()
    return
  }

  const key = `rateLimit:${req.user._id}`
  const limit = 100 // requests
  const windowMs = 15 * 60 * 1000 // 15 minutes

  // Note: In production, use Redis for distributed rate limiting
  if (!global.rateLimitMap) {
    global.rateLimitMap = new Map()
  }

  const current = global.rateLimitMap.get(key) || { count: 0, resetTime: Date.now() + windowMs }

  if (Date.now() > current.resetTime) {
    current.count = 0
    current.resetTime = Date.now() + windowMs
  }

  if (current.count >= limit) {
    res.status(429).json({ success: false, message: 'Too many requests, please try again later' })
    return
  }

  current.count++
  global.rateLimitMap.set(key, current)

  res.setHeader('X-RateLimit-Limit', limit)
  res.setHeader('X-RateLimit-Remaining', limit - current.count)
  res.setHeader('X-RateLimit-Reset', current.resetTime)

  next()
})

// Middleware seller
export const seller = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.status === 'seller') {
    next()
  } else {
    res.status(403)
    throw new Error('Not authorized as seller')
  }
})

// Check user owns resource middleware
export const checkOwnership = (Model, paramIdField = 'id') =>
  asyncHandler(async (req, res, next) => {
    const resource = await Model.findById(req.params[paramIdField])

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' })
    }

    // Check if user owns the resource or is admin or is the seller of the resource
    if (
      resource.user?.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      (req.user.status !== 'seller' || resource.seller?.toString() !== req.user._id.toString())
    ) {
      res.status(403)
      throw new Error('Not authorized to access this resource')
    }

    req.resource = resource
    next()
  })

// Combined Middleware for admin and seller
export const adminOrSeller = asyncHandler(async (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.status === 'seller')) {
    next()
  } else {
    res.status(403)
    throw new Error('Not authorized. Requires admin or seller privileges')
  }
})
