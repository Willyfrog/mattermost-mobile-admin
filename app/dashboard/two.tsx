import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, View } from '@/components/Themed';
import { useAuth } from '@/hooks/useAuth';

export default function UsersScreen() {
  const { serverUrl } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>User Management</Text>
        
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderTitle}>Coming Soon</Text>
          <Text style={styles.placeholderText}>
            User management features will be available here, including:
          </Text>
          
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• View all users</Text>
            <Text style={styles.featureItem}>• User roles and permissions</Text>
            <Text style={styles.featureItem}>• Activate/deactivate users</Text>
            <Text style={styles.featureItem}>• Reset passwords</Text>
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Server:</Text>
          <Text style={styles.value}>{serverUrl || 'Not connected'}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  placeholderContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  featureList: {
    marginTop: 10,
  },
  featureItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    paddingLeft: 10,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
});
