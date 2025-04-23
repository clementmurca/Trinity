import React from 'react'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import axios from 'axios'
import { toast } from 'react-hot-toast'
const ProfilePage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    billing: {
      address: '',
      zipCode: '',
      city: '',
      country: '',
    },
  })

  const [initialFormData, setInitialFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    billing: {
      address: '',
      zipCode: '',
      city: '',
      country: '',
    },
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  })

  const [errors, setErrors] = useState({})
  const [csrfToken, setCsrfToken] = useState(null)

  const userId = JSON.parse(localStorage.getItem('user'))?.id

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const csrfResponse = await axios.get('/api/csrf-token', {
          withCredentials: true,
        })
        setCsrfToken(csrfResponse.data.csrfToken)

        const { data } = await axios.get(`/api/users/${userId}`, {
          withCredentials: true,
          headers: {
            'X-CSRF-Token': csrfResponse.data.csrfToken,
          },
        })

        const { firstName, lastName, phoneNumber, billing } = data.data
        setFormData({
          firstName,
          lastName,
          phoneNumber,
          billing: billing || {},
        })
        setInitialFormData({
          firstName,
          lastName,
          phoneNumber,
          billing: billing || {},
        })
      } catch (error) {
        toast.error('Error fetching initial data:', error)
        setErrors(prev => ({
          ...prev,
          profile: 'Failed to fetch user data. Please try again.',
        }))
      }
    }

    if (userId) {
      fetchInitialData()
    }
  }, [userId])

  const handleInputChange = e => {
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
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handlePasswordChange = e => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleProfileSubmit = async e => {
    e.preventDefault()

    if (!csrfToken) {
      setErrors(prev => ({
        ...prev,
        profile: 'CSRF token not available. Please refresh the page.',
      }))
      return
    }

    // Ensure billing is sent as an object
    const changedFields = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      billing: {
        address: formData.billing?.address || '',
        zipCode: formData.billing?.zipCode || '',
        city: formData.billing?.city || '',
        country: formData.billing?.country || '',
      },
    }

    toast.log('Payload being sent to backend:', changedFields)

    try {
      await axios.put(`/api/users/${userId}`, changedFields, {
        withCredentials: true,
        headers: {
          'X-CSRF-Token': csrfToken,
          'Content-Type': 'application/json',
        },
      })

      alert('Profile updated successfully')
      setErrors({})
    } catch (error) {
      toast.error('Error updating profile:', error)
      if (error.response?.data?.errors) {
        setErrors(prev => ({
          ...prev,
          ...error.response.data.errors.reduce((acc, err) => {
            acc[err.path] = err.message
            return acc
          }, {}),
        }))
      } else {
        setErrors(prev => ({
          ...prev,
          profile: error.response?.data?.message || 'Failed to update profile',
        }))
      }
    }
  }

  const handlePasswordSubmit = async e => {
    e.preventDefault()

    if (!csrfToken) {
      setErrors(prev => ({
        ...prev,
        password: 'CSRF token not available. Please refresh the page.',
      }))
      return
    }

    if (!passwordData.newPassword.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)) {
      setErrors(prev => ({
        ...prev,
        password: 'Password must be at least 8 characters and contain uppercase, lowercase, and numbers',
      }))
      return
    }

    try {
      await axios.put(`/api/users/${userId}/password`, passwordData, {
        withCredentials: true,
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      })
      alert('Password updated successfully')
      setPasswordData({ currentPassword: '', newPassword: '' })
      setErrors({})
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        password: error.response?.data?.message || 'Failed to update password',
      }))
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="bg-[#173334] text-white p-4 rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Personal Information</CardTitle>
          <p className="text-base">Manage your account settings</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {errors.profile && <p className="text-red-500 text-sm">{errors.profile}</p>}

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                  placeholder="First Name"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber || ''}
                onChange={handleInputChange}
                placeholder="+1234567890"
              />
              {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Billing Information</h3>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="billing.address"
                  value={formData.billing?.address || ''}
                  onChange={handleInputChange}
                  placeholder="Address"
                />
                {errors['billing.address'] && <p className="text-red-500 text-sm mt-1">{errors['billing.address']}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    name="billing.zipCode"
                    value={formData.billing?.zipCode || ''}
                    onChange={handleInputChange}
                    placeholder="Zip Code"
                  />
                  {errors['billing.zipCode'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['billing.zipCode']}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="billing.city"
                    value={formData.billing?.city || ''}
                    onChange={handleInputChange}
                    placeholder="City"
                  />
                  {errors['billing.city'] && <p className="text-red-500 text-sm mt-1">{errors['billing.city']}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="billing.country"
                  value={formData.billing?.country || ''}
                  onChange={handleInputChange}
                  placeholder="Country"
                />
                {errors['billing.country'] && <p className="text-red-500 text-sm mt-1">{errors['billing.country']}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white">
              Update Profile
            </Button>
          </form>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Change Password</h3>
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Current Password"
                />
              </div>

              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="New Password"
                />
              </div>

              <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white">
                Update Password
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfilePage
