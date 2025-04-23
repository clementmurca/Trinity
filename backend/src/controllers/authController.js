// backend/src/controllers/authController.js
import { AppError, asyncHandler } from '../middleware/errorMiddleware.js'
import User from '../models/User.js'
import { generateToken, generateRefreshToken } from '../utils/jwt.js'

export const signup = asyncHandler(async (req, res) => {
  const { email, phoneNumber, role = 'user', ...rest } = req.validatedData

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phoneNumber }]
  })

  if (existingUser) {
    throw new AppError('Validation failed', 400, [
      {
        path: 'email',
        message: 'email or phone number already exists'
      }
    ])
  }

  // Create user
  const user = await User.create({
    ...rest,
    email,
    phoneNumber,
    role
  })

  // Send response
  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role
      }
    }
  })
})

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.validatedData

  const user = await User.findOne({
    $or: [{ email: identifier }, { phoneNumber: identifier }]
  }).select('+password')

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid credentials', 401)
  }

  const accessToken = generateToken(user._id)
  const refreshToken = generateRefreshToken(user._id)

  user.refreshToken = refreshToken
  await user.save()

  req.session.regenerate(err => {
    if (err) {
      console.error('Failed to regenerate session ID:', err)
      throw new AppError('Failed to regenerate session', 500)
    }
  })
  req.session.userId = user._id

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false,
    //secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  })

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status
      },
      tokens: {
        accessToken,
        refreshToken
      }
    }
  })
})

export const logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    throw new AppError('User not found', 404)
  }

  user.refreshToken = undefined
  await user.save()

  req.session.destroy()
  res.clearCookie('refreshToken')

  res.json({
    success: true,
    message: 'Logged out successfully'
  })
})

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    throw new AppError('Validation failed', 400, [
      {
        path: 'refreshToken',
        message: 'Required'
      }
    ])
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decoded.id)

    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError('Invalid credentials', 401)
    }

    const accessToken = generateToken(user._id)
    const newRefreshToken = generateRefreshToken(user._id)

    user.refreshToken = newRefreshToken
    await user.save()

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: false,
      //secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.json({
      success: true,
      data: {
        tokens: {
          accessToken
        }
      }
    })
  } catch (error) {
    throw new AppError('Invalid or expired refresh token', 401)
  }
})
