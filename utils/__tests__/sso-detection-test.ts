import { TestDataFactory, PasswordResetTestHelper } from '@/__tests__/utils/test-helpers';

/**
 * SSO Detection Utility Functions
 * These functions are used throughout the app to determine authentication types
 */

/**
 * Determines if a user uses SSO authentication
 * @param user - User object with auth_service field
 * @returns true if user uses SSO, false if email authentication
 */
export const isSSO = (user: { auth_service?: string }): boolean => {
  return !!(user.auth_service && user.auth_service.trim() !== '');
};

/**
 * Determines if a user can reset their password
 * @param user - User object with auth_service field
 * @returns true if user can reset password (email auth), false if SSO
 */
export const canResetPassword = (user: { auth_service?: string }): boolean => {
  return !isSSO(user);
};

/**
 * Gets the authentication type display name
 * @param user - User object with auth_service field
 * @returns human-readable authentication type
 */
export const getAuthType = (user: { auth_service?: string }): string => {
  if (!user.auth_service || user.auth_service.trim() === '') {
    return 'Email';
  }
  
  const authType = user.auth_service.toLowerCase();
  switch (authType) {
    case 'saml':
      return 'SAML SSO';
    case 'ldap':
      return 'LDAP';
    case 'google':
      return 'Google OAuth';
    case 'github':
      return 'GitHub OAuth';
    case 'microsoft':
      return 'Microsoft OAuth';
    case 'gitlab':
      return 'GitLab OAuth';  
    default:
      return `${user.auth_service} SSO`;
  }
};

