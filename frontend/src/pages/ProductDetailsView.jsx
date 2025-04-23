import React from 'react'
import { useParams } from 'react-router-dom'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import axios from 'axios'

const ProductDetailsView = () => {
  const { code } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [stockData, setStockData] = useState({
    stock: 0,
    price: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/products/${code}`)
        setProduct(response.data)
        // Initialiser le prix suggéré
        setStockData(prev => ({
          ...prev,
          price: response.data.price,
        }))
        setLoading(false)
      } catch (err) {
        setError(err, 'Erreur lors du chargement des produits')
        setLoading(false)
      }
    }

    fetchProductDetails()
  }, [code])
  const handleInputChange = e => {
    const { name, value } = e.target
    setStockData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }))
  }

  const handleAddToShop = async () => {
    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')

      if (!userId || !token) {
        toast({
          title: 'Erreur',
          description: 'Vous devez être connecté pour ajouter un produit',
          variant: 'destructive',
        })
        return
      }

      // Vérification que le produit existe
      if (!product || !product._id) {
        toast({
          title: 'Erreur',
          description: 'Produit invalide',
          variant: 'destructive',
        })
        return
      }

      // Conversion explicite en nombres
      const stockNumber = parseInt(stockData.stock)
      const priceNumber = parseFloat(stockData.price)

      // eslint-disable-next-line no-unused-vars
      const _response = await axios.post(
        `http://localhost:5001/api/sellers/${userId}/products`,
        {
          productId: product._id,
          stock: stockNumber,
          price: priceNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      toast({
        title: 'Succès',
        description: 'Le produit a été ajouté à votre boutique',
        variant: 'success',
      })

      setIsModalOpen(false)
    } catch (error) {
      setError('Erreur complète:', error)
      setError("Détails de l'erreur:", error.response?.data)
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Une erreur est survenue',
        variant: 'destructive',
      })
    }
  }

  if (loading) return <div className="text-center font-bold">Chargement...</div>
  if (error) return <div>{error}</div>
  if (!product) return <div className="text-center font-bold">Produit non trouvé.</div>

  return (
    <div className="container mx-auto p-8">
      <div className="flex gap-12">
        {/* Product image */}
        <div className="w-1/3 flex items-center justify-center">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="max-w-[300px] max-h-[300px] w-auto h-auto object-contain"
          />
        </div>

        {/* Product details */}
        <div className="w-2/3 flex flex-col">
          <h2 className="text-3xl font-bold mb-4">{product.name}</h2>

          <div className="text-2xl text-gray-700 mb-6">{product.price}€</div>

          <div className="mb-8">
            <div className="mt-4">
              <strong>Poids : </strong> {product.quantity}
            </div>

            <div className="mt-4">
              <strong>Catégories :</strong> {product.category.join(', ')}
            </div>
            <div className="mt-4">
              <strong>Marque :</strong> {product.brand}
            </div>
            {/* Section for nutritional values */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Valeurs nutritionnelles (pour 100g)</h3>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between p-2 border-b">
                    <span className="font-medium">Énergie</span>
                    <span>{product.nutritionFacts?.energy_100g || 0} kcal</span>
                  </div>
                  <div className="flex justify-between p-2 border-b">
                    <span className="font-medium">Protéines</span>
                    <span>{product.nutritionFacts?.proteins_100g || 0} g</span>
                  </div>
                  <div className="flex justify-between p-2 border-b">
                    <span className="font-medium">Glucides</span>
                    <span>{product.nutritionFacts?.carbohydrates_100g || 0} g</span>
                  </div>
                  <div className="flex justify-between p-2 border-b">
                    <span className="font-medium">Lipides</span>
                    <span>{product.nutritionFacts?.fat_100g || 0} g</span>
                  </div>
                  <div className="flex justify-between p-2 border-b">
                    <span className="font-medium">Fibres</span>
                    <span>{product.nutritionFacts?.fiber_100g || 0} g</span>
                  </div>
                  <div className="flex justify-between p-2 border-b">
                    <span className="font-medium">Sel</span>
                    <span>{product.nutritionFacts?.salt_100g || 0} g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button
            className="w-full bg-black text-white hover:bg-gray-800 py-6 text-xl"
            onClick={() => setIsModalOpen(true)}
          >
            Add to my shop 🛒
          </Button>
          <Dialog
            open={isModalOpen}
            onOpenChange={open => {
              setIsModalOpen(open)
            }}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ajouter à ma boutique</DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">
                    Stock
                  </Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={stockData.stock}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Prix (€)
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={stockData.price}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Annuler
                </Button>
                <Button
                  onClick={e => {
                    e.preventDefault()
                    handleAddToShop()
                  }}
                >
                  Confirmer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailsView
