import { Stack } from 'expo-router';

/**
 * Scanner Stack Layout
 *
 * Navigation for AI face scanner flow.
 */
export default function ScannerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="camera"
        options={{
          presentation: 'fullScreenModal',
          animation: 'fade',
        }}
      />
      <Stack.Screen name="results" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
