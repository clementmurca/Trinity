import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

// Import your existing cart function and env constants
import { addToCart } from "@/services/cartService"; 
import { API_URL, API_TOKEN } from "@/env";

const DEFAULT_IMAGE = "https://via.placeholder.com/300x300";

/**
 * Validate a barcode string (length & numeric).
 */
const isValidBarcode = (code: string) => {
  return code && code.length >= 8 && code.length <= 14 && /^\d+$/.test(code);
};

export default function ScannerResultScreen() {
  const { data, type } = useLocalSearchParams<{ data: string; type: string }>();
  const router = useRouter();

  // States for Open Food Facts data
  const [productOFF, setProductOFF] = useState<any>(null);
  const [loadingOFF, setLoadingOFF] = useState(false);
  const [errorOFF, setErrorOFF] = useState<string | null>(null);

  // State for adding to cart (DB check)
  const [loadingAdd, setLoadingAdd] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        if (!data || !isValidBarcode(data)) {
          setErrorOFF("Code-barres invalide");
          return;
        }

        setLoadingOFF(true);
        setErrorOFF(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(
          `https://world.openfoodfacts.org/api/v0/product/${data}.json`,
          { signal: controller.signal }
        );

        clearTimeout(timeoutId);
        const result = await response.json();

        if (result.status === 1) {
          setProductOFF(result.product);
        } else {
          setErrorOFF("Aucun produit trouvé pour ce code-barres.");
        }
      } catch (err: any) {
        setErrorOFF(
          err.name === "AbortError"
            ? "La requête a expiré"
            : "Erreur de chargement du produit"
        );
      } finally {
        setLoadingOFF(false);
      }
    };

    fetchProductData();
  }, [data]);

  /**
   * Attempt to add the scanned product to cart if it exists in your DB.
   */
  const handleAddToCart = async () => {
    try {
      setLoadingAdd(true);

      // 1) Fetch your local DB of products from /api/sellers
      const res = await axios.get(`${API_URL}/api/sellers`, {
        headers: { 
          Authorization: `Bearer ${API_TOKEN}` 
        },
      });

      // 2) Flatten all sellers into one big product array
      const allSellers = res.data.data; 
      const allProducts = allSellers.flatMap((seller: any) =>
        seller.products.map((p: any) => ({
          _id: p._id,
          code: p.code,
          name: p.name,
          brand: p.brand,
          price: p.price,
          imageUrl: p.imageUrl,
          quantity: p.quantity,
          category: p.category,
          stock: p.stock,
          nutritionFacts: p.nutritionFacts,
        }))
      );

      // 3) Find the product in your DB that matches the scanned code
      const foundProduct = allProducts.find((prod: any) => prod.code === data);

      if (!foundProduct) {
        Alert.alert(
          "Produit indisponible",
          "Ce produit n'est pas présent dans notre base de données."
        );
        return;
      }

      // 4) Check stock
      if (!foundProduct.stock || foundProduct.stock <= 0) {
        Alert.alert(
          "Stock épuisé",
          "Le produit est dans notre base, mais il est en rupture de stock."
        );
        return;
      }

      // 5) If in stock, add to cart
      const success = await addToCart(foundProduct._id, 1);
      if (success) {
        Alert.alert(
          "Produit ajouté",
          `${foundProduct.name} a été ajouté à votre panier.`,
          [
            {
              text: "Continuer",
              style: "cancel",
            },
            {
              text: "Voir le panier",
              onPress: () => router.push("/(tabs)/cart"),
            },
          ]
        );
      } else {
        Alert.alert(
          "Erreur",
          "Impossible d'ajouter le produit au panier. Veuillez réessayer."
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
      Alert.alert(
        "Erreur",
        "Une erreur s'est produite lors de l'ajout au panier. Veuillez réessayer."
      );
    } finally {
      setLoadingAdd(false);
    }
  };

  // Helper to read a numeric value from the OFF nutriments
  const nutrimentValue = (key: string) =>
    productOFF?.nutriments?.[key] ?? "N/A";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Basic scanned info */}
        <Text style={styles.scanInfo}>
          ✅ Code scanné : {data} {"\n"}🔍 Type : {type}
        </Text>

        {/* Loading from OFF */}
        {loadingOFF && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text>Chargement des informations produit...</Text>
          </View>
        )}

        {/* Error from OFF */}
        {!loadingOFF && errorOFF && (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{errorOFF}</Text>
          </View>
        )}

        {/* Display OFF info (if any) */}
        {!loadingOFF && productOFF && (
          <>
            {/* Image */}
            <Image
              source={{ uri: productOFF.image_url || DEFAULT_IMAGE }}
              style={styles.productImage}
              defaultSource={{ uri: DEFAULT_IMAGE }}
            />

            {/* Basic fields */}
            <Text style={styles.productName}>
              {productOFF.product_name || "Nom inconnu"}
            </Text>
            <Text style={styles.productInfo}>
              Marque : {productOFF.brands || "Marque inconnue"}
            </Text>
            <Text style={styles.productInfo}>
              Poids : {productOFF.quantity || "N/A"}
            </Text>
            <Text style={styles.productInfo}>
              Catégories :{" "}
              {productOFF.categories_tags
                ? productOFF.categories_tags
                    .map((c: string) => c.replace("en:", ""))
                    .join(", ")
                : "Non spécifiées"}
            </Text>

            {/* Nutritional values */}
            <Text style={styles.sectionTitle}>
              Valeurs nutritionnelles (pour 100g)
            </Text>
            <View style={styles.nutritionRow}>
              <Text>Énergie: {nutrimentValue("energy_100g")} kcal</Text>
              <Text>Protéines: {nutrimentValue("proteins_100g")} g</Text>
              <Text>Glucides: {nutrimentValue("carbohydrates_100g")} g</Text>
              <Text>Sucres: {nutrimentValue("sugars_100g")} g</Text>
              <Text>Lipides: {nutrimentValue("fat_100g")} g</Text>
              <Text>Fibres: {nutrimentValue("fiber_100g")} g</Text>
              <Text>Sel: {nutrimentValue("salt_100g")} g</Text>
            </View>
          </>
        )}

        {/* Buttons: Rescan / Add to Cart */}
        <View style={styles.buttons}>
          {/* Scanner à nouveau */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/(tabs)/scanner")}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
            <Text style={styles.buttonText}>Scanner à nouveau</Text>
          </TouchableOpacity>

          {/* Ajouter au panier */}
          <TouchableOpacity
            style={[styles.addButton, loadingAdd && { opacity: 0.7 }]}
            onPress={handleAddToCart}
            disabled={loadingAdd}
          >
            <Ionicons name="cart" size={20} color="white" />
            <Text style={styles.buttonText}>
              {loadingAdd ? "Ajout..." : "Ajouter au panier"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* --- STYLES --- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    padding: 16,
  },
  centered: {
    alignItems: "center",
    marginTop: 32,
  },
  scanInfo: {
    fontSize: 16,
    marginBottom: 16,
    color: "#1f2937",
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
  },
  productImage: {
    width: "100%",
    height: 250,
    resizeMode: "contain",
    marginBottom: 16,
    backgroundColor: "white",
  },
  productName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  productInfo: {
    fontSize: 16,
    marginBottom: 4,
  },
  sectionTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  nutritionRow: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 4,
  },
  buttons: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  backButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addButton: {
    backgroundColor: "#16A34A",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
