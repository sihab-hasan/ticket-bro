// frontend/src/store/slices/userSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "@/api/user.api";
import { storageUtils } from "@/utils/storageUtils";

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const user = await userService.getMe();
      storageUtils.setUser(user);
      return user;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load profile.");
    }
  },
);

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (data, { rejectWithValue }) => {
    try {
      const user = await userService.updateMe(data);
      storageUtils.setUser(user);
      return user;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update profile.");
    }
  },
);

export const uploadAvatar = createAsyncThunk(
  "user/uploadAvatar",
  async (file, { rejectWithValue }) => {
    try {
      const user = await userService.uploadAvatar(file);
      storageUtils.setUser(user);
      return user;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to upload avatar.");
    }
  },
);

export const removeAvatar = createAsyncThunk(
  "user/removeAvatar",
  async (_, { rejectWithValue }) => {
    try {
      const user = await userService.removeAvatar();
      storageUtils.setUser(user);
      return user;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to remove avatar.");
    }
  },
);

export const fetchSessions = createAsyncThunk(
  "user/fetchSessions",
  async (_, { rejectWithValue }) => {
    try {
      return (await userService.getSessions()) ?? [];
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load sessions.");
    }
  },
);

export const revokeSession = createAsyncThunk(
  "user/revokeSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      await userService.revokeSession(sessionId);
      return sessionId;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to revoke session.");
    }
  },
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
  profile: null,
  sessions: [],
  isLoading: false,
  isSaving: false,
  isUploading: false,
  error: null,
  successMsg: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,

  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    clearSuccessMsg: (state) => {
      state.successMsg = null;
    },
    clearUserState: () => initialState,
  },

  extraReducers: (builder) => {
    // fetchProfile
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.profile = payload;
      })
      .addCase(fetchProfile.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });

    // updateProfile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isSaving = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.isSaving = false;
        state.profile = payload;
        state.successMsg = "Profile updated successfully.";
      })
      .addCase(updateProfile.rejected, (state, { payload }) => {
        state.isSaving = false;
        state.error = payload;
      });

    // uploadAvatar
    builder
      .addCase(uploadAvatar.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, { payload }) => {
        state.isUploading = false;
        state.profile = payload;
        state.successMsg = "Avatar updated.";
      })
      .addCase(uploadAvatar.rejected, (state, { payload }) => {
        state.isUploading = false;
        state.error = payload;
      });

    // removeAvatar
    builder
      .addCase(removeAvatar.fulfilled, (state, { payload }) => {
        state.profile = payload;
        state.successMsg = "Avatar removed.";
      })
      .addCase(removeAvatar.rejected, (state, { payload }) => {
        state.error = payload;
      });

    // fetchSessions
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSessions.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.sessions = payload;
      })
      .addCase(fetchSessions.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });

    // revokeSession
    builder
      .addCase(revokeSession.fulfilled, (state, { payload: sessionId }) => {
        state.sessions = state.sessions.filter(
          (s) => (s._id || s.id) !== sessionId,
        );
        state.successMsg = "Session revoked.";
      })
      .addCase(revokeSession.rejected, (state, { payload }) => {
        state.error = payload;
      });
  },
});

export const { clearUserError, clearSuccessMsg, clearUserState } =
  userSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectProfile = (state) => state.user.profile;
export const selectSessions = (state) => state.user.sessions;
export const selectUserLoading = (state) => state.user.isLoading;
export const selectUserSaving = (state) => state.user.isSaving;
export const selectUploading = (state) => state.user.isUploading;
export const selectUserError = (state) => state.user.error;
export const selectSuccessMsg = (state) => state.user.successMsg;

export default userSlice.reducer;
