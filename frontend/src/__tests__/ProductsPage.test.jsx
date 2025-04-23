// ProductsPage.test.jsx
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProductsPage from '../pages/ProductsPage'
import axios from 'axios'
import { vi } from 'vitest'

vi.mock('axios')

describe('ProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders product list correctly', async () => {
    const mockProducts = [
      { code: 'p1', name: 'Product A', price: 10, category: ['Electronics'], imageUrl: 'img1.jpg' },
      { code: 'p2', name: 'Product B', price: 20, category: ['Clothing'], imageUrl: 'img2.jpg' },
    ]
    axios.get.mockResolvedValue({ data: mockProducts })

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Chargement.../i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument()
      expect(screen.getByText('Product B')).toBeInTheDocument()
    })
  })

  test('filters products based on search', async () => {
    const mockProducts = [
      { code: 'p1', name: 'Product A', price: 10, category: ['Electronics'], imageUrl: 'img1.jpg' },
      { code: 'p2', name: 'Product B', price: 20, category: ['Clothing'], imageUrl: 'img2.jpg' },
    ]
    axios.get.mockResolvedValue({ data: mockProducts })

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Your search...')
    fireEvent.change(searchInput, { target: { value: 'Product A' } })

    expect(screen.getByText('Product A')).toBeInTheDocument()
    expect(screen.queryByText('Product B')).not.toBeInTheDocument()
  })

  test('paginates products correctly', async () => {
    const manyProducts = Array.from({ length: 20 }, (_, i) => ({
      code: `p${i + 1}`,
      name: `Product ${i + 1}`,
      price: (i + 1) * 5,
      category: ['Category1'],
      imageUrl: `img${i + 1}.jpg`,
    }))

    axios.get.mockResolvedValue({ data: manyProducts })

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument()
    })

    for (let i = 1; i <= 9; i++) {
      expect(screen.getByText(`Product ${i}`)).toBeInTheDocument()
    }
    expect(screen.queryByText('Product 10')).not.toBeInTheDocument()

    const nextButton = screen.getByLabelText('Go to next page')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Product 10')).toBeInTheDocument()
    })

    for (let i = 10; i <= 18; i++) {
      expect(screen.getByText(`Product ${i}`)).toBeInTheDocument()
    }
  })
})
