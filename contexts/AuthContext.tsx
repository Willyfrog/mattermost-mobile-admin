import React, { createContext, useContext, useState, useEffect } from 'react';
import { mattermostService } from '@/services/mattermostClient';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  serverUrl: string | null;
  login: (serverUrl: string, username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('🔧 AuthProvider render - isAuthenticated:', isAuthenticated, 'loading:', loading);

  useEffect(() => {
    // Check if user is already authenticated
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    console.log('🔧 Checking auth status...');
    try {
      const token = mattermostService.getToken();
      const url = mattermostService.getUrl();
      console.log('🔧 Auth check - token:', !!token, 'url:', url);
      
      if (token && url) {
        console.log('🔧 Setting authenticated to true');
        setIsAuthenticated(true);
        setServerUrl(url);
      } else {
        console.log('🔧 No token/url found, staying unauthenticated');
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
    } finally {
      console.log('🔧 Setting loading to false');
      setLoading(false);
    }
  };

  const login = async (serverUrl: string, username: string, password: string) => {
    try {
      const result = await mattermostService.login(serverUrl, username, password);
      
      if (result.success) {
        setIsAuthenticated(true);
        setUser(result.user);
        setServerUrl(serverUrl);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setServerUrl(null);
    // Clear token from service
    mattermostService.setToken('');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        serverUrl,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}