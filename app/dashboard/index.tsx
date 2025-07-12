import { StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';

import { Text, View } from '@/components/Themed';
import { useAuth } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user, serverUrl, isAuthenticated } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <LinearGradient
          colors={['#166DE0', '#28427B']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <FontAwesome name="server" size={32} color="#fff" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Mattermost Admin</Text>
            <Text style={styles.headerSubtitle}>Dashboard</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Status Section */}
          <View style={styles.statusSection}>
            <Text style={styles.sectionTitle}>Server Status</Text>
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <View style={styles.statusIndicator}>
                  <View style={[styles.statusDot, { backgroundColor: isAuthenticated ? '#4CAF50' : '#ff4444' }]} />
                  <Text style={styles.statusText}>
                    {isAuthenticated ? 'Connected' : 'Disconnected'}
                  </Text>
                </View>
                <FontAwesome 
                  name={isAuthenticated ? 'check-circle' : 'exclamation-circle'} 
                  size={20} 
                  color={isAuthenticated ? '#4CAF50' : '#ff4444'} 
                />
              </View>
              <View style={styles.serverInfo}>
                <Text style={styles.serverLabel}>Server URL</Text>
                <Text style={styles.serverValue}>{serverUrl || 'Not connected'}</Text>
              </View>
            </View>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <LinearGradient
              colors={['#f8f9ff', '#ffffff']}
              style={styles.welcomeCard}
            >
              <FontAwesome name="info-circle" size={24} color="#166DE0" style={styles.welcomeIcon} />
              <Text style={styles.welcomeTitle}>Welcome to Mattermost Admin</Text>
              <Text style={styles.welcomeText}>
                Manage your Mattermost server from anywhere. Use the quick actions above or navigate through the tabs to access different features.
              </Text>
            </LinearGradient>
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
    backgroundColor: '#555',
  },
  
  // Section Styles
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
    marginTop: 8,
  },
  
  // Status Section
  statusSection: {
    marginBottom: 32,
  },
  statusCard: {
    backgroundColor: '#555',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
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
    color: '#2c3e50',
  },
  serverInfo: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  serverLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  serverValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  
  // Actions Section
  actionsSection: {
    marginBottom: 32,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: (width - 52) / 2,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  
  // Welcome Section
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  welcomeIcon: {
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 15,
    color: '#7f8c8d',
    lineHeight: 22,
    textAlign: 'center',
  },
});
