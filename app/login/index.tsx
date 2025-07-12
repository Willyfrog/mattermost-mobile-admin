import { useEffect } from 'react';
import { router } from 'expo-router';

export default function LoginIndex() {
  console.log('📱 LoginIndex component mounted');
  
  useEffect(() => {
    console.log('📱 LoginIndex useEffect - redirecting to /login/server');
    // Redirect to the server setup screen
    router.replace('/login/server');
  }, []);

  console.log('📱 LoginIndex render');
  return null;
}