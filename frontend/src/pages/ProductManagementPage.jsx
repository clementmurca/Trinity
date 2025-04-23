import React from 'react'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import axios from 'axios'

const ProductManagementPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rowSelection, setRowSelection] = useState({})
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [barcodeToImport, setBarcodeToImport] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    quantity: '',
    stock: 0,
    category: '',
    nutritionFacts: {
      energy_100g: '',
      proteins_100g: '',
      carbohydrates_100g: '',
      fat_100g: '',
      fiber_100g: '',
      salt_100g: '',
    },
  })

  // Récupération des produits du vendeur connecté
  useEffect(() => {
    const fetchSellerProducts = async () => {
      try {
        const userId = localStorage.getItem('userId')
        if (!userId) {
          setError('Vous devez être connecté en tant que vendeur')
          setLoading(false)
          return
        }

        const response = await axios.get(`http://localhost:5001/api/sellers/${userId}/products`)
        const sortedProducts = response.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setProducts(sortedProducts)
        setLoading(false)
      } catch (err) {
        setError('Erreur lors du chargement des produits', err)
        setLoading(false)
      }
    }
    fetchSellerProducts()
  }, [])

  // function to handle the import of a product
  const handleImportProduct = async () => {
    try {
      const response = await axios.post(`http://localhost:5001/api/products/import/${barcodeToImport}`)
      setProducts(prevProducts => [response.data, ...prevProducts])
      setBarcodeToImport('')
      setIsImportModalOpen(false)
    } catch (error) {
      setError("Erreur lors de l'importation:", error)
    }
  }

  // function to handle the edition of a product
  const handleEditClick = product => {
    setEditingProduct(product)
    setFormData({
      price: product.sellerInfo?.price || product.price,
      stock: product.sellerInfo?.stock || 0,
    })
    setIsEditModalOpen(true)
  }

  const handleInputChange = e => {
    const { name, value } = e.target
    if (name.startsWith('nutrition.')) {
      const nutritionField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        nutritionFacts: {
          ...prev.nutritionFacts,
          [nutritionField]: value,
        },
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token')

      if (!token) {
        setError("Token d'authentification manquant")
        return
      }

      const userId = localStorage.getItem('userId')
      // eslint-disable-next-line no-unused-vars
      const response = await axios.patch(
        `http://localhost:5001/api/sellers/${userId}/products/${editingProduct._id}`,
        {
          stock: parseInt(formData.stock),
          price: parseFloat(formData.price),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      setProducts(prevProducts =>
        prevProducts.map(product =>
          product._id === editingProduct._id
            ? {
                ...product,
                sellerInfo: {
                  ...product.sellerInfo,
                  stock: parseInt(formData.stock),
                  price: parseFloat(formData.price),
                },
              }
            : product
        )
      )

      setIsEditModalOpen(false)
    } catch (error) {
      setError('Erreur lors de la mise à jour:', error)
    }
  }

  // function to handle the deletion of a product
  const handleDeleteClick = product => {
    setProductToDelete(product)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      const userId = localStorage.getItem('userId')
      const token = localStorage.getItem('token')

      if (!userId || !token) {
        setError('Identifiants manquants')
        return
      }

      await axios.delete(`http://localhost:5001/api/sellers/${userId}/products/${productToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      setProducts(prevProducts => prevProducts.filter(product => product._id !== productToDelete._id))
      setIsDeleteModalOpen(false)
    } catch (error) {
      setError('Erreur lors de la suppression:', error)
    }
  }

  // table columns logic
  const columns = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
    },
    {
      accessorKey: 'imageUrl',
      header: 'Picture',
      cell: ({ row }) => (
        <img src={row.original.imageUrl} alt={row.original.name} className="w-12 h-12 object-contain" />
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'category',
      header: 'Categories',
      cell: ({ row }) => row.original.category.join(', '),
    },
    {
      accessorKey: 'brand',
      header: 'Brand',
    },
    {
      accessorKey: 'price',
      header: 'Prix',
      cell: ({ row }) => `${row.original.sellerInfo?.price || row.original.price}€`,
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }) => `${row.original.sellerInfo?.stock || 0}`,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => handleEditClick(row.original)}>
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-red-500"
            onClick={() => handleDeleteClick(row.original)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  // function to handle table pagination
  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 9,
      },
    },
  })

  if (loading) return <div className="text-center font-bold">Chargement...</div>
  if (error) return { error }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold text-center mb-8">Your Shop</h1>
      <div className="mb-4 flex flex-row justify-end">
        <Button onClick={() => setIsImportModalOpen(true)}>Importer Produit</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Modal d'importation */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importer un produit</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="barcode">Code-barres du produit</Label>
              <Input
                id="barcode"
                value={barcodeToImport}
                onChange={e => setBarcodeToImport(e.target.value)}
                placeholder="Entrez le code-barres"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleImportProduct}>Valider</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal de modification */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center font-bold">Modifier le produit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="price">Prix</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit}>Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal de suppression */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">Êtes-vous sûr de vouloir supprimer ce produit de votre boutique ?</div>
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Non
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Oui
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center mt-4">
        <div>
          {Object.keys(rowSelection).length} sur {products.length} produit(s) sélectionné(s)
        </div>
        {table.getPageCount() > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} />
              </PaginationItem>
              {table.getCanNextPage() && (
                <PaginationItem>
                  <PaginationNext onClick={() => table.nextPage()} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  )
}

export default ProductManagementPage
