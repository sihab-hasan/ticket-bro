// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// User roles
export const UserRole = {
  ADMIN: 'admin',
  ORGANIZER: 'organizer',
  USER: 'user',
  GUEST: 'guest'
};

const AuthContext = createContext(null);

// Mock users for development
const MOCK_USERS = {
  admin: {
    id: '1',
    name: 'Admin User',
    email: 'admin@ticketbro.com',
    role: UserRole.ADMIN,
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D9488&color=fff',
    emailVerified: true,
    phoneVerified: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    permissions: ['all']
  },
  organizer: {
    id: '2',
    name: 'Organizer User',
    email: 'organizer@ticketbro.com',
    role: UserRole.ORGANIZER,
    avatar: 'https://ui-avatars.com/api/?name=Organizer+User&background=0D9488&color=fff',
    emailVerified: true,
    phoneVerified: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    permissions: ['create_events', 'manage_events', 'view_revenue']
  },
  user: {
    id: '3',
    name: 'Regular User',
    email: 'user@ticketbro.com',
    role: UserRole.USER,
    avatar: 'https://ui-avatars.com/api/?name=Regular+User&background=0D9488&color=fff',
    emailVerified: true,
    phoneVerified: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    permissions: ['book_tickets', 'view_bookings']
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('access_token');
        const storedRefreshToken = localStorage.getItem('refresh_token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          
          // Validate token with server
          await validateToken(storedToken);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Validate token with server
  const validateToken = async (token) => {
    try {
      // API call to validate token
      // const response = await api.post('/auth/validate', { token });
      return true;
    } catch (err) {
      throw new Error('Token validation failed');
    }
  };

  // Login function
  const login = useCallback(async (email, password, rememberMe = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock login logic
      let mockUser;
      if (email.includes('admin')) {
        mockUser = MOCK_USERS.admin;
      } else if (email.includes('organizer')) {
        mockUser = MOCK_USERS.organizer;
      } else {
        mockUser = { ...MOCK_USERS.user, email, name: email.split('@')[0] };
      }
      
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ id: mockUser.id, role: mockUser.role }))}.signature`;
      const mockRefreshToken = `refresh_${Date.now()}`;
      
      setUser(mockUser);
      setToken(mockToken);
      setRefreshToken(mockRefreshToken);
      setIsAuthenticated(true);
      
      // Store in localStorage if remember me
      if (rememberMe) {
        localStorage.setItem('access_token', mockToken);
        localStorage.setItem('refresh_token', mockRefreshToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
      } else {
        // Use sessionStorage for session-only
        sessionStorage.setItem('access_token', mockToken);
        sessionStorage.setItem('refresh_token', mockRefreshToken);
        sessionStorage.setItem('user', JSON.stringify(mockUser));
      }
      
      return { success: true, user: mockUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = {
        id: `user_${Date.now()}`,
        ...userData,
        role: UserRole.USER,
        emailVerified: false,
        phoneVerified: false,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=0D9488&color=fff`
      };
      
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ id: newUser.id, role: newUser.role }))}.signature`;
      const mockRefreshToken = `refresh_${Date.now()}`;
      
      setUser(newUser);
      setToken(mockToken);
      setRefreshToken(mockRefreshToken);
      setIsAuthenticated(true);
      
      localStorage.setItem('access_token', mockToken);
      localStorage.setItem('refresh_token', mockRefreshToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return { success: true, user: newUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    
    // Clear all storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
  }, []);

  // Refresh access token
  const refreshAccessToken = useCallback(async () => {
    try {
      const currentRefreshToken = refreshToken || localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
      
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }
      
      // API call to refresh token
      // const response = await api.post('/auth/refresh', { refreshToken: currentRefreshToken });
      
      const newToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ id: user?.id, role: user?.role }))}.signature_${Date.now()}`;
      
      setToken(newToken);
      
      // Update storage
      if (localStorage.getItem('access_token')) {
        localStorage.setItem('access_token', newToken);
      }
      if (sessionStorage.getItem('access_token')) {
        sessionStorage.setItem('access_token', newToken);
      }
      
      return newToken;
    } catch (err) {
      logout();
      throw err;
    }
  }, [refreshToken, user, logout]);

  // Check if user has specific role
  const hasRole = useCallback((roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  }, [user]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    if (user.role === UserRole.ADMIN) return true;
    return user.permissions?.includes(permission) || false;
  }, [user]);

  // Update user profile
  const updateProfile = useCallback(async (profileData) => {
    setIsLoading(true);
    try {
      // API call to update profile
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      
      // Update storage
      if (localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      if (sessionStorage.getItem('user')) {
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return { success: true, user: updatedUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Change password
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setIsLoading(true);
    try {
      // API call to change password
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Request password reset
  const requestPasswordReset = useCallback(async (email) => {
    setIsLoading(true);
    try {
      // API call to request password reset
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset password with token
  const resetPassword = useCallback(async (token, newPassword) => {
    setIsLoading(true);
    try {
      // API call to reset password
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verify email
  const verifyEmail = useCallback(async (token) => {
    setIsLoading(true);
    try {
      // API call to verify email
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = { ...user, emailVerified: true };
      setUser(updatedUser);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const value = {
    // State
    user,
    token,
    refreshToken,
    isLoading,
    error,
    isAuthenticated,
    
    // Core auth methods
    login,
    register,
    logout,
    
    // Token management
    refreshAccessToken,
    
    // Authorization
    hasRole,
    hasPermission,
    
    // Profile management
    updateProfile,
    changePassword,
    
    // Password reset
    requestPasswordReset,
    resetPassword,
    
    // Email verification
    verifyEmail,
    
    // Utility
    isAdmin: user?.role === UserRole.ADMIN,
    isOrganizer: user?.role === UserRole.ORGANIZER,
    isRegularUser: user?.role === UserRole.USER,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};