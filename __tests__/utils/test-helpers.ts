export interface AuthData {
  token: string;
  serverUrl: string;
  userId?: string;
  username?: string;
}

/**
 * Test utilities for authentication and token storage testing
 */

export class TestDataFactory {
  /**
   * Creates mock authentication data for testing
   */
  static createAuthData(overrides: Partial<AuthData> = {}): AuthData {
    return {
      token: 'test-token-123',
      serverUrl: 'https://test.mattermost.com',
      userId: 'user123',
      username: 'testuser',
      ...overrides,
    };
  }

  /**
   * Creates mock user data for testing
   */
  static createUser(overrides: any = {}) {
    return {
      id: 'user123',
      username: 'testuser',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      roles: 'system_user',
      delete_at: 0,
      auth_service: null, // Email authentication by default
      mfa_active: false,
      ...overrides,
    };
  }

  /**
   * Creates mock admin user data for testing
   */
  static createAdminUser(overrides: any = {}) {
    return {
      id: 'admin123',
      username: 'admin',
      email: 'admin@example.com',
      first_name: 'Admin',
      last_name: 'User',
      roles: 'system_admin',
      delete_at: 0,
      auth_service: null, // Email authentication by default
      mfa_active: true,
      ...overrides,
    };
  }

  /**
   * Creates mock SSO user data for testing
   */
  static createSSOUser(authService: string = 'saml', overrides: any = {}) {
    return {
      id: 'sso123',
      username: 'ssouser',
      email: 'sso@example.com',
      first_name: 'SSO',
      last_name: 'User',
      roles: 'system_user',
      delete_at: 0,
      auth_service: authService,
      mfa_active: false,
      ...overrides,
    };
  }

  /**
   * Creates mock email authentication user data for testing
   */
  static createEmailAuthUser(overrides: any = {}) {
    return {
      id: 'email123',
      username: 'emailuser',
      email: 'email@example.com',
      first_name: 'Email',
      last_name: 'User',
      roles: 'system_user',
      delete_at: 0,
      auth_service: null,
      mfa_active: false,
      ...overrides,
    };
  }

  /**
   * Creates mock server URLs for testing
   */
  static createServerUrls() {
    return {
      valid: 'https://test.mattermost.com',
      withPort: 'https://test.mattermost.com:8065',
      withPath: 'https://test.mattermost.com/subpath',
      localhost: 'http://localhost:8065',
      ip: 'http://192.168.1.100:8065',
    };
  }

  /**
   * Creates mock error responses for testing
   */
  static createErrorResponses() {
    return {
      invalidCredentials: new Error('invalid_user_password'),
      userNotFound: new Error('user_not_found'),
      accountInactive: new Error('account_inactive'),
      networkError: new Error('Network request failed'),
      serverError: new Error('Internal Server Error'),
      unauthorized: new Error('Unauthorized'),
      forbidden: new Error('Forbidden'),
      ssoUser: new Error('Cannot reset password for SSO user'),
      permissionDenied: new Error('Permission denied'),
    };
  }
}

export class StorageMockHelper {
  /**
   * Creates a mock for expo-secure-store with common scenarios
   */
  static createSecureStoreMock() {
    return {
      setItemAsync: jest.fn(),
      getItemAsync: jest.fn(),
      deleteItemAsync: jest.fn(),
    };
  }

  /**
   * Sets up storage mock for successful operations
   */
  static setupSuccessfulStorage(mockStore: any, authData: AuthData) {
    mockStore.setItemAsync.mockResolvedValue(undefined);
    mockStore.getItemAsync
      .mockResolvedValueOnce(authData.token)
      .mockResolvedValueOnce(authData.serverUrl)
      .mockResolvedValueOnce(authData.userId)
      .mockResolvedValueOnce(authData.username);
    mockStore.deleteItemAsync.mockResolvedValue(undefined);
  }

  /**
   * Sets up storage mock for empty/null responses
   */
  static setupEmptyStorage(mockStore: any) {
    mockStore.getItemAsync.mockResolvedValue(null);
    mockStore.setItemAsync.mockResolvedValue(undefined);
    mockStore.deleteItemAsync.mockResolvedValue(undefined);
  }

