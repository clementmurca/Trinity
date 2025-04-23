import { useEffect } from 'react'
import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm'

const LoginPage = () => {
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="w-full max-w-md mx-auto flex flex-col justify-center p-8">
        <LoginForm />
      </div>

      {/* Right Panel */}
      <div className="hidden lg:block w-[50%]">
        <img src="/background.jpg" alt="Star trails in night sky" className="w-full h-full object-cover" />
      </div>
    </div>
  )
}

export default LoginPage
