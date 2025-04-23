import express from 'express'
import { getUsers, getUserById, updateUser, deleteUser, updatePassword } from '../controllers/userController.js'
import { protect, admin } from '../middleware/authMiddleware.js'
import { validateUpdateUser, validateUpdatePassword } from '../middleware/validateMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID de l'utilisateur
 *         firstName:
 *           type: string
 *           description: Prénom de l'utilisateur
 *         lastName:
 *           type: string
 *           description: Nom de l'utilisateur
 *         email:
 *           type: string
 *           format: email
 *           description: Email de l'utilisateur
 *         phoneNumber:
 *           type: string
 *           description: Numéro de téléphone
 *         status:
 *           type: string
 *           enum: [customer, seller]
 *           description: Statut de l'utilisateur
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: Rôle de l'utilisateur
 *         billing:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *             zipCode:
 *               type: string
 *             city:
 *               type: string
 *             country:
 *               type: string
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupère tous les utilisateurs (Admin uniquement)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé - Réservé aux administrateurs
 */
router.route('/').get(protect, admin, getUsers)

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Récupère un utilisateur par son ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilisateur non trouvé
 */
router.route('/:id').get(protect, getUserById)

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Met à jour les informations d'un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               billing:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   city:
 *                     type: string
 *                   country:
 *                     type: string
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
 *       400:
 *         description: Données invalides
 */
router.route('/:id').put(protect, validateUpdateUser, updateUser)

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprime un utilisateur (Admin uniquement)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
 *       403:
 *         description: Accès refusé - Réservé aux administrateurs
 */
router.route('/:id').delete(protect, admin, deleteUser)

/**
 * @swagger
 * /api/users/{id}/password:
 *   put:
 *     summary: Met à jour le mot de passe d'un utilisateur
 *     tags: [Users]
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
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Mot de passe mis à jour avec succès
 *       400:
 *         description: Mot de passe actuel incorrect ou nouveau mot de passe invalide
 */
router.route('/:id/password').put(protect, validateUpdatePassword, updatePassword)

export default router
