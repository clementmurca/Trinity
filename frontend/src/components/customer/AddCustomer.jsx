'use client'

import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { register } from '../../features/auth/authSlice'
import { toast } from 'react-hot-toast'

const AddCustomer = () => {
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    billing: {
      address: '',
      city: '',
      zipCode: '',
      country: '',
    },
  })

  const [errors, setErrors] = React.useState({})
  const [successMessage, setSuccessMessage] = React.useState('') // Success message state

  const dispatch = useDispatch()
  const { isLoading } = useSelector(state => state.auth)

  // Handle input change
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
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  // Validate Form
  const validateForm = () => {
    const newErrors = {}

    if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters.'
    }
    if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters.'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.'
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.'
    }

    if (formData.billing.address.length < 5) {
      newErrors['billing.address'] = 'Please enter a valid address.'
    }
    if (formData.billing.zipCode.length < 3) {
      newErrors['billing.zipCode'] = 'Please enter a valid zip code.'
    }
    if (formData.billing.city.length < 2) {
      newErrors['billing.city'] = 'Please enter a valid city.'
    }
    if (formData.billing.country.length < 2) {
      newErrors['billing.country'] = 'Please enter a valid country.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const newUser = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        billing: {
          address: formData.billing.address.trim(),
          zipCode: formData.billing.zipCode.trim(),
          city: formData.billing.city.trim(),
          country: formData.billing.country.trim(),
        },
      }

      await dispatch(register(newUser)).unwrap() // Dispatch the register action

      // Display success message
      setSuccessMessage('✅ User has been created successfully!')

      // Clear the form fields
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        billing: {
          address: '',
          city: '',
          zipCode: '',
          country: '',
        },
      })

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      toast.error('Failed to create customer:', err)
      setErrors(prev => ({
        ...prev,
        submit: err.message || 'Failed to create customer. Please try again.',
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-8">
      {/* Success Message */}
      {successMessage && <p className="text-green-500 text-center">{successMessage}</p>}

      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" name="firstName" onChange={handleChange} value={formData.firstName} />
            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" name="lastName" onChange={handleChange} value={formData.lastName} />
            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" onChange={handleChange} value={formData.email} />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        <Separator className="my-4" />
        <Separator className="my-4" />

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" onChange={handleChange} value={formData.password} />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            onChange={handleChange}
            value={formData.confirmPassword}
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
        </div>

        <Separator className="my-4" />
        <Separator className="my-4" />

        <div className="grid gap-2">
          <Label htmlFor="phoneNumber">Phone</Label>
          <Input id="phoneNumber" name="phoneNumber" onChange={handleChange} value={formData.phoneNumber} />
        </div>

        <Separator className="my-4" />
        <Separator className="my-4" />

        <div className="grid gap-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="billing.address" onChange={handleChange} value={formData.billing.address} />
        </div>

        <div className="grid grid-cols-10 gap-4">
          <div className="col-span-9 grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="billing.city" onChange={handleChange} value={formData.billing.city} />
          </div>
          <div className="col-span-1 grid gap-2">
            <Label htmlFor="zipCode">Zip code</Label>
            <Input id="zipCode" name="billing.zipCode" onChange={handleChange} value={formData.billing.zipCode} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="billing.country" onChange={handleChange} value={formData.billing.country} />
        </div>
      </div>

      {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create new customer'}
      </Button>
    </form>
  )
}

export default AddCustomer
