import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';

import { Text } from '@/components/Themed';
import { useAuth } from '@/hooks/useAuth';
import { mattermostService } from '@/services/mattermostClient';
import { SearchInput } from '@/components/SearchInput';
import { FilterSwitch } from '@/components/FilterSwitch';
import { UserList } from '@/components/UserList';
import { MattermostUser } from '@/components/UserCard';

export default function UsersScreen() {
  const { serverUrl, isAuthenticated } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [users, setUsers] = useState<MattermostUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = useCallback(async (term: string = '', refresh: boolean = false) => {
    if (!isAuthenticated) return;
    
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);

    try {
      const result = await mattermostService.searchUsers(term, {
        allow_inactive: includeDeleted,
        limit: 20,
        page: 0,
      });

      if (result.success && result.users) {
        setUsers(result.users);
      } else {
        setError(result.error || 'Failed to search users');
        setUsers([]);
      }
    } catch (err) {
      setError('An error occurred while searching users');
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, includeDeleted]);

  const loadInitialUsers = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await mattermostService.getAllUsers(0, 20);

      if (result.success && result.users) {
        setUsers(result.users);
      } else {
        setError(result.error || 'Failed to load users');
        setUsers([]);
      }
    } catch (err) {
      setError('An error occurred while loading users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load initial users when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      loadInitialUsers();
    }
  }, [isAuthenticated, loadInitialUsers]);

  // Search users when search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      searchUsers(searchTerm);
    } else {
      loadInitialUsers();
    }
  }, [searchTerm, includeDeleted, searchUsers, loadInitialUsers]);

  const handleRefresh = () => {
    if (searchTerm.trim()) {
      searchUsers(searchTerm, true);
    } else {
      setRefreshing(true);
      loadInitialUsers().finally(() => setRefreshing(false));
    }
  };

  const handleUserPress = (user: MattermostUser) => {
    Alert.alert(
      user.username,
      `Email: ${user.email}\nStatus: ${user.delete_at ? 'Inactive' : 'Active'}`,
      [{ text: 'OK' }]
    );
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-triangle" size={32} color="#ff4444" />
          <Text style={styles.errorText}>
            Please login to access user management
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <LinearGradient
        colors={['#166DE0', '#28427B']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <FontAwesome name="users" size={32} color="#fff" style={styles.headerIcon} />
          <Text style={styles.headerTitle}>User Management</Text>
          <Text style={styles.headerSubtitle}>Search and manage Mattermost users</Text>
        </View>
      </LinearGradient>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <SearchInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          onClear={handleClearSearch}
          placeholder="Search users..."
        />
        
        <FilterSwitch
          label="Include deleted users"
          value={includeDeleted}
          onValueChange={setIncludeDeleted}
        />
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorBanner}>
          <FontAwesome name="exclamation-circle" size={16} color="#ff4444" />
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {/* Users List */}
      <UserList
        users={users}
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onUserPress={handleUserPress}
        searchTerm={searchTerm}
        emptyMessage={searchTerm ? "No users found" : "No users available"}
        emptySubMessage={searchTerm ? `Try adjusting your search for "${searchTerm}"` : "Check your server connection"}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 12,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  errorBannerText: {
    fontSize: 14,
    color: '#ff4444',
    marginLeft: 8,
    flex: 1,
  },
});
