import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography as Text, Card, Button } from '@/components/common';
import { Colors, Spacing, Layout, BorderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoutineStore, RoutineOption } from '@/stores/routine.store';
import { useSkinProfile } from '@/stores/profile.store';
import { useAuthStore } from '@/stores/auth.store';
import { getFallbackRoutines } from '@/services/ai/routine-generator';

/**
 * Expert template categories
 */
const TEMPLATE_CATEGORIES = [
  { id: 'morning', name: 'Morning', icon: 'sunny-outline' },
  { id: 'evening', name: 'Evening', icon: 'moon-outline' },
  { id: 'quick', name: 'Quick', icon: 'flash-outline' },
  { id: 'weekend', name: 'Weekend', icon: 'calendar-outline' },
];

/**
 * Expert Templates Screen
 *
 * Implements T081: Create expert templates screen
 * Per plan.md Error Handling Strategy: Offer pre-built templates as fallback
 *
 * Features:
 * - Pre-designed routine templates
 * - Filter by category (morning, evening, quick)
 * - Select and create routine from template
 */
export default function TemplatesScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const skinProfile = useSkinProfile();
  const { createRoutine, createRoutineSteps } = useRoutineStore();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const userId = session?.user?.id;

  // Get fallback templates
  const templates = getFallbackRoutines(skinProfile?.skin_type || 'normal');

  // Filter templates by category if selected
  const filteredTemplates = selectedCategory
    ? templates.filter(t => {
        const title = t.title.toLowerCase();
        if (selectedCategory === 'morning') return title.includes('morning') || title.includes('glow');
        if (selectedCategory === 'evening') return title.includes('evening') || title.includes('night') || title.includes('restore');
        if (selectedCategory === 'quick') return title.includes('quick') || t.estimatedDurationMinutes <= 10;
        if (selectedCategory === 'weekend') return title.includes('weekend') || t.estimatedDurationMinutes >= 15;
        return true;
      })
    : templates;

  const handleSelectTemplate = useCallback(async (template: RoutineOption) => {
    if (!userId) {
      Alert.alert('Sign In Required', 'Please sign in to create a routine.');
      return;
    }

    if (!skinProfile) {
      Alert.alert(
        'Skin Profile Recommended',
        'For best results, complete a face scan first. Do you want to continue anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => createFromTemplate(template) },
        ]
      );
      return;
    }

    await createFromTemplate(template);
  }, [userId, skinProfile]);

  const createFromTemplate = async (template: RoutineOption) => {
    if (!userId) return;

    setIsCreating(true);
    try {
      // Create routine
      const routine = await createRoutine({
        user_id: userId,
        skin_profile_id: skinProfile?.id || '',
        title: template.title,
        description: template.description,
        focus_area: template.focusArea,
        estimated_duration_minutes: template.estimatedDurationMinutes,
        benefits: template.benefits,
        status: 'draft',
        is_ai_generated: false,
      });

      // Create steps
      const stepsToCreate = template.steps.map((step, index) => ({
        step_number: index + 1,
        step_type: step.stepType as 'face_yoga' | 'product_application',
        title: step.title,
        instructions: step.instructions,
        tips: step.tips || null,
        duration_seconds: step.durationSeconds,
        image_url: null,
        video_url: null,
        product_id: null,
        product_amount: step.productAmount || null,
      }));

      await createRoutineSteps(routine.id, stepsToCreate);

      // Navigate to product selection
      router.replace(`/(main)/(tabs)/routines/${routine.id}/products`);
    } catch (error) {
      console.error('Failed to create routine from template:', error);
      Alert.alert('Error', 'Failed to create routine. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text variant="h3">Expert Templates</Text>
        <View style={styles.placeholder} />
      </View>

      <Text variant="body" style={styles.subtitle}>
        Choose from professionally designed routines
      </Text>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        <TouchableOpacity
          style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Ionicons
            name="apps-outline"
            size={16}
            color={!selectedCategory ? Colors.textInverse : Colors.text}
          />
          <Text
            variant="caption"
            style={[styles.categoryText, !selectedCategory && styles.categoryTextActive]}
          >
            All
          </Text>
        </TouchableOpacity>
        {TEMPLATE_CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Ionicons
              name={cat.icon as any}
              size={16}
              color={selectedCategory === cat.id ? Colors.textInverse : Colors.text}
            />
            <Text
              variant="caption"
              style={[styles.categoryText, selectedCategory === cat.id && styles.categoryTextActive]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Templates List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredTemplates.map((template, index) => (
          <Card key={index} style={styles.templateCard}>
            <View style={styles.templateHeader}>
              <View style={styles.templateIcon}>
                <Ionicons name="document-text" size={24} color={Colors.primary} />
              </View>
              <View style={styles.templateInfo}>
                <Text variant="h4" style={styles.templateTitle}>
                  {template.title}
                </Text>
                <View style={styles.templateMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                    <Text variant="caption" style={styles.metaText}>
                      {template.estimatedDurationMinutes} min
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="list-outline" size={14} color={Colors.textSecondary} />
                    <Text variant="caption" style={styles.metaText}>
                      {template.steps.length} steps
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <Text variant="body" style={styles.templateDescription}>
              {template.description}
            </Text>

            <View style={styles.focusBadge}>
              <Text variant="caption" style={styles.focusText}>
                {template.focusArea}
              </Text>
            </View>

            {template.benefits.length > 0 && (
              <View style={styles.benefitsList}>
                {template.benefits.slice(0, 3).map((benefit, bIndex) => (
                  <View key={bIndex} style={styles.benefitItem}>
                    <Ionicons name="checkmark" size={12} color={Colors.success} />
                    <Text variant="caption" style={styles.benefitText}>
                      {benefit}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <Button
              title="Use This Template"
              variant="outline"
              onPress={() => handleSelectTemplate(template)}
              loading={isCreating}
              style={styles.useButton}
            />
          </Card>
        ))}

        {filteredTemplates.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={Colors.textTertiary} />
            <Text variant="body" style={styles.emptyText}>
              No templates found for this category.
            </Text>
          </View>
        )}
      </ScrollView>
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
  subtitle: {
    color: Colors.textSecondary,
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.md,
  },
  categoryScroll: {
    maxHeight: 50,
    marginBottom: Spacing.md,
  },
  categoryContent: {
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    color: Colors.text,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: Colors.textInverse,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.xl,
  },
  templateCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  templateHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateInfo: {
    flex: 1,
  },
  templateTitle: {
    color: Colors.text,
    marginBottom: 4,
  },
  templateMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: Colors.textSecondary,
  },
  templateDescription: {
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  focusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  focusText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  benefitsList: {
    marginBottom: Spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  benefitText: {
    color: Colors.textSecondary,
  },
  useButton: {
    marginTop: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  emptyText: {
    color: Colors.textSecondary,
  },
});
