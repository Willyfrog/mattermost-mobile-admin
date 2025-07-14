import { TokenStorage } from '@/services/tokenStorage';
import * as SecureStore from 'expo-secure-store';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('TokenStorage Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Data corruption scenarios', () => {
    it('should handle corrupted token data', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue('corrupted-data-###');

      const token = await TokenStorage.getToken();

      expect(token).toBe('corrupted-data-###');
    });

    it('should handle null values in storage', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      const authData = await TokenStorage.getAuthData();

      expect(authData).toBeNull();
    });

    it('should handle undefined values in storage', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(undefined as any);

      const authData = await TokenStorage.getAuthData();

      expect(authData).toBeNull();
    });

    it('should handle empty string values', async () => {
      mockSecureStore.getItemAsync
        .mockResolvedValueOnce('') // token
        .mockResolvedValueOnce('https://test.com') // serverUrl
        .mockResolvedValueOnce('user123') // userId
        .mockResolvedValueOnce('testuser'); // username

      const authData = await TokenStorage.getAuthData();

      expect(authData).toBeNull();
    });

    it('should handle mixed valid/invalid data', async () => {
      mockSecureStore.getItemAsync
        .mockResolvedValueOnce('valid-token') // token
        .mockResolvedValueOnce('') // serverUrl (empty)
        .mockResolvedValueOnce('user123') // userId
        .mockResolvedValueOnce('testuser'); // username

      const authData = await TokenStorage.getAuthData();

      expect(authData).toBeNull();
    });
  });

  describe('Storage permission errors', () => {
    it('should handle permission denied errors', async () => {
      mockSecureStore.setItemAsync.mockRejectedValue(new Error('Permission denied'));

      await expect(TokenStorage.saveToken('test-token')).rejects.toThrow('Failed to save authentication token');
      expect(console.error).toHaveBeenCalledWith('Error saving token');
    });

    it('should handle read permission errors', async () => {
      mockSecureStore.getItemAsync.mockRejectedValue(new Error('Read permission denied'));

      const token = await TokenStorage.getToken();

      expect(token).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error retrieving token');
    });

    it('should handle delete permission errors', async () => {
      mockSecureStore.deleteItemAsync.mockRejectedValue(new Error('Delete permission denied'));

      await TokenStorage.removeToken();

      expect(console.error).toHaveBeenCalledWith('Error removing token');
    });
  });

  describe('Storage quota scenarios', () => {
    it('should handle storage quota exceeded', async () => {
      mockSecureStore.setItemAsync.mockRejectedValue(new Error('QuotaExceededError'));

      await expect(TokenStorage.saveToken('large-token')).rejects.toThrow('Failed to save authentication token');
    });

    it('should handle large auth data objects', async () => {
      const largeAuthData = {
        token: 'a'.repeat(10000),
        serverUrl: 'https://test.com',
        userId: 'user123',
        username: 'testuser',
      };

      mockSecureStore.setItemAsync.mockResolvedValue(undefined);

      await TokenStorage.saveAuthData(largeAuthData);

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledTimes(4);
    });

    it('should handle saving partial data on quota error', async () => {
      const authData = {
        token: 'test-token',
        serverUrl: 'https://test.com',
        userId: 'user123',
        username: 'testuser',
      };

      mockSecureStore.setItemAsync
        .mockResolvedValueOnce(undefined) // token saves successfully
        .mockRejectedValueOnce(new Error('QuotaExceededError')) // serverUrl fails
        .mockResolvedValueOnce(undefined) // userId saves successfully
        .mockResolvedValueOnce(undefined); // username saves successfully

      await expect(TokenStorage.saveAuthData(authData)).rejects.toThrow('Failed to save authentication data');
    });
  });

  describe('Concurrent operations', () => {
    it('should handle concurrent save operations', async () => {
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);

      const savePromises = [
        TokenStorage.saveToken('token1'),
        TokenStorage.saveToken('token2'),
        TokenStorage.saveToken('token3'),
      ];

      await Promise.all(savePromises);

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledTimes(3);
    });

    it('should handle concurrent read operations', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue('test-token');

      const readPromises = [
        TokenStorage.getToken(),
        TokenStorage.getToken(),
        TokenStorage.getToken(),
      ];

      const results = await Promise.all(readPromises);

      expect(results).toEqual(['test-token', 'test-token', 'test-token']);
      expect(mockSecureStore.getItemAsync).toHaveBeenCalledTimes(3);
    });

    it('should handle concurrent save/read operations', async () => {
      let tokenValue = 'initial-token';
      
      mockSecureStore.setItemAsync.mockImplementation(async (key, value) => {
        tokenValue = value;
      });
      
      mockSecureStore.getItemAsync.mockImplementation(async (key) => {
        return tokenValue;
      });

      const operations = [
        TokenStorage.saveToken('token1'),
        TokenStorage.getToken(),
        TokenStorage.saveToken('token2'),
        TokenStorage.getToken(),
      ];

      await Promise.all(operations);

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledTimes(2);
      expect(mockSecureStore.getItemAsync).toHaveBeenCalledTimes(2);
    });

    it('should handle concurrent clear operations', async () => {
      mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);

      const clearPromises = [
        TokenStorage.clearAll(),
        TokenStorage.clearAll(),
        TokenStorage.clearAll(),
      ];

      await Promise.all(clearPromises);

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledTimes(12); // 4 keys × 3 operations
    });
  });

  describe('Platform-specific edge cases', () => {
    it('should handle iOS keychain access errors', async () => {
      mockSecureStore.setItemAsync.mockRejectedValue(new Error('Keychain access denied'));

      await expect(TokenStorage.saveToken('test-token')).rejects.toThrow('Failed to save authentication token');
    });

    it('should handle Android keystore errors', async () => {
      mockSecureStore.getItemAsync.mockRejectedValue(new Error('Keystore unavailable'));

      const token = await TokenStorage.getToken();

      expect(token).toBeNull();
    });

    it('should handle biometric authentication failures', async () => {
      mockSecureStore.getItemAsync.mockRejectedValue(new Error('Biometric authentication failed'));

      const token = await TokenStorage.getToken();

      expect(token).toBeNull();
    });
  });

  describe('Data validation edge cases', () => {
    it('should handle extremely long tokens', async () => {
      const longToken = 'a'.repeat(100000);
      
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);
      mockSecureStore.getItemAsync.mockResolvedValue(longToken);

      await TokenStorage.saveToken(longToken);
      const retrievedToken = await TokenStorage.getToken();

      expect(retrievedToken).toBe(longToken);
    });

    it('should handle special characters in data', async () => {
      const specialCharData = {
        token: 'token-with-special-chars-!@#$%^&*()_+{}|:<>?[]\\;\'",./`~',
        serverUrl: 'https://test.com/path?param=value&other=encoded%20string',
        userId: 'user-123-!@#',
        username: 'user@domain.com',
      };

      mockSecureStore.setItemAsync.mockResolvedValue(undefined);
      mockSecureStore.getItemAsync
        .mockResolvedValueOnce(specialCharData.token)
        .mockResolvedValueOnce(specialCharData.serverUrl)
        .mockResolvedValueOnce(specialCharData.userId)
        .mockResolvedValueOnce(specialCharData.username);

      await TokenStorage.saveAuthData(specialCharData);
      const retrievedData = await TokenStorage.getAuthData();

      expect(retrievedData).toEqual(specialCharData);
    });

    it('should handle unicode characters', async () => {
      const unicodeData = {
        token: 'token-with-unicode-🔑🛡️',
        serverUrl: 'https://tëst.com',
        userId: 'user-123-ñ',
        username: 'usër@dømaín.com',
      };

      mockSecureStore.setItemAsync.mockResolvedValue(undefined);
      mockSecureStore.getItemAsync
        .mockResolvedValueOnce(unicodeData.token)
        .mockResolvedValueOnce(unicodeData.serverUrl)
        .mockResolvedValueOnce(unicodeData.userId)
        .mockResolvedValueOnce(unicodeData.username);

      await TokenStorage.saveAuthData(unicodeData);
      const retrievedData = await TokenStorage.getAuthData();

      expect(retrievedData).toEqual(unicodeData);
    });
  });

  describe('Memory management', () => {
    it('should handle rapid sequential operations', async () => {
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);
      mockSecureStore.getItemAsync.mockResolvedValue('test-token');

      const operations = [];
      for (let i = 0; i < 1000; i++) {
        operations.push(TokenStorage.saveToken(`token-${i}`));
        operations.push(TokenStorage.getToken());
      }

      await Promise.all(operations);

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledTimes(1000);
      expect(mockSecureStore.getItemAsync).toHaveBeenCalledTimes(1000);
    });

    it('should handle memory pressure scenarios', async () => {
      // Simulate memory pressure by creating large objects
      const largeObjects = Array(100).fill(null).map(() => ({
        token: 'x'.repeat(1000),
        serverUrl: 'https://test.com',
        userId: 'user123',
        username: 'testuser',
      }));

      mockSecureStore.setItemAsync.mockResolvedValue(undefined);

      for (const obj of largeObjects) {
        await TokenStorage.saveAuthData(obj);
      }

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledTimes(400); // 4 keys × 100 objects
    });
  });

  describe('Error recovery', () => {
    it('should recover from transient storage errors', async () => {
      mockSecureStore.getItemAsync
        .mockRejectedValueOnce(new Error('Transient error'))
        .mockResolvedValueOnce('recovered-token');

      const firstAttempt = await TokenStorage.getToken();
      const secondAttempt = await TokenStorage.getToken();

      expect(firstAttempt).toBeNull();
      expect(secondAttempt).toBe('recovered-token');
    });

    it('should handle partial auth data corruption', async () => {
      mockSecureStore.getItemAsync
        .mockResolvedValueOnce('valid-token') // token
        .mockRejectedValueOnce(new Error('Corrupt data')) // serverUrl
        .mockResolvedValueOnce('user123') // userId
        .mockResolvedValueOnce('testuser'); // username

      const authData = await TokenStorage.getAuthData();

      expect(authData).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error retrieving auth data');
    });
  });
});