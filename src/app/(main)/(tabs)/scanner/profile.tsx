import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Typography as Text, Button, Card } from '@/components/common';
import { Colors, Spacing, BorderRadius, Layout } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkinProfileCard } from '@/components/scanner/SkinProfileCard';
import { ConcernsList } from '@/components/scanner/ConcernsList';
import { useSkinProfile, useProfileStore } from '@/stores/profile.store';

/**
 * Skin Profile View Screen
 *
 * Detailed view of skin profile with full concerns list and explanations.
 * Reference: mydeisgn/ai_face_scanner_-_results_&_profile
 *
 * Implements:
 * - FR-013: Full skin profile display with concerns and explanations
 */

export default function ProfileScreen() {
  const router = useRouter();
  const skinProfile = useSkinProfile();
  const { skinProfileHistory, fetchSkinProfileHistory } = useProfileStore();

  if (!skinProfile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Ionicons name="scan-outline" size={64} color={Colors.textTertiary} />
          <Text variant="h3" style={styles.emptyTitle}>
            No Skin Profile Yet
          </Text>
          <Text variant="body" style={styles.emptyText}>
            Take a skin scan to get your personalized profile
          </Text>
          <Button
            title="Start Scan"
            variant="primary"
            onPress={() => router.push('/(main)/(tabs)/scanner/camera')}
          />
        </View>
      </SafeAreaView>
    );
  }

  const skinTypeInfo = getSkinTypeInfo(skinProfile.skin_type);
  const analysisDate = new Date(skinProfile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text variant="h3">Skin Profile</Text>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => router.push('/(main)/(tabs)/scanner/camera')}
        >
          <Ionicons name="refresh" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Summary Card */}
        <SkinProfileCard
          skinProfile={skinProfile}
          showConfidence
          showDate
        />

        {/* Skin Type Details */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="water-outline" size={24} color={Colors.primary} />
            <Text variant="label" style={styles.sectionTitle}>
              Your Skin Type: {skinProfile.skin_type?.charAt(0).toUpperCase() + skinProfile.skin_type?.slice(1)}
            </Text>
          </View>
          <Text variant="body" style={styles.skinTypeDescription}>
            {skinTypeInfo.description}
          </Text>
          <View style={styles.skinTypeTips}>
            <Text variant="bodySmall" style={styles.tipsTitle}>
              Key Recommendations:
            </Text>
            {skinTypeInfo.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text variant="bodySmall" style={styles.tipText}>
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Full Concerns List */}
        <View style={styles.concernsSection}>
          <Text variant="label" style={styles.concernsSectionTitle}>
            Detected Concerns ({(skinProfile.concerns as any[])?.length || 0})
          </Text>
          <ConcernsList
            concerns={skinProfile.concerns as any[]}
            showExplanations
          />
        </View>

        {/* Analysis Metadata */}
        <Card style={styles.metadataCard}>
          <Text variant="label" style={styles.metadataTitle}>
            Analysis Details
          </Text>
          <View style={styles.metadataRow}>
            <Text variant="caption" style={styles.metadataLabel}>
              Analyzed on
            </Text>
            <Text variant="bodySmall" style={styles.metadataValue}>
              {analysisDate}
            </Text>
          </View>
          <View style={styles.metadataRow}>
            <Text variant="caption" style={styles.metadataLabel}>
              Confidence Score
            </Text>
            <Text variant="bodySmall" style={styles.metadataValue}>
              {Math.round((skinProfile.analysis_confidence || 0.8) * 100)}%
            </Text>
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Generate Routine"
            variant="primary"
            onPress={() => router.push('/(main)/(tabs)/routines/builder')}
            fullWidth
            leftIcon={<Ionicons name="sparkles" size={20} color={Colors.textInverse} />}
          />
          <Button
            title="Retake Scan"
            variant="outline"
            onPress={() => router.push('/(main)/(tabs)/scanner/camera')}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface SkinTypeInfo {
  description: string;
  tips: string[];
}

function getSkinTypeInfo(skinType: string | null): SkinTypeInfo {
  const info: Record<string, SkinTypeInfo> = {
    oily: {
      description: 'Your skin produces excess sebum, which can lead to shine and enlarged pores. The good news is that oily skin tends to age more slowly!',
      tips: [
        'Use lightweight, oil-free moisturizers',
        'Look for niacinamide to control oil production',
        'Don\'t skip moisturizer - it helps balance oil',
        'Use clay masks weekly for deep cleansing',
      ],
    },
    dry: {
      description: 'Your skin lacks natural oils and moisture, which can lead to tightness and flaking. Hydration is key for your skin type!',
      tips: [
        'Use rich, cream-based moisturizers',
        'Look for hyaluronic acid for deep hydration',
        'Avoid hot water and harsh cleansers',
        'Apply moisturizer to damp skin',
      ],
    },
    combination: {
      description: 'Your skin has both oily and dry areas, typically with an oily T-zone and drier cheeks. Balance is the key to managing combination skin.',
      tips: [
        'Use different products for different areas',
        'Lightweight gel moisturizers work well',
        'Don\'t over-cleanse the oily areas',
        'Focus hydrating products on dry areas',
      ],
    },
    sensitive: {
      description: 'Your skin reacts easily to products and environmental factors. Gentle, soothing products are essential for your skin type.',
      tips: [
        'Patch test new products first',
        'Avoid fragrances and harsh ingredients',
        'Look for soothing ingredients like aloe',
        'Use minimal products in your routine',
      ],
    },
    normal: {
      description: 'Your skin is well-balanced with good moisture levels and minimal concerns. Focus on maintaining this healthy balance!',
      tips: [
        'Maintain your current routine',
        'Don\'t forget daily sunscreen',
        'Stay hydrated inside and out',
        'Consider anti-aging prevention early',
      ],
    },
  };

  return info[skinType || 'normal'] || info.normal;
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.md,
  },
  emptyTitle: {
    color: Colors.text,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  sectionCard: {
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text,
  },
  skinTypeDescription: {
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  skinTypeTips: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  tipsTitle: {
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  tipText: {
    color: Colors.textSecondary,
    flex: 1,
  },
  concernsSection: {
    marginTop: Spacing.xl,
  },
  concernsSectionTitle: {
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  metadataCard: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.backgroundSecondary,
  },
  metadataTitle: {
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  metadataLabel: {
    color: Colors.textSecondary,
  },
  metadataValue: {
    color: Colors.text,
  },
  actions: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
});
