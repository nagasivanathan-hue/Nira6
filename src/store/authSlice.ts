import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '@/services/api';
import type { User } from '@/types';

// ─── Session Persistence Helpers ───
// "Keep me logged in" stores auth in localStorage with a 7-day expiry.
// Otherwise, auth is stored in sessionStorage (cleared when browser closes).

const SESSION_KEY = 'userInfo';
const PERSIST_KEY = 'nira6_keepLoggedIn';
const EXPIRY_KEY = 'nira6_sessionExpiry';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/** Check if "keep me logged in" is enabled */
export function isKeepLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(PERSIST_KEY) === 'true';
}

/** Set the "keep me logged in" preference */
export function setKeepLoggedIn(value: boolean): void {
  if (typeof window === 'undefined') return;
  if (value) {
    localStorage.setItem(PERSIST_KEY, 'true');
  } else {
    localStorage.removeItem(PERSIST_KEY);
  }
}

/** Get the correct storage based on user preference */
function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return isKeepLoggedIn() ? localStorage : sessionStorage;
}

/** Save user info to the appropriate storage with optional expiry */
function saveUserToStorage(user: User | null): void {
  if (typeof window === 'undefined') return;
  const storage = getStorage();
  if (!storage) return;

  if (user) {
    storage.setItem(SESSION_KEY, JSON.stringify(user));
    // Also keep in localStorage for backward compat with StoreInitializer
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));

    if (isKeepLoggedIn()) {
      localStorage.setItem(EXPIRY_KEY, String(Date.now() + SEVEN_DAYS_MS));
    } else {
      localStorage.removeItem(EXPIRY_KEY);
    }
  } else {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }
}

/** Remove all auth data from both storages */
function clearUserFromStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(EXPIRY_KEY);
  localStorage.removeItem(PERSIST_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

// Load initial state from storage
const getUserFromStorage = () => {
  if (typeof window !== 'undefined') {
    // Check if session has expired (for "keep me logged in" users)
    const expiry = localStorage.getItem(EXPIRY_KEY);
    if (expiry && Date.now() > Number(expiry)) {
      // Session expired — clear everything
      clearUserFromStorage();
      return null;
    }

    // Try localStorage first (persistent), then sessionStorage (tab-only)
    const stored = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
  }
  return null;
};

const initialUser = getUserFromStorage();

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: initialUser,
  isAuthenticated: !!initialUser,
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: Record<string, string>, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      saveUserToStorage(response.data);
      return response.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: Record<string, string>, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData);
      saveUserToStorage(response.data);
      return response.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      clearUserFromStorage();
    },
    clearError: (state) => {
      state.error = null;
    },
    setAuth: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      saveUserToStorage(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, setAuth } = authSlice.actions;
export default authSlice.reducer;
