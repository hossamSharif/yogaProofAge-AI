import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useIsAuthenticated, useAuthLoading } from '@/stores/auth.store';
import { useOnboardingCompleted, useProfileStore } from '@/stores/profile.store';

/**
 * Main App Layout
 *
 * Protected route group requiring authentication.
 * Implements T067: Onboarding guard - redirects new users to onboarding.
 */
export default function MainLayout() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const isAuthLoading = useAuthLoading();
  const onboardingCompleted = useOnboardingCompleted();
  const { profile } = useProfileStore();

  useEffect(() => {
    if (isAuthLoading) return;

    // Redirect to auth if not authenticated
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
      return;
    }

    // Redirect to onboarding if not completed (T067)
    if (profile && !profile.onboarding_completed) {
      router.replace('/(onboarding)/welcome');
    }
  }, [isAuthenticated, isAuthLoading, profile]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="diary" options={{ headerShown: false }} />
      <Stack.Screen name="products" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="subscription" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
