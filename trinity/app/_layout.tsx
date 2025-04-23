import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { TextInput, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LogBox } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import SearchHeader from '../components/SearchHeader'

SplashScreen.preventAutoHideAsync();

function HeaderRight() {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push('/cart')}
      className="mr-4 p-2"
      accessibilityLabel="Voir mon panier"
    >
      <Ionicons name="cart-outline" size={24} color="black" />
    </TouchableOpacity>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: true,
            header: (props) => (
              <View style={{
                height: 100,
                backgroundColor: '#3B82F6',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 10,
              }}>
                <SearchHeader />
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="products/index"
          options={{
            title: 'Nos Produits',
            headerBackTitle: 'Retour',
            headerStyle: {
              backgroundColor: '#F8FAFC',
            },
          }}
        />
        <Stack.Screen
          name="products/[id]"
          options={{
            title: 'Détails du produit',
            headerBackTitle: 'Retour',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerRight: () => <HeaderRight />,
            headerStyle: {
              backgroundColor: '#F8FAFC',
            },
          }}
        />
        <Stack.Screen
          name="PurchaseHistory"
          options={{
            title: 'Historique d\'achat',
            headerBackTitle: 'Retour',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerRight: () => <HeaderRight />,
            headerStyle: {
              backgroundColor: '#F8FAFC',
            },
          }}
        />
        <Stack.Screen
          name="account"
          options={{
            title: 'Mon Compte',
            headerBackTitle: 'Retour',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerRight: () => <HeaderRight />,
            headerStyle: {
              backgroundColor: '#F8FAFC',
            },
          }}
        />
        <Stack.Screen
          name="+not-found"
          options={{
            title: 'Page non trouvée',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
// Ignorer spécifiquement les erreurs de navigation
LogBox.ignoreLogs([
  "Couldn't find a navigation context",
  "Attempted to navigate",
  "Navigation context"
]);
