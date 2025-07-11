import { Stack } from 'expo-router';

export default function LoginLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="server" />
      <Stack.Screen name="credentials" />
      <Stack.Screen name="success" />
    </Stack>
  );
}