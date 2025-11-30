import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/constants/theme';
import {
  useRoutineStore,
  useActiveSession,
  useActiveRoutineSteps,
  useCurrentStep,
} from '@/stores/routine.store';
import { useAuthStore } from '@/stores/auth.store';
import { FaceYogaStep } from '@/components/routine/FaceYogaStep';
import { ProductStep } from '@/components/routine/ProductStep';
import { ProgressIndicator } from '@/components/routine/ProgressIndicator';
import { SessionSummary } from '@/components/routine/SessionSummary';

/**
 * Routine Player Screen (T095, FR-024, FR-025, FR-026, FR-027, FR-028, FR-029)
 *
 * Interactive routine player with:
 * - Step-by-step navigation
 * - Face yoga exercises with animations and timers
 * - Product application steps with instructions
 * - Progress tracking
 * - Pause/resume functionality
 * - Session completion summary
 *
 * References design: mydeisgn/routine_player_-_video_guide and routine_player_-_product_focus
 */
export default function RoutinePlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const userId = useAuthStore(state => state.user?.id);

  const {
    startSession,
    pauseSession,
    resumeSession,
    completeStep,
    skipStep,
    completeSession,
    abandonSession,
    fetchRoutineSteps,
  } = useRoutineStore();

  const activeSession = useActiveSession();
  const steps = useActiveRoutineSteps();
  const currentStep = useCurrentStep();

  const [isLoading, setIsLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);

  // Load routine steps and start session
  useEffect(() => {
    if (!id || !userId) return;

    const initializeSession = async () => {
      try {
        // Load steps if not already loaded
        if (steps.length === 0) {
          await fetchRoutineSteps(id);
        }

        // Start new session if no active session
        if (!activeSession) {
          await startSession(userId, id);
        }

        setIsLoading(false);
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to start routine session');
        router.back();
      }
    };

    initializeSession();
  }, [id, userId]);

  // Handle back navigation
  const handleBack = () => {
    if (activeSession && !showSummary) {
      Alert.alert(
        'Abandon Session?',
        'Your progress will be saved, but the session will be marked as incomplete.',
        [
          {
            text: 'Continue Session',
            style: 'cancel',
          },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: async () => {
              await abandonSession();
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  };

  // Handle step completion
  const handleStepComplete = () => {
    if (!currentStep || !activeSession) return;

    completeStep(currentStep.id);

    // Check if this was the last step
    if (activeSession.currentStepIndex === steps.length - 1) {
      handleSessionComplete();
    }
  };

  // Handle step skip
  const handleStepSkip = () => {
    if (!currentStep || !activeSession) return;

    skipStep(currentStep.id);

    // Check if this was the last step
    if (activeSession.currentStepIndex === steps.length - 1) {
      handleSessionComplete();
    }
  };

  // Handle session completion
  const handleSessionComplete = async () => {
    try {
      await completeSession();
      setShowSummary(true);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to save session. Please try again.');
    }
  };

  // Handle summary done
  const handleSummaryDone = () => {
    router.back();
  };

  // Handle pause/resume
  const handlePauseResume = () => {
    if (!activeSession) return;

    if (activeSession.isPaused) {
      resumeSession();
    } else {
      pauseSession();
    }
  };

  // Navigate to previous step
  const handlePreviousStep = () => {
    if (!activeSession || activeSession.currentStepIndex === 0) return;
    // Note: This requires adding a method to the store to navigate backwards
    // For now, we'll just show a message
    Alert.alert('Info', 'You cannot go back to previous steps in this version');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading routine...</Text>
      </View>
    );
  }

  if (showSummary && activeSession) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <SessionSummary
          session={{
            startedAt: activeSession.startedAt,
            totalDuration: Math.floor(
              (Date.now() - new Date(activeSession.startedAt).getTime()) / 1000
            ),
            stepsCompleted: activeSession.completedSteps.length,
            stepsSkipped: activeSession.skippedSteps.length,
            totalSteps: steps.length,
          }}
          routineName={steps[0]?.routine_id}
          onDone={handleSummaryDone}
        />
      </View>
    );
  }

  if (!currentStep || !activeSession) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No active session</Text>
        <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <ProgressIndicator
            currentStep={activeSession.currentStepIndex}
            totalSteps={steps.length}
            completedSteps={activeSession.completedSteps}
            skippedSteps={activeSession.skippedSteps}
            mode="bar"
          />
        </View>

        <TouchableOpacity style={styles.headerButton} onPress={handlePauseResume}>
          <Ionicons
            name={activeSession.isPaused ? 'play' : 'pause'}
            size={28}
            color={Colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Step Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {currentStep.step_type === 'face_yoga' ? (
          <FaceYogaStep
            step={currentStep}
            isActive={!activeSession.isPaused}
            onComplete={handleStepComplete}
            showAnimation={!activeSession.isPaused}
          />
        ) : (
          <ProductStep
            step={currentStep}
            product={currentStep.products}
            isActive={!activeSession.isPaused}
            onComplete={handleStepComplete}
          />
        )}
      </ScrollView>

      {/* Footer Controls */}
      <View style={styles.footer}>
        {/* Previous Step Button (disabled for now) */}
        <TouchableOpacity
          style={[styles.footerButton, styles.footerButtonSecondary]}
          onPress={handlePreviousStep}
          disabled={activeSession.currentStepIndex === 0}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={
              activeSession.currentStepIndex === 0 ? Colors.textMuted : Colors.primary
            }
          />
          <Text
            style={[
              styles.footerButtonText,
              activeSession.currentStepIndex === 0 && styles.footerButtonTextDisabled,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        {/* Skip Step Button */}
        <TouchableOpacity
          style={[styles.footerButton, styles.footerButtonSecondary]}
          onPress={handleStepSkip}
        >
          <Text style={styles.footerButtonText}>Skip</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Pause Overlay */}
      {activeSession.isPaused && (
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseCard}>
            <Ionicons name="pause-circle-outline" size={64} color={Colors.primary} />
            <Text style={styles.pauseTitle}>Paused</Text>
            <Text style={styles.pauseSubtitle}>Tap play to continue</Text>
            <TouchableOpacity style={styles.resumeButton} onPress={handlePauseResume}>
              <Ionicons name="play" size={20} color={Colors.textInverse} />
              <Text style={styles.resumeButtonText}>Resume</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.error,
    marginBottom: Spacing.lg,
  },
  errorButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  errorButtonText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textInverse,
    fontFamily: Typography.fontFamily.semiBold,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    gap: Spacing.md,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  footerButtonSecondary: {
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
  },
  footerButtonText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
  },
  footerButtonTextDisabled: {
    color: Colors.textMuted,
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  pauseCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
    minWidth: 280,
  },
  pauseTitle: {
    fontSize: Typography.fontSize.xxl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  pauseSubtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.md,
  },
  resumeButtonText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textInverse,
  },
});
