import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Timer } from './Timer';
import { TipsCard } from './TipsCard';
import { Database } from '@/types/supabase.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RoutineStep = Database['public']['Tables']['routine_steps']['Row'];

interface FaceYogaStepProps {
  /**
   * Routine step data
   */
  step: RoutineStep;
  /**
   * Whether the step is currently active (timer running)
   */
  isActive: boolean;
  /**
   * Callback when step timer completes
   */
  onComplete: () => void;
  /**
   * Whether to show animation
   */
  showAnimation?: boolean;
}

/**
 * Face Yoga Step Component (T096, FR-026)
 *
 * Displays a face yoga exercise with:
 * - Visual guide/animation
 * - Countdown timer
 * - Instructions
 * - Tips
 */
export const FaceYogaStep: React.FC<FaceYogaStepProps> = ({
  step,
  isActive,
  onComplete,
  showAnimation = true,
}) => {
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (isActive && showAnimation) {
      // Gentle pulse animation to guide breathing/movement
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Infinite repeat
        false
      );

      opacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      scale.value = withTiming(1, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [isActive, showAnimation, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    if (isActive) {
      // Small delay before starting timer to allow user to read instructions
      const timeout = setTimeout(() => setIsTimerActive(true), 1500);
      return () => clearTimeout(timeout);
    } else {
      setIsTimerActive(false);
    }
  }, [isActive]);

  const handleTimerComplete = () => {
    setIsTimerActive(false);
    onComplete();
  };

  return (
    <View style={styles.container}>
      {/* Image/Animation Guide */}
      <View style={styles.visualContainer}>
        {step.image_url ? (
          <Animated.View style={[styles.imageWrapper, showAnimation && animatedStyle]}>
            <Image
              source={{ uri: step.image_url }}
              style={styles.image}
              resizeMode="contain"
            />
          </Animated.View>
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>Face Yoga Exercise</Text>
          </View>
        )}
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <Timer
          durationSeconds={step.duration_seconds || 30}
          isActive={isTimerActive}
          onComplete={handleTimerComplete}
          size="lg"
        />
      </View>

      {/* Exercise Title */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{step.title}</Text>

        {/* Instructions */}
        {step.instructions && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsLabel}>How to perform:</Text>
            <Text style={styles.instructionsText}>{step.instructions}</Text>
          </View>
        )}

        {/* Tips */}
        {step.tips && (
          <View style={styles.tipsContainer}>
            <TipsCard tips={step.tips} title="Pro Tips" icon="fitness-outline" />
          </View>
        )}

        {/* Benefits/Focus Area */}
        {step.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Focus:</Text>
            <Text style={styles.notesText}>{step.notes}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  visualContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  imageWrapper: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundMuted,
  },
  image: {
    width: SCREEN_WIDTH - Spacing.xl * 2,
    height: 280,
  },
  placeholderImage: {
    width: SCREEN_WIDTH - Spacing.xl * 2,
    height: 280,
    backgroundColor: Colors.backgroundMuted,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textMuted,
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  instructionsContainer: {
    gap: Spacing.xs,
  },
  instructionsLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textMuted,
  },
  instructionsText: {
    fontSize: Typography.fontSize.md,
    lineHeight: Typography.lineHeight.lg,
    color: Colors.text,
  },
  tipsContainer: {
    marginTop: Spacing.sm,
  },
  notesContainer: {
    gap: Spacing.xs,
  },
  notesLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textMuted,
  },
  notesText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    fontStyle: 'italic',
  },
});
