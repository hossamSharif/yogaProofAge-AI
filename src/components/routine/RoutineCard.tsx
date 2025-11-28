import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography as Text, Card } from '@/components/common';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Database } from '@/types/supabase.types';

type Routine = Database['public']['Tables']['routines']['Row'];

interface RoutineCardProps {
  routine: Routine;
  onPress?: () => void;
  onPlayPress?: () => void;
  showPlayButton?: boolean;
  isActive?: boolean;
}

/**
 * RoutineCard Component
 *
 * Implements T082: Build routine card component
 * Displays routine title, focus, duration, benefits per FR-017
 *
 * Features:
 * - Visual indicator for active routine
 * - Duration display
 * - Benefits list preview
 * - Focus area badge
 * - Play button for quick start
 */
export function RoutineCard({
  routine,
  onPress,
  onPlayPress,
  showPlayButton = true,
  isActive = false,
}: RoutineCardProps) {
  const benefits = Array.isArray(routine.benefits) ? routine.benefits as string[] : [];
  const displayBenefits = benefits.slice(0, 3);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={[styles.container, isActive && styles.activeContainer]}>
        {isActive && (
          <View style={styles.activeBadge}>
            <Text variant="caption" style={styles.activeBadgeText}>
              ACTIVE
            </Text>
          </View>
        )}

        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="h3" style={styles.title} numberOfLines={1}>
              {routine.title}
            </Text>
            <View style={styles.focusBadge}>
              <Text variant="caption" style={styles.focusText}>
                {routine.focus_area}
              </Text>
            </View>
          </View>

          {showPlayButton && (
            <TouchableOpacity
              style={styles.playButton}
              onPress={e => {
                e.stopPropagation();
                onPlayPress?.();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="play" size={24} color={Colors.textInverse} />
            </TouchableOpacity>
          )}
        </View>

        {routine.description && (
          <Text variant="body" style={styles.description} numberOfLines={2}>
            {routine.description}
          </Text>
        )}

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
            <Text variant="caption" style={styles.metaText}>
              {routine.estimated_duration_minutes} min
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="fitness-outline" size={16} color={Colors.textSecondary} />
            <Text variant="caption" style={styles.metaText}>
              {routine.is_ai_generated ? 'AI Generated' : 'Custom'}
            </Text>
          </View>
        </View>

        {displayBenefits.length > 0 && (
          <View style={styles.benefits}>
            {displayBenefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                <Text variant="caption" style={styles.benefitText} numberOfLines={1}>
                  {benefit}
                </Text>
              </View>
            ))}
            {benefits.length > 3 && (
              <Text variant="caption" style={styles.moreBenefits}>
                +{benefits.length - 3} more
              </Text>
            )}
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  activeContainer: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  activeBadge: {
    position: 'absolute',
    top: -1,
    right: Spacing.md,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderBottomLeftRadius: BorderRadius.sm,
    borderBottomRightRadius: BorderRadius.sm,
  },
  activeBadgeText: {
    color: Colors.textInverse,
    fontWeight: '700',
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  titleContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  title: {
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  focusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  focusText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  description: {
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: Colors.textSecondary,
  },
  benefits: {
    marginTop: Spacing.xs,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  benefitText: {
    color: Colors.textSecondary,
    flex: 1,
  },
  moreBenefits: {
    color: Colors.primary,
    marginTop: 4,
  },
});

export default RoutineCard;
