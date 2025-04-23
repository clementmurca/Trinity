import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { register } from "../../../redux/authSlice";
import { RootState, AppDispatch } from "../../../redux/store";

// Define a local type for the signup form (instead of importing from authSlice)
export interface SignupForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  billing: {
    address: string;
    zipCode: string;
    city: string;
    country: string;
  };
}

const Signup: React.FC<{ onSignupSuccess?: () => void }> = ({ onSignupSuccess }) => {
  const [formData, setFormData] = useState<SignupForm>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    billing: { address: "", zipCode: "", city: "", country: "" },
  });
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleChange = (key: string, value: string) => {
    if (key.includes(".")) {
      const [parent, child] = key.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...(prev as any)[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [key]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      Alert.alert("Error", "First Name and Last Name are required.");
      return false;
    }
    if (!formData.email.includes("@")) {
      Alert.alert("Error", "Enter a valid email.");
      return false;
    }
    if (formData.phoneNumber.length < 8) {
      Alert.alert("Error", "Enter a valid phone number.");
      return false;
    }
    if (formData.password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      await dispatch(register(formData)).unwrap();
      Alert.alert("Success", "Account created successfully!");
      if (onSignupSuccess) await onSignupSuccess();
      router.replace("/account/login");
    } catch (err: any) {
      Alert.alert("Registration Failed", err.message || "An error occurred.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Sign up to get started</Text>
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={formData.firstName}
        onChangeText={(text) => handleChange("firstName", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={formData.lastName}
        onChangeText={(text) => handleChange("lastName", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => handleChange("email", text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={formData.phoneNumber}
        onChangeText={(text) => handleChange("phoneNumber", text)}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={formData.password}
        onChangeText={(text) => handleChange("password", text)}
        secureTextEntry
      />
      <Text style={styles.sectionTitle}>Billing Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={formData.billing.address}
        onChangeText={(text) => handleChange("billing.address", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Zip Code"
        value={formData.billing.zipCode}
        onChangeText={(text) => handleChange("billing.zipCode", text)}
        keyboardType="number-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="City"
        value={formData.billing.city}
        onChangeText={(text) => handleChange("billing.city", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Country"
        value={formData.billing.country}
        onChangeText={(text) => handleChange("billing.country", text)}
      />
      <TouchableOpacity style={styles.signupButton} onPress={handleSubmit} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signupButtonText}>Sign Up</Text>}
      </TouchableOpacity>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.replace("/account/login")}>
          <Text style={[styles.footerText, styles.footerLink]}> Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9fafb" },
  title: { fontSize: 28, fontWeight: "700", color: "#111827", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#6b7280", textAlign: "center", marginBottom: 20 },
  errorBox: { backgroundColor: "#fee2e2", padding: 12, borderRadius: 8, marginBottom: 20 },
  errorText: { color: "#dc2626", textAlign: "center" },
  input: { backgroundColor: "#fff", borderColor: "#d1d5db", borderWidth: 1, borderRadius: 8, padding: 14, fontSize: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#111827", marginBottom: 12 },
  signupButton: { backgroundColor: "#10B981", paddingVertical: 16, borderRadius: 8, alignItems: "center", marginBottom: 16 },
  signupButtonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  footer: { flexDirection: "row", justifyContent: "center" },
  footerText: { fontSize: 14, color: "#6b7280" },
  footerLink: { color: "#3B82F6", fontWeight: "600" },
});

export default Signup;
