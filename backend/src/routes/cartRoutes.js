import express from 'express'
import { getCart, createCart, updateCartItem, removeFromCart } from '../controllers/cartController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *           description: ID du produit
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: Quantité du produit
 *     Cart:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: ID de l'utilisateur
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Récupère le panier de l'utilisateur connecté
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Panier récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Non autorisé
 */
router.get('/', protect, getCart)

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Crée un nouveau panier
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Panier créé avec succès
 *       401:
 *         description: Non autorisé
 */
router.post('/', protect, createCart)

/**
 * @swagger
 * /api/cart/{productId}:
 *   put:
 *     summary: Met à jour la quantité d'un produit dans le panier
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Quantité mise à jour avec succès
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Produit non trouvé dans le panier
 */
router.put('/:productId', protect, updateCartItem)

/**
 * @swagger
 * /api/cart/{productId}:
 *   delete:
 *     summary: Supprime un produit du panier
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Produit supprimé du panier avec succès
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Produit non trouvé dans le panier
 */
router.delete('/:productId', protect, removeFromCart)

export default router
