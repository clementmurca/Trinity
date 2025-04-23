import path from 'path'
import { fileURLToPath } from 'url'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { swaggerSpec, swaggerUi } from '../swagger.js'
import passport from './config/passport.js'
import { configureBasicMiddleware } from './middleware/basicMiddleware.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'
import { configureSecurity } from './middleware/securityMiddleware.js'
import sessionConfig from './middleware/sessionConfig.js'
import { configureRoutes } from './routes/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()

const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    "http://localhost:3000", // React Web App
    'http://localhost:5173', // URL front,
    'http://localhost:8081', // URL react native en dev,
    'http://10.68.244.184:8081', // URL appareil physique (expo)
    "http://localhost:19006", // Expo Web Preview,
    'http://localhost:19000', // URL expo start
    "exp://10.0.2.2:8081", // Expo Android Emulator (for local testing)
    "http://10.0.2.2:8081", // React Native (Android)
    "http://127.0.0.1:8081", // React Native (iOS)
    process.env.API_URL || "http://10.68.250.193:5001/api",

  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'Cache-Control'],
  exposedHeaders: ['X-CSRF-Token'],
};

app.use(cors(corsOptions))
app.use(cookieParser())
app.use(sessionConfig)
app.use(passport.initialize())

// Configuration spéciale pour le webhook Stripe qui a besoin du body brut
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))

// Middleware standard pour toutes les autres routes
configureBasicMiddleware(app)

// stock invoice pdf
app.use('/invoices', express.static(path.join(__dirname, 'public/invoices')))

// Route Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.get('/api', (req, res) => {
  res.json({ message: 'Server is working!' })
})

configureSecurity(app)

// Configure Routes
configureRoutes(app)

//handle errors
app.use(errorHandler)
app.use(notFound)

export default app
