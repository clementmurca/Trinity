// frontend/src/pages/SignupPage.jsx
import React from 'react'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import SignupForm from '../components/auth/SignupForm'

const SignupPage = () => {
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Form Section */}
      <div className="mt-10">
        <SignupForm />
      </div>
    </div>
  )
}

export default SignupPage
