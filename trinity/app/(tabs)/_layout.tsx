
import { Tabs } from "expo-router";
import { Provider } from "react-redux";
import store from "../../redux/store";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { IconSymbol } from "@/components/ui/IconSymbol";


export default function TabsLayout() {
  return (
    <Provider store={store}>
      {/* Wrap navigation inside Redux Provider */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#3B82F6",
          tabBarInactiveTintColor: "#64748B",
          tabBarStyle: {
            backgroundColor: "#F8FAFC",
            borderTopWidth: 1,
            borderTopColor: "#E2E8F0",
            height: 80,
            paddingBottom: 16,
            paddingTop: 8,
          },

        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Accueil",
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: "Compte",
            href: "/account", 
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="scanner"
          options={{
            title: "Scanner",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="barcode-scan" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: "Panier",
            tabBarIcon: ({ color, size }) => (
              <FontAwesome5 name="shopping-cart" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </Provider>

  );
}
