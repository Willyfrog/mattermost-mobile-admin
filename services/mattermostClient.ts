import { Client4 } from '@mattermost/client';
import { normalizeServerUrl } from '@/utils/validation';

export class MattermostService {
  private client: Client4;
  
  constructor() {
    this.client = new Client4();
  }

  async pingServer(serverUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      const normalizedUrl = normalizeServerUrl(serverUrl);
      this.client.setUrl(normalizedUrl);
      
      // Use the ping endpoint to check if server is reachable
      await this.client.ping();
      
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

  getToken(): string | null {
    return this.client.getToken();
  }

  setToken(token: string): void {
    this.client.setToken(token);
  }

  getUrl(): string {
    return this.client.getUrl();
  }
}

export const mattermostService = new MattermostService();