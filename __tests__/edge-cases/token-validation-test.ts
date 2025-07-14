import { MattermostService } from '@/services/mattermostClient';
import { TokenStorage } from '@/services/tokenStorage';
import { Client4 } from '@mattermost/client';

// Mock dependencies
jest.mock('@mattermost/client');
jest.mock('@/services/tokenStorage');
jest.mock('@/utils/validation', () => ({
  normalizeServerUrl: jest.fn((url) => url),
}));

const mockClient4 = Client4 as jest.MockedClass<typeof Client4>;
const mockTokenStorage = TokenStorage as jest.Mocked<typeof TokenStorage>;

describe('Token Validation Edge Cases', () => {
  let service: MattermostService;
  let mockClientInstance: jest.Mocked<Client4>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockClientInstance = {
      setUrl: jest.fn(),
      setToken: jest.fn(),
      getToken: jest.fn(),
      getUrl: jest.fn(),
      ping: jest.fn(),
      login: jest.fn(),
      getMe: jest.fn(),
    } as any;
    
    mockClient4.mockImplementation(() => mockClientInstance);
    service = new MattermostService();
    
    // Mock console to avoid noise
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Token corruption scenarios', () => {
    it('should handle malformed token gracefully', async () => {
      const corruptedAuthData = {
        token: 'corrupted-token-###-invalid',
        serverUrl: 'https://test.com',
      };

      mockTokenStorage.getAuthData.mockResolvedValue(corruptedAuthData);
      mockClientInstance.getToken.mockReturnValue(corruptedAuthData.token);
      mockClientInstance.getMe.mockRejectedValue(new Error('Token format invalid'));
      mockTokenStorage.clearAll.mockResolvedValue(undefined);

      const result = await service.validateToken();

      expect(result).toBe(false);
      expect(mockTokenStorage.clearAll).toHaveBeenCalledTimes(1);
    });

    it('should handle empty token string', async () => {
      const emptyTokenData = {
        token: '',
        serverUrl: 'https://test.com',
      };

      mockTokenStorage.getAuthData.mockResolvedValue(emptyTokenData);
      mockClientInstance.getToken.mockReturnValue('');

      const result = await service.validateToken();

      expect(result).toBe(false);
      expect(mockClientInstance.getMe).not.toHaveBeenCalled();
    });

    it('should handle undefined token', async () => {
      mockTokenStorage.getAuthData.mockResolvedValue(null);
      mockClientInstance.getToken.mockReturnValue(null);

      const result = await service.validateToken();

      expect(result).toBe(false);
      expect(mockClientInstance.getMe).not.toHaveBeenCalled();
    });
  });

  describe('Network failure scenarios', () => {
    it('should handle network timeout during token validation', async () => {
      const validAuthData = {
        token: 'valid-token',
        serverUrl: 'https://test.com',
      };

      mockTokenStorage.getAuthData.mockResolvedValue(validAuthData);
      mockClientInstance.getToken.mockReturnValue(validAuthData.token);
      mockClientInstance.getMe.mockRejectedValue(new Error('Network timeout'));
      mockTokenStorage.clearAll.mockResolvedValue(undefined);

      const result = await service.validateToken();

      expect(result).toBe(false);
      expect(mockTokenStorage.clearAll).toHaveBeenCalledTimes(1);
    });

    it('should handle intermittent network errors', async () => {
      const validAuthData = {
        token: 'valid-token',
        serverUrl: 'https://test.com',
      };

      mockTokenStorage.getAuthData.mockResolvedValue(validAuthData);
      mockClientInstance.getToken.mockReturnValue(validAuthData.token);
      mockClientInstance.getMe.mockRejectedValue(new Error('ECONNRESET'));
      mockTokenStorage.clearAll.mockResolvedValue(undefined);

      const result = await service.validateToken();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Token validation failed');
    });

    it('should handle DNS resolution failures', async () => {
      const serverUrl = 'https://nonexistent.domain.com';
      
      mockClientInstance.ping.mockRejectedValue(new Error('ENOTFOUND'));

      const result = await service.pingServer(serverUrl);

      expect(result).toEqual({
        success: false,
        error: 'Server not reachable. Please verify the URL is correct.',
      });
    });
  });

  describe('Server response edge cases', () => {
    it('should handle 401 unauthorized responses', async () => {
      const expiredTokenData = {
        token: 'expired-token',
        serverUrl: 'https://test.com',
      };

      mockTokenStorage.getAuthData.mockResolvedValue(expiredTokenData);
      mockClientInstance.getToken.mockReturnValue(expiredTokenData.token);
      mockClientInstance.getMe.mockRejectedValue(new Error('Unauthorized'));
      mockTokenStorage.clearAll.mockResolvedValue(undefined);

      const result = await service.validateToken();

      expect(result).toBe(false);
      expect(mockTokenStorage.clearAll).toHaveBeenCalledTimes(1);
    });

    it('should handle 403 forbidden responses', async () => {
      const revokedTokenData = {
        token: 'revoked-token',
        serverUrl: 'https://test.com',
      };

      mockTokenStorage.getAuthData.mockResolvedValue(revokedTokenData);
      mockClientInstance.getToken.mockReturnValue(revokedTokenData.token);
      mockClientInstance.getMe.mockRejectedValue(new Error('Forbidden'));
      mockTokenStorage.clearAll.mockResolvedValue(undefined);

      const result = await service.validateToken();

      expect(result).toBe(false);
      expect(mockTokenStorage.clearAll).toHaveBeenCalledTimes(1);
    });

    it('should handle 500 internal server errors', async () => {
      const validTokenData = {
        token: 'valid-token',
        serverUrl: 'https://test.com',
      };

      mockTokenStorage.getAuthData.mockResolvedValue(validTokenData);
      mockClientInstance.getToken.mockReturnValue(validTokenData.token);
      mockClientInstance.getMe.mockRejectedValue(new Error('Internal Server Error'));
      mockTokenStorage.clearAll.mockResolvedValue(undefined);

      const result = await service.validateToken();

      expect(result).toBe(false);
      expect(mockTokenStorage.clearAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('Storage edge cases', () => {
    it('should handle storage quota exceeded', async () => {
      const largeData = {
        token: 'a'.repeat(10000), // Very large token
        serverUrl: 'https://test.com',
        userId: 'user123',
        username: 'testuser',
      };

      mockTokenStorage.saveAuthData.mockRejectedValue(new Error('QuotaExceededError'));

      const result = await service.login('https://test.com', 'user', 'pass');

      expect(result).toEqual({ success: true, user: undefined });
    });

    it('should handle storage permission denied', async () => {
      mockTokenStorage.getAuthData.mockRejectedValue(new Error('Permission denied'));

      await service.initialize();

      expect(console.error).toHaveBeenCalledWith('Failed to initialize Mattermost client:', expect.any(Error));
    });

    it('should handle storage corruption during read', async () => {
      mockTokenStorage.getAuthData.mockRejectedValue(new Error('Storage corruption detected'));

      const result = await service.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('Concurrent operations', () => {
    it('should handle multiple simultaneous token validations', async () => {
      const validAuthData = {
        token: 'valid-token',
        serverUrl: 'https://test.com',
      };

      mockTokenStorage.getAuthData.mockResolvedValue(validAuthData);
      mockClientInstance.getToken.mockReturnValue(validAuthData.token);
      mockClientInstance.getMe.mockResolvedValue({ id: 'user123' });

      const validationPromises = [
        service.validateToken(),
        service.validateToken(),
        service.validateToken(),
      ];

      const results = await Promise.all(validationPromises);

      expect(results).toEqual([true, true, true]);
      expect(mockClientInstance.getMe).toHaveBeenCalledTimes(3);
    });

    it('should handle concurrent login attempts', async () => {
      const mockUser = { id: 'user123', username: 'testuser' };
      const mockToken = 'concurrent-token';

      mockClientInstance.login.mockResolvedValue(mockUser);
      mockClientInstance.getToken.mockReturnValue(mockToken);
      mockTokenStorage.saveAuthData.mockResolvedValue(undefined);

      const loginPromises = [
        service.login('https://test.com', 'user1', 'pass1'),
        service.login('https://test.com', 'user2', 'pass2'),
      ];

      const results = await Promise.all(loginPromises);

      expect(results).toHaveLength(2);
      expect(mockClientInstance.login).toHaveBeenCalledTimes(2);
    });

    it('should handle concurrent logout operations', async () => {
      mockTokenStorage.clearAll.mockResolvedValue(undefined);

      const logoutPromises = [
        service.logout(),
        service.logout(),
        service.logout(),
      ];

      await Promise.all(logoutPromises);

      expect(mockTokenStorage.clearAll).toHaveBeenCalledTimes(3);
    });
  });

  describe('Memory and performance edge cases', () => {
    it('should handle large user objects', async () => {
      const largeUser = {
        id: 'user123',
        username: 'testuser',
        profile: {
          // Simulate large profile data
          avatar: 'data:image/base64,' + 'x'.repeat(100000),
          bio: 'Very long bio '.repeat(1000),
        },
      };

      mockClientInstance.login.mockResolvedValue(largeUser);
      mockClientInstance.getToken.mockReturnValue('token123');
      mockTokenStorage.saveAuthData.mockResolvedValue(undefined);

      const result = await service.login('https://test.com', 'user', 'pass');

      expect(result).toEqual({ success: true, user: largeUser });
    });

    it('should handle rapid successive operations', async () => {
      const operations = [];
      
      for (let i = 0; i < 100; i++) {
        operations.push(service.isAuthenticated());
      }

      const results = await Promise.all(operations);

      expect(results).toHaveLength(100);
    });
  });

  describe('URL edge cases', () => {
    it('should handle malformed server URLs', async () => {
      const malformedUrls = [
        'not-a-url',
        'http://',
        'https://',
        'ftp://invalid.com',
        'javascript:alert()',
        'data:text/html,<script>alert()</script>',
      ];

      for (const url of malformedUrls) {
        mockClientInstance.ping.mockRejectedValue(new Error('Invalid URL'));
        
        const result = await service.pingServer(url);
        
        expect(result.success).toBe(false);
      }
    });

    it('should handle URLs with unusual ports', async () => {
      const urlsWithPorts = [
        'https://test.com:8065',
        'https://test.com:443',
        'https://test.com:65535',
        'https://test.com:1',
      ];

      for (const url of urlsWithPorts) {
        mockClientInstance.ping.mockResolvedValue(undefined);
        
        const result = await service.pingServer(url);
        
        expect(result.success).toBe(true);
      }
    });
  });
});