import React from 'react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { register } from '../../features/auth/authSlice'
import { toast } from 'react-hot-toast'

const SignupForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    billing: {
      address: '',
      zipCode: '',
      city: '',
      country: '',
    },
  })

  const [validationErrors, setValidationErrors] = useState({})
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading, error } = useSelector(state => state.auth)

  const validateForm = () => {
    const errors = {}

    if (formData.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters'
    }
    if (formData.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number'
    }

    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }
    if (!/\d/.test(formData.password) || !/[a-zA-Z]/.test(formData.password)) {
      errors.password = 'Password must contain both letters and numbers'
    }

    if (formData.billing.address.length < 5) {
      errors['billing.address'] = 'Please enter a valid address'
    }
    if (formData.billing.zipCode.length < 3) {
      errors['billing.zipCode'] = 'Please enter a valid zip code'
    }
    if (formData.billing.city.length < 2) {
      errors['billing.city'] = 'Please enter a valid city'
    }
    if (formData.billing.country.length < 2) {
      errors['billing.country'] = 'Please enter a valid country'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = e => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      // Send `billing` fields as a nested object
      const formattedData = {
        ...formData,
        phoneNumber: `+${formData.phoneNumber.trim()}`,
        billing: {
          address: formData.billing.address.trim(),
          zipCode: formData.billing.zipCode.trim(),
          city: formData.billing.city.trim(),
          country: formData.billing.country.trim(),
        },
      }

      await dispatch(register(formattedData)).unwrap() // Handle signup only
      toast.log('Registration successful:')
      navigate('/login')
    } catch (err) {
      toast.error('Registration failed:', err)
      setValidationErrors(prev => ({
        ...prev,
        submit: err.message || 'Registration failed. Please try again.',
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Your Account</h2>
        <p className="text-gray-600 mb-6">Join our platform and start exploring all the features</p>

        {(error || validationErrors.submit) && (
          <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">{error || validationErrors.submit}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              className="mt-1"
            />
            {validationErrors.firstName && <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>}
          </div>
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              className="mt-1"
            />
            {validationErrors.lastName && <p className="text-red-500 text-sm mt-1">{validationErrors.lastName}</p>}
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@example.com"
            className="mt-1"
          />
          {validationErrors.email && <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>}
        </div>

        <div className="mt-4">
          <Label htmlFor="phoneNumber">Phone Number *</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+1234567890"
            className="mt-1"
          />
          {validationErrors.phoneNumber && <p className="text-red-500 text-sm mt-1">{validationErrors.phoneNumber}</p>}
        </div>

        <div className="mt-4">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="********"
            className="mt-1"
          />
          {validationErrors.password && <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>}
        </div>

        <h3 className="text-lg font-medium text-gray-900 mt-6">Billing Information</h3>

        <div className="mt-4">
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            name="billing.address"
            value={formData.billing.address}
            onChange={handleChange}
            placeholder="123 Main St"
            className="mt-1"
          />
          {validationErrors['billing.address'] && (
            <p className="text-red-500 text-sm mt-1">{validationErrors['billing.address']}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="zipCode">Zip Code *</Label>
            <Input
              id="zipCode"
              name="billing.zipCode"
              value={formData.billing.zipCode}
              onChange={handleChange}
              placeholder="12345"
              className="mt-1"
            />
            {validationErrors['billing.zipCode'] && (
              <p className="text-red-500 text-sm mt-1">{validationErrors['billing.zipCode']}</p>
            )}
          </div>
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              name="billing.city"
              value={formData.billing.city}
              onChange={handleChange}
              placeholder="New York"
              className="mt-1"
            />
            {validationErrors['billing.city'] && (
              <p className="text-red-500 text-sm mt-1">{validationErrors['billing.city']}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="country">Country *</Label>
          <Input
            id="country"
            name="billing.country"
            value={formData.billing.country}
            onChange={handleChange}
            placeholder="USA"
            className="mt-1"
          />
          {validationErrors['billing.country'] && (
            <p className="text-red-500 text-sm mt-1">{validationErrors['billing.country']}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className={`w-full mt-6 bg-zinc-900 text-white py-2 rounded-md ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </Button>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link to="/login" className="text-zinc-900 hover:underline">
            Log in
          </Link>
        </p>

        <p className="mt-4 text-sm text-gray-500">
          By signing up, you agree to our{' '}
          <a href="#" className="text-blue-600">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-blue-600">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </form>
  )
}

export default SignupForm
