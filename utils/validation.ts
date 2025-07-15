export const validateServerUrl = (url: string): { isValid: boolean; error?: string } => {
  if (!url.trim()) {
    return { isValid: false, error: 'Server URL is required' };
  }

  // Add protocol if missing
  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  try {
    const urlObj = new URL(normalizedUrl);
    
    // Basic validation
    if (!urlObj.hostname) {
      return { isValid: false, error: 'Invalid server URL format' };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid server URL format' };
  }
};

export const normalizeServerUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

export const validateCredentials = (username: string, password: string): { isValid: boolean; error?: string } => {
  if (!username.trim()) {
    return { isValid: false, error: 'Username is required' };
  }

  if (!password.trim()) {
    return { isValid: false, error: 'Password is required' };
  }

  return { isValid: true };
};

export const validateSystemAdmin = (user: any): { isValid: boolean; error?: string } => {
  if (!user) {
    return { isValid: false, error: 'User data is required' };
  }

  if (!user.roles || typeof user.roles !== 'string') {
    return { isValid: false, error: 'Access denied. This app is only available to system administrators.' };
  }

  // Check if user has system_admin role (roles are space-delimited)
  const userRoles = user.roles.split(' ');
  const hasSystemAdminRole = userRoles.includes('system_admin');

  if (!hasSystemAdminRole) {
    return { isValid: false, error: 'Access denied. This app is only available to system administrators.' };
  }

  return { isValid: true };
};