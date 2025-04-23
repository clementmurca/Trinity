import axios from 'axios'
import asyncHandler from 'express-async-handler'
import Product from '../models/Product.js'

const generatePrice = () => {
  const min = 0.5
  const max = 10
  return Number((Math.random() * (max - min) + min).toFixed(2))
}

// function to import multiple products from OpenFoodFacts
export const importMultipleProducts = asyncHandler(async (req, res) => {
  console.log("Tentative d'importation des 100 premiers produits...")
  try {
    const response = await axios.get(
      'https://world.openfoodfacts.org/api/v2/search?' + 'fields=code,product_name_fr,brands,image_url,quantity,categories,nutriments' + '&page_size=100&page=1'
    )

    if (!response.data.products) {
      throw new Error('Aucun produit trouvé')
    }

    const importedProducts = []
    const products = response.data.products

    for (const productData of products) {
      if (productData.code && productData.product_name_fr) {
        const nutriments = productData.nutriments || {}

        const product = new Product({
          code: productData.code,
          name: productData.product_name_fr,
          brand: productData.brands || 'Non spécifié',
          imageUrl: productData.image_url || '',
          price: generatePrice(),
          quantity: productData.quantity || 'Non spécifié',
          category: Array.isArray(productData.categories) ? productData.categories : (productData.categories || '').split(',').map(cat => cat.trim()),
          stock: 0,
          nutritionFacts: {
            energy_100g: nutriments.energy_100g || 0,
            proteins_100g: nutriments.proteins_100g || 0,
            carbohydrates_100g: nutriments.carbohydrates_100g || 0,
            fat_100g: nutriments.fat_100g || 0,
            fiber_100g: nutriments.fiber_100g || 0,
            salt_100g: nutriments.salt_100g || 0
          }
        })

        try {
          const existingProduct = await Product.findOne({ code: product.code })
          if (!existingProduct) {
            await product.save()
            importedProducts.push(product)
          }
        } catch (error) {
          console.error(`Erreur lors de l'importation du produit ${product.code}: ${error.message}`)
        }
      }
    }

    res.status(200).json({
      message: `${importedProducts.length} produits importés avec succès`,
      products: importedProducts
    })
  } catch (error) {
    console.error(`Erreur lors de l'importation multiple: ${error.message}`)
    res.status(500)
    throw new Error("Erreur lors de l'importation multiple des produits")
  }
})

// function to import product from OpenFoodFacts with code-barres
export const importProductFromOpenFoodFacts = asyncHandler(async barcode => {
  console.log(`Tentative d'importation du produit avec le code-barres: ${barcode}`)
  try {
    const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)

    if (!response.data.product) {
      throw new Error('Produit non trouvé')
    }

    const productData = response.data.product
    const nutriments = productData.nutriments

    const product = new Product({
      code: productData.code,
      name: productData.product_name_fr,
      brand: productData.brands,
      imageUrl: productData.image_url,
      price: generatePrice(),
      quantity: productData.quantity,
      category: Array.isArray(productData.categories) ? productData.categories : productData.categories.split(',').map(cat => cat.trim()),
      stock: 0,
      nutritionFacts: {
        energy_100g: nutriments.energy_100g || 0,
        proteins_100g: nutriments.proteins_100g || 0,
        carbohydrates_100g: nutriments.carbohydrates_100g || 0,
        fat_100g: nutriments.fat_100g || 0,
        fiber_100g: nutriments.fiber_100g || 0,
        salt_100g: nutriments.salt_100g || 0
      }
    })

    await product.save()
    return product
  } catch (error) {
    console.error(`Erreur lors de l'importation: ${error.message}`)
    throw error
  }
})

// function to get all products
export const getProducts = asyncHandler(async (req, res) => {
  const { query } = req
  const products = await Product.find(query)

  if (products.length === 0) {
    return res.status(200).json({ message: 'Aucun produit trouvé', products: [] })
  }
  res.json(products)
})

// function to get product by code
export const getProductByCode = asyncHandler(async (req, res) => {
  const { code } = req.params
  const product = await Product.findOne({ code })

  if (!product) {
    res.status(404)
    throw new Error('Produit non trouvé')
  }
  res.json(product)
})

// function to get product by category
export const getProductByCategory = asyncHandler(async (req, res) => {
  const categories = req.params.category.split(',').map(cat => cat.trim())
  console.log(`Recherche de produits pour les catégories: ${categories}`)
  const products = await Product.find({ category: { $in: categories } })
  console.log(`Nombre de produits trouvés: ${products.length}`)
  res.json(products)
})

// function to update a product stock
export const updateProductStock = asyncHandler(async (req, res) => {
  const { code } = req.params
  const { stock } = req.body

  const product = await Product.findOneAndUpdate({ code }, { stock }, { new: true })

  if (!product) {
    res.status(404)
    throw new Error('Produit non trouvé')
  }

  res.json(product)
})

//update product informations
export const updateProduct = asyncHandler(async (req, res) => {
  const { code } = req.params
  const updateData = req.body
  // Suppression des champs non modifiables
  delete updateData.code
  delete updateData._id
  const product = await Product.findOneAndUpdate(
    { code },
    { $set: updateData },
    {
      new: true,
      runValidators: true
    }
  )
  if (!product) {
    res.status(404)
    throw new Error('Produit non trouvé')
  }
  res.json(product)
})
// function to delete a product
export const deleteProduct = asyncHandler(async (req, res) => {
  const { code } = req.params
  const product = await Product.findOneAndDelete({ code })

  if (!product) {
    res.status(404)
    throw new Error('Produit non trouvé')
  }

  res.status(200).json({ message: 'Produit supprimé avec succès', product })
})
