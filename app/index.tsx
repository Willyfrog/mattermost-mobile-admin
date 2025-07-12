import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function AppIndex() {
  const { isAuthenticated, loading } = useAuth();
  
  console.log('🏠 AppIndex render - isAuthenticated:', isAuthenticated, 'loading:', loading);
  
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        console.log('🏠 AppIndex redirecting to /dashboard');
        router.replace('/dashboard');
      } else {
        console.log('🏠 AppIndex redirecting to /login');
        router.replace('/login');
      }
    }
  }, [isAuthenticated, loading]);

  // Return null while redirecting
  return null;
}