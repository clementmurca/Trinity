import asyncHandler from 'express-async-handler'
import Product from '../models/Product.js'
import User from '../models/User.js'

// @desc    Create a new seller
// @route   POST /api/sellers
// @access  Private/Admin
export const createSeller = asyncHandler(async (req, res) => {
  const { userId } = req.body

  const user = await User.findById(userId)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  user.status = 'seller'
  // Le rôle sera automatiquement mis à jour en 'admin' grâce au schéma
  await user.save()

  res.status(201).json({
    success: true,
    data: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      status: user.status,
      role: user.role
    }
  })
})

// @desc    Add product to seller's stock
// @route   POST /api/sellers/:sellerId/products
// @access  Private/Seller
export const addProductToStock = asyncHandler(async (req, res) => {
  console.log('Body reçu:', req.body)
  console.log('Params reçus:', req.params)
  console.log('Headers reçus:', req.headers)

  const { productId, stock, price } = req.body
  const sellerId = req.params.sellerId

  // Validation des paramètres
  if (!sellerId || !productId) {
    res.status(400)
    throw new Error('ID du vendeur et ID du produit sont requis')
  }

  // Conversion explicite en nombres
  const stockNumber = parseInt(stock)
  const priceNumber = parseFloat(price)

  if (isNaN(stockNumber) || isNaN(priceNumber)) {
    res.status(400)
    throw new Error('Le stock et le prix doivent être des nombres valides')
  }
  // Vérifier que le vendeur existe
  const seller = await User.findById(sellerId)
  if (!seller || seller.status !== 'seller') {
    res.status(404)
    throw new Error('Seller not found')
  }

  // Vérifier que le produit existe
  const product = await Product.findById(productId)
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  // Mettre à jour ou créer le stock du produit pour ce vendeur
  product.sellers = product.sellers || []
  const sellerIndex = product.sellers.findIndex(s => s.sellerId.toString() === sellerId)

  if (sellerIndex >= 0) {
    product.sellers[sellerIndex].stock = stock
    product.sellers[sellerIndex].price = price
  } else {
    product.sellers.push({
      sellerId,
      stock: stockNumber,
      price: priceNumber
    })
  }

  await product.save()

  res.status(200).json({
    success: true,
    data: product
  })
})

// @desc    Get all sellers with their products
// @route   GET /api/sellers
// @access  Public
export const getAllSellers = asyncHandler(async (req, res) => {
  const sellers = await User.find({ status: 'seller' }).select('-password -refreshToken')

  const sellersWithProducts = await Promise.all(
    sellers.map(async seller => {
      const products = await Product.find({
        'sellers.sellerId': seller._id
      })
      return {
        ...seller.toObject(),
        products: products.map(product => ({
          ...product.toObject(),
          sellerInfo: product.sellers.find(s => s.sellerId.toString() === seller._id.toString())
        }))
      }
    })
  )

  res.json({
    success: true,
    data: sellersWithProducts
  })
})

// @desc    Get seller's products
// @route   GET /api/sellers/:sellerId/products
// @access  Public
export const getSellerProducts = asyncHandler(async (req, res) => {
  const { sellerId } = req.params

  const seller = await User.findById(sellerId)
  if (!seller || seller.status !== 'seller') {
    res.status(404)
    throw new Error('Seller not found')
  }

  const products = await Product.find({
    'sellers.sellerId': sellerId
  })

  const productsWithSellerInfo = products.map(product => ({
    ...product.toObject(),
    sellerInfo: product.sellers.find(s => s.sellerId.toString() === sellerId)
  }))

  res.json({
    success: true,
    data: productsWithSellerInfo
  })
})

// @desc    Get all sellers for a specific product
// @route   GET /api/products/:productId/sellers
// @access  Public
export const getProductSellers = asyncHandler(async (req, res) => {
  const { productId } = req.params

  const product = await Product.findById(productId)
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  const sellerIds = product.sellers.map(s => s.sellerId)
  const sellers = await User.find({
    _id: { $in: sellerIds }
  }).select('-password -refreshToken')

  const sellersWithStock = sellers.map(seller => ({
    ...seller.toObject(),
    stockInfo: product.sellers.find(s => s.sellerId.toString() === seller._id.toString())
  }))

  res.json({
    success: true,
    data: sellersWithStock
  })
})

// @desc    Update product stock for seller
// @route   PATCH /api/sellers/:sellerId/products/:productId
// @access  Private/Seller
export const updateSellerProductStock = asyncHandler(async (req, res) => {
  const { sellerId, productId } = req.params
  const { stock, price } = req.body

  const product = await Product.findById(productId)
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  const sellerIndex = product.sellers.findIndex(s => s.sellerId.toString() === sellerId)
  if (sellerIndex === -1) {
    res.status(404)
    throw new Error("Product not found in seller's stock")
  }

  product.sellers[sellerIndex].stock = stock
  if (price) {
    product.sellers[sellerIndex].price = price
  }

  await product.save()

  res.json({
    success: true,
    data: product
  })
})

// @desc    Remove product from seller's shop
// @route   DELETE /api/sellers/:sellerId/products/:productId
// @access  Private/Seller
export const removeProductFromShop = asyncHandler(async (req, res) => {
  const { sellerId, productId } = req.params

  // Vérifier que le vendeur existe
  const seller = await User.findById(sellerId)
  if (!seller || seller.status !== 'seller') {
    res.status(404)
    throw new Error('Vendeur non trouvé')
  }

  // Vérifier que le produit existe en utilisant _id
  const product = await Product.findById(productId)
  if (!product) {
    res.status(404)
    throw new Error('Produit non trouvé')
  }

  // Vérifier que le produit est dans la boutique du vendeur
  const sellerIndex = product.sellers.findIndex(s => s.sellerId.toString() === sellerId)
  if (sellerIndex === -1) {
    res.status(404)
    throw new Error('Produit non trouvé dans la boutique du vendeur')
  }

  // Supprimer le vendeur de la liste des vendeurs du produit
  product.sellers.splice(sellerIndex, 1)
  await product.save()

  res.status(200).json({
    success: true,
    message: 'Produit retiré de la boutique avec succès'
  })
})
