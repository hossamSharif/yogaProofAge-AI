import { Stack } from 'expo-router';

/**
 * Auth Layout
 *
 * Stack navigator for authentication screens.
 * Reference: mydeisgn/account_creation_login
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
