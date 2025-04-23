import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    SafeAreaView,
    Alert,
    Linking,
    AppState
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getCartItems, updateCartItemQuantity, removeFromCart, clearCart } from '@/services/cartService';
import { createPaymentIntent, openStripeCheckout, checkPaymentStatus, getInvoiceUrl } from '../../services/stripeService';
import { CartItem } from '@/constants/types';
import { useRouter, Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import '../../global.css';

export default function CartScreen() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPrice, setTotalPrice] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const router = useRouter();
    const [invoiceInProgress, setInvoiceInProgress] = useState(false);

    // Effet au montage initial
    useEffect(() => {
        fetchCartItems();
    }, []);
    // Effet qui se déclenche chaque fois que l'écran redevient actif
    useFocusEffect(
        useCallback(() => {
            fetchCartItems();
        }, [])
    );
    useEffect(() => {
        // Calculer le prix total à chaque changement du panier
        const total = cartItems.reduce((sum, item) => {
            return sum + (item.product.price * item.quantity);
        }, 0);
        setTotalPrice(total);
    }, [cartItems]);

    useEffect(() => {
        // Gestionnaire pour détecter le changement d'état de l'application
        const subscription = AppState.addEventListener('change', async (nextAppState) => {
            // Si l'app revient au premier plan
            if (nextAppState === 'active') {
                // Vérifiez si une facture était en cours de téléchargement
                const invoiceFlag = await AsyncStorage.getItem('invoiceDownloaded');
                if (invoiceFlag === 'true') {
                    // Réinitialiser le flag
                    await AsyncStorage.removeItem('invoiceDownloaded');

                    // Si un paiement était en cours, nettoyer tout
                    const sessionId = await AsyncStorage.getItem('lastPaymentSessionId');
                    if (sessionId) {
                        try {
                            // Vider le panier
                            await clearCart();

                            // Supprimer l'ID de session
                            await AsyncStorage.removeItem('lastPaymentSessionId');

                            // Réinitialiser les états
                            setProcessingPayment(false);
                            setInvoiceInProgress(false);

                            // Afficher l'alerte avec un bouton qui recharge l'app
                            Alert.alert(
                                "Commande complétée",
                                "Merci pour votre achat!",
                                [
                                    {
                                        text: "OK",
                                        onPress: async () => {
                                            try {
                                                // Recharger complètement l'application
                                                await Updates.reloadAsync();
                                            } catch (error) {
                                                console.error("Erreur lors du redémarrage de l'application:", error);
                                                // Fallback en cas d'échec du redémarrage
                                                fetchCartItems();
                                            }
                                        }
                                    }
                                ]
                            );
                        } catch (error) {
                            console.error("Erreur lors du retour à l'application:", error);
                        }
                    }
                }
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);


    const fetchCartItems = async () => {
        setLoading(true);
        try {
            const items = await getCartItems();
            console.log("Panier récupéré:", items.length, "articles");
            setCartItems(items);
        } catch (error) {
            console.error("Erreur lors de la récupération du panier:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchCartItems();
    }, []);

    const handleQuantityChange = async (productId: string, newQuantity: number) => {
        if (!productId) {
            console.error("ID du produit manquant");
            return;
        }
        if (newQuantity <= 0) {
            // Si la quantité est 0 ou moins, on supprime l'article
            await handleRemoveItem(productId);
            return;
        }

        try {
            // mise à jour immédiate de l'UI
            setCartItems(prevItems =>
                prevItems.map(item =>
                    (item.product._id === productId) ? { ...item, quantity: newQuantity } : item
                )
            );

            // Appel API
            const success = await updateCartItemQuantity(productId, newQuantity);

            // Si l'API échoue, on recharge tout le panier
            if (!success) {
                console.log("Échec de la mise à jour de la quantité, rechargement du panier");
                fetchCartItems();
            }
        } catch (error) {
            console.error("Erreur lors de la modification de la quantité:", error);
            fetchCartItems(); // Recharger en cas d'erreur
        }
    };

    const handleRemoveItem = async (productId: string) => {
        if (!productId) {
            console.error("ID du produit manquant");
            return;
        }

        try {
            // suppression immédiate de l'UI
            setCartItems(prevItems => prevItems.filter(item => item.product._id !== productId));

            // Appel API
            const success = await removeFromCart(productId);

            // Si l'API échoue, on recharge tout le panier
            if (!success) {
                console.log("Échec de la suppression, rechargement du panier");
                fetchCartItems();
            }
        } catch (error) {
            console.error("Erreur lors de la suppression du produit:", error);
            fetchCartItems();
        }
    };
    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            Alert.alert("Panier vide", "Votre panier est vide. Ajoutez des produits avant de passer à la caisse.");
            return;
        }

        setProcessingPayment(true);

        try {
            // 1. Créer la session de paiement
            const sessionData = await createPaymentIntent();
            console.log('Session de paiement créée:', sessionData.sessionId);

            // 2. Stocker l'ID de session pour vérification ultérieure
            await AsyncStorage.setItem('lastPaymentSessionId', sessionData.sessionId);

            // 3. Ouvrir Stripe dans le navigateur
            if (await Linking.canOpenURL(sessionData.url)) {
                Linking.openURL(sessionData.url);
            } else {
                const paymentResult = await openStripeCheckout(sessionData.url);
                if (!paymentResult.success) {
                    Alert.alert("Paiement non complété", "Le paiement n'a pas été finalisé.");
                    setProcessingPayment(false);
                    return;
                }
            }

            // 4. Initialiser la vérification récursive
            let checkCount = 0;
            const maxChecks = 6; // Vérifier jusqu'à 6 fois
            const checkInterval = 5000; // Toutes les 5 secondes

            const checkPaymentStatusRecursive = async () => {
                try {
                    const sessionId = await AsyncStorage.getItem('lastPaymentSessionId');
                    if (!sessionId) return;

                    const statusResult = await checkPaymentStatus(sessionId);
                    console.log(`Vérification ${checkCount + 1}/${maxChecks}:`, statusResult);

                    if (statusResult.success) {
                        // Paiement réussi - traiter et arrêter les vérifications
                        Alert.alert(
                            "Paiement réussi",
                            "Votre commande a été confirmée.",
                            [
                                {
                                    text: "Télécharger la facture",
                                    onPress: async () => {
                                        try {
                                            // Indiquer qu'une facture est en cours de téléchargement
                                            setInvoiceInProgress(true);
                                            Alert.alert("Information", "Génération de votre facture en cours...");

                                            const invoiceResult = await getInvoiceUrl(sessionId);
                                            if (invoiceResult.success && invoiceResult.invoiceUrl) {
                                                // Stocker l'état de téléchargement avant d'ouvrir le lien
                                                await AsyncStorage.setItem('invoiceDownloaded', 'true');
                                                await Linking.openURL(invoiceResult.invoiceUrl);
                                            } else {
                                                setInvoiceInProgress(false);
                                                Alert.alert("Erreur", "Impossible de récupérer la facture.");
                                            }
                                        } catch (error) {
                                            console.error("Erreur facture:", error);
                                            setInvoiceInProgress(false);
                                            Alert.alert("Erreur", "Une erreur est survenue lors du téléchargement de la facture.");
                                        }
                                    }
                                }
                            ]
                        );
                        setProcessingPayment(false);
                        return;
                    }

                    // Continuer à vérifier?
                    checkCount++;
                    if (checkCount < maxChecks) {
                        setTimeout(checkPaymentStatusRecursive, checkInterval);
                    } else {
                        // Maximum de vérifications atteint
                        Alert.alert(
                            "Statut indéterminé",
                            "Impossible de confirmer le statut de votre paiement. Veuillez vérifier vos commandes pour confirmer."
                        );
                        setProcessingPayment(false);
                    }
                } catch (error) {
                    console.error('Erreur lors de la vérification du paiement:', error);
                    setProcessingPayment(false);
                }
            };

            // Démarrer la vérification récursive après un délai initial
            setTimeout(() => {
                checkPaymentStatusRecursive();
            }, 10000); // Premier délai de 10 secondes pour laisser le temps de compléter le paiement

        } catch (error) {
            console.error('Erreur lors du processus de paiement:', error);
            Alert.alert("Erreur de paiement", "Une erreur est survenue. Veuillez réessayer plus tard.");
            setProcessingPayment(false);
        }
    };
    const renderCartItem = ({ item }: { item: CartItem }) => {
        const productId = item.product._id;
        if (!productId) {
            console.warn("Item sans ID trouvé:", item);
            return null;
        }

        return (
            <View className="bg-white mb-3 rounded-xl overflow-hidden shadow-md">
                <View className="flex-row">
                    <View className="w-28 h-28 bg-gray-50 flex items-center justify-center p-2">
                        <Image
                            source={{ uri: item.product.imageUrl }}
                            className="w-24 h-24"
                            resizeMode="contain"
                        />
                    </View>

                    <View className="flex-1 p-4 justify-between">
                        <View>
                            <Text className="font-bold text-gray-800 text-base" numberOfLines={2}>
                                {item.product.name}
                            </Text>
                            <Text className="text-blue-600 font-semibold text-lg mt-1">
                                {item.product.price.toFixed(2)}€
                            </Text>
                            <Text className="text-gray-500 text-xs mt-1">
                                {item.product.quantity}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="flex-row items-center justify-between bg-gray-50 px-4 py-3 border-t border-gray-100">
                    <TouchableOpacity
                        onPress={() => handleRemoveItem(productId)}
                        className="p-2"
                    >
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>

                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => handleQuantityChange(productId, item.quantity - 1)}
                            className="bg-gray-200 w-8 h-8 rounded-full items-center justify-center"
                        >
                            <Ionicons name="remove" size={18} color="#4B5563" />
                        </TouchableOpacity>
                        <View className="bg-white px-4 py-1 mx-2 rounded-full min-w-12 items-center border border-gray-200">
                            <Text className="text-base font-medium">{item.quantity}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => handleQuantityChange(productId, item.quantity + 1)}
                            className="bg-blue-500 w-8 h-8 rounded-full items-center justify-center"
                        >
                            <Ionicons name="add" size={18} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    if (loading && cartItems.length === 0) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-4 text-gray-600 font-medium">Chargement de votre panier...</Text>
            </SafeAreaView>
        );
    }

    if (cartItems.length === 0) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-gray-50 px-6">
                <View className="bg-white p-8 rounded-3xl shadow-sm items-center w-full max-w-md">
                    <View className="bg-blue-50 rounded-full p-4 mb-6">
                        <Ionicons name="cart-outline" size={80} color="#3B82F6" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-800 mb-3">Votre panier est vide</Text>
                    <Text className="text-center text-gray-500 mb-8 leading-5">
                        Ajoutez des produits à votre panier pour les voir apparaître ici.
                    </Text>
                    <Link href="/products" asChild>
                        <TouchableOpacity
                            className="w-full bg-blue-500 py-4 px-6 rounded-xl flex-row justify-center items-center"
                        >
                            <Ionicons name="basket-outline" size={20} color="white" className="mr-2" />
                            <Text className="text-white font-bold text-base">Découvrir nos produits</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </SafeAreaView>
        );
    }

    // Hauteur de la bande de résumé
    const summaryHeight = 180;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-4 pt-6 flex-1">
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-2xl font-bold text-gray-800">Mon Panier</Text>
                    <Text className="text-gray-500">{cartItems.length} articles</Text>
                </View>

                <FlatList
                    data={cartItems}
                    renderItem={renderCartItem}
                    keyExtractor={(item) => item._id || Math.random().toString()}
                    showsVerticalScrollIndicator={false}
                    className="mb-4"
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    contentContainerStyle={{ paddingBottom: summaryHeight }}
                />
            </View>

            {/* Résumé du panier et bouton de paiement */}
            <View className="absolute bottom-0 left-0 right-0 bg-white px-4 pt-4 pb-8 shadow-lg border-t border-gray-200 rounded-t-3xl">
                <View className="mb-4">
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-500">Sous-total</Text>
                        <Text className="text-gray-800 font-medium">{totalPrice.toFixed(2)}€</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-500">Frais de livraison</Text>
                        <Text className="text-gray-800 font-medium">0.00€</Text>
                    </View>
                    <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100">
                        <Text className="text-gray-800 font-bold text-lg">Total</Text>
                        <Text className="text-blue-600 font-bold text-xl">{totalPrice.toFixed(2)}€</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={handleCheckout}
                    disabled={processingPayment}
                    className={`py-4 rounded-xl items-center flex-row justify-center ${processingPayment ? 'bg-blue-300' : 'bg-blue-500'}`}
                >
                    {processingPayment ? (
                        <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                    ) : (
                        <Ionicons name="card-outline" size={20} color="white" style={{ marginRight: 8 }} />
                    )}
                    <Text className="text-white font-bold text-lg">
                        {processingPayment ? 'Traitement en cours...' : 'Passer à la caisse'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}