  /**
   * Sets up storage mock for error scenarios
   */
  static setupErrorStorage(mockStore: any, errorType: 'permission' | 'quota' | 'corruption' = 'permission') {
    const errorMap = {
      permission: new Error('Permission denied'),
      quota: new Error('QuotaExceededError'),
      corruption: new Error('Storage corruption detected'),
    };

    const error = errorMap[errorType];
    mockStore.setItemAsync.mockRejectedValue(error);
    mockStore.getItemAsync.mockRejectedValue(error);
    mockStore.deleteItemAsync.mockRejectedValue(error);
  }
}

export class MattermostClientMockHelper {
  /**
   * Creates a mock for the Mattermost Client4
   */
  static createClient4Mock() {
    return {
      setUrl: jest.fn(),
      setToken: jest.fn(),
      getToken: jest.fn(),
      getUrl: jest.fn(),
      ping: jest.fn(),
      login: jest.fn(),
      getMe: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
    };
  }

  /**
   * Sets up client mock for successful operations
   */
  static setupSuccessfulClient(mockClient: any, user: any, token: string) {
    mockClient.login.mockResolvedValue(user);
    mockClient.getToken.mockReturnValue(token);
    mockClient.getMe.mockResolvedValue(user);
    mockClient.ping.mockResolvedValue(undefined);
    mockClient.getUrl.mockReturnValue('https://test.mattermost.com');
  }

  /**
   * Sets up client mock for authentication failures
   */
  static setupAuthFailureClient(mockClient: any, errorType: 'credentials' | 'network' | 'server' = 'credentials') {
    const errorMap = {
      credentials: new Error('invalid_user_password'),
      network: new Error('Network request failed'),
      server: new Error('Internal Server Error'),
    };

    const error = errorMap[errorType];
    mockClient.login.mockRejectedValue(error);
    mockClient.getMe.mockRejectedValue(error);
    mockClient.ping.mockRejectedValue(error);
  }
}

export class PasswordResetTestHelper {
  /**
   * Sets up mocks for successful password reset
   */
  static setupSuccessfulPasswordReset(mockService: any, email: string) {
    mockService.sendPasswordResetEmail.mockResolvedValue({ success: true });
    return { email };
  }

  /**
   * Sets up mocks for failed password reset
   */
  static setupFailedPasswordReset(mockService: any, errorType: 'not_found' | 'permission' | 'sso' | 'network' = 'not_found') {
    const errorMap = {
      not_found: { success: false, error: 'User not found' },
      permission: { success: false, error: 'Permission denied. You need admin privileges to reset passwords.' },
      sso: { success: false, error: 'Cannot reset password for SSO users' },
      network: { success: false, error: 'Network request failed' },
    };

    mockService.sendPasswordResetEmail.mockResolvedValue(errorMap[errorType]);
  }

  /**
   * Sets up mocks for password reset exception
   */
  static setupPasswordResetException(mockService: any, error: Error) {
    mockService.sendPasswordResetEmail.mockRejectedValue(error);
  }

  /**
   * Creates test scenarios for password reset functionality
   */
  static getPasswordResetScenarios() {
    return {
      emailAuthUser: {
        description: 'Email authentication user (can reset password)',
        user: TestDataFactory.createEmailAuthUser(),
        canResetPassword: true,
      },
      ssoSamlUser: {
        description: 'SAML SSO user (cannot reset password)',
        user: TestDataFactory.createSSOUser('saml'),
        canResetPassword: false,
      },
      ssoLdapUser: {
        description: 'LDAP SSO user (cannot reset password)',
        user: TestDataFactory.createSSOUser('ldap'),
        canResetPassword: false,
      },
      ssoGoogleUser: {
        description: 'Google OAuth user (cannot reset password)',
        user: TestDataFactory.createSSOUser('google'),
        canResetPassword: false,
      },
      emptyAuthServiceUser: {
        description: 'User with empty auth_service (can reset password)',
        user: TestDataFactory.createUser({ auth_service: '' }),
        canResetPassword: true,
      },
      whitespaceAuthServiceUser: {
        description: 'User with whitespace-only auth_service (can reset password)',
        user: TestDataFactory.createUser({ auth_service: '   ' }),
        canResetPassword: true,
      },
      undefinedAuthServiceUser: {
        description: 'User with undefined auth_service (can reset password)',
        user: TestDataFactory.createUser({ auth_service: undefined }),
        canResetPassword: true,
      },
    };
  }

  /**
   * Helper to check if a user can reset password based on auth_service
   */
  static canUserResetPassword(user: any): boolean {
    return !user.auth_service || user.auth_service.trim() === '';
  }
}

