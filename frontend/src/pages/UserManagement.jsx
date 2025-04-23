import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import axios from 'axios'
import { toast } from 'react-hot-toast'
const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [error, setError] = useState(null)
  const [csrfToken, setCsrfToken] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    billing: {
      address: '',
      zipCode: '',
      city: '',
      country: '',
    },
    role: 'user',
    status: 'customer',
  })

  // Fetch CSRF Token and Users
  const fetchCsrfTokenAndUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const csrfResponse = await axios.get('/api/csrf-token', {
        withCredentials: true,
      })
      setCsrfToken(csrfResponse.data.csrfToken)

      const { data } = await axios.get('/api/users', {
        withCredentials: true,
        headers: {
          'X-CSRF-Token': csrfResponse.data.csrfToken,
        },
      })
      setUsers(data.data.users)
    } catch (error) {
      toast.error('Error fetching users or CSRF token:', error)
      setError('Failed to fetch users. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  // Validate form inputs
  const validateForm = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setError('Please fill in all required fields.')
      return false
    }
    return true
  }

  // Handle input changes
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

  // Save or Update User
  const handleSaveUser = async () => {
    if (!validateForm()) return

    // Clean the payload to remove unrecognized keys
    const cleanedFormData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      billing: formData.billing,
      role: formData.role,
      status: formData.status,
    }

    try {
      const config = {
        withCredentials: true,
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      }

      if (currentUser) {
        // For updating existing user
        await axios.put(`/api/users/${currentUser._id}`, cleanedFormData, config)
      } else {
        // For creating a new user
        await axios.post('/api/users', cleanedFormData, config)
      }

      fetchCsrfTokenAndUsers()
      setShowModal(false)
    } catch (error) {
      toast.error('Error saving user:', error)
      setError('Failed to save user. Please try again later.')
    }
  }

  // Edit User
  const handleEditUser = user => {
    setCurrentUser(user)
    setFormData(user)
    setShowModal(true)
  }

  // Delete User
  const handleDeleteUser = async userId => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${userId}`, {
          withCredentials: true,
          headers: {
            'X-CSRF-Token': csrfToken,
          },
        })
        fetchCsrfTokenAndUsers()
      } catch (error) {
        toast.error('Error deleting user:', error)
        setError('Failed to delete user. Please try again later.')
      }
    }
  }

  // Fetch CSRF Token and Users on Component Load
  useEffect(() => {
    fetchCsrfTokenAndUsers()
  }, [])

  const filteredUsers = users.filter(
    user =>
      user.firstName.toLowerCase().includes(filter.toLowerCase()) ||
      user.lastName.toLowerCase().includes(filter.toLowerCase()) ||
      user.email.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="flex items-center gap-4 mb-4">
        <Input placeholder="Filter users..." value={filter} onChange={e => setFilter(e.target.value)} />
        {/* <Button
          onClick={() => {
            setCurrentUser(null);
            setFormData({
              firstName: "",
              lastName: "",
              email: "",
              phoneNumber: "",
              billing: { address: "", zipCode: "", city: "", country: "" },
              role: "user",
              status: "customer",
            });
            setShowModal(true);
          }}
        >
          Add User
        </Button> */}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan="8" className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map(user => (
              <TableRow key={user._id}>
                <TableCell>
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phoneNumber}</TableCell>
                <TableCell>{user.billing?.address}</TableCell>
                <TableCell>{user.billing?.country}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.status}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user._id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Add/Edit User Modal */}
      {showModal && (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentUser ? 'Edit User' : 'Add User'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone</Label>
                <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="billing.address">Address</Label>
                <Input
                  id="billing.address"
                  name="billing.address"
                  value={formData.billing.address}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="billing.country">Country</Label>
                <Input
                  id="billing.country"
                  name="billing.country"
                  value={formData.billing.country}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full"
                >
                  <option value="customer">Customer</option>
                  <option value="seller">Seller</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveUser}>{currentUser ? 'Save Changes' : 'Add User'}</Button>
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default UserManagement
