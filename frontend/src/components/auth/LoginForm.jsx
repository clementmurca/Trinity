import { useState } from 'react'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { login } from '../../features/auth/authSlice'
import { resetError } from '../../features/auth/authSlice'
import { toast } from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const LoginForm = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  })

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading, error } = useSelector(state => state.auth)

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const resultAction = await dispatch(login(formData))

      if (login.fulfilled.match(resultAction)) {
        // Récupération de l'utilisateur complet
        const user = resultAction.payload.user

        // Vérification de l'existence de _id ou id
        const userId = user?._id || user?.id

        if (userId) {
          // Stockage de l'utilisateur complet et de son ID
          localStorage.setItem('user', JSON.stringify(user))
          localStorage.setItem('userId', userId)

          dispatch(resetError())
          navigate('/')
        } else {
          toast.error('Invalid user data structure:', user)
          throw new Error('Invalid user data')
        }
      }
    } catch (error) {
      toast.error('Login error:', error)
    }
  }

  const handleGoogleLogin = () => {
    // Redirect to the backend Google OAuth endpoint
    window.location.href = `${API_URL}/auth/google`
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="w-full max-w-md mx-auto flex flex-col justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Login to your account</h1>
          <p className="text-sm text-zinc-500 mb-6">Enter your email below to login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 text-red-500 p-4 rounded-md text-center">{error}</div>}

          <div>
            <label className="block text-sm text-zinc-900 mb-2">Email</label>
            <Input
              type="email"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="m@example.com"
              className="w-full h-11 border-zinc-200 rounded-md bg-white"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm text-zinc-900">Password</label>
              <Link to="/forgot-password" className="text-sm text-zinc-500">
                Forgot your password?
              </Link>
            </div>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full h-11 border-zinc-200 rounded-md bg-white"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-zinc-900 text-white h-11 rounded-md hover:bg-zinc-800 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Signing in...' : 'Login'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-zinc-500">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-11 border border-zinc-200 text-zinc-900 rounded-md hover:bg-zinc-50 flex items-center justify-center gap-2"
          onClick={handleGoogleLogin}
        >
          <img
            src="https://img.icons8.com/?size=100&id=17949&format=png&color=000000"
            alt="Google Logo"
            className="w-5 h-5"
          />
          Login with Google
        </Button>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-zinc-900 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginForm
