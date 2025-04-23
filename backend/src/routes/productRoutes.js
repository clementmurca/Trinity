import express from 'express'
import asyncHandler from 'express-async-handler'
import {
  getProducts,
  getProductByCode,
  getProductByCategory,
  updateProductStock,
  importProductFromOpenFoodFacts,
  importMultipleProducts
} from '../controllers/productController.js'
import { protect, admin } from '../middleware/authMiddleware.js'
import { manualUpdateProducts } from '../scripts/updateProducts.js'

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - code
 *         - name
 *       properties:
 *         code:
 *           type: string
 *           description: Code-barres du produit
 *         name:
 *           type: string
 *           description: Nom du produit
 *         brand:
 *           type: string
 *           description: Marque du produit
 *         imageUrl:
 *           type: string
 *           description: URL de l'image du produit
 *         price:
 *           type: number
 *           description: Prix du produit
 *         quantity:
 *           type: string
 *           description: Quantité/Poids du produit
 *         category:
 *           type: array
 *           items:
 *             type: string
 *           description: Catégories du produit
 *         nutritionFacts:
 *           type: object
 *           properties:
 *             energy_100g:
 *               type: number
 *             proteins_100g:
 *               type: number
 *             carbohydrates_100g:
 *               type: number
 *             fat_100g:
 *               type: number
 *             fiber_100g:
 *               type: number
 *             salt_100g:
 *               type: number
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Récupère tous les produits
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Liste des produits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', getProducts)

/**
 * @swagger
 * /api/products/{code}:
 *   get:
 *     summary: Récupère un produit par son code-barres
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Code-barres du produit
 *     responses:
 *       200:
 *         description: Détails du produit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Produit non trouvé
 */
router.get('/:code', getProductByCode)

/**
 * @swagger
 * /api/products/category/{category}:
 *   get:
 *     summary: Récupère les produits par catégorie
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Catégorie des produits
 *     responses:
 *       200:
 *         description: Liste des produits de la catégorie
 */
router.get('/category/:category', getProductByCategory)

/**
 * @swagger
 * /api/products/{code}/stock:
 *   patch:
 *     summary: Met à jour le stock d'un produit
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
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
 *     responses:
 *       200:
 *         description: Stock mis à jour
 */
router.patch('/:code/stock', updateProductStock)

/**
 * @swagger
 * /api/products/import/{barcode}:
 *   post:
 *     summary: Importe un produit depuis OpenFoodFacts
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Produit importé avec succès
 */
router.post(
  '/import/:barcode',
  asyncHandler(async (req, res) => {
    try {
      const product = await importProductFromOpenFoodFacts(req.params.barcode)
      res.status(201).json(product)
    } catch (error) {
      res.status(400).json({ success: false, message: error.message })
    }
  })
)

/**
 * @swagger
 * /api/products/import-multiple:
 *   post:
 *     summary: Importe plusieurs produits depuis OpenFoodFacts
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Produits importés avec succès
 */
router.post('/import-multiple', importMultipleProducts)

/**
 * @swagger
 * /api/products/update-products:
 *   post:
 *     summary: Met à jour tous les produits depuis OpenFoodFacts
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Produits mis à jour avec succès
 */
router.post('/update-products', protect, admin, async (req, res) => {
  try {
    console.log('Démarrage de la mise à jour manuelle des produits...')
    await manualUpdateProducts()
    res.json({
      success: true,
      message: 'Mise à jour des produits terminée avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router
