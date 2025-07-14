import React from 'react';
import { StyleSheet, FlatList, View, RefreshControl } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { Text, useThemeColor } from './Themed';
import { UserCard, MattermostUser } from './UserCard';
import { LoadingState } from './LoadingState';

interface UserListProps {
  users: MattermostUser[];
  loading: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onUserPress?: (user: MattermostUser) => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  emptyMessage?: string;
  emptySubMessage?: string;
  searchTerm?: string;
}

export function UserList({
  users,
  loading,
  refreshing = false,
  onRefresh,
  onUserPress,
  onEndReached,
  onEndReachedThreshold = 0.1,
  emptyMessage = 'No users found',
  emptySubMessage = 'Try adjusting your search criteria',
  searchTerm = '',
}: UserListProps) {
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');

  const renderUser = ({ item }: { item: MattermostUser }) => (
    <UserCard user={item} onPress={onUserPress} />
  );

  const renderEmpty = () => {
    if (loading) {
      return <LoadingState message="Loading users..." />;
    }

    return (
      <View style={styles.emptyContainer}>
        <FontAwesome 
          name="users" 
          size={48} 
          color={textSecondaryColor} 
          style={styles.emptyIcon}
        />
        <Text style={[styles.emptyTitle, { color: textColor }]}>
          {emptyMessage}
        </Text>
        <Text style={[styles.emptySubtitle, { color: textSecondaryColor }]}>
          {searchTerm ? `No results for "${searchTerm}"` : emptySubMessage}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading || users.length === 0) return null;
    
    return (
      <View style={styles.footer}>
        <LoadingState message="Loading more users..." size="small" />
      </View>
    );
  };

  return (
    <FlatList
      data={users}
      renderItem={renderUser}
      keyExtractor={(item) => item.id}
      style={styles.list}
      contentContainerStyle={users.length === 0 ? styles.emptyListContainer : styles.listContainer}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={primaryColor}
            colors={[primaryColor]}
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingVertical: 20,
  },
});