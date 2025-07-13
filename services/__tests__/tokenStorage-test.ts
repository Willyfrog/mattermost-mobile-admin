import { TokenStorage } from '../tokenStorage';
import * as SecureStore from 'expo-secure-store';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('TokenStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveToken and getToken', () => {
    it('should save and retrieve a token', async () => {
      const testToken = 'test-token-123';
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);
      mockSecureStore.getItemAsync.mockResolvedValue(testToken);

      await TokenStorage.saveToken(testToken);
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('mattermost_token', testToken);

      const retrievedToken = await TokenStorage.getToken();
      expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('mattermost_token');
      expect(retrievedToken).toBe(testToken);
    });

    it('should handle storage errors gracefully', async () => {
      mockSecureStore.getItemAsync.mockRejectedValue(new Error('Storage error'));

      const token = await TokenStorage.getToken();
      expect(token).toBeNull();
    });
  });

  describe('saveAuthData and getAuthData', () => {
    it('should save and retrieve complete auth data', async () => {
      const authData = {
        token: 'test-token',
        serverUrl: 'https://test.mattermost.com',
        userId: 'user123',
        username: 'testuser',
      };

      mockSecureStore.setItemAsync.mockResolvedValue(undefined);
      mockSecureStore.getItemAsync
        .mockResolvedValueOnce(authData.token)
        .mockResolvedValueOnce(authData.serverUrl)
        .mockResolvedValueOnce(authData.userId)
        .mockResolvedValueOnce(authData.username);

      await TokenStorage.saveAuthData(authData);
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledTimes(4);

      const retrievedData = await TokenStorage.getAuthData();
      expect(retrievedData).toEqual(authData);
    });

    it('should return null when no token or serverUrl', async () => {
      mockSecureStore.getItemAsync
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('https://test.com');

      const authData = await TokenStorage.getAuthData();
      expect(authData).toBeNull();
    });
  });

  describe('clearAll', () => {
    it('should clear all stored data', async () => {
      mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);

      await TokenStorage.clearAll();
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledTimes(4);
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('mattermost_token');
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('mattermost_server_url');
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('mattermost_user_id');
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('mattermost_username');
    });
  });
});