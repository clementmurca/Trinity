import React from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categories, setCategories] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 9

  const navigate = useNavigate()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/products')
        setProducts(response.data)
        setFilteredProducts(response.data)
        const uniqueCategories = [...new Set(response.data.flatMap(product => product.category))]
        const categoryObj = uniqueCategories.reduce((acc, cat) => ({ ...acc, [cat]: false }), {})
        setCategories(categoryObj)
        setLoading(false)
      } catch (err) {
        setError('Erreur lors du chargement des produits', err)
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    const results = products.filter(
      product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (Object.values(categories).every(v => v === false) || product.category.some(cat => categories[cat]))
    )
    setFilteredProducts(results)
    setCurrentPage(1)
  }, [searchTerm, categories, products])

  const handleCardClick = code => {
    navigate(`/product/${code}`)
  }

  const handleSearchChange = event => {
    setSearchTerm(event.target.value)
  }

  const handleCategoryChange = category => {
    setCategories(prev => ({ ...prev, [category]: !prev[category] }))
  }

  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  if (loading) return <div className="text-center font-bold">Chargement...</div>
  if (error) return { error }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-8">Products list</h1>

      <div className="flex gap-8">
        {/* Colonne de gauche : Recherche et Filtres */}
        <div className="w-1/4">
          {/* Barre de recherche */}
          <div className="mb-6">
            <Input
              type="search"
              placeholder="Your search..."
              className="w-full rounded-full"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          {/* Filtres */}
          <div className="flex flex-col gap-2">
            {Object.entries(categories).map(([category, isChecked]) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox checked={isChecked} onCheckedChange={() => handleCategoryChange(category)} />
                <label>{category}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne de droite : Grille de produits */}
        <div className="w-3/4">
          <div className="grid grid-cols-3 gap-4">
            {currentProducts.map(product => (
              <Card
                key={product.code}
                className="p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleCardClick(product.code)}
              >
                <img src={product.imageUrl} alt={product.name} className="w-40 h-40 object-contain mb-4" />
                <h3 className="font-medium text-center mb-2">{product.name}</h3>
                <p className="text-xl font-bold">{product.price}€</p>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={handlePreviousPage} disabled={currentPage === 1} />
              </PaginationItem>

              {[...Array(totalPages)].map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink onClick={() => setCurrentPage(index + 1)} isActive={currentPage === index + 1}>
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext onClick={handleNextPage} disabled={currentPage === totalPages} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}

export default ProductsPage
