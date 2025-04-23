// ProfilePage.test.jsx
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProfilePage from '../pages/ProfilePage'
import axios from 'axios'
import { vi } from 'vitest'

vi.mock('axios')

vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    log: vi.fn(),
  },
}))

const localStorageMock = {
  getItem: vi.fn(key => (key === 'user' ? JSON.stringify({ id: '123' }) : null)),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
}
vi.stubGlobal('localStorage', localStorageMock)

const mockCsrfResponse = { data: { csrfToken: 'fake-csrf-token' } }
const mockUserResponse = {
  data: {
    data: {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      billing: {
        address: '123 Street',
        zipCode: '12345',
        city: 'New York',
        country: 'USA',
      },
    },
  },
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders profile form correctly', async () => {
    axios.get.mockImplementation(url => {
      if (url === '/api/csrf-token') {
        return Promise.resolve(mockCsrfResponse)
      }
      if (url === '/api/users/123') {
        return Promise.resolve(mockUserResponse)
      }
      return Promise.reject(new Error('Invalid API call'))
    })

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue('123 Street')).toBeInTheDocument()
    expect(screen.getByDisplayValue('12345')).toBeInTheDocument()
    expect(screen.getByDisplayValue('New York')).toBeInTheDocument()
    expect(screen.getByDisplayValue('USA')).toBeInTheDocument()
  })

  test('allows user to update profile inputs', async () => {
    axios.get.mockImplementation(url => {
      if (url === '/api/csrf-token') return Promise.resolve(mockCsrfResponse)
      if (url === '/api/users/123') return Promise.resolve(mockUserResponse)
      return Promise.reject(new Error('Invalid API call'))
    })

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument()
    })

    const firstNameInput = screen.getByPlaceholderText('First Name')
    fireEvent.change(firstNameInput, { target: { value: 'Alice' } })
    expect(firstNameInput.value).toBe('Alice')
  })

  test('submits profile update', async () => {
    axios.get.mockImplementation(url => {
      if (url === '/api/csrf-token') return Promise.resolve(mockCsrfResponse)
      if (url === '/api/users/123') return Promise.resolve(mockUserResponse)
      return Promise.reject(new Error('Invalid API call'))
    })

    axios.put.mockResolvedValue({ data: { message: 'Updated successfully' } })

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument()
    })

    const updateButton = screen.getByRole('button', { name: /update profile/i })
    fireEvent.click(updateButton)

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        '/api/users/123',
        {
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+1234567890',
          billing: {
            address: '123 Street',
            zipCode: '12345',
            city: 'New York',
            country: 'USA',
          },
        },
        {
          withCredentials: true,
          headers: {
            'X-CSRF-Token': 'fake-csrf-token',
            'Content-Type': 'application/json',
          },
        }
      )
    })
  })
})
