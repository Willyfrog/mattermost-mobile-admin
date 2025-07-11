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

  useEffect(() => {
    // Check if user is already authenticated
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = mattermostService.getToken();
      const url = mattermostService.getUrl();
      
      if (token && url) {
        // Could verify token validity here
        setIsAuthenticated(true);
        setServerUrl(url);
        // Note: In a real app, you'd want to fetch user data here
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
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