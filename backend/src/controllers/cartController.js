import asyncHandler from 'express-async-handler'
import Product from '../models/Product.js'
import User from '../models/User.js'

// @desc Récupérer le contenu du panier
// @route GET /api/cart
// @access Private
export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id

  const user = await User.findById(userId).populate('cart.product')

  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' })
  }

  res.status(200).json({ cart: user.cart })
})

// @desc    Ajouter un produit au panier
// @route   POST /api/cart
// @access  Private
export const createCart = asyncHandler(async (req, res) => {
  try {
    const { productId, quantity } = req.body
    const userId = req.user._id

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Produit ID et quantité sont requis' })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' })
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Quantité insuffisante en stock' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' })
    }

    const existingProductIndex = user.cart.findIndex(item => item.product.toString() === product._id.toString())

    if (existingProductIndex !== -1) {
      user.cart[existingProductIndex].quantity += quantity
    } else {
      user.cart.push({ product: product._id, quantity })
    }

    product.stock -= quantity
    await product.save()
    await user.save()

    res.status(200).json({
      message: 'Produit ajouté au panier et stock mis à jour',
      cart: user.cart
    })
  } catch (error) {
    console.error("Erreur lors de l'ajout au panier :", error.message)
    res.status(500).json({ message: 'Une erreur interne est survenue' })
  }
})

// @desc Mettre à jour la quantité d'un produit dans le panier
// @route PUT /api/cart/:productId
// @access Private
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body
  const { productId } = req.params
  const userId = req.user._id

  const user = await User.findById(userId)
  const cartItem = user.cart.find(item => item.product.toString() === productId)

  if (!cartItem) {
    return res.status(404).json({ message: 'Produit non trouvé dans le panier' })
  }

  cartItem.quantity = quantity
  await user.save()

  res.status(200).json({ message: 'Quantité mise à jour', cart: user.cart })
})

// @desc Supprimer un produit du panier
// @route DELETE /api/cart/:productId
// @access Private
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const userId = req.user._id

  const user = await User.findById(userId)
  user.cart = user.cart.filter(item => item.product.toString() !== productId)

  await user.save()

  res.status(200).json({ message: 'Produit supprimé du panier', cart: user.cart })
})
