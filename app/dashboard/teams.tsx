import React, { useState, useMemo } from 'react';
import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';

import { Text, View, useThemeColor } from '@/components/Themed';
import { useAuth } from '@/hooks/useAuth';
import { useAppData } from '@/contexts/AppDataContext';
import TeamCard from '@/components/TeamCard';
import { LoadingState } from '@/components/LoadingState';

export default function TeamsScreen() {
  const { isAuthenticated } = useAuth();
  const { teams, loading, error, retryTeams } = useAppData();
  const [refreshing, setRefreshing] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const primaryColor = useThemeColor({}, 'primary');
  const errorColor = useThemeColor({}, 'error');
  const borderColor = useThemeColor({}, 'border');

  // Sort teams alphabetically by display_name
  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => 
      a.display_name.toLowerCase().localeCompare(b.display_name.toLowerCase())
    );
  }, [teams]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await retryTeams();
    } finally {
      setRefreshing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-triangle" size={32} color={errorColor} />
          <Text style={[styles.errorText, { color: errorColor }]}>
            Please login to access team management
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header Section */}
      <LinearGradient
        colors={[primaryColor, '#6366F1']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.headerContent, { backgroundColor: 'transparent' }]}>
          <FontAwesome name="group" size={32} color="#fff" style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Team Management</Text>
          <Text style={styles.headerSubtitle}>View and manage Mattermost teams</Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={[styles.content, { backgroundColor }]}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={primaryColor}
              colors={[primaryColor]}
            />
          }
        >
          {/* Teams Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              All Teams ({sortedTeams.length})
            </Text>
            
            {loading.teams ? (
              <LoadingState />
            ) : error.teams ? (
              <View style={[styles.errorContainer, { backgroundColor: cardColor, borderColor }]}>
                <FontAwesome name="exclamation-triangle" size={20} color={errorColor} />
                <Text style={[styles.errorText, { color: textColor }]}>
                  {error.teams}
                </Text>
                <Text style={[styles.retryButton, { color: primaryColor }]} onPress={retryTeams}>
                  Tap to retry
                </Text>
              </View>
            ) : sortedTeams.length === 0 ? (
              <View style={[styles.emptyContainer, { backgroundColor: cardColor, borderColor }]}>
                <FontAwesome name="group" size={24} color={textMuted} />
                <Text style={[styles.emptyText, { color: textSecondary }]}>
                  No teams found
                </Text>
                <Text style={[styles.emptySubText, { color: textMuted }]}>
                  Teams will appear here when available
                </Text>
              </View>
            ) : (
              <View style={styles.teamsContainer}>
                {sortedTeams.map((team) => (
                  <TeamCard key={team.id} team={team} />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header Styles
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

  // Content Styles
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollView: {
    flex: 1,
  },

  // Section Styles
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  teamsContainer: {
    gap: 0,
  },

  // Error and Empty States
  errorContainer: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  emptyContainer: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
  },
});