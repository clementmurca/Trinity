import React, { useState, useEffect } from "react";
import { 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity 
} from "react-native";
import { Camera } from "expo-camera";
import CameraView from "expo-camera/build/CameraView";
import { useRouter } from "expo-router";

export default function Scanner() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Handler for barcode scanning: immediately navigate to result screen
  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (!scanned) {
      setScanned(true);
      router.push({
        pathname: "/(tabs)/scanner/result",
        params: { type, data },
      });
    }
  };

  // If permission status is undetermined or denied, display messages accordingly
  if (hasPermission === null) {
    return <Text style={styles.permissionText}>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
          }}
        >
          <Text style={styles.buttonText}>Request Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>SCAN PRODUCT</Text>
      <View style={styles.scannerContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: [
              "qr", "pdf417", "ean13", "ean8", "upc_e",
              "code128", "code39", "code93", "codabar", "itf14"
            ]
          }}
          style={styles.camera}
        />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setScanned(false)}
      >
        <Text style={styles.buttonText}>Scan Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  scannerContainer: {
    width: 300,
    height: 300,
    backgroundColor: "black",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "black",
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  permissionText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
    padding: 20,
  },
  button: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginVertical: 10,
    width: 300,
    alignItems: "center",
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});
