import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { Text, useThemeColor } from './Themed';

export interface MattermostUser {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  nickname?: string;
  roles?: string;
  delete_at?: number;
  position?: string;
  last_activity_at?: number;
  mfa_active?: boolean;
}

interface UserCardProps {
  user: MattermostUser;
  onPress?: (user: MattermostUser) => void;
}

export function UserCard({ user, onPress }: UserCardProps) {
  const backgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const textMutedColor = useThemeColor({}, 'textMuted');
  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');
  const borderColor = useThemeColor({}, 'border');

  // Check if user is active (delete_at is 0 or null/undefined)
  const isActive = !user.delete_at || user.delete_at === 0;
  
  // Create full name from first and last name
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
  
  // Display name priority: nickname > full name > username
  const displayName = user.nickname || fullName || user.username;
  
  // Parse roles - remove 'system_' prefix and capitalize
  const parseRoles = (roles: string = '') => {
    if (!roles) return 'User';
    
    const roleList = roles.split(' ').filter(Boolean);
    const displayRoles = roleList.map(role => {
      if (role.startsWith('system_')) {
        return role.replace('system_', '').replace('_', ' ').toLowerCase();
      }
      return role.toLowerCase();
    });
    
    // Capitalize first letter of each role
    return displayRoles.map(role => 
      role.charAt(0).toUpperCase() + role.slice(1)
    ).join(', ');
  };

  const renderContent = () => (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      {/* Avatar placeholder */}
      <View style={[styles.avatar, { backgroundColor: isActive ? successColor : errorColor }]}>
        <Text style={styles.avatarText}>
          {displayName.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* User info */}
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={[styles.displayName, { color: textColor }]} numberOfLines={1}>
            {displayName}
          </Text>
          <View style={styles.statusContainer}>
            <FontAwesome 
              name={isActive ? 'check-circle' : 'times-circle'} 
              size={12} 
              color={isActive ? successColor : errorColor} 
            />
          </View>
        </View>

        {/* Show full name if different from display name */}
        {fullName && fullName !== displayName && (
          <Text style={[styles.fullName, { color: textSecondaryColor }]} numberOfLines={1}>
            {fullName}
          </Text>
        )}

        {/* Email */}
        <Text style={[styles.email, { color: textSecondaryColor }]} numberOfLines={1}>
          {user.email}
        </Text>

        {/* Roles */}
        <Text style={[styles.roles, { color: textMutedColor }]} numberOfLines={1}>
          {parseRoles(user.roles)}
        </Text>
      </View>

      {/* Chevron icon */}
      <FontAwesome 
        name="chevron-right" 
        size={12} 
        color={textMutedColor} 
        style={styles.chevron}
      />
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity 
        onPress={() => onPress(user)} 
        style={styles.touchable}
        activeOpacity={0.7}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return renderContent();
}

const styles = StyleSheet.create({
  touchable: {
    marginBottom: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusContainer: {
    marginLeft: 8,
  },
  fullName: {
    fontSize: 14,
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    marginBottom: 2,
  },
  roles: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  chevron: {
    marginLeft: 8,
  },
});