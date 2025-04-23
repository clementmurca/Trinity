import axios from 'axios'
import { API_URL, API_TOKEN } from '@/env'
import * as WebBrowser from 'expo-web-browser'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface CreateCheckoutSessionResponse {
  sessionId: string
  url: string // URL pour le paiement via navigateur web
}

/**
 * Crée une session de paiement sur le backend
 */
export const createPaymentIntent =
  async (): Promise<CreateCheckoutSessionResponse> => {
    try {
      // Récupération du token d'authentification
      const token = (await AsyncStorage.getItem('userToken')) || API_TOKEN

      // Appel à l'API - le backend récupère le panier directement
      const response = await axios.post(
        `${API_URL}/api/payments/create-payment-intent`,
        {}, // Corps vide car nous utilisons le panier stocké côté serveur
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      return response.data
    } catch (error) {
      console.error(
        'Erreur lors de la création de la session de paiement:',
        error
      )
      throw error
    }
  }

/**
 * Ouvre la page de paiement Stripe dans un navigateur Web
 */
export const openStripeCheckout = async (
  paymentUrl: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Ouvrir le navigateur avec l'URL de paiement Stripe
    const result = await WebBrowser.openBrowserAsync(paymentUrl)

    // Vérifier le résultat
    if (result.type === 'cancel') {
      return { success: false, error: "Paiement annulé par l'utilisateur" }
    }

    // Si nous arrivons ici, le navigateur a été fermé après le paiement
    // On suppose que le paiement est réussi (le backend confirmera)
    return { success: true }
  } catch (error) {
    console.error(
      "Erreur lors de l'ouverture du navigateur de paiement:",
      error
    )
    return {
      success: false,
      error: "Erreur lors de l'ouverture de la page de paiement",
    }
  }
}

/**
 * Vérifie le statut d'un paiement
 */
export const checkPaymentStatus = async (
  sessionId: string
): Promise<{ success: boolean; orderId?: string }> => {
  try {
    // Récupération du token d'authentification
    const token = (await AsyncStorage.getItem('userToken')) || API_TOKEN

    // Appel à l'API
    const response = await axios.get(
      `${API_URL}/api/payments/check-status/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    return {
      success: response.data.status === 'paid',
      orderId: response.data.orderId,
    }
  } catch (error) {
    console.error(
      'Erreur lors de la vérification du statut du paiement:',
      error
    )
    throw error
  }
}
/**
 * Récupère l'URL de la facture pour une session de paiement
 */
export const getInvoiceUrl = async (
  sessionId: string
): Promise<{ success: boolean; invoiceUrl?: string; error?: string }> => {
  try {
    // Récupération du token d'authentification
    const token = (await AsyncStorage.getItem('userToken')) || API_TOKEN

    // Appel à l'API
    const response = await axios.get(
      `${API_URL}/api/payments/invoice/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    return {
      success: true,
      invoiceUrl: response.data.invoiceUrl,
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la facture:', error)
    return {
      success: false,
      error: 'Erreur lors de la récupération de la facture',
    }
  }
}
