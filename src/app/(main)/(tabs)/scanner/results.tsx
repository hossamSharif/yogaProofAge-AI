import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Typography as Text, Button, Card } from '@/components/common';
import { Colors, Spacing, BorderRadius, Layout } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkinProfileCard } from '@/components/scanner/SkinProfileCard';
import { ConcernsList } from '@/components/scanner/ConcernsList';
import { useSkinProfile, useProfileStore } from '@/stores/profile.store';
import * as databaseService from '@/services/supabase/database';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';

/**
 * Analysis Results Screen
 *
 * Displays AI skin analysis results with skin type and concerns.
 * Reference: mydeisgn/ai_face_scanner_-_results_&_profile
 *
 * Implements:
 * - FR-013: Display skin profile with type, concerns, and explanations
 */

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ profileId: string }>();
  const { skinProfile, setSkinProfile } = useProfileStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile if we have an ID but no data
  useEffect(() => {
    if (params.profileId && !skinProfile) {
      fetchProfile(params.profileId);
    }
  }, [params.profileId]);

  const fetchProfile = async (profileId: string) => {
    try {
      setIsLoading(true);
      const profile = await databaseService.getSkinProfileById(profileId);
      if (profile) {
        setSkinProfile(profile);
      } else {
        setError('Profile not found');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewFullProfile = () => {
    router.push('/(main)/(tabs)/scanner/profile');
  };

  const handleGenerateRoutine = () => {
    router.push('/(main)/(tabs)/routines/builder');
  };

  const handleScanAgain = () => {
    router.replace('/(main)/(tabs)/scanner/camera');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text variant="body" style={styles.loadingText}>
            Loading your results...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !skinProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={Colors.error} />
          <Text variant="h3" style={styles.errorTitle}>
            Something went wrong
          </Text>
          <Text variant="body" style={styles.errorText}>
            {error || 'Unable to load your skin analysis results'}
          </Text>
          <Button
            title="Try Again"
            variant="primary"
            onPress={handleScanAgain}
          />
        </View>
      </SafeAreaView>
    );
  }

  const confidencePercent = Math.round((skinProfile.analysis_confidence || 0.8) * 100);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Success header */}
        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.successHeader}
        >
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
          </View>
          <Text variant="h2" style={styles.successTitle}>
            Analysis Complete!
          </Text>
          <Text variant="body" style={styles.successSubtitle}>
            Your personalized skin profile is ready
          </Text>
        </Animated.View>

        {/* Skin Profile Card */}
        <Animated.View entering={SlideInUp.duration(500).delay(200)}>
          <SkinProfileCard
            skinProfile={skinProfile}
            onPress={handleViewFullProfile}
            showConfidence
          />
        </Animated.View>

        {/* Analysis Confidence */}
        <Animated.View entering={SlideInUp.duration(500).delay(300)}>
          <Card style={styles.confidenceCard}>
            <View style={styles.confidenceHeader}>
              <Text variant="label">Analysis Confidence</Text>
              <Text variant="h3" style={styles.confidenceValue}>
                {confidencePercent}%
              </Text>
            </View>
            <View style={styles.confidenceBar}>
              <View
                style={[
                  styles.confidenceFill,
                  { width: `${confidencePercent}%` },
                ]}
              />
            </View>
            <Text variant="caption" style={styles.confidenceTip}>
              {confidencePercent >= 80
                ? 'High confidence analysis based on clear image'
                : confidencePercent >= 60
                  ? 'Good confidence - better lighting may improve accuracy'
                  : 'Low confidence - consider retaking in better conditions'}
            </Text>
          </Card>
        </Animated.View>

        {/* Concerns Preview */}
        <Animated.View entering={SlideInUp.duration(500).delay(400)}>
          <View style={styles.concernsSection}>
            <View style={styles.sectionHeader}>
              <Text variant="label">Detected Concerns</Text>
              <Text variant="bodySmall" style={styles.concernsCount}>
                {(skinProfile.concerns as any[])?.length || 0} found
              </Text>
            </View>
            <ConcernsList
              concerns={skinProfile.concerns as any[]}
              compact
            />
          </View>
        </Animated.View>

        {/* Action buttons */}
        <Animated.View
          entering={SlideInUp.duration(500).delay(500)}
          style={styles.actions}
        >
          <Button
            title="Generate My Routine"
            variant="primary"
            onPress={handleGenerateRoutine}
            fullWidth
            leftIcon={<Ionicons name="sparkles" size={20} color={Colors.textInverse} />}
          />
          <Button
            title="View Full Profile"
            variant="outline"
            onPress={handleViewFullProfile}
            fullWidth
          />
          <Button
            title="Take Another Scan"
            variant="ghost"
            onPress={handleScanAgain}
            fullWidth
          />
        </Animated.View>

        {/* What's next */}
        <Card style={styles.nextStepsCard}>
          <Text variant="label" style={styles.nextStepsTitle}>
            What's Next?
          </Text>
          <View style={styles.nextStepsList}>
            <NextStep
              number={1}
              title="Review your profile"
              description="Understand your skin type and concerns"
              icon="document-text-outline"
            />
            <NextStep
              number={2}
              title="Get a personalized routine"
              description="AI-generated face yoga and skincare steps"
              icon="sparkles-outline"
            />
            <NextStep
              number={3}
              title="Track your progress"
              description="Take photos and see your transformation"
              icon="trending-up-outline"
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

interface NextStepProps {
  number: number;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

function NextStep({ number, title, description, icon }: NextStepProps) {
  return (
    <View style={styles.nextStep}>
      <View style={styles.nextStepIcon}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <View style={styles.nextStepContent}>
        <Text variant="bodySmall" style={styles.nextStepTitle}>
          {title}
        </Text>
        <Text variant="caption" style={styles.nextStepDescription}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing['3xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.md,
  },
  errorTitle: {
    color: Colors.text,
    textAlign: 'center',
  },
  errorText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  successHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.success + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  successTitle: {
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  successSubtitle: {
    color: Colors.textSecondary,
  },
  confidenceCard: {
    marginTop: Spacing.lg,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  confidenceValue: {
    color: Colors.primary,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  confidenceTip: {
    color: Colors.textSecondary,
  },
  concernsSection: {
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  concernsCount: {
    color: Colors.textSecondary,
  },
  actions: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  nextStepsCard: {
    marginTop: Spacing.xl,
  },
  nextStepsTitle: {
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  nextStepsList: {
    gap: Spacing.md,
  },
  nextStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  nextStepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextStepContent: {
    flex: 1,
  },
  nextStepTitle: {
    color: Colors.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  nextStepDescription: {
    color: Colors.textSecondary,
  },
});
