import { MattermostService } from '../mattermostClient';
import { TokenStorage } from '../tokenStorage';
import { Client4 } from '@mattermost/client';
import { normalizeServerUrl, validateSystemAdmin } from '@/utils/validation';

// Mock dependencies
jest.mock('@mattermost/client');
jest.mock('../tokenStorage');
jest.mock('@/utils/validation');

const mockClient4 = Client4 as jest.MockedClass<typeof Client4>;
const mockTokenStorage = TokenStorage as jest.Mocked<typeof TokenStorage>;
const mockNormalizeServerUrl = normalizeServerUrl as jest.MockedFunction<typeof normalizeServerUrl>;
const mockValidateSystemAdmin = validateSystemAdmin as jest.MockedFunction<typeof validateSystemAdmin>;

describe('MattermostService', () => {
  let service: MattermostService;
  let mockClientInstance: jest.Mocked<Client4>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock client instance
    mockClientInstance = {
      setUrl: jest.fn(),
      setToken: jest.fn(),
      getToken: jest.fn(),
      getUrl: jest.fn(),
      ping: jest.fn(),
      login: jest.fn(),
      getMe: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
    } as any;
    
    mockClient4.mockImplementation(() => mockClientInstance);
    service = new MattermostService();
  });

  describe('initialization', () => {
    it('should initialize with stored auth data', async () => {
      const mockAuthData = {
        token: 'stored-token',
        serverUrl: 'https://stored.mattermost.com',
        userId: 'user123',
        username: 'testuser',
      };

      mockTokenStorage.getAuthData.mockResolvedValue(mockAuthData);

      await service.initialize();

      expect(mockTokenStorage.getAuthData).toHaveBeenCalledTimes(1);
      expect(mockClientInstance.setUrl).toHaveBeenCalledWith(mockAuthData.serverUrl);
      expect(mockClientInstance.setToken).toHaveBeenCalledWith(mockAuthData.token);
    });

    it('should handle missing auth data gracefully', async () => {
      mockTokenStorage.getAuthData.mockResolvedValue(null);

      await service.initialize();

      expect(mockTokenStorage.getAuthData).toHaveBeenCalledTimes(1);
      expect(mockClientInstance.setUrl).not.toHaveBeenCalled();
      expect(mockClientInstance.setToken).not.toHaveBeenCalled();
    });

    it('should handle storage errors gracefully', async () => {
      mockTokenStorage.getAuthData.mockRejectedValue(new Error('Storage error'));

      await service.initialize();

      expect(mockTokenStorage.getAuthData).toHaveBeenCalledTimes(1);
      expect(mockClientInstance.setUrl).not.toHaveBeenCalled();
      expect(mockClientInstance.setToken).not.toHaveBeenCalled();
    });

    it('should only initialize once', async () => {
      mockTokenStorage.getAuthData.mockResolvedValue(null);

      await service.initialize();
      await service.initialize();

      expect(mockTokenStorage.getAuthData).toHaveBeenCalledTimes(1);
    });
  });

  describe('pingServer', () => {
    it('should successfully ping server', async () => {
      const serverUrl = 'https://test.mattermost.com';
      const normalizedUrl = 'https://test.mattermost.com/';
      
      mockNormalizeServerUrl.mockReturnValue(normalizedUrl);
      mockClientInstance.ping.mockResolvedValue(undefined);

      const result = await service.pingServer(serverUrl);

      expect(mockNormalizeServerUrl).toHaveBeenCalledWith(serverUrl);
      expect(mockClientInstance.setUrl).toHaveBeenCalledWith(normalizedUrl);
      expect(mockClientInstance.ping).toHaveBeenCalledWith(false);
      expect(result).toEqual({ success: true });
    });

    it('should handle ping errors', async () => {
      const serverUrl = 'https://invalid.mattermost.com';
      const normalizedUrl = 'https://invalid.mattermost.com/';
      
      mockNormalizeServerUrl.mockReturnValue(normalizedUrl);
      mockClientInstance.ping.mockRejectedValue(new Error('Network error'));

      const result = await service.pingServer(serverUrl);

      expect(result).toEqual({
        success: false,
        error: 'Unable to connect to server. Please check the URL and try again.',
      });
    });

    it('should handle network errors specifically', async () => {
      const serverUrl = 'https://network.error.com';
      const normalizedUrl = 'https://network.error.com/';
      
      mockNormalizeServerUrl.mockReturnValue(normalizedUrl);
      mockClientInstance.ping.mockRejectedValue(new Error('Network request failed'));

      const result = await service.pingServer(serverUrl);

      expect(result).toEqual({
        success: false,
        error: 'Unable to connect to server. Please check the URL and try again.',
      });
    });
  });

  describe('login', () => {
    it('should login successfully and store auth data', async () => {
      const serverUrl = 'https://test.mattermost.com';
      const normalizedUrl = 'https://test.mattermost.com/';
      const username = 'testuser';
      const password = 'testpass';
      const mockUser = { id: 'user123', username: 'testuser', roles: 'system_admin system_user' };
      const mockToken = 'login-token-123';

      mockNormalizeServerUrl.mockReturnValue(normalizedUrl);
      mockClientInstance.login.mockResolvedValue(mockUser);
      mockClientInstance.getToken.mockReturnValue(mockToken);
      mockTokenStorage.saveAuthData.mockResolvedValue(undefined);
      mockValidateSystemAdmin.mockReturnValue({ isValid: true });

      const result = await service.login(serverUrl, username, password);

      expect(mockNormalizeServerUrl).toHaveBeenCalledWith(serverUrl);
      expect(mockClientInstance.setUrl).toHaveBeenCalledWith(normalizedUrl);
      expect(mockClientInstance.login).toHaveBeenCalledWith(username, password);
      expect(mockTokenStorage.saveAuthData).toHaveBeenCalledWith({
        token: mockToken,
        serverUrl: normalizedUrl,
        userId: mockUser.id,
        username: mockUser.username,
      });
      expect(result).toEqual({ success: true, user: mockUser });
    });

    it('should handle invalid credentials', async () => {
      const serverUrl = 'https://test.mattermost.com';
      const normalizedUrl = 'https://test.mattermost.com/';
      const username = 'testuser';
      const password = 'wrongpass';

      mockNormalizeServerUrl.mockReturnValue(normalizedUrl);
      mockClientInstance.login.mockRejectedValue(new Error('invalid_user_password'));

      const result = await service.login(serverUrl, username, password);

      expect(result).toEqual({
        success: false,
        error: 'Invalid username or password',
      });
    });

    it('should handle user not found', async () => {
      const serverUrl = 'https://test.mattermost.com';
      const normalizedUrl = 'https://test.mattermost.com/';
      const username = 'nonexistent';
      const password = 'testpass';

      mockNormalizeServerUrl.mockReturnValue(normalizedUrl);
      mockClientInstance.login.mockRejectedValue(new Error('user_not_found'));

      const result = await service.login(serverUrl, username, password);

      expect(result).toEqual({
        success: false,
        error: 'User not found',
      });
    });

    it('should handle inactive account', async () => {
      const serverUrl = 'https://test.mattermost.com';
      const normalizedUrl = 'https://test.mattermost.com/';
      const username = 'inactive';
      const password = 'testpass';

      mockNormalizeServerUrl.mockReturnValue(normalizedUrl);
      mockClientInstance.login.mockRejectedValue(new Error('account_inactive'));

      const result = await service.login(serverUrl, username, password);

      expect(result).toEqual({
        success: false,
        error: 'Account is inactive',
      });
    });

    it('should handle generic login errors', async () => {
      const serverUrl = 'https://test.mattermost.com';
      const normalizedUrl = 'https://test.mattermost.com/';
      const username = 'testuser';
      const password = 'testpass';

      mockNormalizeServerUrl.mockReturnValue(normalizedUrl);
      mockClientInstance.login.mockRejectedValue(new Error('Server error'));

      const result = await service.login(serverUrl, username, password);

      expect(result).toEqual({
        success: false,
        error: 'Server error',
      });
    });

    it('should handle token storage errors', async () => {
      const serverUrl = 'https://test.mattermost.com';
      const normalizedUrl = 'https://test.mattermost.com/';
      const username = 'testuser';
      const password = 'testpass';
      const mockUser = { id: 'user123', username: 'testuser', roles: 'system_admin system_user' };
      const mockToken = 'login-token-123';

      mockNormalizeServerUrl.mockReturnValue(normalizedUrl);
      mockClientInstance.login.mockResolvedValue(mockUser);
      mockClientInstance.getToken.mockReturnValue(mockToken);
      mockTokenStorage.saveAuthData.mockRejectedValue(new Error('Storage error'));
      mockValidateSystemAdmin.mockReturnValue({ isValid: true });

      const result = await service.login(serverUrl, username, password);

      expect(result).toEqual({ success: false, error: 'Storage error' });
    });

    it('should reject login for non-admin users', async () => {
      const serverUrl = 'https://test.mattermost.com';
      const normalizedUrl = 'https://test.mattermost.com/';
      const username = 'testuser';
      const password = 'testpass';
      const mockUser = { id: 'user123', username: 'testuser', roles: 'system_user' };

      mockNormalizeServerUrl.mockReturnValue(normalizedUrl);
      mockClientInstance.login.mockResolvedValue(mockUser);
      mockValidateSystemAdmin.mockReturnValue({ 
        isValid: false, 
        error: 'Access denied. This app is only available to system administrators.' 
      });

      const result = await service.login(serverUrl, username, password);

      expect(result).toEqual({ 
        success: false, 
        error: 'Access denied. This app is only available to system administrators.' 
      });
    });
  });

  describe('logout', () => {
    it('should clear all authentication data', async () => {
      mockTokenStorage.clearAll.mockResolvedValue(undefined);

      await service.logout();

      expect(mockTokenStorage.clearAll).toHaveBeenCalledTimes(1);
      expect(mockClientInstance.setToken).toHaveBeenCalledWith('');
      expect(mockClientInstance.setUrl).toHaveBeenCalledWith('');
    });

    it('should handle storage errors gracefully', async () => {
      mockTokenStorage.clearAll.mockRejectedValue(new Error('Storage error'));

      await service.logout();

      expect(mockTokenStorage.clearAll).toHaveBeenCalledTimes(1);
      expect(mockClientInstance.setToken).toHaveBeenCalledWith('');
      expect(mockClientInstance.setUrl).toHaveBeenCalledWith('');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', async () => {
      mockTokenStorage.getAuthData.mockResolvedValue({
        token: 'valid-token',
        serverUrl: 'https://test.com',
      });
      mockClientInstance.getToken.mockReturnValue('valid-token');

      const result = await service.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when no token exists', async () => {
      mockTokenStorage.getAuthData.mockResolvedValue(null);
      mockClientInstance.getToken.mockReturnValue(null);

      const result = await service.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('validateToken', () => {
    it('should validate token successfully', async () => {
      const mockAuthData = {
        token: 'valid-token',
        serverUrl: 'https://test.com',
      };
      const mockUser = { id: 'user123' };

      mockTokenStorage.getAuthData.mockResolvedValue(mockAuthData);
      mockClientInstance.getToken.mockReturnValue('valid-token');
      mockClientInstance.getMe.mockResolvedValue(mockUser);

      const result = await service.validateToken();

      expect(mockClientInstance.getMe).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it('should handle invalid token', async () => {
      const mockAuthData = {
        token: 'invalid-token',
        serverUrl: 'https://test.com',
      };

      mockTokenStorage.getAuthData.mockResolvedValue(mockAuthData);
      mockClientInstance.getToken.mockReturnValue('invalid-token');
      mockClientInstance.getMe.mockRejectedValue(new Error('Unauthorized'));
      mockTokenStorage.clearAll.mockResolvedValue(undefined);

      const result = await service.validateToken();

      expect(mockClientInstance.getMe).toHaveBeenCalledTimes(1);
      expect(mockTokenStorage.clearAll).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });

    it('should handle missing token', async () => {
      mockTokenStorage.getAuthData.mockResolvedValue(null);
      mockClientInstance.getToken.mockReturnValue(null);

      const result = await service.validateToken();

      expect(mockClientInstance.getMe).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('token and URL getters/setters', () => {
    it('should get token from client', () => {
      const mockToken = 'test-token';
      mockClientInstance.getToken.mockReturnValue(mockToken);

      const result = service.getToken();

      expect(mockClientInstance.getToken).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockToken);
    });

    it('should set token on client', () => {
      const mockToken = 'new-token';

      service.setToken(mockToken);

      expect(mockClientInstance.setToken).toHaveBeenCalledWith(mockToken);
    });

    it('should get URL from client', () => {
      const mockUrl = 'https://test.com';
      mockClientInstance.getUrl.mockReturnValue(mockUrl);

      const result = service.getUrl();

      expect(mockClientInstance.getUrl).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockUrl);
    });
  });

  describe('sendPasswordResetEmail', () => {
    beforeEach(async () => {
      // Initialize service with mock auth data
      mockTokenStorage.getAuthData.mockResolvedValue({
        token: 'valid-token',
        serverUrl: 'https://test.mattermost.com',
        userId: 'user123',
        username: 'testuser',
      });
      await service.initialize();
    });

    it('should send password reset email successfully', async () => {
      const email = 'user@example.com';
      mockClientInstance.sendPasswordResetEmail.mockResolvedValue(undefined);

      const result = await service.sendPasswordResetEmail(email);

      expect(mockClientInstance.sendPasswordResetEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual({ success: true });
    });

    it('should handle user not found error', async () => {
      const email = 'nonexistent@example.com';
      mockClientInstance.sendPasswordResetEmail.mockRejectedValue(new Error('User not found'));

      const result = await service.sendPasswordResetEmail(email);

      expect(result).toEqual({
        success: false,
        error: 'User not found',
      });
    });

    it('should handle permission denied error', async () => {
      const email = 'user@example.com';
      mockClientInstance.sendPasswordResetEmail.mockRejectedValue(new Error('permission denied'));

      const result = await service.sendPasswordResetEmail(email);

      expect(result).toEqual({
        success: false,
        error: 'Permission denied. You need admin privileges to reset passwords.',
      });
    });

    it('should handle SSO user error', async () => {
      const email = 'sso-user@example.com';
      mockClientInstance.sendPasswordResetEmail.mockRejectedValue(new Error('sso user detected'));

      const result = await service.sendPasswordResetEmail(email);

      expect(result).toEqual({
        success: false,
        error: 'Cannot reset password for SSO users',
      });
    });

    it('should handle generic API errors', async () => {
      const email = 'user@example.com';
      mockClientInstance.sendPasswordResetEmail.mockRejectedValue(new Error('Server internal error'));

      const result = await service.sendPasswordResetEmail(email);

      expect(result).toEqual({
        success: false,
        error: 'Server internal error',
      });
    });

    it('should handle network errors', async () => {
      const email = 'user@example.com';
      mockClientInstance.sendPasswordResetEmail.mockRejectedValue(new Error('Network request failed'));

      const result = await service.sendPasswordResetEmail(email);

      expect(result).toEqual({
        success: false,
        error: 'Network request failed',
      });
    });

    it('should handle non-Error exceptions', async () => {
      const email = 'user@example.com';
      mockClientInstance.sendPasswordResetEmail.mockRejectedValue('Unexpected error');

      const result = await service.sendPasswordResetEmail(email);

      expect(result).toEqual({
        success: false,
        error: 'Failed to send password reset email',
      });
    });

    it('should initialize service before making API call', async () => {
      const newService = new MattermostService();
      const email = 'user@example.com';
      
      mockTokenStorage.getAuthData.mockResolvedValue({
        token: 'init-token',
        serverUrl: 'https://init.mattermost.com',
      });
      mockClientInstance.sendPasswordResetEmail.mockResolvedValue(undefined);

      const result = await newService.sendPasswordResetEmail(email);

      expect(mockTokenStorage.getAuthData).toHaveBeenCalled();
      expect(mockClientInstance.setUrl).toHaveBeenCalledWith('https://init.mattermost.com');
      expect(mockClientInstance.setToken).toHaveBeenCalledWith('init-token');
      expect(result).toEqual({ success: true });
    });
  });
});