import * as SecureStore from 'expo-secure-store';

const KEYS = {
  TOKEN: 'mattermost_token',
  SERVER_URL: 'mattermost_server_url',
  USER_ID: 'mattermost_user_id',
  USERNAME: 'mattermost_username',
};

export interface AuthData {
  token: string;
  serverUrl: string;
  userId?: string;
  username?: string;
}

export class TokenStorage {
  static async saveToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.TOKEN, token);
    } catch (error) {
      console.error('Error saving token');
      throw new Error('Failed to save authentication token');
    }
  }

  static async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(KEYS.TOKEN);
    } catch (error) {
      console.error('Error retrieving token');
      return null;
    }
  }

  static async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(KEYS.TOKEN);
    } catch (error) {
      console.error('Error removing token');
    }
  }

  static async saveServerUrl(serverUrl: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.SERVER_URL, serverUrl);
    } catch (error) {
      console.error('Error saving server URL');
      throw new Error('Failed to save server URL');
    }
  }

  static async getServerUrl(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(KEYS.SERVER_URL);
    } catch (error) {
      console.error('Error retrieving server URL');
      return null;
    }
  }

  static async removeServerUrl(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(KEYS.SERVER_URL);
    } catch (error) {
      console.error('Error removing server URL');
    }
  }

  static async saveUserId(userId: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.USER_ID, userId);
    } catch (error) {
      console.error('Error saving user ID');
    }
  }

  static async getUserId(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(KEYS.USER_ID);
    } catch (error) {
      console.error('Error retrieving user ID');
      return null;
    }
  }

  static async saveUsername(username: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.USERNAME, username);
    } catch (error) {
      console.error('Error saving username');
    }
  }

  static async getUsername(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(KEYS.USERNAME);
    } catch (error) {
      console.error('Error retrieving username');
      return null;
    }
  }

  static async saveAuthData(authData: AuthData): Promise<void> {
    try {
      await Promise.all([
        SecureStore.setItemAsync(KEYS.TOKEN, authData.token),
        SecureStore.setItemAsync(KEYS.SERVER_URL, authData.serverUrl),
        authData.userId ? SecureStore.setItemAsync(KEYS.USER_ID, authData.userId) : Promise.resolve(),
        authData.username ? SecureStore.setItemAsync(KEYS.USERNAME, authData.username) : Promise.resolve(),
      ]);
    } catch (error) {
      console.error('Error saving auth data');
      throw new Error('Failed to save authentication data');
    }
  }

  static async getAuthData(): Promise<AuthData | null> {
    try {
      const [token, serverUrl, userId, username] = await Promise.all([
        SecureStore.getItemAsync(KEYS.TOKEN),
        SecureStore.getItemAsync(KEYS.SERVER_URL),
        SecureStore.getItemAsync(KEYS.USER_ID),
        SecureStore.getItemAsync(KEYS.USERNAME),
      ]);

      if (!token || !serverUrl) {
        return null;
      }

      return {
        token,
        serverUrl,
        userId: userId || undefined,
        username: username || undefined,
      };
    } catch (error) {
      console.error('Error retrieving auth data');
      return null;
    }
  }

  static async clearAll(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(KEYS.TOKEN),
        SecureStore.deleteItemAsync(KEYS.SERVER_URL),
        SecureStore.deleteItemAsync(KEYS.USER_ID),
        SecureStore.deleteItemAsync(KEYS.USERNAME),
      ]);
    } catch (error) {
      console.error('Error clearing auth data');
    }
  }
}