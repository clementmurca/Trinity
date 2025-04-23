import csrf from 'csurf'
import authRoutes from './authRoutes.js'
import cartRoutes from './cartRoutes.js'
import invoiceRoutes from './invoiceRoutes.js'
import orderRoutes from './orderRoutes.js'
import productRoutes from './productRoutes.js'
import sellerRoutes from './sellerRoutes.js'
import userRoutes from './userRoutes.js'
import paymentRoutes from './paymentRoutes.js'

// CSRF Protection Middleware
const csrfProtection = csrf({ cookie: true })
export const configureRoutes = app => {
  // Auth routes
  app.use('/api/auth', csrfProtection, authRoutes)
  app.use('/api/users', csrfProtection, userRoutes)

  // Product routes
  app.use('/api/products', productRoutes)

  // Cart routes
  app.use('/api/cart', cartRoutes)

  // Order routes
  app.use('/api/orders', orderRoutes)

  // Invoice routes
  app.use('/api/invoices', invoiceRoutes)

  // Seller routes
  app.use('/api/sellers', sellerRoutes)

  // Stripe payment routes
  app.use('/api/payments', paymentRoutes)

  // 404 handler - should be the last route
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `Cannot ${req.method} ${req.originalUrl}`
    })
  })
}
