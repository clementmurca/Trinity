import axios from './axios'
import { toast } from 'react-hot-toast'

export const refreshAccessToken = async () => {
  try {
    // Call the backend's refresh-token endpoint
    const response = await axios.post('/auth/refresh-token', {}, { withCredentials: true })

    // Extract the new access token
    const { tokens } = response.data.data

    // Store the new access token in localStorage
    localStorage.setItem('token', tokens.accessToken)

    return tokens.accessToken // Return for retrying failed requests
  } catch (error) {
    toast.error('Failed to refresh token:', error)
    return null // Return null if refresh fails
  }
}
