import axios from 'axios'
import cron from 'node-cron'
import Product from '../models/Product.js'

// Fonction d'actualisation d'un produit
const updateProductFromAPI = async product => {
  try {
    const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${product.code}.json`)

    if (!response.data.product) {
      console.log(`Produit ${product.code} non trouvé sur OpenFoodFacts`)
      return
    }

    const productData = response.data.product
    const nutriments = productData.nutriments || {}

    // Mise à jour des données du produit
    product.name = productData.product_name_fr || product.name
    product.brand = productData.brands || product.brand
    product.imageUrl = productData.image_url || product.imageUrl
    product.quantity = productData.quantity || product.quantity
    product.category = Array.isArray(productData.categories)
      ? productData.categories
      : productData.categories?.split(',').map(cat => cat.trim()) || product.category
    product.nutritionFacts = {
      energy_100g: nutriments.energy_100g || 0,
      proteins_100g: nutriments.proteins_100g || 0,
      carbohydrates_100g: nutriments.carbohydrates_100g || 0,
      fat_100g: nutriments.fat_100g || 0,
      fiber_100g: nutriments.fiber_100g || 0,
      salt_100g: nutriments.salt_100g || 0
    }

    await product.save()
    console.log(`Produit ${product.code} mis à jour avec succès`)
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du produit ${product.code}:`, error.message)
  }
}

// Fonction principale d'actualisation
const updateAllProducts = async () => {
  try {
    console.log("Début de l'actualisation des produits...")
    const products = await Product.find({})
    console.log(`${products.length} produits trouvés à actualiser`)

    // Mise à jour des produits avec un délai entre chaque requête
    for (const product of products) {
      await updateProductFromAPI(product)
      // Attendre 1 seconde entre chaque requête pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log('Actualisation terminée avec succès')
  } catch (error) {
    console.error("Erreur lors de l'actualisation des produits:", error)
  }
}

// Planification de la tâche (tous les jours à 3h du matin)
export const scheduleProductsUpdate = () => {
  cron.schedule('0 3 * * *', async () => {
    console.log('Démarrage de la mise à jour quotidienne des produits...')
    await updateAllProducts()
  })
}

// Export de la fonction pour une utilisation manuelle si nécessaire
export const manualUpdateProducts = updateAllProducts
