import dotenv from 'dotenv'
import express from 'express'
import passport from '../config/passport.js'
import { login, signup, logout, refreshToken } from '../controllers/authController.js'
import { protect, verifyRefreshToken } from '../middleware/authMiddleware.js'
import { validateSignup, validateLogin } from '../middleware/validateMiddleware.js'
import User from '../models/User.js'
import { generateToken } from '../utils/jwt.js'

dotenv.config()

const router = express.Router()

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Authentification avec Google
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirection vers l'authentification Google
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Callback de l'authentification Google
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirection vers l'application avec le token
 *       500:
 *         description: Échec de l'authentification
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
  }),
  (req, res) => {
    if (!req.user) {
      return res.status(500).json({
        success: false,
        error: {
          status: 500,
          message: 'Authentication failed'
        }
      })
    }

    const token = generateToken(req.user.id)
    req.session.userId = req.user.id
    res.redirect(`${process.env.FRONTEND_URL}?token=${token}`)
  }
)

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupère les informations de l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations utilisateur récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 */
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken')
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    res.status(200).json({ success: true, data: user })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to fetch user details' })
  }
})

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupInput'
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 */
router.post('/signup', validateSignup, signup)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Connexion réussie
 */
router.post('/login', validateLogin, login)

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion utilisateur
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
router.post('/logout', protect, logout)

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Rafraîchit le token d'accès
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token rafraîchi avec succès
 */
router.post('/refresh-token', verifyRefreshToken, refreshToken)

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginInput:
 *       type: object
 *       required:
 *         - identifier
 *         - password
 *       properties:
 *         identifier:
 *           type: string
 *         password:
 *           type: string
 *     SignupInput:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *         status:
 *           type: string
 */

export default router
