import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from './authService'
import { toast } from 'react-hot-toast'

// Get user and token from localStorage if they exist
const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
const token = localStorage.getItem('token')

const initialState = {
  user: user || null,
  token: token || null,
  isLoading: false,
  error: null,
}

// Async thunk for registration
export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const response = await authService.register(userData)
    return response // Return the entire response
  } catch (error) {
    // Enhanced error handling
    const message =
      error.response?.data?.errors?.[0]?.message || // Try to get specific error message
      error.response?.data?.message || // Fallback to general error message
      'Registration failed. Please try again.' // Default message
    return thunkAPI.rejectWithValue(message)
  }
})

// Async thunk for login
export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try {
    const response = await authService.login(credentials)
    const { user, tokens } = response

    // Validate role and status
    if (!user.role || !user.status) {
      toast.error('Role or status missing in login response:', user)
      throw new Error('User role or status is missing')
    }

    // Store token and user in localStorage
    if (tokens?.accessToken) {
      localStorage.setItem('token', tokens.accessToken)
      localStorage.setItem('user', JSON.stringify(user))
    }

    // Return only the data Redux needs
    return { user, tokens }
  } catch (error) {
    const message = error.response?.data?.message || 'Login failed. Please check your credentials.'
    return thunkAPI.rejectWithValue(message)
  }
})

// Async thunk for logout
export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authService.logout()
    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userId')
  } catch (error) {
    toast.error('Logout error:', error)
    // Even if logout fails, we still want to clear local state
  }
})

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetError: state => {
      state.error = null
    },
    resetState: state => {
      state.user = null
      state.token = null
      state.isLoading = false
      state.error = null
    },
    setUser: (state, action) => {
      if (!action.payload.user.role || !action.payload.user.status) {
        toast.error('Role or status is missing in the user object')
      }
      state.user = action.payload.user
      state.token = action.payload.token
    },
  },
  extraReducers: builder => {
    builder
      // Register cases
      .addCase(register.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user // Updated to match your backend response
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.user = null
      })

      // Login cases
      .addCase(login.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.tokens.accessToken
        state.error = null
        // Sauvegarder l'ID dans le localStorage
        if (action.payload.user?._id) {
          localStorage.setItem('userId', action.payload.user._id)
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.user = null
        state.token = null
      })

      // Logout cases
      .addCase(logout.pending, state => {
        state.isLoading = true
      })
      .addCase(logout.fulfilled, state => {
        state.user = null
        state.token = null
        state.isLoading = false
        state.error = null
      })
      .addCase(logout.rejected, state => {
        state.isLoading = false
        // Still clear the state even if logout fails
        state.user = null
        state.token = null
      })
  },
})

// Export actions and reducer
export const { resetError, resetState, setUser } = authSlice.actions
export default authSlice.reducer

// Selectors
export const selectUser = state => state.auth.user
export const selectToken = state => state.auth.token
export const selectIsLoading = state => state.auth.isLoading
export const selectError = state => state.auth.error
