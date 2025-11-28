import { Stack } from 'expo-router';

/**
 * Onboarding Layout
 *
 * Stack navigator for first-time user experience screens.
 * Flow: welcome (4 slides) → tutorial (3 steps) → goals → main app
 *
 * Reference: mydeisgn/welcome_screen_1-4 and tutorial_step_1-3
 */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false, // Prevent swipe back during onboarding
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="tutorial" />
      <Stack.Screen name="goals" />
    </Stack>
  );
}
