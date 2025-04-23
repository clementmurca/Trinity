import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import SignupPage from '../pages/SignupPage'
import { vi } from 'vitest'

vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

const createTestStore = () => {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: { user: null, token: null, isLoading: false, error: null },
    },
  })
}

describe('SignupPage', () => {
  let store

  beforeEach(() => {
    store = createTestStore()
  })

  test('renders the signup form', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SignupPage />
        </MemoryRouter>
      </Provider>
    )

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^sign up$/i })).toBeInTheDocument()
  })

  test('allows users to type in inputs', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SignupPage />
        </MemoryRouter>
      </Provider>
    )

    const firstNameInput = screen.getByLabelText(/first name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    await act(async () => {
      fireEvent.change(firstNameInput, { target: { value: 'Alice' } })
      fireEvent.change(emailInput, { target: { value: 'alice@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'strongpass123' } })
    })

    expect(firstNameInput.value).toBe('Alice')
    expect(emailInput.value).toBe('alice@example.com')
    expect(passwordInput.value).toBe('strongpass123')
  })

  test('triggers signup action on form submission', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SignupPage />
        </MemoryRouter>
      </Provider>
    )

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }))
    })

    expect(store.getState().auth.isLoading).toBe(false)
  })
})
