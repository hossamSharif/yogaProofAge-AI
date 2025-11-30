import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Database } from '@/types/supabase.types';

type RoutineSession = Database['public']['Tables']['routine_sessions']['Row'];

interface SessionSummaryProps {
  /**
   * Session data
   */
  session: {
    startedAt: string;
    completedAt?: string;
    totalDuration: number; // in seconds
    stepsCompleted: number;
    stepsSkipped: number;
    totalSteps: number;
  };
  /**
   * Routine name
   */
  routineName?: string;
  /**
   * Callback when user taps "Done" button
   */
  onDone: () => void;
  /**
   * Callback when user taps "View Progress" button (optional)
   */
  onViewProgress?: () => void;
}

/**
 * Session Completion Summary Component (T104, FR-029, FR-031)
 *
 * Displays a summary of completed routine session with:
 * - Duration
 * - Steps completed/skipped
 * - Completion rate
 * - Congratulations message
 * - Action buttons
 */
export const SessionSummary: React.FC<SessionSummaryProps> = ({
  session,
  routineName,
  onDone,
  onViewProgress,
}) => {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) {
      return `${secs}s`;
    }
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  const completionRate = Math.round(
    (session.stepsCompleted / session.totalSteps) * 100
  );

  const getMessage = () => {
    if (completionRate === 100) {
      return 'Perfect! You completed all steps!';
    } else if (completionRate >= 80) {
      return 'Great job! Almost perfect!';
    } else if (completionRate >= 50) {
      return 'Good work! Keep it up!';
    } else {
      return 'Session complete!';
    }
  };

  const getIcon = () => {
    if (completionRate === 100) return 'trophy';
    if (completionRate >= 80) return 'ribbon';
    if (completionRate >= 50) return 'thumbs-up';
    return 'checkmark-circle';
  };

  return (
    <View style={styles.container}>
      {/* Success Icon */}
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.iconCircle,
            completionRate === 100 && styles.iconCirclePerfect,
          ]}
        >
          <Ionicons
            name={getIcon()}
            size={48}
            color={completionRate === 100 ? Colors.warning : Colors.success}
          />
        </View>
      </View>

      {/* Message */}
      <Text style={styles.title}>{getMessage()}</Text>
      {routineName && <Text style={styles.routineName}>{routineName}</Text>}

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {/* Duration */}
        <View style={styles.statCard}>
          <Ionicons name="time-outline" size={24} color={Colors.primary} />
          <Text style={styles.statValue}>{formatDuration(session.totalDuration)}</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>

        {/* Completed Steps */}
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={24} color={Colors.success} />
          <Text style={styles.statValue}>{session.stepsCompleted}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>

        {/* Completion Rate */}
        <View style={styles.statCard}>
          <Ionicons name="stats-chart-outline" size={24} color={Colors.info} />
          <Text style={styles.statValue}>{completionRate}%</Text>
          <Text style={styles.statLabel}>Completion</Text>
        </View>
      </View>

      {/* Additional Info */}
      {session.stepsSkipped > 0 && (
        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.infoText}>
            You skipped {session.stepsSkipped} step{session.stepsSkipped > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Motivational message based on streak */}
      <View style={styles.motivationContainer}>
        <Text style={styles.motivationText}>
          {completionRate === 100
            ? 'Consistency is key! Keep up this amazing routine.'
            : 'Every session counts! You\'re building great habits.'}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {onViewProgress && (
          <TouchableOpacity style={styles.secondaryButton} onPress={onViewProgress}>
            <Ionicons name="analytics-outline" size={20} color={Colors.primary} />
            <Text style={styles.secondaryButtonText}>View Progress</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.primaryButton} onPress={onDone}>
          <Text style={styles.primaryButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCirclePerfect: {
    backgroundColor: Colors.warningLight,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  routineName: {
    fontSize: Typography.fontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.backgroundMuted,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
  },
  motivationContainer: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  motivationText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryDark,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.md,
  },
  actionsContainer: {
    width: '100%',
    gap: Spacing.sm,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textInverse,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
  },
  secondaryButtonText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
  },
});
