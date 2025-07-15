import { Client4 } from '@mattermost/client';
import { normalizeServerUrl, validateSystemAdmin } from '@/utils/validation';
import { TokenStorage } from './tokenStorage';

export class MattermostService {
  private client: Client4;
  private initialized = false;
  
  constructor() {
    this.client = new Client4();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      const authData = await TokenStorage.getAuthData();
      if (authData) {
        this.client.setUrl(authData.serverUrl);
        this.client.setToken(authData.token);
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Mattermost client:', error);
      this.initialized = true;
    }
  }

  async pingServer(serverUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      const normalizedUrl = normalizeServerUrl(serverUrl);
      this.client.setUrl(normalizedUrl);
      
      // Use the ping endpoint to check if server is reachable
      await this.client.ping(false);
      
      return { success: true };
    } catch (error) {
      console.error('Server ping failed:', error);
      
      if (error instanceof Error) {
        return { 
          success: false, 
          error: error.message.includes('Network') 
            ? 'Unable to connect to server. Please check the URL and try again.'
            : 'Server not reachable. Please verify the URL is correct.'
        };
      }
      
      return { 
        success: false, 
        error: 'Unable to connect to server. Please check the URL and try again.' 
      };
    }
  }

  async login(serverUrl: string, username: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const normalizedUrl = normalizeServerUrl(serverUrl);
      this.client.setUrl(normalizedUrl);
      
      const user = await this.client.login(username, password);
      
      // Check if user has system admin role
      const adminValidation = validateSystemAdmin(user);
      if (!adminValidation.isValid) {
        return { success: false, error: adminValidation.error };
      }
      
      // Save authentication data to secure storage
      const token = this.client.getToken();
      if (token) {
        await TokenStorage.saveAuthData({
          token,
          serverUrl: normalizedUrl,
          userId: user.id,
          username: user.username,
        });
      }
      
      return { success: true, user };
    } catch (error) {
      console.error('Login failed:', error);
      
      if (error instanceof Error) {
        // Common Mattermost error messages
        if (error.message.includes('invalid_user_password')) {
          return { success: false, error: 'Invalid username or password' };
        }
        
        if (error.message.includes('user_not_found')) {
          return { success: false, error: 'User not found' };
        }
        
        if (error.message.includes('account_inactive')) {
          return { success: false, error: 'Account is inactive' };
        }
        
        return { success: false, error: error.message };
      }
      
      return { success: false, error: 'Login failed. Please check your credentials and try again.' };
    }
  }

  async logout(): Promise<void> {
    try {
      await TokenStorage.clearAll();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
    
    // Always clear local tokens even if storage clear fails
    this.client.setToken('');
    this.client.setUrl('');
  }

  getToken(): string | null {
    return this.client.getToken();
  }

  setToken(token: string): void {
    this.client.setToken(token);
  }

  getUrl(): string {
    return this.client.getUrl();
  }

  async isAuthenticated(): Promise<boolean> {
    await this.initialize();
    const token = this.client.getToken();
    return Boolean(token);
  }

  async validateToken(): Promise<boolean> {
    try {
      await this.initialize();
      const token = this.client.getToken();
      
      if (!token) {
        return false;
      }

      // Validate token by making a simple API call
      await this.client.getMe();
      return true;
    } catch (error) {
      console.error('Token validation failed');
      // Clear invalid token from storage
      await this.logout();
      return false;
    }
  }

  async searchUsers(
    term: string = '',
    options: {
      allow_inactive?: boolean;
      limit?: number;
      page?: number;
    } = {}
  ): Promise<{ success: boolean; users?: any[]; error?: string }> {
    try {
      await this.initialize();
      
      const searchOptions = {
        term,
        allow_inactive: options.allow_inactive || false,
        limit: Math.min(options.limit || 20, 100), // Max 100 as per API
        page: options.page || 0,
      };

      const users = await this.client.searchUsers(term, searchOptions);
      
      return { success: true, users };
    } catch (error) {
      console.error('User search failed:', error);
      
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      
      return { success: false, error: 'Failed to search users' };
    }
  }

  async getAllUsers(
    page: number = 0,
    perPage: number = 20
  ): Promise<{ success: boolean; users?: any[]; error?: string }> {
    try {
      await this.initialize();
      
      const users = await this.client.getProfiles(page, Math.min(perPage, 100));
      
      return { success: true, users };
    } catch (error) {
      console.error('Get users failed:', error);
      
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      
      return { success: false, error: 'Failed to get users' };
    }
  }

  async getUsersByIds(
    userIds: string[]
  ): Promise<{ success: boolean; users?: any[]; error?: string }> {
    try {
      await this.initialize();
      
      const users = await this.client.getProfilesByIds(userIds);
      
      return { success: true, users };
    } catch (error) {
      console.error('Get users by IDs failed:', error);
      
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      
      return { success: false, error: 'Failed to get users' };
    }
  }

  async getUser(userId: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      await this.initialize();
      
      const user = await this.client.getUser(userId);
      
      return { success: true, user };
    } catch (error) {
      console.error('Get user failed:', error);
      
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      
      return { success: false, error: 'Failed to get user' };
    }
  }

  async getAllTeams(): Promise<{ success: boolean; teams?: any[]; error?: string }> {
    try {
      await this.initialize();
      
      const teamsResponse = await this.client.getTeams();
      
      // Handle both Team[] and TeamsWithCount responses
      const teams = Array.isArray(teamsResponse) ? teamsResponse : teamsResponse.teams;
      
      return { success: true, teams };
    } catch (error) {
      console.error('Get teams failed:', error);
      
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      
      return { success: false, error: 'Failed to get teams' };
    }
  }

  async getAllRoles(): Promise<{ success: boolean; roles?: any[]; error?: string }> {
    try {
      await this.initialize();
      
      // Get common system roles by name
      const systemRoleNames = [
        'system_admin',
        'system_user',
        'team_admin',
        'team_user',
        'channel_admin',
        'channel_user',
        'system_user_manager',
        'system_read_only_admin',
        'system_manager',
        'team_post_all',
        'team_post_all_public',
        'channel_guest',
        'team_guest',
        'system_guest',
      ];
      
      const roles = await this.client.getRolesByNames(systemRoleNames);
      
      return { success: true, roles };
    } catch (error) {
      console.error('Get roles failed:', error);
      
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      
      return { success: false, error: 'Failed to get roles' };
    }
  }

  async updateUserActive(userId: string, active: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      await this.initialize();
      
      await this.client.updateUserActive(userId, active);
      
      return { success: true };
    } catch (error) {
      console.error('Update user active status failed:', error);
      
      if (error instanceof Error) {
        // Handle specific error cases
        if (error.message.includes('not_found')) {
          return { success: false, error: 'User not found' };
        }
        
        if (error.message.includes('permission')) {
          return { success: false, error: 'Permission denied. You need admin privileges to manage users.' };
        }
        
        return { success: false, error: error.message };
      }
      
      return { success: false, error: `Failed to ${active ? 'activate' : 'deactivate'} user` };
    }
  }
}

export const mattermostService = new MattermostService();