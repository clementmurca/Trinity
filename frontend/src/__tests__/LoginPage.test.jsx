import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import LoginPage from '../pages/LoginPage'
import { vi } from 'vitest'

// ✅ Mock `react-hot-toast` to avoid real notifications
vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

// ✅ Create a Redux store for testing
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isLoading: false,
        error: null,
        ...preloadedState,
      },
    },
  })
}

describe('LoginPage', () => {
  let store

  beforeEach(() => {
    store = createTestStore()
  })

  test('renders login form correctly', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    )

    // ✅ Use getByPlaceholderText for better selection
    expect(screen.getByPlaceholderText(/m@example.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument()
  })

  test('allows input changes', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    )

    // ✅ Use getByPlaceholderText for accuracy
    const emailInput = screen.getByPlaceholderText(/m@example.com/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
    })

    expect(emailInput.value).toBe('user@example.com')
    expect(passwordInput.value).toBe('password123')
  })

  test('handles form submission', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    )

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^login$/i }))
    })

    // ✅ Ensure Redux state is updated (no API request made)
    expect(store.getState().auth.isLoading).toBe(false)
  })
})
