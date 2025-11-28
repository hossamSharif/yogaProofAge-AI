import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography as Text, Button, Card } from '@/components/common';
import { Colors, Spacing, Layout } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Routine Builder Screen (Placeholder)
 *
 * Will generate AI routines based on skin profile.
 * Full implementation in Phase 4 (User Story 2).
 */
export default function RoutineBuilderScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text variant="h3">Routine Builder</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Card style={styles.comingSoonCard}>
          <Ionicons name="sparkles" size={48} color={Colors.primary} />
          <Text variant="h3" style={styles.comingSoonTitle}>
            Coming Soon
          </Text>
          <Text variant="body" style={styles.comingSoonText}>
            AI-powered routine generation will be available in the next update.
          </Text>
        </Card>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPadding,
  },
  comingSoonCard: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  comingSoonTitle: {
    color: Colors.text,
    marginTop: Spacing.md,
  },
  comingSoonText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
