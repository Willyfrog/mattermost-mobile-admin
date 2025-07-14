import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { mattermostService } from '@/services/mattermostClient';
import { TokenStorage } from '@/services/tokenStorage';

// Mock dependencies
jest.mock('@/services/mattermostClient');
jest.mock('@/services/tokenStorage');
jest.mock('@/utils/validation', () => ({
  normalizeServerUrl: jest.fn((url) => url.endsWith('/') ? url : `${url}/`),
}));

// Mock @mattermost/client
jest.mock('@mattermost/client', () => ({
  Client4: jest.fn().mockImplementation(() => ({
    setUrl: jest.fn(),
    setToken: jest.fn(),
    getToken: jest.fn(),
    getUrl: jest.fn(),
    ping: jest.fn(),
    login: jest.fn(),
    getMe: jest.fn(),
  })),
}));

const mockMattermostService = mattermostService as jest.Mocked<typeof mattermostService>;
const mockTokenStorage = TokenStorage as jest.Mocked<typeof TokenStorage>;

// Test app component that simulates the app flow
const TestApp: React.FC<{ onAuthState?: (state: any) => void }> = ({ onAuthState }) => {
  const auth = useAuth();

  React.useEffect(() => {
    if (onAuthState) {
      onAuthState(auth);
    }
  }, [auth, onAuthState]);

  if (auth.loading) {
    return null; // Loading state
  }

  if (!auth.isAuthenticated) {
    return null; // Login flow would be rendered
  }

  return null; // Dashboard would be rendered
};

