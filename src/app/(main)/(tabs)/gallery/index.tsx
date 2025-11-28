import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography as Text, Button } from '@/components/common';
import { Colors, Spacing, Layout } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Photo Gallery Screen (Placeholder)
 *
 * Will display progress photos in chronological grid.
 * Full implementation in Phase 6 (User Story 4).
 */
export default function GalleryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="h1">Gallery</Text>
      </View>

      <View style={styles.emptyState}>
        <Ionicons name="images-outline" size={64} color={Colors.textTertiary} />
        <Text variant="h3" style={styles.emptyTitle}>
          No Photos Yet
        </Text>
        <Text variant="body" style={styles.emptyText}>
          Start capturing daily photos to track your skin transformation
        </Text>
        <Button
          title="Take Photo"
          variant="primary"
          onPress={() => router.push('/(main)/(tabs)/gallery/capture')}
          leftIcon={<Ionicons name="camera" size={20} color={Colors.textInverse} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.md,
  },
  emptyTitle: {
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
});
