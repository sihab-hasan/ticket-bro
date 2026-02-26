import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { storageUtils } from '../../utils/storageUtils';
import toast from 'react-hot-toast';

export const registerUser    = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.register(data);
    const { user, tokens } = res.data.data;
    storageUtils.setTokens(tokens);
    storageUtils.setUser(user);
    return { user, tokens };
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Registration failed'); }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.login(data);
    const result = res.data.data;
    if (result.requiresTwoFactor) return { requiresTwoFactor: true, email: result.email };
    storageUtils.setTokens(result.tokens);
    storageUtils.setUser(result.user);
    return { user: result.user, tokens: result.tokens };
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Login failed'); }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try { await authService.logout(storageUtils.getRefreshToken()); } catch (_) {}
  storageUtils.clearAll();
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const res = await authService.getMe();
    const user = res.data.data;
    storageUtils.setUser(user);
    return user;
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const verifyTwoFactor = createAsyncThunk('auth/2fa', async ({ email, otp }, { rejectWithValue }) => {
  try {
    const res = await authService.verifyTwoFactor(email, otp);
    const { user, tokens } = res.data.data;
    storageUtils.setTokens(tokens);
    storageUtils.setUser(user);
    return { user, tokens };
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'OTP failed'); }
});

const slice = createSlice({
  name: 'auth',
  initialState: {
    user:              storageUtils.getUser(),
    isAuthenticated:   storageUtils.isAuthenticated(),
    isLoading:         false,
    error:             null,
    requires2FA:       false,
    twoFactorEmail:    null,
  },
  reducers: {
    clearError:     (s) => { s.error = null; },
    clearTwoFactor: (s) => { s.requires2FA = false; s.twoFactorEmail = null; },
    setUser:        (s, { payload }) => { s.user = payload; storageUtils.setUser(payload); },
    resetAuth:      (s) => { s.user = null; s.isAuthenticated = false; s.error = null; s.requires2FA = false; },
  },
  extraReducers: (b) => {
    const loading  = (s) => { s.isLoading = true;  s.error = null; };
    const rejected = (s, { payload }) => { s.isLoading = false; s.error = payload; toast.error(payload); };

    b.addCase(registerUser.pending,   loading)
     .addCase(registerUser.fulfilled, (s, { payload }) => { s.isLoading = false; s.user = payload.user; s.isAuthenticated = true; toast.success('Account created! Check your email to verify.'); })
     .addCase(registerUser.rejected,  rejected);

    b.addCase(loginUser.pending,   loading)
     .addCase(loginUser.fulfilled, (s, { payload }) => {
       s.isLoading = false;
       if (payload.requiresTwoFactor) { s.requires2FA = true; s.twoFactorEmail = payload.email; }
       else { s.user = payload.user; s.isAuthenticated = true; toast.success(`Welcome back, ${payload.user.firstName}!`); }
     })
     .addCase(loginUser.rejected,  rejected);

    b.addCase(logoutUser.fulfilled, (s) => { s.user = null; s.isAuthenticated = false; });

    b.addCase(fetchMe.pending,   (s) => { s.isLoading = true; })
     .addCase(fetchMe.fulfilled, (s, { payload }) => { s.isLoading = false; s.user = payload; s.isAuthenticated = true; })
     .addCase(fetchMe.rejected,  (s) => { s.isLoading = false; s.isAuthenticated = false; s.user = null; storageUtils.clearAll(); });

    b.addCase(verifyTwoFactor.pending,   loading)
     .addCase(verifyTwoFactor.fulfilled, (s, { payload }) => { s.isLoading = false; s.user = payload.user; s.isAuthenticated = true; s.requires2FA = false; toast.success(`Welcome back, ${payload.user.firstName}!`); })
     .addCase(verifyTwoFactor.rejected,  rejected);
  },
});

export const { clearError, clearTwoFactor, setUser, resetAuth } = slice.actions;
export const selectUser            = (s) => s.auth.user;
export const selectIsAuthenticated = (s) => s.auth.isAuthenticated;
export const selectIsLoading       = (s) => s.auth.isLoading;
export const selectAuthError       = (s) => s.auth.error;
export const selectRequires2FA     = (s) => s.auth.requires2FA;
export const select2FAEmail        = (s) => s.auth.twoFactorEmail;
export default slice.reducer;