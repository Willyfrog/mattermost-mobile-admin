import { StyleSheet, ScrollView, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';

import { Text, View, useThemeColor } from '@/components/Themed';
import { useAuth } from '@/hooks/useAuth';
import { useAppData } from '@/contexts/AppDataContext';
import TeamCard from '@/components/TeamCard';
import RoleCard from '@/components/RoleCard';
import { LoadingState } from '@/components/LoadingState';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user, serverUrl, isAuthenticated, logout, loading } = useAuth();
  const { teams, roles, loading: appLoading, error: appError, retryTeams, retryRoles } = useAppData();
  
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');
  const borderColor = useThemeColor({}, 'border');

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  // Show loading state during auth transitions
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <FontAwesome name="spinner" size={32} color={primaryColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If not authenticated, show minimal loading (user should be redirected soon)
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <FontAwesome name="spinner" size={32} color={primaryColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Redirecting...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <LinearGradient
          colors={[primaryColor, '#6366F1']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[styles.headerContent, { backgroundColor: 'transparent' }]}>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <FontAwesome name="sign-out" size={20} color="#fff" />
            </TouchableOpacity>
            <FontAwesome name="server" size={32} color="#fff" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Mattermost Admin</Text>
            <Text style={styles.headerSubtitle}>Dashboard</Text>
          </View>
        </LinearGradient>

        <View style={[styles.content, { backgroundColor }]}>
          {/* Status Section */}
          <View style={styles.statusSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Server Status</Text>
            <View style={[styles.statusCard, { backgroundColor: cardColor, borderColor }]}>
              <View style={styles.statusHeader}>
                <View style={styles.statusIndicator}>
                  <View style={[styles.statusDot, { backgroundColor: isAuthenticated ? successColor : errorColor }]} />
                  <Text style={[styles.statusText, { color: textColor }]}>
                    {isAuthenticated ? 'Connected' : 'Disconnected'}
                  </Text>
                </View>
                <FontAwesome 
                  name={isAuthenticated ? 'check-circle' : 'exclamation-circle'} 
                  size={20} 
                  color={isAuthenticated ? successColor : errorColor} 
                />
              </View>
              <View style={[styles.serverInfo, { borderTopColor: borderColor }]}>
                <Text style={[styles.serverLabel, { color: textMuted }]}>Server URL</Text>
                <Text style={[styles.serverValue, { color: textColor }]}>{serverUrl || 'Not connected'}</Text>
              </View>
            </View>
          </View>

          {/* Teams Section */}
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { backgroundColor: 'transparent' }]}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Teams</Text>
              {teams.length > 5 && (
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={[styles.viewAllText, { color: primaryColor }]}>View All</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {appLoading.teams ? (
              <LoadingState />
            ) : appError.teams ? (
              <View style={[styles.errorContainer, { backgroundColor: cardColor, borderColor }]}>
                <FontAwesome name="exclamation-triangle" size={20} color={errorColor} />
                <Text style={[styles.errorText, { color: textColor }]}>
                  {appError.teams}
                </Text>
                <TouchableOpacity 
                  style={[styles.retryButton, { backgroundColor: primaryColor }]}
                  onPress={retryTeams}
                >
                  <Text style={[styles.retryText, { color: '#fff' }]}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : teams.length === 0 ? (
              <View style={[styles.emptyContainer, { backgroundColor: cardColor, borderColor }]}>
                <FontAwesome name="users" size={24} color={textMuted} />
                <Text style={[styles.emptyText, { color: textSecondary }]}>
                  No teams found
                </Text>
              </View>
            ) : (
              <View style={styles.cardsContainer}>
                {teams.slice(0, 5).map((team) => (
                  <TeamCard key={team.id} team={team} />
                ))}
              </View>
            )}
          </View>

          {/* Roles Section */}
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { backgroundColor: 'transparent' }]}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Roles</Text>
              {roles.length > 5 && (
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={[styles.viewAllText, { color: primaryColor }]}>View All</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {appLoading.roles ? (
              <LoadingState />
            ) : appError.roles ? (
              <View style={[styles.errorContainer, { backgroundColor: cardColor, borderColor }]}>
                <FontAwesome name="exclamation-triangle" size={20} color={errorColor} />
                <Text style={[styles.errorText, { color: textColor }]}>
                  {appError.roles}
                </Text>
                <TouchableOpacity 
                  style={[styles.retryButton, { backgroundColor: primaryColor }]}
                  onPress={retryRoles}
                >
                  <Text style={[styles.retryText, { color: '#fff' }]}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : roles.length === 0 ? (
              <View style={[styles.emptyContainer, { backgroundColor: cardColor, borderColor }]}>
                <FontAwesome name="shield" size={24} color={textMuted} />
                <Text style={[styles.emptyText, { color: textSecondary }]}>
                  No roles found
                </Text>
              </View>
            ) : (
              <View style={styles.cardsContainer}>
                {roles.slice(0, 5).map((role) => (
                  <RoleCard key={role.id} role={role} />
                ))}
              </View>
            )}
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
  scrollView: {
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
    position: 'relative',
  },
  logoutButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
    zIndex: 1,
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
    padding: 20,
    paddingTop: 0,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  
  // Section Styles
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 8,
  },
  
  // Status Section
  statusSection: {
    marginBottom: 32,
  },
  statusCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  serverInfo: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  serverLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  serverValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Section Styles
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardsContainer: {
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
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
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
    textAlign: 'center',
  },
  
  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});
