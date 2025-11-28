import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography as Text, Card } from '@/components/common';
import { Colors, Spacing, Layout } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Photo Capture Screen (Placeholder)
 *
 * Will capture progress photos.
 * Full implementation in Phase 6 (User Story 4).
 */
export default function CaptureScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={28} color={Colors.textInverse} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Card style={styles.comingSoonCard}>
            <Ionicons name="camera" size={48} color={Colors.primary} />
            <Text variant="h3" style={styles.comingSoonTitle}>
              Coming Soon
            </Text>
            <Text variant="body" style={styles.comingSoonText}>
              Progress photo capture will be available in a future update.
            </Text>
          </Card>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
