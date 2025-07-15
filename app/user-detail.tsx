import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Text, useThemeColor } from '@/components/Themed';
import { useAuth } from '@/hooks/useAuth';
import { mattermostService } from '@/services/mattermostClient';
import { LoadingState } from '@/components/LoadingState';
import { MattermostUser } from '@/components/UserCard';

export default function UserDetailScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const [user, setUser] = useState<MattermostUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const textMutedColor = useThemeColor({}, 'textMuted');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');

  useEffect(() => {
    if (userId && isAuthenticated) {
      fetchUserDetails();
    }
  }, [userId, isAuthenticated]);

  const fetchUserDetails = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await mattermostService.getUser(userId);
      
      if (result.success && result.user) {
        setUser(result.user);
      } else {
        setError(result.error || 'Failed to load user details');
      }
    } catch (err) {
      setError('An error occurred while loading user details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleActionPress = (action: string) => {
    if (action === 'Activate User' || action === 'Deactivate User') {
      handleUserActiveToggle(action === 'Activate User');
    } else {
      Alert.alert(
        'Action Not Implemented',
        `${action} functionality will be implemented in a future update.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleUserActiveToggle = (activate: boolean) => {
    if (!user) return;

    const actionText = activate ? 'activate' : 'deactivate';
    const warningText = activate 
      ? 'This will allow the user to login and access the system again.'
      : 'This will prevent the user from logging in and accessing the system.';

    Alert.alert(
      `${activate ? 'Activate' : 'Deactivate'} User`,
      `Are you sure you want to ${actionText} ${user.username}?\n\n${warningText}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: activate ? 'Activate' : 'Deactivate', 
          style: activate ? 'default' : 'destructive',
          onPress: () => performUserActiveToggle(activate)
        }
      ]
    );
  };

  const performUserActiveToggle = async (activate: boolean) => {
    if (!user) return;

    const actionText = activate ? 'activate' : 'deactivate';
    setActionLoading(actionText);

    try {
      const result = await mattermostService.updateUserActive(user.id, activate);
      
      if (result.success) {
        Alert.alert(
          'Success',
          `User ${activate ? 'activated' : 'deactivated'} successfully.`,
          [{ text: 'OK' }]
        );
        
        // Refresh user data to reflect changes
        await fetchUserDetails();
      } else {
        Alert.alert(
          'Error',
          result.error || `Failed to ${actionText} user`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        `An error occurred while trying to ${actionText} the user.`,
        [{ text: 'OK' }]
      );
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-triangle" size={32} color={errorColor} />
          <Text style={[styles.errorText, { color: errorColor }]}>
            Please login to access user details
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <LoadingState message="Loading user details..." />
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-triangle" size={32} color={errorColor} />
          <Text style={[styles.errorText, { color: errorColor }]}>
            {error || 'User not found'}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { borderColor }]} 
            onPress={fetchUserDetails}
          >
            <Text style={[styles.retryButtonText, { color: textColor }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Check if user is active
  const isActive = !user.delete_at || user.delete_at === 0;
  
  // Create full name from first and last name
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
  
  // Display name priority: nickname > full name > username
  const displayName = user.nickname || fullName || user.username;
  
  // Parse roles
  const parseRoles = (roles: string = '') => {
    if (!roles) return 'User';
    
    const roleList = roles.split(' ').filter(Boolean);
    const displayRoles = roleList.map(role => {
      if (role.startsWith('system_')) {
        return role.replace('system_', '').replace('_', ' ').toLowerCase();
      }
      return role.toLowerCase();
    });
    
    return displayRoles.map(role => 
      role.charAt(0).toUpperCase() + role.slice(1)
    ).join(', ');
  };

  // Format last activity
  const formatLastActivity = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <LinearGradient
        colors={['#166DE0', '#28427B']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <FontAwesome name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{displayName}</Text>
            <View style={styles.headerStatus}>
              <FontAwesome 
                name={isActive ? 'check-circle' : 'times-circle'} 
                size={14} 
                color={isActive ? '#34D399' : '#F87171'} 
              />
              <Text style={styles.headerStatusText}>
                {isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: isActive ? successColor : errorColor }]}>
              <Text style={styles.avatarText}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.displayName, { color: textColor }]}>{displayName}</Text>
              <Text style={[styles.email, { color: textSecondaryColor }]}>{user.email}</Text>
              <Text style={[styles.roles, { color: textMutedColor }]}>
                {parseRoles(user.roles)}
              </Text>
            </View>
          </View>
        </View>

        {/* Basic Information */}
        <View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Basic Information</Text>
          
          <View style={styles.infoRow}>
            <FontAwesome name="user" size={16} color={textMutedColor} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: textSecondaryColor }]}>Username</Text>
              <Text style={[styles.infoValue, { color: textColor }]}>@{user.username}</Text>
            </View>
          </View>

          {user.position && (
            <View style={styles.infoRow}>
              <FontAwesome name="briefcase" size={16} color={textMutedColor} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: textSecondaryColor }]}>Position</Text>
                <Text style={[styles.infoValue, { color: textColor }]}>
                  {user.position}
                </Text>
              </View>
            </View>
          )}

          {fullName && fullName !== displayName && (
            <View style={styles.infoRow}>
              <FontAwesome name="id-card" size={16} color={textMutedColor} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: textSecondaryColor }]}>Full Name</Text>
                <Text style={[styles.infoValue, { color: textColor }]}>
                  {fullName}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <FontAwesome name="clock-o" size={16} color={textMutedColor} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: textSecondaryColor }]}>Last Activity</Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {formatLastActivity(user.last_activity_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Quick Actions</Text>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.dangerButton]}
              onPress={() => handleActionPress('Reset Password')}
            >
              <FontAwesome name="lock" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Reset Password</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.warningButton]}
              onPress={() => handleActionPress('Reset MFA')}
            >
              <FontAwesome name="shield" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Reset MFA</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => handleActionPress('Change Roles')}
            >
              <FontAwesome name="users" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Change Roles</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.actionButton, 
                isActive ? styles.dangerButton : styles.successButton,
                (actionLoading === 'activate' || actionLoading === 'deactivate') && styles.disabledButton
              ]}
              onPress={() => handleActionPress(isActive ? 'Deactivate User' : 'Activate User')}
              disabled={actionLoading === 'activate' || actionLoading === 'deactivate'}
            >
              {(actionLoading === 'activate' || actionLoading === 'deactivate') ? (
                <FontAwesome 
                  name="spinner" 
                  size={20} 
                  color="#fff" 
                />
              ) : (
                <FontAwesome 
                  name={isActive ? 'user-times' : 'user-plus'} 
                  size={20} 
                  color="#fff" 
                />
              )}
              <Text style={styles.actionButtonText}>
                {(actionLoading === 'activate' || actionLoading === 'deactivate') 
                  ? `${actionLoading === 'activate' ? 'Activating' : 'Deactivating'}...`
                  : isActive ? 'Deactivate User' : 'Activate User'
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerStatusText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 6,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 4,
  },
  roles: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  successButton: {
    backgroundColor: '#10B981',
  },
  warningButton: {
    backgroundColor: '#F59E0B',
  },
  dangerButton: {
    backgroundColor: '#EF4444',
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});