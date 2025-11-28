import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore, useIsAuthenticated, useAuthLoading } from '@/stores/auth.store';
import { Colors } from '@/constants/theme';
import '../i18n';

/**
 * Auth Guard Hook
 *
 * Handles navigation based on authentication state.
 * Redirects unauthenticated users to auth screens,
 * and authenticated users away from auth screens.
 */
function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!isAuthenticated && !inAuthGroup && !inOnboardingGroup) {
      // Redirect to onboarding if not authenticated
      router.replace('/(onboarding)/welcome');
    } else if (isAuthenticated && (inAuthGroup || inOnboardingGroup)) {
      // Redirect to main app if authenticated
      router.replace('/(main)/(tabs)/home');
    }
  }, [isAuthenticated, isLoading, segments]);
}

/**
 * Loading Screen Component
 */
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

/**
 * Root Layout
 *
 * Main app layout with:
 * - Auth state initialization
 * - Auth guard for protected routes
 * - Route groups: (auth), (onboarding), (main)
 */
export default function RootLayout() {
  const { initialize } = useAuthStore();
  const isLoading = useAuthLoading();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      await initialize();
      setIsInitialized(true);
    };
    initApp();
  }, []);

  // Use auth guard
  useProtectedRoute();

  // Show loading screen while initializing
  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Onboarding flow for new users */}
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />

      {/* Authentication screens */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />

      {/* Main app screens (protected) */}
      <Stack.Screen name="(main)" options={{ headerShown: false }} />

      {/* Fallback index route */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
