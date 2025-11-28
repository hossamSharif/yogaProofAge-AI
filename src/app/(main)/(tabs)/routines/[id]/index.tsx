import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Typography as Text, Button, Card } from '@/components/common';
import { Colors, Spacing, Layout, BorderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoutineStore, useActiveRoutineSteps, RoutineStepWithProduct } from '@/stores/routine.store';
import { useAuthStore } from '@/stores/auth.store';
import * as databaseService from '@/services/supabase/database';
import { Database } from '@/types/supabase.types';

type Routine = Database['public']['Tables']['routines']['Row'];

/**
 * Routine Detail Screen
 *
 * Implements T084: Create routine detail screen showing steps
 * Per FR-016-FR-018: Display routine details with steps and activation
 *
 * Features:
 * - Routine overview (title, focus, duration, benefits)
 * - Step-by-step list with type indicators
 * - Activate routine button
 * - Navigate to product selection
 * - Start routine player
 */
export default function RoutineDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuthStore();
  const { fetchRoutineSteps, activateRoutine } = useRoutineStore();
  const steps = useActiveRoutineSteps();

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);

  const userId = session?.user?.id;

  // Fetch routine and steps
  useEffect(() => {
    const loadRoutine = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const routineData = await databaseService.getRoutineById(id);
        setRoutine(routineData);

        if (routineData) {
          await fetchRoutineSteps(id);
        }
      } catch (error) {
        console.error('Failed to load routine:', error);
        Alert.alert('Error', 'Failed to load routine details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadRoutine();
  }, [id]);

  const handleRefresh = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const routineData = await databaseService.getRoutineById(id);
      setRoutine(routineData);
      if (routineData) {
        await fetchRoutineSteps(id);
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const handleActivate = useCallback(async () => {
    if (!userId || !id) return;

    Alert.alert(
      'Activate Routine',
      'This will set this routine as your active routine. Your current active routine will be archived.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate',
          onPress: async () => {
            setIsActivating(true);
            try {
              await activateRoutine(id, userId);
              setRoutine(prev => prev ? { ...prev, status: 'active' } : null);
              Alert.alert('Success', 'Routine activated!');
            } catch (error) {
              Alert.alert('Error', 'Failed to activate routine.');
            } finally {
              setIsActivating(false);
            }
          },
        },
      ]
    );
  }, [userId, id]);

  const handleStartPlayer = () => {
    router.push(`/(main)/(tabs)/routines/${id}/player`);
  };

  const handleEditProducts = () => {
    router.push(`/(main)/(tabs)/routines/${id}/products`);
  };

  const handleBack = () => {
    router.back();
  };

  // Check if routine needs products assigned
  const productSteps = steps.filter(s => s.step_type === 'product_application');
  const missingProducts = productSteps.filter(s => !s.product_id);
  const needsProducts = missingProducts.length > 0;

  const benefits = routine?.benefits ? (routine.benefits as string[]) : [];

  const getStepIcon = (stepType: string) => {
    return stepType === 'face_yoga' ? 'fitness' : 'water';
  };

  const getStepColor = (stepType: string) => {
    return stepType === 'face_yoga' ? Colors.secondary : Colors.primary;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text variant="body" style={styles.loadingText}>Loading routine...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!routine) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text variant="h3">Routine Not Found</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle" size={48} color={Colors.textTertiary} />
          <Text variant="body" style={styles.emptyText}>
            This routine could not be found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text variant="h3" numberOfLines={1} style={styles.headerTitle}>
          {routine.title}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Status Badge */}
        <View style={styles.statusRow}>
          <View style={[
            styles.statusBadge,
            routine.status === 'active' && styles.activeBadge,
            routine.status === 'draft' && styles.draftBadge,
            routine.status === 'archived' && styles.archivedBadge,
          ]}>
            <Text variant="caption" style={styles.statusText}>
              {routine.status.toUpperCase()}
            </Text>
          </View>
          {routine.is_ai_generated && (
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={12} color={Colors.primary} />
              <Text variant="caption" style={styles.aiText}>AI Generated</Text>
            </View>
          )}
        </View>

        {/* Overview Card */}
        <Card style={styles.overviewCard}>
          <View style={styles.overviewRow}>
            <View style={styles.overviewItem}>
              <Ionicons name="flag" size={20} color={Colors.primary} />
              <Text variant="caption" style={styles.overviewLabel}>Focus</Text>
              <Text variant="body" style={styles.overviewValue}>{routine.focus_area}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Ionicons name="time" size={20} color={Colors.primary} />
              <Text variant="caption" style={styles.overviewLabel}>Duration</Text>
              <Text variant="body" style={styles.overviewValue}>{routine.estimated_duration_minutes} min</Text>
            </View>
            <View style={styles.overviewItem}>
              <Ionicons name="list" size={20} color={Colors.primary} />
              <Text variant="caption" style={styles.overviewLabel}>Steps</Text>
              <Text variant="body" style={styles.overviewValue}>{steps.length}</Text>
            </View>
          </View>
        </Card>

        {/* Description */}
        {routine.description && (
          <Text variant="body" style={styles.description}>
            {routine.description}
          </Text>
        )}

        {/* Benefits */}
        {benefits.length > 0 && (
          <View style={styles.benefitsSection}>
            <Text variant="h4" style={styles.sectionTitle}>Benefits</Text>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text variant="body" style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Products Warning */}
        {needsProducts && (
          <TouchableOpacity onPress={handleEditProducts} activeOpacity={0.7}>
            <Card style={styles.warningCard}>
              <Ionicons name="warning" size={24} color={Colors.warning} />
              <View style={styles.warningContent}>
                <Text variant="body" style={styles.warningTitle}>
                  Products Needed
                </Text>
                <Text variant="caption" style={styles.warningText}>
                  {missingProducts.length} step(s) need products assigned. Tap to add products.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.warning} />
            </Card>
          </TouchableOpacity>
        )}

        {/* Steps Section */}
        <View style={styles.stepsSection}>
          <View style={styles.stepsSectionHeader}>
            <Text variant="h4" style={styles.sectionTitle}>Steps</Text>
            <TouchableOpacity onPress={handleEditProducts}>
              <Text variant="caption" style={styles.editLink}>Edit Products</Text>
            </TouchableOpacity>
          </View>

          {steps.map((step, index) => (
            <View key={step.id} style={styles.stepItem}>
              <View style={[styles.stepIcon, { backgroundColor: getStepColor(step.step_type) }]}>
                <Ionicons
                  name={getStepIcon(step.step_type) as any}
                  size={16}
                  color={Colors.textInverse}
                />
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <Text variant="body" style={styles.stepTitle} numberOfLines={1}>
                    {step.title}
                  </Text>
                  <Text variant="caption" style={styles.stepDuration}>
                    {Math.round(step.duration_seconds / 60)}m
                  </Text>
                </View>
                <Text variant="caption" style={styles.stepType}>
                  {step.step_type === 'face_yoga' ? 'Face Yoga' : 'Product Application'}
                </Text>
                {step.step_type === 'product_application' && (
                  <Text
                    variant="caption"
                    style={[styles.productInfo, !step.product_id && styles.missingProduct]}
                  >
                    {step.product_id ? 'Product assigned' : 'No product assigned'}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        {routine.status !== 'active' && (
          <Button
            title="Activate Routine"
            variant="outline"
            onPress={handleActivate}
            loading={isActivating}
            style={styles.activateButton}
          />
        )}
        <Button
          title="Start Routine"
          variant="primary"
          onPress={handleStartPlayer}
          leftIcon={<Ionicons name="play" size={20} color={Colors.textInverse} />}
          disabled={needsProducts}
          style={styles.startButton}
        />
      </View>
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyText: {
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.xl,
  },
  statusRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.backgroundSecondary,
  },
  activeBadge: {
    backgroundColor: Colors.successLight,
  },
  draftBadge: {
    backgroundColor: Colors.warningLight,
  },
  archivedBadge: {
    backgroundColor: Colors.backgroundSecondary,
  },
  statusText: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 10,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primaryLight,
  },
  aiText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  overviewCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overviewItem: {
    alignItems: 'center',
    gap: 4,
  },
  overviewLabel: {
    color: Colors.textSecondary,
  },
  overviewValue: {
    color: Colors.text,
    fontWeight: '600',
  },
  description: {
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  benefitsSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  benefitText: {
    color: Colors.textSecondary,
    flex: 1,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.warningLight,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    color: Colors.warning,
    fontWeight: '600',
  },
  warningText: {
    color: Colors.warning,
  },
  stepsSection: {
    marginBottom: Spacing.lg,
  },
  stepsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  editLink: {
    color: Colors.primary,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    color: Colors.text,
    fontWeight: '500',
    flex: 1,
  },
  stepDuration: {
    color: Colors.textSecondary,
  },
  stepType: {
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  productInfo: {
    color: Colors.success,
    marginTop: 2,
  },
  missingProduct: {
    color: Colors.warning,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  activateButton: {
    flex: 1,
  },
  startButton: {
    flex: 1,
  },
});