export class TestScenarios {
  /**
   * Common test scenarios for authentication flows
   */
  static getAuthScenarios() {
    return {
      freshInstall: {
        description: 'Fresh app install with no stored data',
        storedData: null,
        expectedAuth: false,
      },
      validStoredAuth: {
        description: 'Valid stored authentication data',
        storedData: TestDataFactory.createAuthData(),
        expectedAuth: true,
      },
      expiredToken: {
        description: 'Expired token in storage',
        storedData: TestDataFactory.createAuthData({ token: 'expired-token' }),
        expectedAuth: false,
      },
      corruptedData: {
        description: 'Corrupted data in storage',
        storedData: 'corrupted-data',
        expectedAuth: false,
      },
    };
  }

  /**
   * Common test scenarios for login flows
   */
  static getLoginScenarios() {
    return {
      successfulLogin: {
        description: 'Successful login with valid credentials',
        serverUrl: 'https://test.mattermost.com',
        username: 'testuser',
        password: 'testpass',
        expectedResult: { success: true },
      },
      invalidCredentials: {
        description: 'Login with invalid credentials',
        serverUrl: 'https://test.mattermost.com',
        username: 'testuser',
        password: 'wrongpass',
        expectedResult: { success: false, error: 'Invalid username or password' },
      },
      networkError: {
        description: 'Login with network error',
        serverUrl: 'https://unreachable.com',
        username: 'testuser',
        password: 'testpass',
        expectedResult: { success: false, error: 'Login failed' },
      },
    };
  }
}

export class TestWaitUtils {
  /**
   * Waits for a condition to be true with timeout
   */
  static async waitForCondition(
    condition: () => boolean,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> {
    const start = Date.now();
    
    while (!condition() && Date.now() - start < timeout) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    if (!condition()) {
      throw new Error(`Condition not met within ${timeout}ms`);
    }
  }

  /**
   * Waits for async operations to complete
   */
  static async waitForAsync(ms: number = 0): Promise<void> {
    return new Promise(resolve => {
      if (ms > 0) {
        setTimeout(resolve, ms);
      } else {
        setImmediate(resolve);
      }
    });
  }
}

export class ConsoleMockHelper {
  /**
   * Mocks console methods to avoid noise in tests
   */
  static mockConsole() {
    const originalError = console.error;
    const originalLog = console.log;
    const originalWarn = console.warn;

    const mockError = jest.fn();
    const mockLog = jest.fn();
    const mockWarn = jest.fn();

    console.error = mockError;
    console.log = mockLog;
    console.warn = mockWarn;

    return {
      mockError,
      mockLog,
      mockWarn,
      restore: () => {
        console.error = originalError;
        console.log = originalLog;
        console.warn = originalWarn;
      },
    };
  }
}

export class PerformanceTestHelper {
  /**
   * Measures execution time of a function
   */
  static async measureExecutionTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    return { result, duration };
  }

  /**
   * Runs a function multiple times and returns performance metrics
   */
  static async runPerformanceTest<T>(
    fn: () => Promise<T>,
    iterations: number = 100
  ): Promise<{
    averageTime: number;
    minTime: number;
    maxTime: number;
    totalTime: number;
    results: T[];
  }> {
    const times: number[] = [];
    const results: T[] = [];

    for (let i = 0; i < iterations; i++) {
      const { result, duration } = await this.measureExecutionTime(fn);
      times.push(duration);
      results.push(result);
    }

    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    return {
      averageTime,
      minTime,
      maxTime,
      totalTime,
      results,
    };
  }
}

/**
 * Custom Jest matchers for authentication testing
 */
export const customMatchers = {
  toBeAuthenticated: (received: any) => {
    const pass = received.isAuthenticated === true && received.user !== null;
    
    if (pass) {
      return {
        message: () => 'Expected not to be authenticated',
        pass: true,
      };
    } else {
      return {
        message: () => 'Expected to be authenticated',
        pass: false,
      };
    }
  },

  toHaveValidToken: (received: any) => {
    const pass = typeof received === 'string' && received.length > 0;
    
    if (pass) {
      return {
        message: () => 'Expected not to have a valid token',
        pass: true,
      };
    } else {
      return {
        message: () => 'Expected to have a valid token',
        pass: false,
      };
    }
  },
};