import { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, Text, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import "../global.css";
import axios from 'axios';
import { API_URL, API_TOKEN } from '@/env';
import { Product, Seller } from '@/constants/types';

const SearchHeader = () => {
    const [searchText, setSearchText] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const router = useRouter();

    useEffect(() => {
    const fetchProducts = async () => {
        try {
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
            } catch (error) {
            console.error('Erreur lors de la récupération des produits:', error);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        if (searchText.trim() === '') {
            setFilteredProducts([]);
            return;
        }
    
        const filtered = products.filter(product => 
            product.name.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredProducts(filtered);
    }, [searchText, products]);

    const handleClearText = () => {
        setSearchText('');
        setFilteredProducts([]);
    };

    const handleSelectProduct = (product: Product) => {
        Keyboard.dismiss();

        setTimeout(() => {
            router.push({
                pathname: "/products/[id]",
                params: {
                id: product.id || product.code,
                product: JSON.stringify(product)
                }
            });
            setSearchText('');
            setFilteredProducts([]);
            setIsFocused(false);
        }, 50);
};

    return (
        <View className="flex-row items-center w-full mt-4 pt-6">
            <View className="flex-row items-center bg-gray-200 rounded-full px-2 py-3 flex-1">
            <Ionicons name="search" className="pl-2 ml-3" size={20} color="#374151" />
            <TextInput
                placeholder="Rechercher des produits..."
                className="flex-1 ml-3 text-gray-700"
                placeholderTextColor="#374151"
                value={searchText}
                onChangeText={setSearchText}
                onFocus={() => setIsFocused(true)}
            />
            {searchText.length > 0 && (
                <TouchableOpacity onPress={handleClearText}>
                <Ionicons name="close-circle" className="pr-4 mr-2" size={20} color="#374151" />
                </TouchableOpacity>
            )}
            </View>
            
            {isFocused && filteredProducts.length > 0 && (
            <View 
            className="absolute left-0 right-0 bg-white rounded-lg shadow-md z-10 max-h-150"
            style={{ top: 70 }}
            >
            <FlatList
            data={filteredProducts}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item, index) => `${item._id || item.code}_${index}`}
            renderItem={({ item }) => (
                <TouchableOpacity 
                className="p-3 border-b border-gray-200"
                onPress={() => handleSelectProduct(item)}
                >
                <View className="flex-row items-center">
                    <View className="flex-1">
                    <Text className="font-medium text-gray-800">{item.name}</Text>
                    </View>
                </View>
                </TouchableOpacity>
            )}
            />
            </View>
            )}
        </View>
        );
    };

export default SearchHeader;