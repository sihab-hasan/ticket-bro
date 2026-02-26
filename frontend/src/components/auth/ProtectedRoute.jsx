import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectIsLoading } from '../../store/slices/authSlice';
import authConfig from '../../config/auth.config';

const ProtectedRoute = ({ children, roles }) => {
  const location        = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading       = useSelector(selectIsLoading);
  const user            = useSelector((s) => s.auth.user);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="flex flex-col items-center gap-3">
          <span className="spinner" style={{ width: 24, height: 24, color: 'var(--foreground)' }} />
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--muted-foreground)', fontSize: 13 }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={authConfig.routes.login} state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;