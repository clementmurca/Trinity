import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    AccessibilityInfo,
    findNodeHandle,
    AccessibilityRole
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { Product, Seller } from '@/constants/types';
import { API_URL, API_TOKEN } from '@/env';
import { styles } from '@/constants/styles';

export default function ProductsScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
    const router = useRouter();

    // Vérifier si un lecteur d'écran est activé
    useEffect(() => {
        AccessibilityInfo.isScreenReaderEnabled().then(
            screenReaderEnabled => {
                setScreenReaderEnabled(screenReaderEnabled);
            }
        );

        // S'abonner aux changements d'état du lecteur d'écran
        const subscription = AccessibilityInfo.addEventListener(
            'screenReaderChanged',
            screenReaderEnabled => {
                setScreenReaderEnabled(screenReaderEnabled);
            }
        );

        return () => {
            subscription.remove();
        };
    }, []);

    // Effet au montage initial
    useEffect(() => {
        fetchProducts();
    }, []);

    // Effet qui se déclenche chaque fois que l'écran redevient actif
    useFocusEffect(
        useCallback(() => {
            fetchProducts();
        }, [])
    );

    const fetchProducts = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await axios.get<{ success: boolean; data: Seller[] }>(
                `${API_URL}/api/sellers`,
                {
                    headers: {
                        Authorization: `Bearer ${API_TOKEN}`,
                    },
                }
            );

            const allProducts = response.data.data.flatMap((seller) =>
                seller.products.map((product) => ({
                    _id: product._id,
                    id: product._id || product.code,
                    code: product.code,
                    name: product.name,
                    brand: product.brand,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    quantity: product.quantity,
                    category: product.category,
                    nutritionFacts: product.nutritionFacts,
                    stock: product.stock,
                    sellers: product.sellers,
                    sellerInfo: product.sellerInfo
                }))
            );

            setProducts(allProducts);
            setLoading(false);

            // Annonce pour les lecteurs d'écran quand les produits sont chargés
            if (screenReaderEnabled) {
                AccessibilityInfo.announceForAccessibility(
                    `${allProducts.length} produits chargés. Balayez pour explorer.`
                );
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des produits:', error);
            if (axios.isAxiosError(error)) {
                console.error('Détails de l\'erreur:', {
                    url: error.config?.url,
                    status: error.response?.status,
                    data: error.response?.data
                });
            }
            setLoading(false);

            // Annonce d'erreur pour les lecteurs d'écran
            if (screenReaderEnabled) {
                AccessibilityInfo.announceForAccessibility(
                    "Erreur lors du chargement des produits. Veuillez réessayer."
                );
            }
        }
    };

    const handleProductClick = (product: Product) => {
        router.push({
            pathname: "/products/[id]",
            params: {
                id: product.id || product.code,
                product: JSON.stringify(product)
            }
        });
    };

    const renderProduct = ({ item }: { item: Product }) => {
        // Préparer le texte d'accessibilité pour le produit
        const accessibilityLabel = `${item.name}, ${item.price.toFixed(2)} euros`;
        const accessibilityHint = "Appuyez deux fois pour voir les détails du produit";

        return (
            <TouchableOpacity
                style={styles.productCard}
                onPress={() => handleProductClick(item)}
                accessible={true}
                accessibilityLabel={accessibilityLabel}
                accessibilityHint={accessibilityHint}
                accessibilityRole="button"
            >
                <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.productImage}
                    resizeMode="contain"
                    accessible={false} // Les lecteurs d'écran ne liront pas l'image séparément
                />
                <View style={styles.productDetails}>
                    <Text
                        style={styles.productName}
                        numberOfLines={2}
                    >
                        {item.name}
                    </Text>
                    <Text style={styles.productPrice}>
                        {item.price.toFixed(2)}€
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && products.length === 0) {
        return (
            <View
                style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}
                accessible={true}
                accessibilityLabel="Chargement des produits en cours"
                accessibilityRole="progressbar"
            >
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={{ marginTop: 10, color: '#4B5563' }}>Chargement des produits...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={products}
                renderItem={renderProduct}
                keyExtractor={(item) => item._id || item.code}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
                refreshing={loading}
                onRefresh={fetchProducts}
                accessible={false} // La FlatList elle-même ne doit pas être annoncée
                accessibilityRole="list"
                initialNumToRender={6} // Charge moins d'éléments initialement pour améliorer les performances
                maxToRenderPerBatch={4}
                windowSize={5}
                // En-tête d'accessibilité pour la liste
                ListHeaderComponent={
                    <View
                        accessible={true}
                        accessibilityRole="header"
                        accessibilityLabel={`Liste de ${products.length} produits. Faites défiler pour explorer.`}
                    />
                }
                // Message si la liste est vide
                ListEmptyComponent={
                    <View
                        style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}
                        accessible={true}
                        accessibilityLabel="Aucun produit disponible"
                    >
                        <Text style={{ fontSize: 16, color: '#4B5563' }}>
                            Aucun produit disponible.
                        </Text>
                    </View>
                }
            />
        </View>
    );
}