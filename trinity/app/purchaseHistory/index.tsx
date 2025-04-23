import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import axios from 'axios';
import "../../global.css"
import { API_URL, API_TOKEN } from '@/env';
import { Purchase } from './types/purchase';

const PurchaseHistory = () => {
    const [purchases, setPurchases] = useState<Purchase[]>([]);

    const formatDate = (isoString: string | null | undefined): string => {
        if (!isoString) return "Date non disponible";
        
        if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(isoString)) {
            return "Date non disponible";
        }
        
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString();
        } catch (error) {
            return "Date non disponible";
        }
    };

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            const response = await axios.get<Purchase[]>(
                `${API_URL}/api/orders`,
                {
                    headers: {
                        Authorization: `Bearer ${API_TOKEN}`,
                    },
                }
            );
            setPurchases(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des achats :", error);
        }
    };

    return (
        <ScrollView 
            className="bg-gray-100"
            accessibilityLabel="Historique des achats"
            accessibilityRole="list"
        >
            <View>
                {purchases.length === 0 ? (
                    <View className="p-4 m-4 bg-white rounded-lg shadow items-center">
                        <Text 
                            className="text-gray-600 text-lg" 
                            accessibilityRole="text"
                        >
                            Aucun achat trouvé
                        </Text>
                    </View>
                ) : (
                    purchases.map((purchase, index) => (
                        <View 
                            key={purchase._id}
                            className="bg-white p-4 m-4 rounded-lg shadow"
                            accessibilityRole="button"
                            accessibilityLabel={`Achat du ${formatDate(purchase.issuedAt)}, montant total: ${purchase.totalAmount.toFixed(2)} euros, statut: ${purchase.paymentStatus === 'paid' ? 'Payé' : 'En attente'}`}
                        >
                            <Text 
                                className="text-gray-600"
                                accessibilityRole="text"
                            >
                                Date: {formatDate(purchase.paymentResult?.update_time)}
                            </Text>
                            <Text 
                                className={purchase.paymentResult?.status === 'paid' ? "text-green-600" : "text-yellow-600"}
                                accessibilityRole="text"
                            >
                                Statut paiement: {purchase.paymentResult?.status === 'paid' ? 'Payé ✅' : 'En attente ⚠️'}
                            </Text>
                    
                            {purchase.products.map((item, itemIndex) => (
                                <View 
                                    key={item._id}
                                >
                                    {itemIndex > 0 && <View className="h-px bg-gray-200 my-3" />}
                                    
                                    <View className="flex-row items-center mt-4">
                                        <Image 
                                            source={{ uri: item.product.imageUrl }} 
                                            className="w-20 h-20 rounded-md"
                                            resizeMode="cover"
                                            accessible={true}
                                            accessibilityLabel={`Image du produit ${item.product.name}`}
                                        />
                                        <View className="ml-4 flex-1">
                                            <Text 
                                                className="font-bold"
                                                accessibilityRole="text"
                                            >
                                                {item.product.name}
                                            </Text>
                                            <Text accessibilityRole="text">Marque: {item.product.brand}</Text>
                                            <Text accessibilityRole="text">Prix: {item.product.price.toFixed(2)} €</Text>
                                            <Text accessibilityRole="text">Quantité: {item.quantity}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                    
                            <View className="border-t border-gray-300 mt-4 pt-2">
                                <Text 
                                    className="font-bold"
                                    accessibilityRole="text"
                                >
                                    Total payé: {purchase.totalAmount.toFixed(2)} €
                                </Text>
                            </View>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
};

export default PurchaseHistory;
