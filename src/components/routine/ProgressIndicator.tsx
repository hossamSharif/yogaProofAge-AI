import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface ProgressIndicatorProps {
  /**
   * Current step number (0-based index)
   */
  currentStep: number;
  /**
   * Total number of steps
   */
  totalSteps: number;
  /**
   * Array of completed step IDs
   */
  completedSteps?: string[];
  /**
   * Array of skipped step IDs
   */
  skippedSteps?: string[];
  /**
   * Display mode
   */
  mode?: 'dots' | 'bar' | 'fraction';
}

/**
 * Progress Indicator Component (T098, FR-028)
 *
 * Shows user's progress through routine steps.
 * Supports multiple display modes: dots, bar, or fraction.
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  completedSteps = [],
  skippedSteps = [],
  mode = 'bar',
}) => {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
  const completedCount = completedSteps.length;
  const skippedCount = skippedSteps.length;

  if (mode === 'fraction') {
    return (
      <View style={styles.fractionContainer}>
        <Text style={styles.fractionText}>
          Step {currentStep + 1} of {totalSteps}
        </Text>
        {(completedCount > 0 || skippedCount > 0) && (
          <View style={styles.statsRow}>
            {completedCount > 0 && (
              <View style={styles.stat}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.statText}>{completedCount} completed</Text>
              </View>
            )}
            {skippedCount > 0 && (
              <View style={styles.stat}>
                <Ionicons name="arrow-forward-circle" size={16} color={Colors.textMuted} />
                <Text style={styles.statText}>{skippedCount} skipped</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  }

  if (mode === 'dots') {
    return (
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentStep && styles.dotActive,
              index < currentStep && styles.dotCompleted,
            ]}
          />
        ))}
      </View>
    );
  }

  // Default: bar mode
  return (
    <View style={styles.barContainer}>
      <View style={styles.barHeader}>
        <Text style={styles.barLabel}>
          Step {currentStep + 1} of {totalSteps}
        </Text>
        <Text style={styles.barPercentage}>{Math.round(progressPercentage)}%</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${progressPercentage}%` }]} />
      </View>
      {(completedCount > 0 || skippedCount > 0) && (
        <View style={styles.statsRow}>
          {completedCount > 0 && (
            <View style={styles.stat}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text style={[styles.statText, styles.statTextSmall]}>{completedCount}</Text>
            </View>
          )}
          {skippedCount > 0 && (
            <View style={styles.stat}>
              <Ionicons name="arrow-forward-circle" size={14} color={Colors.textMuted} />
              <Text style={[styles.statText, styles.statTextSmall]}>{skippedCount}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Fraction mode
  fractionContainer: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  fractionText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.text,
  },
  // Dots mode
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.backgroundMuted,
  },
  dotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  dotCompleted: {
    backgroundColor: Colors.success,
  },
  // Bar mode
  barContainer: {
    width: '100%',
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  barLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
  },
  barPercentage: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
  },
  barTrack: {
    height: 8,
    backgroundColor: Colors.backgroundMuted,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  statText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },
  statTextSmall: {
    fontSize: Typography.fontSize.xs,
  },
});
