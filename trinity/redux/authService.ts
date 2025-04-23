import { API_URL } from "../env"; // Ensure that API_URL is correctly imported and configured
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  withCredentials: true,
});

// Function to get CSRF token and store it in AsyncStorage
const getCsrfToken = async () => {
  console.log(`Attempting to connect to API at: ${API_URL}/api/csrf-token`);
  try {
    console.log("🔹 Fetching CSRF token...");
    const response = await axios.get(`${API_URL}/api/csrf-token`, { withCredentials: true, timeout: 50000 });
    if (response.data.csrfToken) {
      await AsyncStorage.setItem("csrfToken", response.data.csrfToken);
      console.log("✅ CSRF Token stored:", response.data.csrfToken);
      return response.data.csrfToken;
    }
    throw new Error("No CSRF token received");
  } catch (error) {
    console.error("❌ Failed to get CSRF token:", error);
    return null;
  }
};

// Attach Authorization & CSRF headers to every request
axiosInstance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  const csrfToken = await AsyncStorage.getItem("csrfToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (csrfToken) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});

// Register a new user (with CSRF)
const register = async (userData: any) => {
  try {
    const csrfToken = await getCsrfToken();
    if (!csrfToken) throw new Error("CSRF token missing");

    console.log("Registering user with CSRF token:", csrfToken);

    const response = await axiosInstance.post("/api/auth/signup", userData, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Registration failed");
    }

    return response.data;
  } catch (error: any) {
    console.error("❌ Registration error:", error);
    Alert.alert("Registration error", error.response?.data?.message || "Failed to register.");
    throw new Error(error.response?.data?.message || "Registration failed.");
  }
};

// Login user (with CSRF)
const login = async (credentials: any) => {
  try {
    const csrfToken = await getCsrfToken();
    if (!csrfToken) throw new Error("CSRF token missing");

    console.log("Making login request with CSRF token:", csrfToken);

    const response = await axiosInstance.post("/api/auth/login", credentials, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Login failed");
    }

    const { user, tokens } = response.data.data;

    if (!user || !tokens?.accessToken) {
      throw new Error("Invalid response format");
    }

    // Use either user._id or user.id, whichever exists
    const userId = user._id || user.id;
    if (userId) {
      await AsyncStorage.setItem("userId", String(userId));
    }

    await AsyncStorage.setItem("user", JSON.stringify(user));
    await AsyncStorage.setItem("token", tokens.accessToken);
    await AsyncStorage.setItem("refreshToken", tokens.refreshToken);

    return response.data.data;
  } catch (error: any) {
    console.error("❌ Login error:", error);
    Alert.alert("Login error", error.response?.data?.message || "Login failed.");
    throw new Error(error.response?.data?.message || "Login failed.");
  }
};

// Logout user
const logout = async () => {
  try {
    await axiosInstance.post("/api/auth/logout");
  } catch (error) {
    Alert.alert("Logout error", "Failed to log out.");
  } finally {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("refreshToken");
    await AsyncStorage.removeItem("userId");
    await AsyncStorage.removeItem("csrfToken");
  }
};

// Refresh access token
const refreshAccessToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available.");
    }

    const response = await axiosInstance.post("/api/auth/refresh", { refreshToken });
    if (!response.data?.success) {
      throw new Error("Failed to refresh token.");
    }

    const newAccessToken = response.data.data.accessToken;
    await AsyncStorage.setItem("token", newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("❌ Token refresh failed:", error);
    await logout(); // Force logout if refresh fails
    return null;
  }
};

// Get current auth state
const getAuthState = async () => {
  try {
    const user = await AsyncStorage.getItem("user");
    const token = await AsyncStorage.getItem("token");
    return {
      user: user ? JSON.parse(user) : null,
      token,
      isAuthenticated: !!(token && user),
    };
  } catch (error) {
    Alert.alert("Error", "Failed to get auth state.");
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    };
  }
};

// Fetch user profile
const fetchProfile = async () => {
  try {
    const response = await axiosInstance.get("/api/auth/me");
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch profile");
    }
    return response.data.data;
  } catch (error: any) {
    Alert.alert("Error", "Failed to fetch profile.");
    throw error;
  }
};

// Update user profile
const updateProfile = async (profileData: any) => {
  try {
    const response = await axiosInstance.put(`/api/users/${profileData.id}`, profileData);
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Profile update failed");
    }
    const updatedUser = response.data.data;
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error: any) {
    Alert.alert("Error", "Failed to update profile.");
    throw new Error(error.response?.data?.message || "Profile update failed.");
  }
};

const authService = {
  getCsrfToken,
  register,
  login,
  logout,
  refreshAccessToken,
  getAuthState,
  fetchProfile,
  updateProfile,
};

export { axiosInstance };

export default authService;
