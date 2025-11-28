import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Typography as Text } from '@/components/common';
import { Colors, Spacing, Layout } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Photo Detail Screen (Placeholder)
 *
 * Will display individual photo with analysis details.
 * Full implementation in Phase 6 (User Story 4).
 */
export default function PhotoDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text variant="h3">Photo Details</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={64} color={Colors.textTertiary} />
          <Text variant="caption" style={styles.placeholderText}>
            Photo ID: {id}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text variant="h3" style={styles.sectionTitle}>
            Analysis Details
          </Text>
          <Text variant="body" style={styles.comingSoonText}>
            Photo analysis details will be available in a future update.
          </Text>
        </View>
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
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.screenPadding,
  },
  imagePlaceholder: {
    aspectRatio: 3 / 4,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  placeholderText: {
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
  infoSection: {
    flex: 1,
  },
  sectionTitle: {
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  comingSoonText: {
    color: Colors.textSecondary,
  },
});
