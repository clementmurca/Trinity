import { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { Product } from '@/constants/types';
import { API_URL, API_TOKEN } from '@/env';
import "../../global.css"

export default function PromotionSection() {
    const [promoProducts, setPromoProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchPromoProducts();
    }, []);

    const fetchPromoProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get<Product[]>(
                `${API_URL}/api/products`,
                {
                    headers: {
                        Authorization: `Bearer ${API_TOKEN}`,
                    },
                }
            );
            const allProducts = response.data;
            const randomProducts = [];
            
            if (allProducts.length <= 4) {
                setPromoProducts(allProducts);
            } else {
                const selectedIndices = new Set();

                while (randomProducts.length < 4) {
                    const randomIndex = Math.floor(Math.random() * allProducts.length);
                    
                    if (!selectedIndices.has(randomIndex)) {
                        selectedIndices.add(randomIndex);
                        randomProducts.push(allProducts[randomIndex]);
                    }
                }
                setPromoProducts(randomProducts);
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    const handleProductClick = (product: Product) => {
        router.push({
            pathname: "/products/[id]",
            params: {
                id: product._id || product.code,
                product: JSON.stringify(product)
            }
        });
    };

    const renderPromoProduct = (item: Product) => (
        <TouchableOpacity 
    key={item._id || item.code}
    className="w-[48%] mb-4 bg-white rounded-lg overflow-hidden shadow-md relative hover:border-2 hover:border-blue-500 active:border-2 active:border-blue-500 duration-2"
    onPress={() => handleProductClick(item)}
    accessible={true}
    accessibilityLabel={`Produit en promotion: ${item.name}, prix: ${item.price.toFixed(2)} euros`}
    accessibilityHint="Appuyez pour voir les détails du produit"
    accessibilityRole="button"
>
            <View className="absolute top-2 right-2 bg-red-600 px-2 py-1 rounded z-10">
                <Text className="text-white font-bold text-xs" accessibilityRole="text">PROMO</Text>
            </View>
            <Image 
                source={{ uri: item.imageUrl }} 
                className="w-full h-[150px] bg-white py-3"
                resizeMode="contain"
                accessible={true}
                accessibilityLabel={`Image du produit ${item.name}`}
            />
            <View className="px-2 py-3">
                <Text className="text-lg font-bold text-gray-800 mb-1" numberOfLines={2} accessibilityRole="text">{item.name}</Text>
                <Text className="text-lg font-bold text-gray-800" accessibilityRole="text">{item.price.toFixed(2)}€</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading && promoProducts.length === 0) {
        return (
            <View className="p-5 items-center" accessibilityRole="progressbar" accessibilityLabel="Chargement des promotions en cours">
                <ActivityIndicator size="large" color="#000000" />
                <Text className="mt-2 text-base">Chargement des promotions...</Text>
            </View>
        );
    }

    const createRows = (data: Product[]) => {
        const rows = [];
        for (let i = 0; i < data.length; i += 2) {
            rows.push(
                <View key={`row-${i}`} className="flex-row justify-between">
                    {renderPromoProduct(data[i])}
                    {i + 1 < data.length ? renderPromoProduct(data[i + 1]) : <View className="w-[48%]" />}
                </View>
            );
        }
        return rows;
    };

    return (
        <View className="bg-gray-100 px-2 py-4">
            <Text className="text-2xl mb-4 px-2">Promotions</Text>
            <View>
                {createRows(promoProducts)}
            </View>
            {loading && (
                <View className="items-center py-2">
                    <ActivityIndicator size="small" color="#000000" />
                </View>
            )}
        </View>
    );
}
