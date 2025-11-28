import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Typography as Text, Card } from '@/components/common';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Database } from '@/types/supabase.types';

type SkinProfile = Database['public']['Tables']['skin_profiles']['Row'];

/**
 * Skin Profile Card Component
 *
 * Displays a summary of the user's skin profile.
 *
 * Implements:
 * - FR-013: Display skin type and concerns summary
 * - T064: Build SkinProfileCard component
 */

interface SkinProfileCardProps {
  skinProfile: SkinProfile;
  onPress?: () => void;
  compact?: boolean;
  showConfidence?: boolean;
  showDate?: boolean;
}

const skinTypeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  oily: 'water',
  dry: 'sunny',
  combination: 'contrast',
  sensitive: 'leaf',
  normal: 'happy',
};

const skinTypeColors: Record<string, string> = {
  oily: '#4ECDC4',
  dry: '#FFB347',
  combination: '#9B59B6',
  sensitive: '#E74C3C',
  normal: '#3498DB',
};

export function SkinProfileCard({
  skinProfile,
  onPress,
  compact = false,
  showConfidence = false,
  showDate = false,
}: SkinProfileCardProps) {
  const skinType = skinProfile.skin_type || 'normal';
  const concerns = (skinProfile.concerns as any[]) || [];
  const confidence = Math.round((skinProfile.analysis_confidence || 0.8) * 100);

  const skinTypeIcon = skinTypeIcons[skinType] || 'ellipse';
  const skinTypeColor = skinTypeColors[skinType] || Colors.primary;

  const formattedDate = showDate
    ? new Date(skinProfile.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper onPress={onPress} activeOpacity={0.8}>
      <Card style={[styles.card, compact && styles.cardCompact]}>
        <View style={styles.header}>
          {/* Skin type badge */}
          <View style={[styles.skinTypeBadge, { backgroundColor: skinTypeColor + '20' }]}>
            <Ionicons name={skinTypeIcon} size={compact ? 20 : 24} color={skinTypeColor} />
            <Text
              variant={compact ? 'bodySmall' : 'label'}
              style={[styles.skinTypeText, { color: skinTypeColor }]}
            >
              {skinType.charAt(0).toUpperCase() + skinType.slice(1)} Skin
            </Text>
          </View>

          {/* Arrow if pressable */}
          {onPress && (
            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
          )}
        </View>

        {/* Concerns summary */}
        <View style={styles.concernsContainer}>
          <Text variant="caption" style={styles.concernsLabel}>
            {concerns.length} concern{concerns.length !== 1 ? 's' : ''} detected
          </Text>
          <View style={styles.concernTags}>
            {concerns.slice(0, compact ? 3 : 5).map((concern, index) => (
              <View key={index} style={styles.concernTag}>
                <View
                  style={[
                    styles.severityDot,
                    concern.severity === 'mild' && styles.severityMild,
                    concern.severity === 'moderate' && styles.severityModerate,
                    concern.severity === 'severe' && styles.severitySevere,
                  ]}
                />
                <Text variant="caption" style={styles.concernTagText}>
                  {concern.type?.replace(/_/g, ' ')}
                </Text>
              </View>
            ))}
            {concerns.length > (compact ? 3 : 5) && (
              <View style={styles.moreTag}>
                <Text variant="caption" style={styles.moreTagText}>
                  +{concerns.length - (compact ? 3 : 5)} more
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer with metadata */}
        {(showConfidence || showDate) && (
          <View style={styles.footer}>
            {showConfidence && (
              <View style={styles.footerItem}>
                <Ionicons name="analytics" size={14} color={Colors.textTertiary} />
                <Text variant="caption" style={styles.footerText}>
                  {confidence}% confidence
                </Text>
              </View>
            )}
            {showDate && formattedDate && (
              <View style={styles.footerItem}>
                <Ionicons name="calendar-outline" size={14} color={Colors.textTertiary} />
                <Text variant="caption" style={styles.footerText}>
                  {formattedDate}
                </Text>
              </View>
            )}
          </View>
        )}
      </Card>
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
  },
  cardCompact: {
    padding: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  skinTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  skinTypeText: {
    fontWeight: '600',
  },
  concernsContainer: {
    marginBottom: Spacing.sm,
  },
  concernsLabel: {
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  concernTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  concernTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textTertiary,
  },
  severityMild: {
    backgroundColor: Colors.success,
  },
  severityModerate: {
    backgroundColor: Colors.warning,
  },
  severitySevere: {
    backgroundColor: Colors.error,
  },
  concernTagText: {
    color: Colors.textSecondary,
    textTransform: 'capitalize',
    fontSize: 11,
  },
  moreTag: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  moreTagText: {
    color: Colors.primary,
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  footerText: {
    color: Colors.textTertiary,
  },
});

export default SkinProfileCard;
