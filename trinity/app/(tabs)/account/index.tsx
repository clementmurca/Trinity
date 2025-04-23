// app/(tabs)/account/index.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, LogBox } from "react-native";
import { Link, useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { axiosInstance } from "../../../redux/authService";

// Ignore specific warnings to prevent them from showing in development
LogBox.ignoreLogs(['Logout API error']);

const Account = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check session when component mountswhe
  useEffect(() => {
    let isMounted = true;
  
    const checkSession = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("token");
        const user = await AsyncStorage.getItem("user");
  
        if (!token || !user) {
          console.log("🔹 No active session found. Redirecting to login.");
          setIsLoggedIn(false);
          if (isMounted) router.replace("/account/login");
        } else {
          console.log("✅ Session found, showing menu.");
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("❌ Error checking session:", error);
        setIsLoggedIn(false);
        if (isMounted) router.replace("/account/login");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
  
    checkSession();
  
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Completely silent logout function
  const handleLogout = async () => {
    // Immediately start navigating to avoid showing error messages
    // This prevents the error from appearing in the UI by starting the transition right away
    router.replace("/account/login");
    
    // Then clean up on the backend
    try {
      // Disable console error logs temporarily to prevent React Native from showing them in UI
      const originalConsoleError = console.error;
      console.error = (...args) => {
        // Only log to development console if not an axios error
        if (!args[0].includes('AxiosError')) {
          originalConsoleError(...args);
        }
      };
      
      console.log("🔹 Clearing session data...");
      await AsyncStorage.clear();
      setIsLoggedIn(false);
      
      // Try logout API call silently (after navigation has started)
      try {
        console.log("🔹 Fetching fresh CSRF token before logout...");
        const csrfResponse = await axiosInstance.get("/csrf-token", { timeout: 3000 });
        const csrfToken = csrfResponse.data.csrfToken;
        
        await axiosInstance.post(
          "/auth/logout",
          {},
          { headers: { "X-CSRF-Token": csrfToken } }
        );
      } catch (apiError) {
        // Completely silent - don't even log to console to prevent red box
      }
      
      // Restore console.error
      console.error = originalConsoleError;
    } catch (err) {
      // Keep this completely silent
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      
      {/* 🛒 Purchase History */}
      <Link href="../../purchaseHistory" asChild>
        <TouchableOpacity style={styles.menuButton} accessible accessibilityLabel="Historique d'achats" accessibilityHint="Consulter l'historique de vos achats" accessibilityRole="button">
          <View style={styles.menuItem}>
            <Ionicons name="cart-outline" size={20} color="#374151" />
            <Text style={styles.menuText}>Purchase History</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#374151" />
        </TouchableOpacity>
      </Link>
      
      {/* 👤 Profile */}
      <Link href="/account/profile" asChild>
        <TouchableOpacity style={styles.menuButton} accessible accessibilityLabel="Profil" accessibilityHint="Modifier votre profil" accessibilityRole="button">
          <View style={styles.menuItem}>
            <Ionicons name="person-outline" size={20} color="#374151" />
            <Text style={styles.menuText}>Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#374151" />
        </TouchableOpacity>
      </Link>
      
      {/* 🚪 Logout */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} accessible accessibilityLabel="Déconnexion" accessibilityHint="Se déconnecter de l'application" accessibilityRole="button">
        <View style={styles.menuItem}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={[styles.menuText, { color: "#fff" }]}>Logout</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 8,
    color: "#374151",
    fontSize: 16,
  },
  menuButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    color: "#374151",
    fontWeight: "500",
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
});

export default Account;