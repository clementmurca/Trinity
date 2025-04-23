import express from 'express'
import {
  createSeller,
  addProductToStock,
  getAllSellers,
  getSellerProducts,
  getProductSellers,
  updateSellerProductStock,
  removeProductFromShop
} from '../controllers/sellerController.js'
import { protect, admin, seller } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Seller:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID du vendeur
 *         status:
 *           type: string
 *           enum: [seller]
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *     SellerProduct:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *         stock:
 *           type: number
 *           minimum: 0
 *         price:
 *           type: number
 *           minimum: 0
 */

/**
 * @swagger
 * /api/sellers:
 *   get:
 *     summary: Récupère tous les vendeurs
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des vendeurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Seller'
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 */
router.get('/', protect, admin, getAllSellers)

/**
 * @swagger
 * /api/sellers/{sellerId}/products:
 *   get:
 *     summary: Récupère tous les produits d'un vendeur
 *     tags: [Sellers]
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des produits du vendeur
 *       404:
 *         description: Vendeur non trouvé
 */
router.get('/:sellerId/products', getSellerProducts)

/**
 * @swagger
 * /api/sellers/{productId}/sellers:
 *   get:
 *     summary: Récupère tous les vendeurs d'un produit
 *     tags: [Sellers]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des vendeurs du produit
 *       404:
 *         description: Produit non trouvé
 */
router.get('/:productId/sellers', getProductSellers)

router.post('/', protect, admin, createSeller)

/**
 * @swagger
 * /api/sellers/{sellerId}/products:
 *   post:
 *     summary: Ajoute un produit au stock du vendeur
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
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
 *               productId:
 *                 type: string
 *               stock:
 *                 type: number
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Produit ajouté avec succès
 *       400:
 *         description: Données invalides
 */
router.post('/:sellerId/products', protect, seller, addProductToStock)

/**
 * @swagger
 * /api/sellers/{sellerId}/products/{productId}:
 *   patch:
 *     summary: Met à jour le stock d'un produit
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
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
 *               stock:
 *                 type: number
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Stock mis à jour avec succès
 */
router.patch('/:sellerId/products/:productId', protect, seller, updateSellerProductStock)

/**
 * @swagger
 * /api/sellers/{sellerId}/products/{productId}:
 *   delete:
 *     summary: Supprime un produit du stock du vendeur
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Produit supprimé avec succès
 *       404:
 *         description: Produit ou vendeur non trouvé
 */
router.delete('/:sellerId/products/:productId', protect, seller, removeProductFromShop)

export default router