describe('Authentication Flow Integration Tests', () => {
  let authState: any;
  let onAuthStateMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    authState = null;
    onAuthStateMock = jest.fn((state) => {
      authState = state;
    });

    // Mock console to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('App startup scenarios', () => {
    it('should start with clean state when no stored tokens', async () => {
      mockMattermostService.initialize.mockResolvedValue(undefined);
      mockTokenStorage.getAuthData.mockResolvedValue(null);

      render(
        <AuthProvider>
          <TestApp onAuthState={onAuthStateMock} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authState.loading).toBe(false);
        expect(authState.isAuthenticated).toBe(false);
        expect(authState.user).toBeNull();
        expect(authState.serverUrl).toBeNull();
      });

      expect(mockMattermostService.initialize).toHaveBeenCalledTimes(1);
      expect(mockTokenStorage.getAuthData).toHaveBeenCalledTimes(1);
    });

    it('should restore authentication from stored tokens', async () => {
      const storedAuthData = {
        token: 'stored-token-123',
        serverUrl: 'https://company.mattermost.com/',
        userId: 'user123',
        username: 'john.doe',
      };

      mockMattermostService.initialize.mockResolvedValue(undefined);
      mockTokenStorage.getAuthData.mockResolvedValue(storedAuthData);

      render(
        <AuthProvider>
          <TestApp onAuthState={onAuthStateMock} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authState.loading).toBe(false);
        expect(authState.isAuthenticated).toBe(true);
        expect(authState.user).toEqual({
          id: storedAuthData.userId,
          username: storedAuthData.username,
        });
        expect(authState.serverUrl).toBe(storedAuthData.serverUrl);
      });

      expect(mockMattermostService.initialize).toHaveBeenCalledTimes(1);
      expect(mockTokenStorage.getAuthData).toHaveBeenCalledTimes(1);
    });

    it('should handle corrupted stored data gracefully', async () => {
      mockMattermostService.initialize.mockResolvedValue(undefined);
      mockTokenStorage.getAuthData.mockRejectedValue(new Error('Storage corruption'));

      render(
        <AuthProvider>
          <TestApp onAuthState={onAuthStateMock} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authState.loading).toBe(false);
        expect(authState.isAuthenticated).toBe(false);
      });

      expect(console.error).toHaveBeenCalledWith('❌ Error checking auth status:', expect.any(Error));
    });
  });

  describe('Complete login flow', () => {
    beforeEach(() => {
      mockMattermostService.initialize.mockResolvedValue(undefined);
      mockTokenStorage.getAuthData.mockResolvedValue(null);
    });

    it('should complete full login flow successfully', async () => {
      const serverUrl = 'https://test.mattermost.com';
      const username = 'testuser';
      const password = 'testpass123';
      const mockUser = {
        id: 'user456',
        username: 'testuser',
        email: 'test@example.com',
        roles: 'system_admin',
      };

      mockMattermostService.login.mockResolvedValue({
        success: true,
        user: mockUser,
      });

      render(
        <AuthProvider>
          <TestApp onAuthState={onAuthStateMock} />
        </AuthProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(authState.loading).toBe(false);
        expect(authState.isAuthenticated).toBe(false);
      });

      // Perform login
      let loginResult: any;
      await act(async () => {
        loginResult = await authState.login(serverUrl, username, password);
      });

      expect(loginResult).toEqual({ success: true });
      expect(mockMattermostService.login).toHaveBeenCalledWith(serverUrl, username, password);

      // Check final authenticated state
      await waitFor(() => {
        expect(authState.isAuthenticated).toBe(true);
        expect(authState.user).toEqual(mockUser);
        expect(authState.serverUrl).toBe(serverUrl);
      });
    });

    it('should handle login failures in complete flow', async () => {
      const serverUrl = 'https://test.mattermost.com';
      const username = 'wronguser';
      const password = 'wrongpass';

      mockMattermostService.login.mockResolvedValue({
        success: false,
        error: 'Invalid username or password',
      });

      render(
        <AuthProvider>
          <TestApp onAuthState={onAuthStateMock} />
        </AuthProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(authState.loading).toBe(false);
        expect(authState.isAuthenticated).toBe(false);
      });

      // Attempt login
      let loginResult: any;
      await act(async () => {
        loginResult = await authState.login(serverUrl, username, password);
      });

      expect(loginResult).toEqual({
        success: false,
        error: 'Invalid username or password',
      });

      // Should remain unauthenticated
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.user).toBeNull();
      expect(authState.serverUrl).toBeNull();
    });
  });

  describe('Complete logout flow', () => {
    it('should complete full logout flow successfully', async () => {
      const initialAuthData = {
        token: 'valid-token',
        serverUrl: 'https://company.mattermost.com/',
        userId: 'user123',
        username: 'john.doe',
      };

      // Start with authenticated state
      mockMattermostService.initialize.mockResolvedValue(undefined);
      mockTokenStorage.getAuthData.mockResolvedValue(initialAuthData);
      mockMattermostService.logout.mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <TestApp onAuthState={onAuthStateMock} />
        </AuthProvider>
      );

      // Wait for initial authentication
      await waitFor(() => {
        expect(authState.loading).toBe(false);
        expect(authState.isAuthenticated).toBe(true);
      });

      // Perform logout
      await act(async () => {
        await authState.logout();
      });

      expect(mockMattermostService.logout).toHaveBeenCalledTimes(1);

      // Check final unauthenticated state
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.user).toBeNull();
      expect(authState.serverUrl).toBeNull();
    });

    it('should handle logout errors gracefully', async () => {
      const initialAuthData = {
        token: 'valid-token',
        serverUrl: 'https://company.mattermost.com/',
        userId: 'user123',
        username: 'john.doe',
      };

      // Start with authenticated state
      mockMattermostService.initialize.mockResolvedValue(undefined);
      mockTokenStorage.getAuthData.mockResolvedValue(initialAuthData);
      mockMattermostService.logout.mockRejectedValue(new Error('Logout failed'));

      render(
        <AuthProvider>
          <TestApp onAuthState={onAuthStateMock} />
        </AuthProvider>
      );

      // Wait for initial authentication
      await waitFor(() => {
        expect(authState.loading).toBe(false);
        expect(authState.isAuthenticated).toBe(true);
      });

      // Perform logout
      await act(async () => {
        await authState.logout();
      });

      expect(console.error).toHaveBeenCalledWith('❌ Error during logout:', expect.any(Error));

      // Should still clear local state despite error
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.user).toBeNull();
      expect(authState.serverUrl).toBeNull();
    });
  });

  describe('Session persistence across app restarts', () => {
    it('should persist session across simulated app restarts', async () => {
      const sessionData = {
        token: 'persistent-token',
        serverUrl: 'https://persistent.mattermost.com/',
        userId: 'persistent-user',
        username: 'persistent.user',
      };

      // First app launch - login
      mockMattermostService.initialize.mockResolvedValue(undefined);
      mockTokenStorage.getAuthData.mockResolvedValue(null);
      mockMattermostService.login.mockResolvedValue({
        success: true,
        user: { id: sessionData.userId, username: sessionData.username },
      });

      const { unmount } = render(
        <AuthProvider>
          <TestApp onAuthState={onAuthStateMock} />
        </AuthProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(authState.loading).toBe(false);
        expect(authState.isAuthenticated).toBe(false);
      });

      // Login
      await act(async () => {
        await authState.login(sessionData.serverUrl, sessionData.username, 'password');
      });

      expect(authState.isAuthenticated).toBe(true);

      // Simulate app restart by unmounting and remounting
      unmount();

      // Second app launch - should restore session
      mockTokenStorage.getAuthData.mockResolvedValue(sessionData);

      render(
        <AuthProvider>
          <TestApp onAuthState={onAuthStateMock} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authState.loading).toBe(false);
        expect(authState.isAuthenticated).toBe(true);
        expect(authState.user).toEqual({
          id: sessionData.userId,
          username: sessionData.username,
        });
        expect(authState.serverUrl).toBe(sessionData.serverUrl);
      });
    });
  });

  describe('Error recovery scenarios', () => {
    it('should recover from storage initialization errors', async () => {
      // First call fails, second succeeds
      mockMattermostService.initialize
        .mockRejectedValueOnce(new Error('Init failed'))
        .mockResolvedValueOnce(undefined);
      
      mockTokenStorage.getAuthData.mockResolvedValue(null);

      render(
        <AuthProvider>
          <TestApp onAuthState={onAuthStateMock} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authState.loading).toBe(false);
        expect(authState.isAuthenticated).toBe(false);
      });

      expect(console.error).toHaveBeenCalledWith('❌ Error checking auth status:', expect.any(Error));
    });

    it('should handle network errors during login gracefully', async () => {
      mockMattermostService.initialize.mockResolvedValue(undefined);
      mockTokenStorage.getAuthData.mockResolvedValue(null);
      mockMattermostService.login.mockRejectedValue(new Error('Network error'));

      render(
        <AuthProvider>
          <TestApp onAuthState={onAuthStateMock} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authState.loading).toBe(false);
        expect(authState.isAuthenticated).toBe(false);
      });

      let loginResult: any;
      await act(async () => {
        loginResult = await authState.login('https://test.com', 'user', 'pass');
      });

      expect(loginResult).toEqual({ success: false, error: 'Login failed' });
      expect(authState.isAuthenticated).toBe(false);
    });
  });

  describe('Multiple concurrent operations', () => {
    it('should handle concurrent login attempts gracefully', async () => {
      mockMattermostService.initialize.mockResolvedValue(undefined);
      mockTokenStorage.getAuthData.mockResolvedValue(null);

      const mockUser = { id: 'user123', username: 'testuser' };
      mockMattermostService.login.mockResolvedValue({
        success: true,
        user: mockUser,
      });

      render(
        <AuthProvider>
          <TestApp onAuthState={onAuthStateMock} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authState.loading).toBe(false);
      });

      // Simulate concurrent login attempts
      const loginPromises = [
        authState.login('https://test1.com', 'user1', 'pass1'),
        authState.login('https://test2.com', 'user2', 'pass2'),
      ];

      await act(async () => {
        await Promise.all(loginPromises);
      });

      // Should call login service multiple times
      expect(mockMattermostService.login).toHaveBeenCalledTimes(2);
    });
  });
});