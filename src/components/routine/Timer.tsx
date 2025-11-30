import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface TimerProps {
  /**
   * Duration in seconds
   */
  durationSeconds: number;
  /**
   * Whether timer is active
   */
  isActive: boolean;
  /**
   * Callback when timer completes
   */
  onComplete?: () => void;
  /**
   * Callback for each second tick
   */
  onTick?: (remainingSeconds: number) => void;
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Countdown Timer Component (T099, FR-026, FR-027)
 *
 * Displays a countdown timer for routine steps.
 * Supports pause/resume via isActive prop.
 */
export const Timer: React.FC<TimerProps> = ({
  durationSeconds,
  isActive,
  onComplete,
  onTick,
  size = 'md',
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);

  // Reset remaining time when duration changes
  useEffect(() => {
    setRemainingSeconds(durationSeconds);
  }, [durationSeconds]);

  // Countdown logic
  useEffect(() => {
    if (!isActive) return;

    if (remainingSeconds <= 0) {
      onComplete?.();
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        const newValue = Math.max(0, prev - 1);
        onTick?.(newValue);

        if (newValue === 0) {
          clearInterval(interval);
          setTimeout(() => onComplete?.(), 100);
        }

        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, remainingSeconds, onComplete, onTick]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (remainingSeconds / durationSeconds) * 100;
  const isWarning = remainingSeconds <= 10 && remainingSeconds > 0;
  const isComplete = remainingSeconds === 0;

  return (
    <View style={styles.container}>
      {/* Circular progress indicator */}
      <View style={[styles.circle, styles[`circle${size.toUpperCase() as 'SM' | 'MD' | 'LG'}`]]}>
        <View
          style={[
            styles.circleProgress,
            {
              borderColor: isComplete
                ? Colors.success
                : isWarning
                  ? Colors.warning
                  : Colors.primary,
            },
          ]}
        />
        <View style={styles.circleInner}>
          <Text
            style={[
              styles.timeText,
              styles[`timeText${size.toUpperCase() as 'SM' | 'MD' | 'LG'}`],
              isWarning && styles.warningText,
              isComplete && styles.completeText,
            ]}
          >
            {formatTime(remainingSeconds)}
          </Text>
          {size === 'lg' && (
            <Text style={styles.labelText}>
              {isComplete ? 'Complete!' : isActive ? 'Remaining' : 'Paused'}
            </Text>
          )}
        </View>
      </View>

      {/* Progress bar (optional, shown for larger sizes) */}
      {size === 'lg' && (
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${progressPercentage}%`,
                backgroundColor: isComplete
                  ? Colors.success
                  : isWarning
                    ? Colors.warning
                    : Colors.primary,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  circle: {
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circleSM: {
    width: 60,
    height: 60,
  },
  circleMD: {
    width: 100,
    height: 100,
  },
  circleLG: {
    width: 160,
    height: 160,
  },
  circleProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 1000,
    borderWidth: 4,
  },
  circleInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  timeTextSM: {
    fontSize: 16,
    lineHeight: 20,
  },
  timeTextMD: {
    fontSize: 24,
    lineHeight: 32,
  },
  timeTextLG: {
    fontSize: 40,
    lineHeight: 48,
  },
  warningText: {
    color: Colors.warning,
  },
  completeText: {
    color: Colors.success,
  },
  labelText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xxs,
  },
  progressBarContainer: {
    width: 200,
    height: 8,
    backgroundColor: Colors.backgroundMuted,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: Spacing.md,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s ease-in-out',
  },
});
