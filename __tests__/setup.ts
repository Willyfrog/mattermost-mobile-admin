import { customMatchers } from './utils/test-helpers';

// Extend Jest with custom matchers
expect.extend(customMatchers);

// Mock Expo modules
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => false),
    isReady: true,
  },
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => false),
  }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  usePathname: () => '/',
}));

// Global test configuration
global.setImmediate = global.setImmediate || ((fn: any, ...args: any[]) => global.setTimeout(fn, 0, ...args));
global.clearImmediate = global.clearImmediate || global.clearTimeout;

// Mock console methods to reduce noise during tests
const originalError = console.error;
const originalWarn = console.warn;

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
  
  // Mock console methods to avoid noise unless explicitly testing them
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  // Restore console methods
  console.error = originalError;
  console.warn = originalWarn;
});

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAuthenticated(): R;
      toHaveValidToken(): R;
    }
  }
}

// Export common test utilities
export * from './utils/test-helpers';