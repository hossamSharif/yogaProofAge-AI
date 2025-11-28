import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography as Text, Button } from '@/components/common';
import { Colors, Spacing, Layout } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Routines List Screen (Placeholder)
 *
 * Will display user's routines and quick access to routine builder.
 * Full implementation in Phase 4 (User Story 2).
 */
export default function RoutinesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="h1">Routines</Text>
      </View>

      <View style={styles.emptyState}>
        <Ionicons name="calendar-outline" size={64} color={Colors.textTertiary} />
        <Text variant="h3" style={styles.emptyTitle}>
          No Routines Yet
        </Text>
        <Text variant="body" style={styles.emptyText}>
          Create your first personalized routine based on your skin profile
        </Text>
        <Button
          title="Create Routine"
          variant="primary"
          onPress={() => router.push('/(main)/(tabs)/routines/builder')}
          leftIcon={<Ionicons name="add" size={20} color={Colors.textInverse} />}
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
