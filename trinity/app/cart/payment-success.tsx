import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { checkPaymentStatus } from '@/services/stripeService';
import { clearCart } from '@/services/cartService';
import '../../global.css';

export default function PaymentSuccessScreen() {
    const router = useRouter();
    const { session_id, payment_intent } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                if (!payment_intent) {
                    setError("Information de paiement manquante");
                    setLoading(false);
                    return;
                }

                // Vérifier le statut du paiement auprès du backend
                const statusResult = await checkPaymentStatus(payment_intent as string);

                if (statusResult.success) {
                    // Le paiement est confirmé, vider le panier
                    await clearCart();

                    // Stocker l'ID de commande pour redirection
                    if (statusResult.orderId) {
                        setOrderId(statusResult.orderId);
                    }
                } else {
                    setError("Le paiement est en cours de traitement. Vous recevrez une notification dès qu'il sera confirmé.");
                }
            } catch (error) {
                console.error('Erreur lors de la vérification du paiement:', error);
                setError("Une erreur est survenue lors de la vérification du paiement. Veuillez contacter le support.");
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [payment_intent]);

    const handleViewOrder = () => {
        if (orderId) {
            router.push('/products');
        }
    };

    const handleContinueShopping = () => {
        router.push('/products');
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-4 text-gray-600 font-medium">Vérification de votre paiement...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-gray-50 px-6">
                <View className="bg-white p-8 rounded-3xl shadow-sm items-center w-full max-w-md">
                    <View className="bg-yellow-50 rounded-full p-4 mb-6">
                        <Ionicons name="alert-circle-outline" size={80} color="#F59E0B" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">Statut en attente</Text>
                    <Text className="text-center text-gray-500 mb-8 leading-5">
                        {error}
                    </Text>
                    <TouchableOpacity
                        onPress={handleContinueShopping}
                        className="w-full bg-blue-500 py-4 px-6 rounded-xl flex-row justify-center items-center"
                    >
                        <Ionicons name="basket-outline" size={20} color="white" className="mr-2" />
                        <Text className="text-white font-bold text-base">Continuer mes achats</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 justify-center items-center bg-gray-50 px-6">
            <View className="bg-white p-8 rounded-3xl shadow-sm items-center w-full max-w-md">
                <View className="bg-green-50 rounded-full p-4 mb-6">
                    <Ionicons name="checkmark-circle-outline" size={80} color="#10B981" />
                </View>
                <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">Paiement confirmé !</Text>
                <Text className="text-center text-gray-500 mb-8 leading-5">
                    Votre commande a été confirmée et sera préparée dans les plus brefs délais.
                </Text>

                <View className="w-full space-y-4">
                    <TouchableOpacity
                        onPress={handleViewOrder}
                        className="w-full bg-blue-500 py-4 px-6 rounded-xl flex-row justify-center items-center"
                    >
                        <Ionicons name="document-text-outline" size={20} color="white" className="mr-2" />
                        <Text className="text-white font-bold text-base">Voir ma commande</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleContinueShopping}
                        className="w-full bg-gray-100 py-4 px-6 rounded-xl flex-row justify-center items-center"
                    >
                        <Ionicons name="basket-outline" size={20} color="#4B5563" className="mr-2" />
                        <Text className="text-gray-700 font-bold text-base">Continuer mes achats</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}