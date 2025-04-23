import axios from 'axios'
import { API_URL, API_TOKEN } from '@/env'
import { CartItem } from '@/constants/types'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Récupère tous les éléments du panier
 */
export const getCartItems = async (): Promise<CartItem[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/cart`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    })

    // La réponse contient un objet avec une propriété 'cart'
    if (response.data && response.data.cart) {
      console.log(
        "Panier récupéré avec succès, nombre d'éléments:",
        response.data.cart.length
      )
      return response.data.cart
    }

    // Si la structure n'est pas celle attendue, retourner un tableau vide
    console.warn(
      'Structure de réponse inattendue pour le panier:',
      response.data
    )
    return []
  } catch (error) {
    console.error('Erreur lors de la récupération du panier:', error)
    return []
  }
}

/**
 * Ajoute un produit au panier
 */
export const addToCart = async (
  productId: string,
  quantity: number = 1
): Promise<boolean> => {
  try {
    const response = await axios.post(
      `${API_URL}/api/cart`,
      {
        productId,
        quantity,
      },
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      }
    )
    // Si le statut est 200 considérer comme un succès
    return response.status === 200 && !!response.data.message
  } catch (error) {
    console.error("Erreur lors de l'ajout au panier:", error)
    return false
  }
}

/**
 * Met à jour la quantité d'un produit dans le panier
 */
export const updateCartItemQuantity = async (
  productId: string,
  quantity: number
): Promise<boolean> => {
  try {
    const response = await axios.put(
      `${API_URL}/api/cart/${productId}`,
      {
        quantity,
      },
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      }
    )
    return response.data.success
  } catch (error) {
    console.error('Erreur lors de la mise à jour du panier:', error)
    return false
  }
}

/**
 * Supprime un produit du panier
 */
export const removeFromCart = async (productId: string): Promise<boolean> => {
  try {
    const response = await axios.delete(`${API_URL}/api/cart/${productId}`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    })
    return response.data.success
  } catch (error) {
    console.error('Erreur lors de la suppression du panier:', error)
    return false
  }
}

/**
 * Vide complètement le panier
 */
export const clearCart = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken')

    // Récupérer les articles du panier
    const cartItems = await getCartItems()

    // Pour chaque article, mettre la quantité à 0 si l'ID existe
    const promises = cartItems.map((item) => {
      const productId = item.product._id // Utiliser _id au lieu de id
      if (productId) {
        return updateCartItemQuantity(productId, 0)
      }
      return Promise.resolve(true) // Skip les articles sans ID valide
    })
    // Attendre que toutes les mises à jour soient terminées
    await Promise.all(promises)

    // Vider également le stockage local si nécessaire
    await AsyncStorage.removeItem('cartItems')

    console.log('Panier vidé avec succès')
    return true
  } catch (error) {
    console.error('Erreur lors du vidage du panier:', error)
    return false
  }
}
