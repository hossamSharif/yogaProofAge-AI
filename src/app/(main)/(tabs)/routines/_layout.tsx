import { Stack } from 'expo-router';

export default function RoutinesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="builder" />
      <Stack.Screen name="templates" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
