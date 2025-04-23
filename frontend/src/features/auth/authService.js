// frontend/src/features/auth/authService.js
import axios from '../../utils/axios'
import { toast } from 'react-hot-toast'

const register = async userData => {
  try {
    const response = await axios.post('/auth/signup', userData)

    // Validate response structure
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || 'Registration failed')
    }

    // Return the user data or success message
    return response.data
  } catch (error) {
    // Log error details for debugging
    toast.error('Registration error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config,
    })

    // Format error for UI
    const message = error.response?.data?.message || 'Registration failed. Please try again.'
    throw new Error(message)
  }
}

const login = async credentials => {
  try {
    const response = await axios.post('/auth/login', credentials)

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Login failed')
    }

    const { user, tokens } = response.data.data

    // Validate required data
    if (!user || !tokens || !tokens.accessToken || !tokens.refreshToken) {
      throw new Error('Invalid response format')
    }

    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
    localStorage.setItem('userId', user._id)

    return response.data.data
  } catch (error) {
    toast.error('Login error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    })

    if (error.response?.data) {
      throw {
        message: error.response.data.message || 'Login failed',
        errors: error.response.data.errors,
        status: error.response.status,
      }
    }
    throw { message: error.message }
  }
}

const logout = async () => {
  try {
    await axios.post('/auth/logout')
    toast.success('Logout API call successful')
  } catch (error) {
    toast.error('Logout error:', error)
    // Continue with cleanup even if API call fails
  } finally {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userId')
  }
}

// Helper function to check if user is logged in
const isLoggedIn = () => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  return !!(token && user)
}

// Helper function to get current auth state
const getAuthState = () => {
  try {
    return {
      user: JSON.parse(localStorage.getItem('user')),
      token: localStorage.getItem('token'),
      refreshToken: localStorage.getItem('refreshToken'),
      userId: localStorage.getItem('userId'),
      isAuthenticated: isLoggedIn(),
    }
  } catch (error) {
    toast.error('Error getting auth state:', error)
    return {
      user: null,
      token: null,
      refreshToken: null,
      userId: null,
      isAuthenticated: false,
    }
  }
}

const fetchProfile = async () => {
  try {
    const response = await axios.get('/auth/me')
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || 'Failed to fetch profile')
    }

    const user = response.data.data
    if (!user.role || !user.status) {
      throw new Error('User role or status is missing in the profile')
    }

    return user
  } catch (error) {
    toast.error('Fetch profile error:', error)
    throw error
  }
}  

const updateProfile = async profileData => {
  try {
    const response = await axios.put(`/users/${profileData.id}`, profileData) // Assuming '/users/:id' endpoint

    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || 'Profile update failed')
    }

    // Optionally update the stored user data
    const updatedUser = response.data.data
    localStorage.setItem('user', JSON.stringify(updatedUser))

    return updatedUser
  } catch (error) {
    toast.error('Update profile error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    })

    const message = error.response?.data?.message || 'Profile update failed. Please try again.'
    throw new Error(message)
  }
}

const authService = {
  register,
  login,
  logout,
  isLoggedIn,
  getAuthState,
  fetchProfile,
  updateProfile,
}

export default authService
