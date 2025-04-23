import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    AccessibilityInfo,
    AccessibilityRole
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Product } from '@/constants/types';
import { addToCart } from '@/services/cartService';
import { Ionicons } from '@expo/vector-icons';

export default function ProductDetailScreen() {
    const [loading, setLoading] = useState(false);
    const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
    const params = useLocalSearchParams();
    const router = useRouter();
    const product: Product = params.product ? JSON.parse(params.product as string) : null;

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

        // Annoncer le nom du produit quand il est chargé
        if (product && screenReaderEnabled) {
            AccessibilityInfo.announceForAccessibility(
                `Page détaillée du produit ${product.name}`
            );
        }

        return () => {
            subscription.remove();
        };
    }, [product]);

    const handleAddToCart = async () => {
        if (!product) {
            Alert.alert('Erreur', 'Impossible d\'ajouter ce produit au panier.');
            return;
        }

        const productId = product._id;
        if (!productId) {
            Alert.alert('Erreur', 'Identifiant du produit manquant.');
            return;
        }

        setLoading(true);
        const success = await addToCart(productId, 1);
        setLoading(false);

        if (success) {
            // Annonce pour les lecteurs d'écran
            if (screenReaderEnabled) {
                AccessibilityInfo.announceForAccessibility(
                    `${product.name} a été ajouté à votre panier.`
                );
            }

            Alert.alert(
                'Produit ajouté',
                `${product.name} a été ajouté à votre panier.`,
                [
                    {
                        text: 'Continuer mes achats',
                        onPress: () => router.push('/products'),
                    },
                    {
                        text: 'Voir mon panier',
                        onPress: () => router.push('/cart'),
                    },
                ],
                { cancelable: true }
            );
        } else if (product.stock !== undefined && product.stock <= 0) {
            if (screenReaderEnabled) {
                AccessibilityInfo.announceForAccessibility(
                    'Le produit est en rupture de stock.'
                );
            }
            Alert.alert('Erreur', 'Le produit est en rupture de stock.');
        } else {
            Alert.alert('Erreur', 'Impossible d\'ajouter le produit au panier. Veuillez réessayer.');
        }
    };

    if (!product) {
        return (
            <View
                style={styles.errorContainer}
                accessible={true}
                accessibilityLabel="Produit non trouvé"
                accessibilityRole="alert"
            >
                <Text style={styles.errorText}>Produit non trouvé</Text>
            </View>
        );
    }

    //  textes d'accessibilité pour les valeurs nutritionnelles
    const getNutritionAccessibilityLabel = () => {
        if (!product.nutritionFacts) return "Valeurs nutritionnelles non disponibles";

        return `Valeurs nutritionnelles pour 100 grammes. ` +
            `Énergie : ${product.nutritionFacts.energy_100g} kilocalories. ` +
            `Protéines : ${product.nutritionFacts.proteins_100g} grammes. ` +
            `Glucides : ${product.nutritionFacts.carbohydrates_100g} grammes. ` +
            `Lipides : ${product.nutritionFacts.fat_100g} grammes. ` +
            `Fibres : ${product.nutritionFacts.fiber_100g} grammes. ` +
            `Sel : ${product.nutritionFacts.salt_100g} grammes.`;
    };

    //  texte d'accessibilité pour le statut du stock
    const getStockAccessibilityLabel = () => {
        if (product.stock === undefined) return "Stock non disponible";
        if (product.stock <= 0) return "Produit en rupture de stock";
        if (product.stock < 5) return `Attention, stock limité : ${product.stock} unités restantes`;
        return `En stock : ${product.stock} unités disponibles`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                accessible={false} // La ScrollView elle-même ne doit pas être accessible
            >
                <View
                    style={styles.imageContainer}
                    accessible={true}
                    accessibilityLabel={`Image du produit ${product.name}`}
                    accessibilityRole="image"
                >
                    <Image
                        source={{ uri: product.imageUrl }}
                        style={styles.productImage}
                        resizeMode="contain"
                        accessible={false} // L'image elle-même n'est pas un élément accessible distinct
                    />
                </View>

                <View style={styles.contentContainer}>
                    {/* Titre et prix */}
                    <View
                        accessible={true}
                        accessibilityLabel={`${product.name}, Prix: ${product.price.toFixed(2)} euros`}
                        accessibilityRole="header"
                    >
                        <Text style={styles.productName}>{product.name}</Text>
                        <Text style={styles.productPrice}>{product.price.toFixed(2)}€</Text>
                    </View>

                    {/* Informations du produit */}
                    <View
                        style={styles.infoSection}
                        accessible={true}
                        accessibilityLabel={`Informations sur le produit. Poids: ${product.quantity}. Catégories: ${product.category ? product.category.join(', ') : 'Non spécifiées'}. Marque: ${product.brand || 'Non spécifiée'}.`}
                        accessibilityRole="text"
                    >
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Poids : </Text>
                            <Text style={styles.infoValue}>{product.quantity}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Catégories : </Text>
                            <Text style={styles.infoValue}>
                                {product.category ? product.category.join(', ') : 'Non spécifiées'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Marque : </Text>
                            <Text style={styles.infoValue}>{product.brand || 'Non spécifiée'}</Text>
                        </View>
                    </View>

                    {/* Information sur le stock avec indication visuelle et vocale */}
                    <View
                        style={styles.infoRow}
                        accessible={true}
                        accessibilityLabel={getStockAccessibilityLabel()}
                        accessibilityRole="text"
                        accessibilityState={{
                            disabled: product.stock !== undefined && product.stock <= 0
                        }}
                    >
                        <Text style={styles.infoLabel}>Stock : </Text>
                        <Text
                            style={[
                                styles.infoValue,
                                product.stock !== undefined && product.stock <= 0 ? styles.outOfStock : null,
                                product.stock !== undefined && product.stock < 5 ? styles.lowStock : null
                            ]}
                        >
                            {product.stock} unité(s)
                        </Text>
                    </View>

                    {/* Valeurs nutritionnelles */}
                    <View
                        style={styles.nutritionSection}
                        accessible={true}
                        accessibilityLabel={getNutritionAccessibilityLabel()}
                        accessibilityRole="text"
                    >
                        <Text style={styles.sectionTitle}>
                            {product.nutritionFacts
                                ? "Valeurs nutritionnelles (pour 100g)"
                                : "Valeurs nutritionnelles non disponibles"}
                        </Text>

                        {product.nutritionFacts && (
                            <View style={styles.nutritionTable}>
                                <View style={styles.nutritionRow}>
                                    <Text style={styles.nutritionLabel}>Énergie</Text>
                                    <Text style={styles.nutritionValue}>{String(product.nutritionFacts.energy_100g)} kcal</Text>
                                    <Text style={styles.nutritionLabel}>Protéines</Text>
                                    <Text style={styles.nutritionValue}>{String(product.nutritionFacts.proteins_100g)} g</Text>
                                </View>

                                <View style={styles.nutritionRow}>
                                    <Text style={styles.nutritionLabel}>Glucides</Text>
                                    <Text style={styles.nutritionValue}>{String(product.nutritionFacts.carbohydrates_100g)} g</Text>
                                    <Text style={styles.nutritionLabel}>Lipides</Text>
                                    <Text style={styles.nutritionValue}>{String(product.nutritionFacts.fat_100g)} g</Text>
                                </View>

                                <View style={styles.nutritionRow}>
                                    <Text style={styles.nutritionLabel}>Fibres</Text>
                                    <Text style={styles.nutritionValue}>{String(product.nutritionFacts.fiber_100g)} g</Text>
                                    <Text style={styles.nutritionLabel}>Sel</Text>
                                    <Text style={styles.nutritionValue}>{String(product.nutritionFacts.salt_100g)} g</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Bouton d'ajout au panier */}
                    <TouchableOpacity
                        style={[
                            styles.addToCartButton,
                            (loading || (product.stock !== undefined && product.stock <= 0))
                                ? styles.disabledButton
                                : null
                        ]}
                        onPress={handleAddToCart}
                        disabled={loading || (product.stock !== undefined && product.stock <= 0)}
                        accessible={true}
                        accessibilityLabel={
                            loading
                                ? "Ajout au panier en cours"
                                : (product.stock !== undefined && product.stock <= 0)
                                    ? "Impossible d'ajouter au panier, produit en rupture de stock"
                                    : `Ajouter ${product.name} au panier`
                        }
                        accessibilityRole="button"
                        accessibilityState={{
                            disabled: loading || (product.stock !== undefined && product.stock <= 0),
                            busy: loading
                        }}
                        accessibilityHint="Appuyez deux fois pour ajouter ce produit à votre panier"
                    >
                        <Ionicons name="cart" size={20} color="white" style={styles.cartIcon} />
                        <Text style={styles.addToCartButtonText}>
                            {loading ? 'Ajout en cours...' : 'Ajouter au panier'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        marginBottom: 20,
        textAlign: 'center',
    },
    imageContainer: {
        backgroundColor: 'white',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    productImage: {
        width: '80%',
        height: 300,
        backgroundColor: 'white',
    },
    contentContainer: {
        padding: 16,
    },
    productName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 8,
    },
    productPrice: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 20,
    },
    infoSection: {
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        marginVertical: 4,
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
    },
    infoValue: {
        fontSize: 16,
        color: '#333333',
        flex: 1,
    },
    outOfStock: {
        color: 'red',
        fontWeight: 'bold',
    },
    lowStock: {
        color: 'orange',
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 10,
    },
    nutritionSection: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    nutritionTable: {
        borderWidth: 1,
        borderColor: '#EEEEEE',
        borderRadius: 4,
        overflow: 'hidden',
    },
    nutritionRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    nutritionLabel: {
        width: '25%',
        padding: 8,
        backgroundColor: '#F8F8F8',
        fontWeight: '500',
    },
    nutritionValue: {
        width: '25%',
        padding: 8,
        textAlign: 'right',
    },
    addToCartButton: {
        backgroundColor: 'black',
        padding: 15,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    disabledButton: {
        backgroundColor: '#CCCCCC',
    },
    cartIcon: {
        marginRight: 10,
    },
    addToCartButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});