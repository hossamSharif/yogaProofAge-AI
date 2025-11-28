import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Typography as Text, Card, Button } from '@/components/common';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { RoutineOption } from '@/stores/routine.store';

interface RoutineSelectorProps {
  options: RoutineOption[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

/**
 * RoutineSelector Component
 *
 * Implements T083: Build routine option selector component (3-5 options)
 * Per FR-015: Users can select from 3-5 generated routine options
 *
 * Features:
 * - Displays all generated routine options
 * - Visual selection indicator
 * - Shows key details for comparison
 * - Confirm button when option selected
 */
export function RoutineSelector({
  options,
  selectedIndex,
  onSelect,
  onConfirm,
  isLoading = false,
}: RoutineSelectorProps) {
  return (
    <View style={styles.container}>
      <Text variant="h3" style={styles.title}>
        Choose Your Routine
      </Text>
      <Text variant="body" style={styles.subtitle}>
        We've created {options.length} personalized routines for you. Select one to get started.
      </Text>

      <ScrollView
        style={styles.optionsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.optionsContent}
      >
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onSelect(index)}
            activeOpacity={0.7}
          >
            <Card
              style={[
                styles.optionCard,
                selectedIndex === index && styles.selectedCard,
              ]}
            >
              <View style={styles.optionHeader}>
                <View style={styles.optionTitleRow}>
                  <Text variant="h4" style={styles.optionTitle} numberOfLines={1}>
                    {option.title}
                  </Text>
                  {selectedIndex === index && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark" size={16} color={Colors.textInverse} />
                    </View>
                  )}
                </View>
                <View style={styles.focusBadge}>
                  <Text variant="caption" style={styles.focusText}>
                    {option.focusArea}
                  </Text>
                </View>
              </View>

              <Text variant="body" style={styles.description} numberOfLines={2}>
                {option.description}
              </Text>

              <View style={styles.stats}>
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                  <Text variant="caption" style={styles.statText}>
                    {option.estimatedDurationMinutes} min
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="list-outline" size={16} color={Colors.textSecondary} />
                  <Text variant="caption" style={styles.statText}>
                    {option.steps.length} steps
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="sparkles-outline" size={16} color={Colors.textSecondary} />
                  <Text variant="caption" style={styles.statText}>
                    {option.steps.filter(s => s.stepType === 'face_yoga').length} exercises
                  </Text>
                </View>
              </View>

              {option.benefits.length > 0 && (
                <View style={styles.benefitsSection}>
                  <Text variant="caption" style={styles.benefitsLabel}>
                    Benefits:
                  </Text>
                  <View style={styles.benefitsList}>
                    {option.benefits.slice(0, 3).map((benefit, bIndex) => (
                      <View key={bIndex} style={styles.benefitItem}>
                        <View style={styles.benefitDot} />
                        <Text variant="caption" style={styles.benefitText} numberOfLines={1}>
                          {benefit}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {selectedIndex === index && (
                <View style={styles.stepsPreview}>
                  <Text variant="caption" style={styles.stepsPreviewLabel}>
                    Steps Preview:
                  </Text>
                  {option.steps.slice(0, 4).map((step, sIndex) => (
                    <View key={sIndex} style={styles.stepPreviewItem}>
                      <View
                        style={[
                          styles.stepTypeIcon,
                          step.stepType === 'face_yoga'
                            ? styles.faceYogaIcon
                            : styles.productIcon,
                        ]}
                      >
                        <Ionicons
                          name={step.stepType === 'face_yoga' ? 'fitness' : 'water'}
                          size={12}
                          color={Colors.textInverse}
                        />
                      </View>
                      <Text variant="caption" style={styles.stepPreviewText} numberOfLines={1}>
                        {step.title}
                      </Text>
                      <Text variant="caption" style={styles.stepDuration}>
                        {Math.round(step.durationSeconds / 60)}m
                      </Text>
                    </View>
                  ))}
                  {option.steps.length > 4 && (
                    <Text variant="caption" style={styles.moreSteps}>
                      +{option.steps.length - 4} more steps
                    </Text>
                  )}
                </View>
              )}
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={selectedIndex !== null ? 'Use This Routine' : 'Select a Routine'}
          variant="primary"
          onPress={onConfirm}
          disabled={selectedIndex === null}
          loading={isLoading}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  optionsList: {
    flex: 1,
  },
  optionsContent: {
    paddingBottom: Spacing.xl,
  },
  optionCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  optionHeader: {
    marginBottom: Spacing.sm,
  },
  optionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  optionTitle: {
    color: Colors.text,
    flex: 1,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  focusText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  description: {
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: Colors.textSecondary,
  },
  benefitsSection: {
    marginTop: Spacing.xs,
  },
  benefitsLabel: {
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  benefitsList: {
    gap: 2,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  benefitDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.success,
  },
  benefitText: {
    color: Colors.textSecondary,
    flex: 1,
  },
  stepsPreview: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  stepsPreviewLabel: {
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  stepPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 6,
  },
  stepTypeIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceYogaIcon: {
    backgroundColor: Colors.secondary,
  },
  productIcon: {
    backgroundColor: Colors.primary,
  },
  stepPreviewText: {
    color: Colors.text,
    flex: 1,
  },
  stepDuration: {
    color: Colors.textSecondary,
  },
  moreSteps: {
    color: Colors.primary,
    marginTop: 4,
  },
  footer: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});

export default RoutineSelector;
