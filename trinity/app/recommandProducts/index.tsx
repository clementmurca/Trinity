import { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Product, CategoryRecommendation } from './types/product.types';
import { Order, OrderProduct } from './types/order.types';
import { API_URL, API_TOKEN } from '@/env';
import { useRouter } from 'expo-router';
import "../../global.css";

const RecommandProducts: React.FC = () => {
    const [categoryRecommendations, setCategoryRecommendations] = useState<CategoryRecommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchCategoryRecommendations();
    }, []);

    const fetchCategoryRecommendations = async (): Promise<void> => {
    try {
        const ordersResponse = await axios.get(
            `${API_URL}/api/orders`,
            {
            headers: {
                Authorization: `Bearer ${API_TOKEN}`,
            },
            }
        );
    const orders: Order[] = ordersResponse.data;

    const categoryCounter: Record<string, number> = {};

    orders.forEach((order: Order) => {
        order.products.forEach((item: OrderProduct) => {
            const category = item.product.category || item.product.brand || "Autre";
            const quantity = item.quantity;
        
            if (categoryCounter[category]) {
                categoryCounter[category] += quantity;
            } else {
                categoryCounter[category] = quantity;
            }
        });
    });

    const sortedCategories = Object.entries(categoryCounter)
        .sort((a, b) => b[1] - a[1])
        .map(item => item[0]);

    const productsResponse = await axios.get(
        `${API_URL}/api/products`,
        {
            headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            },
        }
    );
    const allProducts: Product[] = productsResponse.data;

    const recommendations: CategoryRecommendation[] = [];

    for (const category of sortedCategories) {
        const categoryProducts = allProducts
            .filter((product: Product) => 
                product.category === category || 
                (!product.category && product.brand === category)
        )
            .slice(0, 3);
        
        if (categoryProducts.length > 0) {
            recommendations.push({
                category,
                products: categoryProducts
            });
            }
        }

        if (recommendations.length === 0 && allProducts.length > 0) {
            recommendations.push({
            category: "Produits populaires",
            products: allProducts.slice(0, 5)
            });
        }

            setCategoryRecommendations(recommendations);
            setLoading(false);
        } catch (error) {
            setError('Impossible de charger les recommandations');
            setLoading(false);
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

    const renderProductItem = ({ item }: { item: Product }): React.ReactElement => (
        <TouchableOpacity 
            className="mr-6 w-52 bg-white rounded-lg my-4 hover:border-2 hover:border-blue-500 active:border-2 active:border-blue-500 shadow-sm hover:shadow-md duration-2"
            onPress={() => handleProductClick(item)}
            accessible={true}
            accessibilityLabel={`Produit ${item.name}, prix: ${item.price.toFixed(2)} euros`}
            accessibilityHint="Appuyez pour voir les détails du produit"
            accessibilityRole="button"
        >
            <View className='bg-white rounded-lg'>
                <Image 
                    source={{ uri: item.imageUrl }} 
                    className="w-full h-36 rounded-lg p-2"
                    resizeMode="contain"
                    accessible={true}
                    accessibilityLabel={`Image du produit ${item.name}`}
                />
            </View>
            <View className="p-3">
                <Text 
                    className="font-bold text-lg mb-1 text-gray-800" 
                    numberOfLines={2}
                    accessibilityRole="text"
                >
                    {item.name}
                </Text>
                <Text 
                    className="font-bold text-lg"
                    accessibilityRole="text"
                >
                    {item.price.toFixed(2)} €
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View 
                className="flex-1 justify-center items-center"
                accessibilityRole="progressbar"
                accessibilityLabel="Chargement des recommandations en cours"
            >
                <ActivityIndicator size="large" color="#0000ff" />
                <Text className="mt-2">Chargement des recommandations...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center p-4">
                <Text 
                    className="text-red-500 mb-4"
                    accessibilityRole="alert"
                >
                    {error}
                </Text>
                <TouchableOpacity 
                    className="bg-blue-500 py-2 px-4 rounded-lg hover:bg-blue-500 active:bg-blue-500 duration-2"
                    onPress={fetchCategoryRecommendations}
                    accessible={true}
                    accessibilityLabel="Réessayer de charger les recommandations"
                    accessibilityRole="button"
                >
                    <Text className="text-white font-bold">Réessayer</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (categoryRecommendations.length === 0) {
        return (
            <View 
                className="flex-1 justify-center items-center p-4"
                accessibilityRole="text"
            >
                <Text className="text-lg text-gray-600">Aucune recommandation disponible pour le moment.</Text>
            </View>
        );
    }

    return (
        <View>
            <Text 
            className="text-2xl mb-4 px-4"
            accessibilityRole="header"
            >
            Recommandations pour vous
            </Text>
                {categoryRecommendations.map((item) => (
                    <View key={item.category}>
                    <Text 
                        className="text-lg mb-2 px-4"
                        accessibilityRole="header"
                    >
                        Nos {item.category}
                    </Text>
                    <FlatList
                        data={item.products}
                        renderItem={renderProductItem}
                        keyExtractor={(product) => product._id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerClassName="px-4"
                        accessible={true}
                        accessibilityLabel={`Liste des produits ${item.category}`}
                    />
                    </View>
                ))}
        </View>
    );
};

export default RecommandProducts;
