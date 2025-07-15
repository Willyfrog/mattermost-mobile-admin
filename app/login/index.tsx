import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAppData } from '@/contexts/AppDataContext';

export default function LoginIndex() {
  const { clearAllData } = useAppData();
  
  console.log('📱 LoginIndex component mounted');
  
  useEffect(() => {
    console.log('📱 LoginIndex useEffect - clearing app data and redirecting to /login/server');
    
    // Clear app data when entering login flow to prevent conflicts
    clearAllData();
    
    // Redirect to the server setup screen
    router.replace('/login/server');
  }, [clearAllData]);

  console.log('📱 LoginIndex render');
  return null;
}