// app/(tabs)/account/profile.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { axiosInstance } from "../../../redux/authService";

interface BillingData {
  address: string;
  zipCode: string;
  city: string;
  country: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string; // read-only
  status: string; // read-only
  billing: BillingData;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
}

const Profile: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "",
    status: "",
    billing: { address: "", zipCode: "", city: "", country: "" },
  });
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
  });

  // Fetch user data when the screen is focused.
  useFocusEffect(
    React.useCallback(() => {
      const fetchUserData = async () => {
        setLoading(true);
        try {
          const userId = await AsyncStorage.getItem("userId");
          const token = await AsyncStorage.getItem("token");
          if (!userId || !token) {
            console.log("❌ No userId or token found. Redirecting to login.");
            await AsyncStorage.clear();
            router.replace("/account/login");
            return;
          }
          console.log("🔹 Fetching user data for userId:", userId);
          // IMPORTANT: Ensure that your backend route is correct.
          // If your backend expects /api/users/:id, then use that:
          const response = await axiosInstance.get(`/api/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("✅ Full API Response:", response.data);
          const userData = response.data.data;
          if (!userData || !userData.firstName) {
            console.error("❌ Invalid response format:", response);
            Alert.alert("Error", "Invalid user data received.");
            return;
          }
          setFormData({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            phoneNumber: userData.phoneNumber || "",
            role: userData.role || "",
            status: userData.status || "",
            billing: {
              address: userData.billing?.address || "",
              zipCode: userData.billing?.zipCode || "",
              city: userData.billing?.city || "",
              country: userData.billing?.country || "",
            },
          });
        } catch (error: any) {
          console.error("❌ Error fetching user data:", error?.response?.data || error);
          Alert.alert("Error", "Failed to fetch user data.");
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }, [])
  );

  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("token");
      if (!userId || !token) {
        Alert.alert("Error", "User session expired. Please log in again.");
        return;
      }
      await axiosInstance.put(
        `/api/users/${userId}`,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          billing: formData.billing,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert("Success", "Profile updated successfully!");
      // Refresh data
      // (You may call fetchUserData here again if needed)
    } catch (error: any) {
      console.error("❌ Error updating profile:", error?.response?.data || error);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async () => {
    setPasswordUpdating(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("token");
      if (!userId || !token) {
        Alert.alert("Error", "User session expired. Please log in again.");
        return;
      }
      // Assume your backend endpoint for password update is /api/users/:id/password
      await axiosInstance.put(
        `/api/users/${userId}/password`,
        passwordData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert("Success", "Password updated successfully!");
      setPasswordData({ currentPassword: "", newPassword: "" });
    } catch (error: any) {
      console.error("❌ Error updating password:", error?.response?.data || error);
      Alert.alert("Error", "Failed to update password.");
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBillingChange = (field: keyof BillingData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      billing: { ...prev.billing, [field]: value },
    }));
  };

  return (
    <ScrollView style={styles.container}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Personal Information</Text>
        <Text style={styles.cardSubtitle}>Manage your account settings</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : formData.firstName ? (
        <View style={styles.cardContent}>
          {/* Personal Info Form */}
          <View style={styles.formSection}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={formData.firstName}
              onChangeText={(text) => handleInputChange("firstName", text)}
              placeholder="First Name"
            />
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={formData.lastName}
              onChangeText={(text) => handleInputChange("lastName", text)}
              placeholder="Last Name"
            />
            <Text style={styles.label}>Email</Text>
            <View style={[styles.input, styles.readOnly]}>
              <Text>{formData.email}</Text>
            </View>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={formData.phoneNumber}
              onChangeText={(text) => handleInputChange("phoneNumber", text)}
              placeholder="Phone Number"
            />
            <Text style={styles.label}>Role</Text>
            <View style={[styles.input, styles.readOnly]}>
              <Text>{formData.role}</Text>
            </View>
            <Text style={styles.label}>Status</Text>
            <View style={[styles.input, styles.readOnly]}>
              <Text>{formData.status}</Text>
            </View>
            <Text style={styles.label}>Billing Address</Text>
            <TextInput
              style={styles.input}
              value={formData.billing.address}
              onChangeText={(text) => handleBillingChange("address", text)}
              placeholder="Address"
            />
            <Text style={styles.label}>Zip Code</Text>
            <TextInput
              style={styles.input}
              value={formData.billing.zipCode}
              onChangeText={(text) => handleBillingChange("zipCode", text)}
              placeholder="Zip Code"
            />
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={formData.billing.city}
              onChangeText={(text) => handleBillingChange("city", text)}
              placeholder="City"
            />
            <Text style={styles.label}>Country</Text>
            <TextInput
              style={styles.input}
              value={formData.billing.country}
              onChangeText={(text) => handleBillingChange("country", text)}
              placeholder="Country"
            />
            <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile} disabled={updating}>
              {updating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Update Profile</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Password Update Section */}
          <View style={[styles.formSection, { marginTop: 20 }]}>
            <Text style={styles.sectionHeader}>Change Password</Text>
            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              value={passwordData.currentPassword}
              onChangeText={(text) => handlePasswordChange("currentPassword", text)}
              secureTextEntry
            />
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              value={passwordData.newPassword}
              onChangeText={(text) => handlePasswordChange("newPassword", text)}
              secureTextEntry
            />
            <TouchableOpacity style={styles.updateButton} onPress={handlePasswordSubmit} disabled={passwordUpdating}>
              {passwordUpdating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={styles.errorTextCenter}>⚠️ No user data found.</Text>
      )}
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  cardHeader: {
    backgroundColor: "#173334",
    padding: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginBottom: 8,
  },
  cardTitle: { fontSize: 22, fontWeight: "700", color: "#fff", marginBottom: 4 },
  cardSubtitle: { fontSize: 16, color: "#fff", opacity: 0.9 },
  cardContent: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  formSection: { marginBottom: 16 },
  sectionHeader: { fontSize: 20, fontWeight: "600", color: "#111827", marginBottom: 12 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
  },
  readOnly: { backgroundColor: "#E5E7EB" },
  updateButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  errorTextCenter: { color: "red", textAlign: "center", marginTop: 20 },
});
