import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';

import { Text, View } from '@/components/Themed';
import { useAuth } from '@/hooks/useAuth';

export default function UsersScreen() {
  const { serverUrl, isAuthenticated } = useAuth();

  const features = [
    { icon: 'eye', title: 'View all users', subtitle: 'Browse user directory' },
    { icon: 'shield', title: 'Roles & Permissions', subtitle: 'Manage user roles' },
    { icon: 'toggle-on', title: 'Activate/Deactivate', subtitle: 'User status control' },
    { icon: 'key', title: 'Reset Passwords', subtitle: 'Password management' }
  ];

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
            <FontAwesome name="users" size={32} color="#fff" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>User Management</Text>
            <Text style={styles.headerSubtitle}>Manage your Mattermost users</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Status Section */}
          <View style={styles.statusSection}>
            <LinearGradient
              colors={['#f8f9ff', '#ffffff']}
              style={styles.statusCard}
            >
              <FontAwesome name={"warning"} size={32} color="#166DE0" style={styles.statusIcon} />
              <Text style={styles.statusTitle}>Coming Soon</Text>
              <Text style={styles.statusText}>
                User management features are currently under development and will be available in a future update.
              </Text>
            </LinearGradient>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Planned Features</Text>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <FontAwesome name={feature.icon as any} size={20} color="#166DE0" style={styles.featureIcon} />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
                </View>
                <FontAwesome name="chevron-right" size={16} color="#bdc3c7" />
              </View>
            ))}
          </View>

          {/* Server Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Server Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Server URL</Text>
                <Text style={styles.infoValue}>{serverUrl || 'Not connected'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <View style={styles.statusIndicator}>
                  <View style={[styles.statusDot, { backgroundColor: isAuthenticated ? '#4CAF50' : '#ff4444' }]} />
                  <Text style={[styles.infoValue, { color: isAuthenticated ? '#4CAF50' : '#ff4444' }]}>
                    {isAuthenticated ? 'Connected' : 'Disconnected'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
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
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statusIcon: {
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 15,
    color: '#7f8c8d',
    lineHeight: 22,
    textAlign: 'center',
  },
  
  // Features Section
  featuresSection: {
    marginBottom: 32,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  
  // Info Section
  infoSection: {
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    flex: 2,
    textAlign: 'right',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
});
