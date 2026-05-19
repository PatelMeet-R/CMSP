import type { User } from "@/modules/auth/types/auth.schemas";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// =============================================
//  V2 Auth Slice — Status-Aware + Hydration State
// =============================================

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  /** True while we're checking if a persisted session is still valid */
  isHydrating: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isHydrating: true, // Start as true — resolved in AuthGuard
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isHydrating = false;
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isHydrating = false;
    },

    /** Called when hydration check completes (valid or invalid session) */
    hydrationComplete: (state) => {
      state.isHydrating = false;
    },

    /** Update user permissions without full re-login (for permission matrix changes) */
    updatePermissions: (state, action: PayloadAction<string[]>) => {
      if (state.user) {
        state.user.permissions = action.payload;
      }
    },

    /** Update user status (for admin status changes reflected in UI) */
    updateStatus: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.status = action.payload;
      }
    },
  },
});

export const {
  setCredentials,
  logout,
  hydrationComplete,
  updatePermissions,
  updateStatus,
} = authSlice.actions;
export default authSlice.reducer;
