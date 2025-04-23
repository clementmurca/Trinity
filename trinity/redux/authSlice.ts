import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../redux/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SignupForm } from "../app/(tabs)/account/signup";

export interface LoginCredentials {
  identifier: string;
  password: string;
}

interface AuthState {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

// Async thunk for registering a user
export const register = createAsyncThunk(
  "api/auth/register",
  async (userData: SignupForm, thunkAPI) => {
    try {
      const response = await authService.register(userData);

      // Store user data in AsyncStorage after successful registration
      await AsyncStorage.setItem("user", JSON.stringify(response.user));
      await AsyncStorage.setItem("token", response.token);

      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Async thunk for logging in a user
export const login = createAsyncThunk<any, LoginCredentials, { rejectValue: string }>(
  "api/auth/login",
  async (credentials, thunkAPI) => {
    try {
      console.log("🚀 Sending API request to login...");
      const response = await authService.login(credentials);
      console.log("✅ API Response:", response);

      if (!response) {
        return thunkAPI.rejectWithValue("No response from server");
      }

      if (!response.user) {
        console.error("❌ No user object in API response:", response);
        return thunkAPI.rejectWithValue("Invalid server response. No user data.");
      }

      // Use either user.id or user._id, whichever is defined
      const userId = response.user.id || response.user._id;
      if (userId) {
        await AsyncStorage.setItem("userId", String(userId));
        console.log("🔹 Stored userId:", userId);
      }

      if (response.user) {
        await AsyncStorage.setItem("user", JSON.stringify(response.user));
      }

      if (response.tokens?.accessToken) {
        await AsyncStorage.setItem("token", response.tokens.accessToken);
        await AsyncStorage.setItem("refreshToken", response.tokens.refreshToken);
      }

      return response;
    } catch (error: any) {
      console.error("🔥 Login error:", error);
      return thunkAPI.rejectWithValue(error.message || "Login failed.");
    }
  }
);

// Async thunk for refreshing access token
export const refreshAccessToken = createAsyncThunk(
  "api/auth/refreshToken",
  async (_, thunkAPI) => {
    try {
      const newToken = await authService.refreshAccessToken();
      if (newToken) {
        await AsyncStorage.setItem("token", newToken);
        return newToken;
      } else {
        throw new Error("Token refresh failed.");
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Async thunk for logging out a user
export const logout = createAsyncThunk("api/auth/logout", async (_, thunkAPI) => {
  try {
    await authService.logout();
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("refreshToken");
    await AsyncStorage.removeItem("userId");
    await AsyncStorage.removeItem("csrfToken");

  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    // Removed AsyncStorage calls from the reducer for purity
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Login cases
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.tokens.accessToken;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Refresh Token cases
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.token = action.payload;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.token = null;
      })
      // Logout cases
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isLoading = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { resetError, setUser } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectError = (state: { auth: AuthState }) => state.auth.error;
