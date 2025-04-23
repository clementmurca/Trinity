import React from 'react';
import { View, Text, SafeAreaView, ImageBackground, ScrollView, Pressable } from 'react-native';
import { Link } from 'expo-router';
import "../../global.css"
import RecommandProducts from '../recommandProducts';
import PromotionSection from '../promotionProducts';

const HomeScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-100 mt-4">
      <ScrollView>
        <View>
          <RecommandProducts />
        </View>
        <View className="w-full h-64" accessible={true} accessibilityLabel="Section des fruits et légumes">
          <ImageBackground
            source={require('../../assets/images/fruits-legumes.jpg')}
            className="w-full h-full bg-cover"
          >
            <View className="absolute inset-0 bg-black/30 w-full h-full" />
            <View className="flex-1 justify-end mb-8">
              <Text className="text-white font-medium uppercase ml-4 pb-2">5 fruits et légumes par jour</Text>
              <Text className="text-white text-lg font-bold ml-4">Nos fruits et légumes</Text>
              <Link href="./products" asChild>
                <Pressable
                className="bg-transparent p-3 rounded-full border-2 border-white ml-4 mt-2 w-40 active:bg-white/30 active:scale-95 hover:border-blue-500 active:border-2 active:border-blue-500 hover:bg-white/20 transition-all"
                accessibilityLabel="Découvrir les fruits et légumes" 
                accessibilityRole="button" 
                accessibilityHint="Navigue vers la section des fruits et légumes"
                >
                  <Text className="text-white font-bold text-center">Découvrir</Text>
                </Pressable>
              </Link>
            </View>
          </ImageBackground>
        </View>

        <View className="border-b border-white my-1" />

        <View className="w-full h-64" accessible={true} accessibilityLabel="Section du petit déjeuner">
          <ImageBackground
            source={require('../../assets/images/petit-dejeune.jpg')}
            className="w-full h-full bg-cover"
          >
            <View className="absolute inset-0 bg-black/30 w-full h-full" />
            <View className="flex-1 justify-end mb-8 relative">
              <Text className="text-white font-medium uppercase ml-4 pb-2">Petit déjeuné</Text>
              <Text className="text-white text-lg font-bold ml-4">Produit du matin</Text>
              <Link href="./products" asChild>
                <Pressable
                  className="transparent p-3 rounded-full border-2 border-white ml-4 mt-2 w-40 active:bg-white/30 active:scale-95 hover:border-blue-500 active:border-2 active:border-blue-500 hover:bg-white/20 transition-all"
                  accessibilityLabel="Découvrir les produits du matin" 
                  accessibilityRole="button" 
                  accessibilityHint="Navigue vers la section des produits du matin"
                >
                  <Text className="text-white font-bold text-center">Découvrir</Text>
                </Pressable>
              </Link>
            </View>
          </ImageBackground>
        </View>

        <View className="border-b border-white my-1" />

        <View className="w-full h-64">
          <ImageBackground
            source={require('../../assets/images/boissons-sucre.jpg')}
            className="w-full h-full bg-cover"
          >
            <View className="absolute inset-0 bg-black/30 w-full h-full" />
            <View className="flex-1 justify-end mb-8" accessible={true} accessibilityLabel="Section des boissons sucrées">
              <Text className="text-white font-medium uppercase ml-4 pb-2">Un petit verre</Text>
              <Text className="text-white text-lg font-bold ml-4">Nos boissons sucrés</Text>
              <Link href="./products" asChild>
                <Pressable
                className="transparent p-3 rounded-full border-2 border-white ml-4 mt-2 w-40 active:bg-white/30 active:scale-95 hover:bg-white/20 hover:border-blue-500 active:border-2 active:border-blue-500 transition-all"
                accessibilityLabel="Découvrir les boissons sucrées" 
                accessibilityRole="button" 
                accessibilityHint="Navigue vers la section des boissons sucrées"
                >
                  <Text className="text-white font-bold text-center">Découvrir</Text>
                </Pressable>
              </Link>
            </View>
          </ImageBackground>
        </View>
        <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
          <PromotionSection />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
