import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../AuthContext';
import { mattermostService } from '@/services/mattermostClient';
import { TokenStorage } from '@/services/tokenStorage';

// Mock dependencies
jest.mock('@/services/mattermostClient');
jest.mock('@/services/tokenStorage');

const mockMattermostService = mattermostService as jest.Mocked<typeof mattermostService>;
const mockTokenStorage = TokenStorage as jest.Mocked<typeof TokenStorage>;

// Test component to access the auth context
const TestComponent: React.FC<{ onAuthData?: (authData: any) => void }> = ({ onAuthData }) => {
  const authData = useAuth();
  
  React.useEffect(() => {
    if (onAuthData) {
      onAuthData(authData);
    }
  }, [authData, onAuthData]);
  
  return null;
};

describe('AuthContext', () => {
  let authData: any;
  let onAuthDataMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    authData = null;
    onAuthDataMock = jest.fn((data) => {
      authData = data;
    });
    
    // Reset console.log mocks
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with loading state', async () => {
      mockMattermostService.initialize.mockResolvedValue(undefined);
      mockTokenStorage.getAuthData.mockResolvedValue(null);

      render(
        <AuthProvider>
          <TestComponent onAuthData={onAuthDataMock} />
        </AuthProvider>
      );

      // Initial state should be loading
      expect(authData.loading).toBe(true);
      expect(authData.isAuthenticated).toBe(false);
      expect(authData.user).toBeNull();
      expect(authData.serverUrl).toBeNull();
    });

    it('should restore authentication from stored data', async () => {
      const mockAuthData = {
        token: 'stored-token',
        serverUrl: 'https://stored.mattermost.com',
        userId: 'user123',
        username: 'testuser',
      };

      mockMattermostService.initialize.mockResolvedValue(undefined);
      mockTokenStorage.getAuthData.mockResolvedValue(mockAuthData);

      render(
        <AuthProvider>
          <TestComponent onAuthData={onAuthDataMock} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authData.loading).toBe(false);
        expect(authData.isAuthenticated).toBe(true);
        expect(authData.serverUrl).toBe(mockAuthData.serverUrl);
        expect(authData.user).toEqual({
          id: mockAuthData.userId,
          username: mockAuthData.username,
        });
      });

      expect(mockMattermostService.initialize).toHaveBeenCalledTimes(1);
      expect(mockTokenStorage.getAuthData).toHaveBeenCalledTimes(1);
    });

    it('should handle missing auth data', async () => {
      mockMattermostService.initialize.mockResolvedValue(undefined);
      mockTokenStorage.getAuthData.mockResolvedValue(null);

      render(
        <AuthProvider>
          <TestComponent onAuthData={onAuthDataMock} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authData.loading).toBe(false);
        expect(authData.isAuthenticated).toBe(false);
        expect(authData.user).toBeNull();
        expect(authData.serverUrl).toBeNull();
      });
    });

    it('should handle incomplete auth data', async () => {
      const mockAuthData = {
        token: 'stored-token',
        serverUrl: 'https://stored.mattermost.com',
      };

      mockMattermostService.initialize.mockResolvedValue(undefined);
      mockTokenStorage.getAuthData.mockResolvedValue(mockAuthData);

      render(
        <AuthProvider>
          <TestComponent onAuthData={onAuthDataMock} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authData.loading).toBe(false);
        expect(authData.isAuthenticated).toBe(true);
        expect(authData.serverUrl).toBe(mockAuthData.serverUrl);
        expect(authData.user).toBeNull();
      });
    });

    it('should handle initialization errors', async () => {
      mockMattermostService.initialize.mockRejectedValue(new Error('Init error'));

      render(
        <AuthProvider>
          <TestComponent onAuthData={onAuthDataMock} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authData.loading).toBe(false);
        expect(authData.isAuthenticated).toBe(false);
      });

      expect(console.error).toHaveBeenCalledWith('❌ Error checking auth status:', expect.any(Error));
    });
  });

  describe('login', () => {
    beforeEach(() => {
      mockMattermostService.initialize.mockResolvedValue(undefined);
      mockTokenStorage.getAuthData.mockResolvedValue(null);
    });

    it('should login successfully', async () => {
      const serverUrl = 'https://test.mattermost.com';
      const username = 'testuser';
      const password = 'testpass';
      const mockUser = { id: 'user123', username: 'testuser' };

      mockMattermostService.login.mockResolvedValue({
        success: true,
        user: mockUser,
      });

      render(
        <AuthProvider>
          <TestComponent onAuthData={onAuthDataMock} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authData.loading).toBe(false);
      });

      let loginResult: any;
      await act(async () => {
        loginResult = await authData.login(serverUrl, username, password);
      });

      expect(loginResult).toEqual({ success: true });
      expect(mockMattermostService.login).toHaveBeenCalledWith(serverUrl, username, password);
      
      await waitFor(() => {
        expect(authData.isAuthenticated).toBe(true);
        expect(authData.user).toEqual(mockUser);
        expect(authData.serverUrl).toBe(serverUrl);
      });
    });

    it('should handle login failure', async () => {
      const serverUrl = 'https://test.mattermost.com';
      const username = 'testuser';
      const password = 'wrongpass';

      mockMattermostService.login.mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      });

      render(
        <AuthProvider>
          <TestComponent onAuthData={onAuthDataMock} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authData.loading).toBe(false);
      });

      let loginResult: any;
      await act(async () => {
        loginResult = await authData.login(serverUrl, username, password);
      });

      expect(loginResult).toEqual({ success: false, error: 'Invalid credentials' });
      expect(authData.isAuthenticated).toBe(false);
      expect(authData.user).toBeNull();
      expect(authData.serverUrl).toBeNull();
    });

    it('should handle login exceptions', async () => {
      const serverUrl = 'https://test.mattermost.com';
      const username = 'testuser';
      const password = 'testpass';

      mockMattermostService.login.mockRejectedValue(new Error('Network error'));

      render(
        <AuthProvider>
          <TestComponent onAuthData={onAuthDataMock} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authData.loading).toBe(false);
      });

      let loginResult: any;
      await act(async () => {
        loginResult = await authData.login(serverUrl, username, password);
      });

      expect(loginResult).toEqual({ success: false, error: 'Login failed' });
      expect(authData.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const mockAuthData = {
        token: 'stored-token',
        serverUrl: 'https://stored.mattermost.com',
        userId: 'user123',
        username: 'testuser',
      };

      mockMattermostService.initialize.mockResolvedValue(undefined);
      mockTokenStorage.getAuthData.mockResolvedValue(mockAuthData);
      mockMattermostService.logout.mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <TestComponent onAuthData={onAuthDataMock} />
        </AuthProvider>
      );

      // Wait for initial authentication
      await waitFor(() => {
        expect(authData.isAuthenticated).toBe(true);
      });

      // Perform logout
      await act(async () => {
        await authData.logout();
      });

      expect(mockMattermostService.logout).toHaveBeenCalledTimes(1);
      expect(authData.isAuthenticated).toBe(false);
      expect(authData.user).toBeNull();
      expect(authData.serverUrl).toBeNull();
    });

    it('should handle logout errors gracefully', async () => {
      const mockAuthData = {
        token: 'stored-token',
        serverUrl: 'https://stored.mattermost.com',
        userId: 'user123',
        username: 'testuser',
      };

      mockMattermostService.initialize.mockResolvedValue(undefined);
      mockTokenStorage.getAuthData.mockResolvedValue(mockAuthData);
      mockMattermostService.logout.mockRejectedValue(new Error('Logout error'));

      render(
        <AuthProvider>
          <TestComponent onAuthData={onAuthDataMock} />
        </AuthProvider>
      );

      // Wait for initial authentication
      await waitFor(() => {
        expect(authData.isAuthenticated).toBe(true);
      });

      // Perform logout
      await act(async () => {
        await authData.logout();
      });

      expect(console.error).toHaveBeenCalledWith('❌ Error during logout:', expect.any(Error));
      expect(authData.isAuthenticated).toBe(false);
      expect(authData.user).toBeNull();
      expect(authData.serverUrl).toBeNull();
    });
  });

  describe('context provider', () => {
    it('should throw error when used outside provider', () => {
      // Mock console.error to avoid error output in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('loading states', () => {
    it('should show loading during initialization', async () => {
      let resolveInit: () => void;
      const initPromise = new Promise<void>((resolve) => {
        resolveInit = resolve;
      });

      mockMattermostService.initialize.mockReturnValue(initPromise);

      render(
        <AuthProvider>
          <TestComponent onAuthData={onAuthDataMock} />
        </AuthProvider>
      );

      expect(authData.loading).toBe(true);

      // Resolve the initialization
      await act(async () => {
        resolveInit();
        await initPromise;
      });

      await waitFor(() => {
        expect(authData.loading).toBe(false);
      });
    });
  });

  describe('state consistency', () => {
    it('should maintain consistent state through multiple operations', async () => {
      mockMattermostService.initialize.mockResolvedValue(undefined);
      mockTokenStorage.getAuthData.mockResolvedValue(null);

      render(
        <AuthProvider>
          <TestComponent onAuthData={onAuthDataMock} />
        </AuthProvider>
      );

      // Initial state
      await waitFor(() => {
        expect(authData.loading).toBe(false);
        expect(authData.isAuthenticated).toBe(false);
      });

      // Login
      const mockUser = { id: 'user123', username: 'testuser' };
      mockMattermostService.login.mockResolvedValue({
        success: true,
        user: mockUser,
      });

      await act(async () => {
        await authData.login('https://test.com', 'user', 'pass');
      });

      expect(authData.isAuthenticated).toBe(true);
      expect(authData.user).toEqual(mockUser);

      // Logout
      mockMattermostService.logout.mockResolvedValue(undefined);

      await act(async () => {
        await authData.logout();
      });

      expect(authData.isAuthenticated).toBe(false);
      expect(authData.user).toBeNull();
      expect(authData.serverUrl).toBeNull();
    });
  });
});