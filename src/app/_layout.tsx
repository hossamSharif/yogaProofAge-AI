import { Stack } from 'expo-router';
import { useEffect } from 'react';
import '../i18n';

export default function RootLayout() {
  useEffect(() => {
    // Initialize app
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
