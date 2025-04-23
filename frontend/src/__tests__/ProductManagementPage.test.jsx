import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProductManagementPage from '../pages/ProductManagementPage'
import { vi } from 'vitest'
import axios from 'axios'

// ✅ Mock axios
vi.mock('axios')

// ✅ Ensure localStorage is mocked
beforeEach(() => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(key => (key === 'userId' ? '123' : 'fake-token')),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  })
})

// ✅ Mock product data
const mockProducts = [
  {
    _id: 'p1',
    name: 'Product A',
    brand: 'Brand X',
    price: 10,
    stock: 5,
    category: ['Electronics'],
    imageUrl: 'img1.jpg',
    sellerInfo: { price: 10, stock: 5 },
  },
]

axios.get.mockImplementation(url => {
  if (url.includes('/api/sellers/123/products')) {
    return Promise.resolve({ data: { data: mockProducts } })
  }
  return Promise.reject(new Error('Invalid API call'))
})

axios.patch.mockResolvedValue({ data: { message: 'Updated successfully' } })
axios.delete.mockResolvedValue({ data: { message: 'Deleted successfully' } })

describe('ProductManagementPage', () => {
  test('renders product list correctly', async () => {
    render(
      <MemoryRouter>
        <ProductManagementPage />
      </MemoryRouter>
    )

    await screen.findByText('Product A')
    expect(screen.getByText('Product A')).toBeInTheDocument()
    expect(screen.getByText('Brand X')).toBeInTheDocument()
    expect(screen.getByText('10€')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  test('opens edit modal and updates a product', async () => {
    render(
      <MemoryRouter>
        <ProductManagementPage />
      </MemoryRouter>
    )

    await screen.findByText('Product A')

    // ✅ Ensure the edit button is correctly selected
    const editButton = document.querySelector("button svg[data-slot='icon']")
    fireEvent.click(editButton)

    expect(screen.getByText('Modifier le produit')).toBeInTheDocument()

    // ✅ Change price and submit
    const priceInput = screen.getByLabelText('Prix')
    fireEvent.change(priceInput, { target: { value: '15' } })

    fireEvent.click(screen.getByRole('button', { name: /sauvegarder/i }))

    await waitFor(() => expect(axios.patch).toHaveBeenCalled())
  })

  test('opens delete modal and confirms deletion', async () => {
    render(
      <MemoryRouter>
        <ProductManagementPage />
      </MemoryRouter>
    )

    await screen.findByText('Product A')

    // ✅ Ensure the delete button is correctly selected
    const deleteButton = document.querySelector('button.text-red-500')
    fireEvent.click(deleteButton)

    expect(screen.getByText('Confirmer la suppression')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /oui/i }))

    await waitFor(() => expect(axios.delete).toHaveBeenCalled())
  })
})
