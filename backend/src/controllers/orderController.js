import asyncHandler from 'express-async-handler'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import User from '../models/User.js'

// @desc Récupérer toutes les commandes d'un utilisateur
// @route GET /api/orders
// @access Private
export const getOrders = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id

    if (!userId) {
      return res.status(400).json({ error: "L'ID utilisateur est requis" })
    }

    const orders = await Order.find({ user: userId }).populate(
      'products.product',
      'imageUrl category name brand code price'
    )

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'Aucune commande trouvée' })
    }

    res.status(200).json(orders)
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes :', error.message)
    res.status(500).json({
      success: false,
      error: {
        status: 500,
        message: 'Une erreur interne est survenue lors de la récupération des commandes',
        details: error.message,
      },
    })
  }
})

// @desc Récupérer toutes les commandes pour le role admin
// @route GET /api/orders/:user
// @access Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.user

    if (!userId) {
      return res.status(400).json({ message: "L'ID utilisateur est requis" })
    }

    const orders = await Order.find({ user: userId }).populate(
      'products.product',
      'imageUrl category name brand code price'
    )

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'Aucune commande trouvée pour cet utilisateur' })
    }

    // Retourner les commandes
    res.status(200).json(orders)
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes :', error.message)
    res.status(500).json({
      success: false,
      message: 'Une erreur interne est survenue',
      details: error.message,
    })
  }
})

// @desc Récupérer une commande par ID
// @route GET /api/orders/:id
// @access Private
export const getOrderById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params

    const order = await Order.findById(id).populate('products.product', 'name brand code price')

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' })
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès interdit à cette commande' })
    }

    res.status(200).json(order)
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande :', error.message)
    res.status(500).json({
      success: false,
      error: {
        status: 500,
        message: 'Une erreur interne est survenue lors de la récupération de la commande',
        details: error.message,
      },
    })
  }
})

// @desc Créer une commande à partir du panier
// @route POST /api/orders
// @access Private

export const createOrder = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id
    const user = await User.findById(userId).populate('cart.product')

    if (!user || !user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: 'Votre panier est vide' })
    }

    let totalAmount = 0
    const orderProducts = []

    for (const item of user.cart) {
      const product = await Product.findById(item.product._id)

      if (!product) {
        return res.status(404).json({
          message: `Produit non trouvé : ${item.product.name}`,
        })
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Stock insuffisant pour le produit : ${product.name}`,
        })
      }

      totalAmount += product.price * item.quantity
      orderProducts.push({
        product: product._id,
        quantity: item.quantity
      })

      product.stock -= item.quantity
      await product.save()
    }

    const order = new Order({
      user: userId,
      products: orderProducts,
      totalAmount,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
    })

    const createdOrder = await order.save()

    user.cart = []
    await user.save()

    res.status(201).json(createdOrder)
  } catch (error) {
    console.error('Erreur lors de la création de la commande :', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la commande',
      error: error.message,
    })
  }
})

export default Order

// @desc Mettre à jour le statut d'une commande
// @route PUT /api/orders/:id/status
// @access Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered']

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Statut invalide' })
  }

  const order = await Order.findById(id)

  if (!order) {
    return res.status(404).json({ message: 'Commande non trouvée' })
  }

  order.status = status
  await order.save()

  res.status(200).json({ message: 'Statut mis à jour avec succès', order })
})

// @desc Supprimer une commande
// @route DELETE /api/orders/:id
// @access Admin
export const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params

  const order = await Order.findByIdAndDelete(id)

  if (!order) {
    return res.status(404).json({ message: 'Commande non trouvée' })
  }

  res.status(200).json({ message: 'Commande supprimée avec succès' })
})
