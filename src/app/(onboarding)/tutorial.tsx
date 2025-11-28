import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Typography as Text, Button } from '@/components/common';
import { Colors, Spacing, BorderRadius, Layout } from '@/constants/theme';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

/**
 * Tutorial Steps Screen
 *
 * 3-step tutorial showing how to use key features
 * Reference: mydeisgn/tutorial_step_1-3
 */

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  tip: string;
  image: any;
}

const steps: TutorialStep[] = [
  {
    id: 1,
    title: 'Take Your Face Scan',
    description:
      'Position your face in the camera frame with good lighting. Our AI will analyze your skin type and concerns in seconds.',
    tip: 'Natural daylight works best for accurate results!',
    image: require('@/assets/images/onboarding/tutorial1.png'),
  },
  {
    id: 2,
    title: 'Choose Your Routine',
    description:
      'Based on your skin analysis, we\'ll generate personalized routines. Select the one that fits your lifestyle and goals.',
    tip: 'You can change your routine anytime!',
    image: require('@/assets/images/onboarding/tutorial2.png'),
  },
  {
    id: 3,
    title: 'Follow Along Daily',
    description:
      'Start each session with our guided player. Follow step-by-step face yoga exercises and skincare applications.',
    tip: 'Consistency is key - even 5 minutes daily makes a difference!',
    image: require('@/assets/images/onboarding/tutorial3.png'),
  },
];

export default function TutorialScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      router.push('/(onboarding)/goals');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      router.back();
    }
  };

  const handleSkip = () => {
    router.push('/(onboarding)/goals');
  };

  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressBar,
              index <= currentStep && styles.progressBarActive,
            ]}
          />
        ))}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Step number */}
        <Animated.View
          key={`step-${step.id}`}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
        >
          <View style={styles.stepIndicator}>
            <Text variant="caption" style={styles.stepText}>
              Step {step.id} of {steps.length}
            </Text>
          </View>
        </Animated.View>

        {/* Image */}
        <Animated.View
          key={`image-${step.id}`}
          style={styles.imageContainer}
          entering={SlideInRight.duration(400)}
          exiting={SlideOutLeft.duration(300)}
        >
          <Image source={step.image} style={styles.image} resizeMode="contain" />
        </Animated.View>

        {/* Content */}
        <Animated.View
          key={`content-${step.id}`}
          entering={FadeIn.duration(400).delay(100)}
          exiting={FadeOut.duration(200)}
        >
          <Text variant="h2" style={styles.title}>
            {step.title}
          </Text>
          <Text variant="body" style={styles.description}>
            {step.description}
          </Text>

          {/* Tip card */}
          <View style={styles.tipCard}>
            <Text variant="label" style={styles.tipLabel}>
              Pro Tip
            </Text>
            <Text variant="bodySmall" style={styles.tipText}>
              {step.tip}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Back"
          variant="ghost"
          onPress={handleBack}
          style={styles.backButton}
        />
        <Button
          title="Skip"
          variant="outline"
          onPress={handleSkip}
          style={styles.skipButton}
        />
        <Button
          title={currentStep === steps.length - 1 ? 'Continue' : 'Next'}
          variant="primary"
          onPress={handleNext}
          style={styles.nextButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing['3xl'],
    gap: Spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
  },
  progressBarActive: {
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  stepIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  stepText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  image: {
    width: width * 0.7,
    height: width * 0.6,
  },
  title: {
    marginBottom: Spacing.md,
    color: Colors.text,
  },
  description: {
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 24,
  },
  tipCard: {
    backgroundColor: Colors.success + '10',
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  tipLabel: {
    color: Colors.success,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  tipText: {
    color: Colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing['3xl'],
    paddingTop: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  backButton: {
    flex: 1,
  },
  skipButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});
