import { Stack } from 'expo-router';

export default function GalleryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="capture" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="compare" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
