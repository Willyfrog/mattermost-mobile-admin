import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppData } from '@/contexts/AppDataContext';

export function AuthAppDataIntegration() {
  const { isAuthenticated } = useAuth();
  const { fetchAllData, clearAllData } = useAppData();

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch data when user becomes authenticated
      fetchAllData();
    } else {
      // Clear data when user is not authenticated
      clearAllData();
    }
  }, [isAuthenticated, fetchAllData, clearAllData]);

  return null; // This component doesn't render anything
}