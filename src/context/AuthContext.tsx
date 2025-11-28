import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/auth';
import { tokenManager } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string, referralCode?: string) => Promise<{ ok: boolean; error?: string; needsVerification?: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await tokenManager.getAccessToken();
      if (token) {
        const response = await authService.getCurrentUser();
        if (response.ok && response.user) {
          setUser(response.user);
        } else {
          await tokenManager.clearTokens();
        }
      }
    } catch (error) {
      await tokenManager.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      if (response.ok) {
        setUser(response.user);
        return { ok: true };
      }
      return { ok: false, error: response.error || 'Login failed' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      const needsVerification = error.response?.data?.needs_verification;
      return { ok: false, error: errorMessage, needsVerification };
    }
  };

  const register = async (email: string, password: string, fullName: string, referralCode?: string) => {
    try {
      const response = await authService.register(email, password, fullName, referralCode);
      if (response.ok) {
        setUser(response.user);
        return { ok: true, needsVerification: !response.user?.is_verified };
      }
      return { ok: false, error: response.error || 'Registration failed' };
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error 
        || error.message 
        || (error.response?.status === 400 ? 'Invalid registration data' : 'Network error. Please check your connection.');
      return { ok: false, error: errorMessage };
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.ok && response.user) {
        setUser(response.user);
      }
    } catch (error) {
      // Silently fail
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


