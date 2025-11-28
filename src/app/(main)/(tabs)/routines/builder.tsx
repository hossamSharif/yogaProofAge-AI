import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography as Text, Button, Card } from '@/components/common';
import { RoutineSelector } from '@/components/routine';
import { Colors, Spacing, Layout } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoutineStore, RoutineOption } from '@/stores/routine.store';
import { useProfileStore, useSkinProfile, useSelectedGoals } from '@/stores/profile.store';
import { useAuthStore } from '@/stores/auth.store';
import { generateRoutineOptions, getFallbackRoutines } from '@/services/ai/routine-generator';
import { getUserFriendlyMessage } from '@/utils/errorHandler';

type BuilderStep = 'intro' | 'generating' | 'select' | 'saving';

/**
 * Routine Builder Screen
 *
 * Implements T080: Create routine builder screen (AI generation trigger)
 * Per FR-015: Generate 3-5 AI-powered routine options
 *
 * Features:
 * - AI routine generation based on skin profile
 * - Multiple routine options to choose from
 * - Fallback templates when AI unavailable
 * - Save selected routine to database
 */
export default function RoutineBuilderScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const skinProfile = useSkinProfile();
  const selectedGoals = useSelectedGoals();
  const {
    generatedOptions,
    selectedOptionIndex,
    setGeneratedOptions,
    selectOption,
    clearGeneratedOptions,
    createRoutine,
    createRoutineSteps,
  } = useRoutineStore();

  const [step, setStep] = useState<BuilderStep>('intro');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const userId = session?.user?.id;

  const handleGenerateRoutines = useCallback(async () => {
    if (!skinProfile) {
      Alert.alert(
        'Skin Profile Required',
        'Please complete a face scan first to get personalized routines.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Scan Now', onPress: () => router.push('/(main)/(tabs)/scanner') },
        ]
      );
      return;
    }

    setStep('generating');
    setError(null);

    try {
      const options = await generateRoutineOptions(skinProfile, selectedGoals);
      setGeneratedOptions(options);
      setStep('select');
    } catch (err: any) {
      console.error('Routine generation failed:', err);
      setError(getUserFriendlyMessage(err));

      // Use fallback templates
      const fallbackOptions = getFallbackRoutines(skinProfile.skin_type);
      setGeneratedOptions(fallbackOptions);
      setStep('select');
    }
  }, [skinProfile, selectedGoals]);

  const handleUseFallback = useCallback(() => {
    const skinType = skinProfile?.skin_type || 'normal';
    const fallbackOptions = getFallbackRoutines(skinType);
    setGeneratedOptions(fallbackOptions);
    setStep('select');
  }, [skinProfile]);

  const handleSelectOption = useCallback((index: number) => {
    selectOption(index);
  }, []);

  const handleConfirmSelection = useCallback(async () => {
    if (!userId || selectedOptionIndex === null || !skinProfile) return;

    const selectedOption = generatedOptions[selectedOptionIndex];
    if (!selectedOption) return;

    setIsSaving(true);
    setStep('saving');

    try {
      // Create the routine
      const routine = await createRoutine({
        user_id: userId,
        skin_profile_id: skinProfile.id,
        title: selectedOption.title,
        description: selectedOption.description,
        focus_area: selectedOption.focusArea,
        estimated_duration_minutes: selectedOption.estimatedDurationMinutes,
        benefits: selectedOption.benefits,
        status: 'draft',
        is_ai_generated: true,
      });

      // Create the steps
      const stepsToCreate = selectedOption.steps.map((step, index) => ({
        step_number: index + 1,
        step_type: step.stepType as 'face_yoga' | 'product_application',
        title: step.title,
        instructions: step.instructions,
        tips: step.tips || null,
        duration_seconds: step.durationSeconds,
        image_url: step.imageUrl || null,
        video_url: null,
        product_id: null, // Products assigned in next screen
        product_amount: step.productAmount || null,
      }));

      await createRoutineSteps(routine.id, stepsToCreate);

      // Navigate to product selection for the new routine
      clearGeneratedOptions();
      router.replace(`/(main)/(tabs)/routines/${routine.id}/products`);
    } catch (err: any) {
      console.error('Failed to save routine:', err);
      Alert.alert('Error', 'Failed to save routine. Please try again.');
      setStep('select');
    } finally {
      setIsSaving(false);
    }
  }, [userId, selectedOptionIndex, generatedOptions, skinProfile]);

  const handleBack = () => {
    if (step === 'select') {
      clearGeneratedOptions();
      setStep('intro');
    } else {
      router.back();
    }
  };

  const renderIntro = () => (
    <View style={styles.content}>
      <View style={styles.introSection}>
        <Ionicons name="sparkles" size={64} color={Colors.primary} />
        <Text variant="h2" style={styles.introTitle}>
          AI Routine Builder
        </Text>
        <Text variant="body" style={styles.introText}>
          Create a personalized skincare and face yoga routine tailored to your skin profile and goals.
        </Text>
      </View>

      {skinProfile ? (
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Ionicons name="person-circle" size={24} color={Colors.primary} />
            <Text variant="h4" style={styles.profileTitle}>
              Your Skin Profile
            </Text>
          </View>
          <Text variant="body" style={styles.profileText}>
            Skin Type: <Text variant="body" style={styles.profileValue}>{skinProfile.skin_type}</Text>
          </Text>
          {selectedGoals.length > 0 && (
            <Text variant="body" style={styles.profileText}>
              Goals: <Text variant="body" style={styles.profileValue}>{selectedGoals.map(g => g.replace('_', ' ')).join(', ')}</Text>
            </Text>
          )}
        </Card>
      ) : (
        <Card style={styles.noProfileCard}>
          <Ionicons name="alert-circle" size={24} color={Colors.warning} />
          <Text variant="body" style={styles.noProfileText}>
            Complete a face scan first to get personalized routine recommendations.
          </Text>
        </Card>
      )}

      <View style={styles.actions}>
        <Button
          title="Generate My Routine"
          variant="primary"
          onPress={handleGenerateRoutines}
          leftIcon={<Ionicons name="sparkles" size={20} color={Colors.textInverse} />}
          fullWidth
          disabled={!skinProfile}
        />
        <Button
          title="Browse Templates Instead"
          variant="outline"
          onPress={handleUseFallback}
          style={styles.secondaryAction}
          fullWidth
        />
      </View>
    </View>
  );

  const renderGenerating = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text variant="h3" style={styles.loadingTitle}>
        Creating Your Routines
      </Text>
      <Text variant="body" style={styles.loadingText}>
        Our AI is analyzing your skin profile and creating personalized routine options...
      </Text>
    </View>
  );

  const renderSaving = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text variant="h3" style={styles.loadingTitle}>
        Saving Your Routine
      </Text>
      <Text variant="body" style={styles.loadingText}>
        Setting up your personalized routine...
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text variant="h3">
          {step === 'intro' ? 'Routine Builder' : step === 'select' ? 'Choose Routine' : 'Building...'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning" size={20} color={Colors.warning} />
          <Text variant="caption" style={styles.errorText}>
            {error} Using template routines instead.
          </Text>
        </View>
      )}

      {step === 'intro' && renderIntro()}
      {step === 'generating' && renderGenerating()}
      {step === 'saving' && renderSaving()}
      {step === 'select' && generatedOptions.length > 0 && (
        <View style={styles.selectorContainer}>
          <RoutineSelector
            options={generatedOptions}
            selectedIndex={selectedOptionIndex}
            onSelect={handleSelectOption}
            onConfirm={handleConfirmSelection}
            isLoading={isSaving}
          />
        </View>
      )}
    </SafeAreaView>
  );
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
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.warningLight,
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.sm,
  },
  errorText: {
    color: Colors.warning,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.screenPadding,
    justifyContent: 'center',
  },
  introSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  introTitle: {
    color: Colors.text,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  introText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  profileCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  profileTitle: {
    color: Colors.text,
  },
  profileText: {
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  profileValue: {
    color: Colors.text,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  noProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.warningLight,
  },
  noProfileText: {
    color: Colors.warning,
    flex: 1,
  },
  actions: {
    gap: Spacing.sm,
  },
  secondaryAction: {
    marginTop: Spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
  },
  loadingTitle: {
    color: Colors.text,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  selectorContainer: {
    flex: 1,
    paddingHorizontal: Layout.screenPadding,
  },
});
