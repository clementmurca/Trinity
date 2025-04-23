import axios from 'axios'
import { refreshAccessToken } from './auth'
import { toast } from 'react-hot-toast'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

let csrfToken = null

// Fetch CSRF token from the server
const fetchCsrfToken = async () => {
  try {
    const response = await instance.get('/csrf-token')
    csrfToken = response.data.csrfToken
    console.log('CSRF Token fetched:', csrfToken)
  } catch (error) {
    toast.error('Failed to fetch CSRF Token:', error)
  }
}

fetchCsrfToken()

// Request interceptor with CSRF handling
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken
    }

    return config
  },
  error => {
    toast.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor with error handling
instance.interceptors.response.use(
  response => {
    toast.success('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    })
    return response
  },
  async error => {
    toast.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    })

    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const newAccessToken = await refreshAccessToken()

        if (newAccessToken) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
          return instance(originalRequest)
        } else {
          toast.error('Failed to refresh access token')
          localStorage.removeItem('user')
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
      } catch (refreshError) {
        toast.error('Token refresh error:', refreshError)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    }

    if (error.response) {
      switch (error.response.status) {
        case 403:
          toast.error('Permission denied')
          break
        case 404:
          toast.error('Resource not found')
          break
        case 422:
          toast.error('Validation error:', error.response.data)
          break
        case 500:
          toast.error('Server error:', error.response.data)
          break
      }
    }

    return Promise.reject({
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data,
    })
  }
)

// Health check function
instance.checkHealth = async () => {
  try {
    const response = await instance.get('/health')
    return response.data
  } catch (error) {
    toast.error('API Health Check Failed:', error)
    return false
  }
}

export default instance
