import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { login, resetError } from "../../../redux/authSlice";
import { RootState, AppDispatch } from "../../../redux/store";
import { LoginCredentials } from "../../../redux/authSlice";
import authService from "../../../redux/authService";

const Login: React.FC<{ onLoginSuccess?: () => void }> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState<LoginCredentials>({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleChange = (key: keyof LoginCredentials, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    console.log("🔹 Login button clicked!");
    try {
      console.log("🔄 Resetting old session data...");
      await AsyncStorage.clear();

      console.log("🔹 Fetching CSRF token...");
      await authService.getCsrfToken();

      console.log("🔹 Dispatching login request with:", formData);
      const resultAction = await dispatch(login(formData));

      console.log("🔹 Full login response:", resultAction);
      if (login.fulfilled.match(resultAction)) {
        console.log("✅ Login successful:", resultAction.payload);

        if (!resultAction.payload?.user) {
          console.error("❌ API Response missing user:", resultAction.payload);
          Alert.alert("Login Error", "Invalid user data received.");
          return;
        }

        const user = resultAction.payload.user;
        const userId = user?.id || user?._id;
        console.log("🔹 Extracted userId:", userId);
        if (!userId) {
          Alert.alert("Login Error", "Missing user ID in server response.");
          return;
        }

        await AsyncStorage.setItem("user", JSON.stringify(user));
        await AsyncStorage.setItem("userId", String(userId));
        await AsyncStorage.setItem("token", resultAction.payload.tokens.accessToken);

        dispatch(resetError());
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        // Navigate to the Account menu screen
        router.replace("/account");
      } else {
        Alert.alert("Login Error", "Invalid credentials");
      }
    } catch (error) {
      console.error("🔥 Login error:", error);
      Alert.alert("Login Error", "Failed to login");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Please log in to your account</Text>
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.identifier}
        onChangeText={(text) => handleChange("identifier", text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Password"
          value={formData.password}
          onChangeText={(text) => handleChange("password", text)}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} style={styles.eyeButton}>
          <Ionicons name={showPassword ? "eye" : "eye-off"} size={24} color="#555" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => Alert.alert("Reset Password", "Password reset functionality coming soon!")}>
        <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginButton} onPress={handleSubmit} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Login</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.googleButton} onPress={() => Alert.alert("Google Login", "Google login functionality coming soon!")}>
        <Ionicons name="logo-google" size={24} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.googleButtonText}>Login with Google</Text>
      </TouchableOpacity>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => router.replace("/account/signup")}>
          <Text style={[styles.footerText, styles.footerLink]}> Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: "#dc2626",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  eyeButton: {
    padding: 10,
  },
  forgotPasswordText: {
    color: "#3B82F6",
    textAlign: "right",
    marginBottom: 24,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#db4437",
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  googleButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#6b7280",
  },
  footerLink: {
    color: "#3B82F6",
    fontWeight: "600",
  },
});

export default Login;
