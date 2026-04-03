// frontend/src/components/auth/ProtectedRoute.jsx
//
// Supports two modes:
//   1. Layout route (Outlet pattern) — wraps child routes:
//        <Route element={<ProtectedRoute />}>
//          <Route path="/profile" element={<ProfilePage />} />
//        </Route>
//
//   2. Wrapper pattern (children prop):
//        <ProtectedRoute roles={['admin']}>
//          <AdminPage />
//        </ProtectedRoute>
//
// Props:
//   allowedRoles / roles  — array of role strings; if omitted, any auth'd user passes
//   requireVerified       — if true, redirect unverified-email users to verify notice
//   children              — wrapper usage only

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectIsLoading,
  selectUser,
} from "@/store/slices/authSlice";
import authConfig from "@/config/auth.config";
import { canUserAccessPanel } from "@/utils/access.utils";

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-6 h-6 rounded-full border-2 border-transparent border-t-[#a3e635]"
        style={{ animation: "spin 0.7s linear infinite" }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p className="text-[0.8rem] text-muted-foreground">Loading…</p>
    </div>
  </div>
);

const ProtectedRoute = ({
  children,
  roles,
  allowedRoles,
  requiredPanel,
  requireVerified = false,
}) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const user = useSelector(selectUser);

  const requiredRoles = allowedRoles ?? roles ?? null;

  // Restoring session from httpOnly cookie — don't redirect yet
  if (isLoading) return <Spinner />;

  // Not authenticated → open login modal on top of attempted page
  // (state.from lets login redirect back after success)
  if (!isAuthenticated) {
    return (
      <Navigate
        to={authConfig.routes.login}
        state={{ from: location }}
        replace
      />
    );
  }

  // Email verification gate
  if (requireVerified && user && !user.isEmailVerified) {
    return (
      <Navigate
        to={authConfig.routes.verifyEmailNotice}
        state={{ from: location }}
        replace
      />
    );
  }

  // Role check
  if (requiredRoles?.length && user && !requiredRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  if (requiredPanel && user && !canUserAccessPanel(user, requiredPanel)) {
    return <Navigate to="/403" replace />;
  }

  return children ?? <Outlet />;
};

export default ProtectedRoute;
