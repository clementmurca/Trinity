// backend/src/controllers/userController.js
import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'
import User from '../models/User.js'

// @desc    Get all users (with pagination)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  const users = await User.find({}).select('-password -refreshToken').skip(skip).limit(limit).sort({ createdAt: -1 })

  const total = await User.countDocuments()

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  })
})

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID format'
    })
  }

  const user = await User.findById(id).select('-password -refreshToken')

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }

  // Check if user is requesting their own data or is an admin
  if (user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to access this user's data"
    })
  }

  res.json({
    success: true,
    data: user
  })
})

// function to get all sellers
export const getSellers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  const sellers = await User.find({ status: 'seller' }).select('-password -refreshToken').skip(skip).limit(limit).sort({ createdAt: -1 })

  const total = await User.countDocuments({ status: 'seller' })

  res.json({
    success: true,
    data: {
      sellers,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  })
})

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID format'
    })
  }

  // Find user
  const user = await User.findById(id)

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }

  // Check authorization
  if (user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this user'
    })
  }

  const { firstName, lastName, phoneNumber, billing, status } = req.body

  // Validate and assign billing
  if (billing && (typeof billing !== 'object' || Array.isArray(billing))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid billing object'
    })
  }

  // Update fields
  user.firstName = firstName || user.firstName
  user.lastName = lastName || user.lastName
  user.phoneNumber = phoneNumber || user.phoneNumber
  user.billing = billing || user.billing

  // Allow admins to update status
  if (status && req.user.role === 'admin') {
    user.status = status
  }

  // Save updated user
  const updatedUser = await user.save()

  res.json({
    success: true,
    data: {
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      billing: updatedUser.billing,
      status: updatedUser.status,
      role: updatedUser.role
    }
  })
})

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  // Only allow admin to delete users
  if (req.user.role !== 'admin') {
    res.status(403)
    throw new Error('Not authorized to delete users')
  }

  await user.deleteOne()

  res.json({
    success: true,
    message: 'User deleted successfully'
  })
})

// @desc    Update user password
// @route   PUT /api/users/:id/password
// @access  Private
export const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  // Only allow users to change their own password
  if (user._id.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error("Not authorized to change this user's password")
  }

  const { currentPassword, newPassword } = req.validatedData

  // Check current password
  if (!(await user.comparePassword(currentPassword))) {
    res.status(400)
    throw new Error('Current password is incorrect')
  }

  user.password = newPassword
  await user.save()

  res.json({
    success: true,
    message: 'Password updated successfully'
  })
})
