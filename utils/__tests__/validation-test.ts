import { validateSystemAdmin } from '../validation';

describe('validateSystemAdmin', () => {
  it('should return valid for users with system_admin role', () => {
    const user = { id: 'user123', username: 'admin', roles: 'system_admin system_user' };
    const result = validateSystemAdmin(user);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should return invalid for users without system_admin role', () => {
    const user = { id: 'user123', username: 'user', roles: 'system_user' };
    const result = validateSystemAdmin(user);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Access denied. This app is only available to system administrators.');
  });

  it('should return invalid for users with no roles', () => {
    const user = { id: 'user123', username: 'user', roles: '' };
    const result = validateSystemAdmin(user);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Access denied. This app is only available to system administrators.');
  });

  it('should return invalid for users with undefined roles', () => {
    const user = { id: 'user123', username: 'user' };
    const result = validateSystemAdmin(user);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Access denied. This app is only available to system administrators.');
  });

  it('should return invalid for null user', () => {
    const result = validateSystemAdmin(null);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('User data is required');
  });

  it('should return invalid for undefined user', () => {
    const result = validateSystemAdmin(undefined);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('User data is required');
  });

  it('should return invalid for non-string roles', () => {
    const user = { id: 'user123', username: 'user', roles: 123 };
    const result = validateSystemAdmin(user);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Access denied. This app is only available to system administrators.');
  });

  it('should handle system_admin role in different positions', () => {
    const user1 = { id: 'user123', username: 'admin', roles: 'system_user system_admin' };
    const user2 = { id: 'user123', username: 'admin', roles: 'system_admin' };
    const user3 = { id: 'user123', username: 'admin', roles: 'team_admin system_admin channel_admin' };

    expect(validateSystemAdmin(user1).isValid).toBe(true);
    expect(validateSystemAdmin(user2).isValid).toBe(true);
    expect(validateSystemAdmin(user3).isValid).toBe(true);
  });

  it('should not match partial role names', () => {
    const user = { id: 'user123', username: 'user', roles: 'system_administrator' };
    const result = validateSystemAdmin(user);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Access denied. This app is only available to system administrators.');
  });
});