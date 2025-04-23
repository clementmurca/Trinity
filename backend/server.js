import app from './src/app.js'
import connectDB from './src/config/db.js'
import { setupGlobalErrorHandlers } from './src/middleware/errorMiddleware.js'
import { manualUpdateProducts, scheduleProductsUpdate } from './src/scripts/updateProducts.js'

// Connect to MongoDB
connectDB()

const PORT = process.env.PORT || 5001

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})

// Setup global error handlers for the server
setupGlobalErrorHandlers(server)
setupGlobalErrorHandlers(server)

// launch the products update script
scheduleProductsUpdate()

await manualUpdateProducts()
scheduleProductsUpdate()

await manualUpdateProducts()
