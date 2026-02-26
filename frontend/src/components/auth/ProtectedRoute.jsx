// frontend/src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectIsLoading } from '@/store/slices/authSlice';
import authConfig from '@/config/auth.config';

/**
 * ProtectedRoute — supports BOTH usage patterns:
 *
 * 1. Layout-route (AppRoutes.jsx pattern) — renders <Outlet /> for nested routes:
 *      <Route element={<ProtectedRoute />}>
 *        <Route path="/profile" element={<ProfilePage />} />
 *      </Route>
 *
 *      <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
 *        <Route path="/admin" element={<AdminDashboard />} />
 *      </Route>
 *
 * 2. Wrapper (legacy pattern) — wraps children directly:
 *      <ProtectedRoute roles={[UserRole.ADMIN]}>
 *        <AdminDashboard />
 *      </ProtectedRoute>
 *
 * Props:
 *   allowedRoles  — array of roles for layout-route usage  (AppRoutes pattern)
 *   roles         — array of roles for children wrap usage  (legacy pattern)
 *   children      — used only in wrapper pattern
 */
const ProtectedRoute = ({ children, roles, allowedRoles }) => {
  const location        = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading       = useSelector(selectIsLoading);
  const user            = useSelector(s => s.auth.user);

  // Normalize — accept either prop name
  const requiredRoles = allowedRoles ?? roles ?? null;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-6 h-6 rounded-full border-2 border-transparent border-t-[#a3e635]"
            style={{ animation: 'spin 0.7s linear infinite' }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p className="text-[0.8rem] font-sans text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  // ── Not authenticated → /login ────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <Navigate
        to={authConfig.routes.login}
        state={{ from: location }}
        replace
      />
    );
  }

  // ── Wrong role → /403 ─────────────────────────────────────────────────────
  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  // ── Success ───────────────────────────────────────────────────────────────
  // Layout-route pattern: no children passed → render <Outlet />
  // Wrapper pattern: children passed → render them directly
  return children ?? <Outlet />;
};

export default ProtectedRoute;