// frontend/src/store/slices/authSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../api/auth.api";
import { storageUtils } from "../../utils/storageUtils";

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      await authService.register(data);
      // FIX: Discard tokens on register — email is NOT yet verified.
      // Force user to verify email before they can access protected routes.
      return { registered: true };
    } catch (err) {
      return rejectWithValue(err.message || "Registration failed.");
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const payload = await authService.login(data);

      // 2FA path — no tokens issued yet
      if (payload.requiresTwoFactor) {
        return { requiresTwoFactor: true, email: payload.email };
      }

      // FIX: only store the accessToken in memory (via storageUtils.setTokens).
      // refreshToken arrives as httpOnly cookie — never touch it in JS.
      // User object goes to localStorage for reload & tab-switch resilience.
      storageUtils.setTokens({ accessToken: payload.tokens.accessToken });
      storageUtils.setUser(payload.user);

      return { user: payload.user, accessToken: payload.tokens.accessToken };
    } catch (err) {
      return rejectWithValue(err.message || "Login failed.");
    }
  },
);

export const verifyTwoFactor = createAsyncThunk(
  "auth/verifyTwoFactor",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const { user, tokens } = await authService.verifyTwoFactor(email, otp);

      storageUtils.setTokens({ accessToken: tokens.accessToken });
      storageUtils.setUser(user);

      return { user, accessToken: tokens.accessToken };
    } catch (err) {
      return rejectWithValue(err.message || "OTP verification failed.");
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // Server will clear the httpOnly refreshToken cookie
      await authService.logout();
    } catch {
      // Always clear local state even if server call fails
    } finally {
      storageUtils.clearAll();
    }
  },
);

export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getMe();
      storageUtils.setUser(user);
      return user;
    } catch (err) {
      storageUtils.clearAll();
      return rejectWithValue(err.message || "Failed to fetch user.");
    }
  },
);

// ── Slice ─────────────────────────────────────────────────────────────────────

// FIX: On page reload/new tab, access token is gone (it was in memory).
// Check localStorage for a persisted user object:
//   - If found: set user but NOT isAuthenticated yet — fetchMe() will verify.
//   - AuthContext.useEffect detects !isAuthenticated + persisted user → calls fetchMe()
//   - fetchMe → GET /auth/me → 401 → api.js interceptor → POST /auth/refresh-token
//     (browser sends httpOnly cookie automatically) → new accessToken in memory
//   - fetchMe retried and succeeds → isAuthenticated = true
//   - Same works across tabs: new tab reads user from localStorage, calls fetchMe()
const persistedUser = storageUtils.getUser();

const initialState = {
  user: persistedUser || null,
  // FIX: isAuthenticated starts false on reload even if we have a cached user.
  // We can't trust it until the server has validated the session via /me.
  isAuthenticated: false,
  // authStatus: "loading" | "authenticated" | "guest"
  // "loading"       — session restore in progress; block ALL auth-gated UI
  // "authenticated" — fetchMe succeeded; user is logged in
  // "guest"         — no session or fetchMe failed; show login/register
  authStatus: persistedUser ? "loading" : "guest",
  isLoading: !!persistedUser, // show loading spinner while silent refresh is in flight
  error: null,
  requiresTwoFactor: false,
  twoFactorEmail: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTwoFactor: (state) => {
      state.requiresTwoFactor = false;
      state.twoFactorEmail = null;
    },
    updateUser: (state, action) => {
      state.user = action.payload;
      storageUtils.setUser(action.payload);
    },
    // Used by OAuthSuccessPage to set auth state after redirect
    setAuthFromOAuth: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      state.authStatus = "authenticated";
      state.error = null;
      storageUtils.setTokens({ accessToken });
      storageUtils.setUser(user);
    },
  },

  extraReducers: (builder) => {
    // ── register ─────────────────────────────────────────────────────────────
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false; // NOT authenticated — email not verified
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ── login ─────────────────────────────────────────────────────────────────
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.requiresTwoFactor) {
          state.requiresTwoFactor = true;
          state.twoFactorEmail = action.payload.email;
          state.authStatus = "guest";
        } else {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.authStatus = "authenticated";
          state.requiresTwoFactor = false;
          state.twoFactorEmail = null;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ── verifyTwoFactor ───────────────────────────────────────────────────────
    builder
      .addCase(verifyTwoFactor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyTwoFactor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.authStatus = "authenticated";
        state.requiresTwoFactor = false;
        state.twoFactorEmail = null;
      })
      .addCase(verifyTwoFactor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ── logout ────────────────────────────────────────────────────────────────
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.authStatus = "guest";
      state.requiresTwoFactor = false;
      state.twoFactorEmail = null;
      state.error = null;
      state.isLoading = false;
    });

    // ── fetchMe ───────────────────────────────────────────────────────────────
    builder
      .addCase(fetchMe.pending, (state) => {
        state.isLoading = true;
        state.authStatus = "loading";
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.authStatus = "authenticated";
      })
      .addCase(fetchMe.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.authStatus = "guest";
      });
  },
});

export const { clearError, clearTwoFactor, setAuthFromOAuth, updateUser } =
  authSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectRequires2FA = (state) => state.auth.requiresTwoFactor;
export const select2FAEmail = (state) => state.auth.twoFactorEmail;
// "loading" | "authenticated" | "guest"
export const selectAuthStatus = (state) => state.auth.authStatus;

export default authSlice.reducer;
