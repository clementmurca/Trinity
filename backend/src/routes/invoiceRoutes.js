import express from 'express'
import { getInvoices, getAllInvoices, getInvoiceById, uploadInvoicePDF, createInvoice, updateInvoice, deleteInvoice } from '../controllers/invoiceController.js'
import { protect, admin } from '../middleware/authMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Invoice:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID de la facture
 *         orderId:
 *           type: string
 *           description: ID de la commande associée
 *         userId:
 *           type: string
 *           description: ID de l'utilisateur
 *         amount:
 *           type: number
 *           description: Montant total de la facture
 *         pdfUrl:
 *           type: string
 *           description: URL du fichier PDF de la facture
 *         status:
 *           type: string
 *           enum: [pending, paid, cancelled]
 *           description: Statut de la facture
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/invoices/upload/{id}:
 *   post:
 *     summary: Upload un PDF pour une facture (Admin uniquement)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: PDF uploadé avec succès
 *       400:
 *         description: Erreur lors de l'upload
 */
router.post('/upload/:id', protect, admin, upload.single('file'), uploadInvoicePDF)

/**
 * @swagger
 * /api/invoices/all:
 *   get:
 *     summary: Récupère toutes les factures (Admin uniquement)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de toutes les factures
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invoice'
 */
router.get('/all', protect, admin, getAllInvoices)

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Récupère une facture par son ID (Admin uniquement)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de la facture
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 */
router.get('/:id', protect, admin, getInvoiceById)

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Crée une nouvelle facture (Admin uniquement)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - amount
 *             properties:
 *               orderId:
 *                 type: string
 *               amount:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [pending, paid, cancelled]
 *     responses:
 *       201:
 *         description: Facture créée avec succès
 */
router.post('/', protect, admin, createInvoice)

/**
 * @swagger
 * /api/invoices/{id}:
 *   put:
 *     summary: Met à jour une facture (Admin uniquement)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               amount:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [pending, paid, cancelled]
 *     responses:
 *       200:
 *         description: Facture mise à jour avec succès
 */
router.put('/:id', protect, admin, updateInvoice)

/**
 * @swagger
 * /api/invoices/{id}:
 *   delete:
 *     summary: Supprime une facture (Admin uniquement)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Facture supprimée avec succès
 */
router.delete('/:id', protect, admin, deleteInvoice)

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Récupère les factures de l'utilisateur connecté
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des factures de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invoice'
 */
router.get('/', protect, getInvoices)

export default router