describe('SSO Detection Logic', () => {
  describe('isSSO function', () => {
    it('should return false for null auth_service', () => {
      const user = TestDataFactory.createUser({ auth_service: null });
      expect(isSSO(user)).toBe(false);
    });

    it('should return false for undefined auth_service', () => {
      const user = TestDataFactory.createUser({ auth_service: undefined });
      expect(isSSO(user)).toBe(false);
    });

    it('should return false for empty string auth_service', () => {
      const user = TestDataFactory.createUser({ auth_service: '' });
      expect(isSSO(user)).toBe(false);
    });

    it('should return false for whitespace-only auth_service', () => {
      const user = TestDataFactory.createUser({ auth_service: '   ' });
      expect(isSSO(user)).toBe(false);
    });

    it('should return true for SAML auth_service', () => {
      const user = TestDataFactory.createSSOUser('saml');
      expect(isSSO(user)).toBe(true);
    });

    it('should return true for LDAP auth_service', () => {
      const user = TestDataFactory.createSSOUser('ldap');
      expect(isSSO(user)).toBe(true);
    });

    it('should return true for OAuth providers', () => {
      const googleUser = TestDataFactory.createSSOUser('google');
      const githubUser = TestDataFactory.createSSOUser('github');
      const microsoftUser = TestDataFactory.createSSOUser('microsoft');
      
      expect(isSSO(googleUser)).toBe(true);
      expect(isSSO(githubUser)).toBe(true);
      expect(isSSO(microsoftUser)).toBe(true);
    });

    it('should return true for custom SSO providers', () => {
      const customUser = TestDataFactory.createSSOUser('custom-sso');
      expect(isSSO(customUser)).toBe(true);
    });
  });

  describe('canResetPassword function', () => {
    it('should return true for email authentication users', () => {
      const scenarios = PasswordResetTestHelper.getPasswordResetScenarios();
      
      expect(canResetPassword(scenarios.emailAuthUser.user)).toBe(true);
      expect(canResetPassword(scenarios.emptyAuthServiceUser.user)).toBe(true);
      expect(canResetPassword(scenarios.whitespaceAuthServiceUser.user)).toBe(true);
      expect(canResetPassword(scenarios.undefinedAuthServiceUser.user)).toBe(true);
    });

    it('should return false for SSO users', () => {
      const scenarios = PasswordResetTestHelper.getPasswordResetScenarios();
      
      expect(canResetPassword(scenarios.ssoSamlUser.user)).toBe(false);
      expect(canResetPassword(scenarios.ssoLdapUser.user)).toBe(false);
      expect(canResetPassword(scenarios.ssoGoogleUser.user)).toBe(false);
    });

    it('should match expected results from test scenarios', () => {
      const scenarios = PasswordResetTestHelper.getPasswordResetScenarios();
      
      Object.entries(scenarios).forEach(([key, scenario]) => {
        expect(canResetPassword(scenario.user)).toBe(scenario.canResetPassword);
      });
    });
  });

  describe('getAuthType function', () => {
    it('should return "Email" for email authentication users', () => {
      const emailUser = TestDataFactory.createEmailAuthUser();
      const emptyAuthUser = TestDataFactory.createUser({ auth_service: '' });
      const undefinedAuthUser = TestDataFactory.createUser({ auth_service: undefined });
      const whitespaceAuthUser = TestDataFactory.createUser({ auth_service: '   ' });
      
      expect(getAuthType(emailUser)).toBe('Email');
      expect(getAuthType(emptyAuthUser)).toBe('Email');
      expect(getAuthType(undefinedAuthUser)).toBe('Email');
      expect(getAuthType(whitespaceAuthUser)).toBe('Email');
    });

    it('should return correct display names for common SSO providers', () => {
      expect(getAuthType({ auth_service: 'saml' })).toBe('SAML SSO');
      expect(getAuthType({ auth_service: 'ldap' })).toBe('LDAP');
      expect(getAuthType({ auth_service: 'google' })).toBe('Google OAuth');
      expect(getAuthType({ auth_service: 'github' })).toBe('GitHub OAuth');
      expect(getAuthType({ auth_service: 'microsoft' })).toBe('Microsoft OAuth');
      expect(getAuthType({ auth_service: 'gitlab' })).toBe('GitLab OAuth');
    });

    it('should handle case-insensitive auth service names', () => {
      expect(getAuthType({ auth_service: 'SAML' })).toBe('SAML SSO');
      expect(getAuthType({ auth_service: 'Google' })).toBe('Google OAuth');
      expect(getAuthType({ auth_service: 'LDAP' })).toBe('LDAP');
    });

    it('should return generic SSO display name for unknown providers', () => {
      expect(getAuthType({ auth_service: 'custom-provider' })).toBe('custom-provider SSO');
      expect(getAuthType({ auth_service: 'okta' })).toBe('okta SSO');
      expect(getAuthType({ auth_service: 'azure' })).toBe('azure SSO');
    });
  });

  describe('Integration with PasswordResetTestHelper', () => {
    it('should correctly identify which users can reset passwords', () => {
      const scenarios = PasswordResetTestHelper.getPasswordResetScenarios();
      
      // Test each scenario using the helper function
      Object.entries(scenarios).forEach(([key, scenario]) => {
        const helperResult = PasswordResetTestHelper.canUserResetPassword(scenario.user);
        const utilityResult = canResetPassword(scenario.user);
        
        expect(helperResult).toBe(utilityResult);
        expect(helperResult).toBe(scenario.canResetPassword);
      });
    });

    it('should provide consistent results across different user types', () => {
      const testUsers = [
        TestDataFactory.createEmailAuthUser(),
        TestDataFactory.createSSOUser('saml'),
        TestDataFactory.createSSOUser('ldap'),
        TestDataFactory.createSSOUser('google'),
        TestDataFactory.createUser({ auth_service: '' }),
        TestDataFactory.createUser({ auth_service: '   ' }),
        TestDataFactory.createUser({ auth_service: undefined }),
      ];

      testUsers.forEach(user => {
        const isUserSSO = isSSO(user);
        const canUserResetPwd = canResetPassword(user);
        const helperResult = PasswordResetTestHelper.canUserResetPassword(user);
        
        // SSO users cannot reset passwords, email users can
        expect(canUserResetPwd).toBe(!isUserSSO);
        expect(helperResult).toBe(!isUserSSO);
        expect(canUserResetPwd).toBe(helperResult);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing user object gracefully', () => {
      expect(() => isSSO({} as any)).not.toThrow();
      expect(() => canResetPassword({} as any)).not.toThrow();
      expect(() => getAuthType({} as any)).not.toThrow();
      
      expect(isSSO({} as any)).toBe(false);
      expect(canResetPassword({} as any)).toBe(true);
      expect(getAuthType({} as any)).toBe('Email');
    });

    it('should handle special characters in auth_service', () => {
      const specialCharsUser = { auth_service: 'custom-provider-2023!' };
      
      expect(isSSO(specialCharsUser)).toBe(true);
      expect(canResetPassword(specialCharsUser)).toBe(false);
      expect(getAuthType(specialCharsUser)).toBe('custom-provider-2023! SSO');
    });

    it('should handle very long auth_service strings', () => {
      const longAuthService = 'a'.repeat(100);
      const longAuthUser = { auth_service: longAuthService };
      
      expect(isSSO(longAuthUser)).toBe(true);
      expect(canResetPassword(longAuthUser)).toBe(false);
      expect(getAuthType(longAuthUser)).toBe(`${longAuthService} SSO`);
    });
  });
});