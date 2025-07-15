import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { mattermostService } from '@/services/mattermostClient';
import { TokenStorage } from '@/services/tokenStorage';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  serverUrl: string | null;
  login: (serverUrl: string, username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
  clearAppData: () => void;
  fetchAppData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [appDataCallbacks, setAppDataCallbacks] = useState<{
    clearAll: (() => void) | null;
    fetchAll: (() => Promise<void>) | null;
  }>({ clearAll: null, fetchAll: null });

  console.log('🔧 AuthProvider render - isAuthenticated:', isAuthenticated, 'loading:', loading);

  useEffect(() => {
    // Check if user is already authenticated
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    console.log('🔧 Checking auth status...');
    try {
      // Initialize the Mattermost client to load stored tokens
      await mattermostService.initialize();
      
      // Get authentication data from secure storage
      const authData = await TokenStorage.getAuthData();
      console.log('🔧 Auth check - authData:', !!authData);
      
      if (authData) {
        console.log('🔧 Setting authenticated to true');
        setIsAuthenticated(true);
        setServerUrl(authData.serverUrl);
        
        // Set user data if available
        if (authData.userId && authData.username) {
          setUser({
            id: authData.userId,
            username: authData.username,
          });
        }
      } else {
        console.log('🔧 No auth data found, staying unauthenticated');
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
    } finally {
      console.log('🔧 Setting loading to false');
      setLoading(false);
    }
  };

  const clearAppData = () => {
    if (appDataCallbacks.clearAll) {
      appDataCallbacks.clearAll();
    }
  };

  const fetchAppData = async () => {
    if (appDataCallbacks.fetchAll) {
      await appDataCallbacks.fetchAll();
    }
  };

  const login = async (serverUrl: string, username: string, password: string) => {
    try {
      const result = await mattermostService.login(serverUrl, username, password);
      
      if (result.success) {
        setIsAuthenticated(true);
        setUser(result.user);
        setServerUrl(serverUrl);
        
        // Fetch app data after successful login
        await fetchAppData();
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      // Clear all authentication data from secure storage and service
      await mattermostService.logout();
      
      // Clear app data
      clearAppData();
      
      // Update local state
      setIsAuthenticated(false);
      setUser(null);
      setServerUrl(null);
      
      // Redirect to login screen
      router.replace('/login');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Still update local state even if storage clear fails
      clearAppData();
      setIsAuthenticated(false);
      setUser(null);
      setServerUrl(null);
      
      // Redirect to login screen even if logout fails
      router.replace('/login');
    }
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
        clearAppData,
        fetchAppData,
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