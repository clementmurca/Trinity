import express from 'express'
import { getOrders, getAllOrders, getOrderById, createOrder, updateOrderStatus, deleteOrder } from '../controllers/orderController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         product:
 *           type: string
 *           description: ID du produit
 *         seller:
 *           type: string
 *           description: ID du vendeur
 *         quantity:
 *           type: number
 *           description: Quantité commandée
 *         price:
 *           type: number
 *           description: Prix unitaire
 *     Order:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *           description: ID de l'utilisateur qui a passé la commande
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         totalAmount:
 *           type: number
 *           description: Montant total de la commande
 *         status:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *           description: Statut de la commande
 *         shippingAddress:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *             city:
 *               type: string
 *             postalCode:
 *               type: string
 *             country:
 *               type: string
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Récupère les commandes de l'utilisateur connecté
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des commandes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Non autorisé
 */
router.get('/', protect, getOrders)

/**
 * @swagger
 * /api/orders/{user}:
 *   get:
 *     summary: Récupère toutes les commandes (Admin uniquement)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste de toutes les commandes
 *       403:
 *         description: Accès refusé
 */
router.get('/:user', protect, admin, getAllOrders)

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Récupère une commande par son ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la commande
 *     responses:
 *       200:
 *         description: Détails de la commande
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Commande non trouvée
 */
router.get('/:id', protect, getOrderById)

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Crée une nouvelle commande
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - shippingAddress
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/OrderItem'
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   postalCode:
 *                     type: string
 *                   country:
 *                     type: string
 *     responses:
 *       201:
 *         description: Commande créée avec succès
 *       400:
 *         description: Données invalides
 */
router.post('/', protect, createOrder)

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Met à jour le statut d'une commande
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la commande
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Statut mis à jour avec succès
 *       400:
 *         description: Statut invalide
 */
router.put('/:id', protect, updateOrderStatus)

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Supprime une commande
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la commande
 *     responses:
 *       200:
 *         description: Commande supprimée avec succès
 *       404:
 *         description: Commande non trouvée
 */
router.delete('/:id', protect, deleteOrder)

export default router
