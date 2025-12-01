import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { ComparisonResult, ChangeArea } from '@/services/ai/photo-comparison';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

/**
 * Comparison Results Component (T119)
 *
 * Displays AI photo comparison results with side-by-side images
 * and annotated change areas
 *
 * Implements FR-057: Display comparison results with highlighted changes
 */

interface ComparisonResultsProps {
  result: ComparisonResult;
  beforeImageUri: string;
  afterImageUri: string;
  beforeDate: string;
  afterDate: string;
}

export const ComparisonResults: React.FC<ComparisonResultsProps> = ({
  result,
  beforeImageUri,
  afterImageUri,
  beforeDate,
  afterDate,
}) => {
  return (
    <ScrollView style={styles.container}>
      {/* Overall Assessment */}
      <View style={styles.section}>
        <View style={[styles.assessmentBadge, styles[`assessment_${result.overallAssessment}`]]}>
          <Text style={styles.assessmentText}>
            {getAssessmentLabel(result.overallAssessment)}
          </Text>
        </View>

        <Text style={styles.summary}>{result.summary}</Text>

        <Text style={styles.metadata}>
          {result.daysBetween} days between photos • Confidence: {Math.round(result.confidenceScore * 100)}%
        </Text>
      </View>

      {/* Side-by-Side Images */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Before & After</Text>
        <View style={styles.imagesContainer}>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: beforeImageUri }} style={styles.image} resizeMode="cover" />
            <Text style={styles.imageLabel}>{formatDate(beforeDate)}</Text>
          </View>

          <View style={styles.imageWrapper}>
            <Image source={{ uri: afterImageUri }} style={styles.image} resizeMode="cover" />
            <Text style={styles.imageLabel}>{formatDate(afterDate)}</Text>
          </View>
        </View>
      </View>

      {/* Change Areas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detected Changes</Text>

        {result.changeAreas.length === 0 ? (
          <Text style={styles.noChanges}>No significant changes detected</Text>
        ) : (
          result.changeAreas.map((change, index) => (
            <ChangeAreaCard key={index} change={change} />
          ))
        )}
      </View>

      {/* Statistics Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.statsContainer}>
          <StatItem
            label="Improvements"
            count={result.changeAreas.filter(c => c.type === 'improvement').length}
            color={Colors.success}
          />
          <StatItem
            label="Concerns"
            count={result.changeAreas.filter(c => c.type === 'concern').length}
            color={Colors.error}
          />
          <StatItem
            label="Stable Areas"
            count={result.changeAreas.filter(c => c.type === 'neutral').length}
            color={Colors.textSecondary}
          />
        </View>
      </View>
    </ScrollView>
  );
};

/**
 * Change Area Card Component
 */
const ChangeAreaCard: React.FC<{ change: ChangeArea }> = ({ change }) => {
  return (
    <View style={[styles.changeCard, styles[`changeCard_${change.type}`]]}>
      <View style={styles.changeHeader}>
        <Text style={styles.changeType}>{getChangeIcon(change.type)}</Text>
        <View style={styles.changeInfo}>
          <Text style={styles.changeArea}>{change.area}</Text>
          <Text style={styles.changeCategory}>{formatCategory(change.category)}</Text>
        </View>
        <View style={[styles.severityBadge, styles[`severity_${change.severity}`]]}>
          <Text style={styles.severityText}>{change.severity}</Text>
        </View>
      </View>
      <Text style={styles.changeDescription}>{change.description}</Text>
    </View>
  );
};

/**
 * Stat Item Component
 */
const StatItem: React.FC<{ label: string; count: number; color: string }> = ({
  label,
  count,
  color,
}) => {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statCount, { color }]}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

// Helper functions
function getAssessmentLabel(assessment: ComparisonResult['overallAssessment']): string {
  switch (assessment) {
    case 'improved':
      return '✓ Improvement Detected';
    case 'stable':
      return '= Stable Condition';
    case 'worsened':
      return '⚠ Some Concerns';
    case 'inconclusive':
      return '? Inconclusive';
    default:
      return assessment;
  }
}

function getChangeIcon(type: ChangeArea['type']): string {
  switch (type) {
    case 'improvement':
      return '↑';
    case 'concern':
      return '↓';
    case 'neutral':
      return '→';
    default:
      return '•';
  }
}

function formatCategory(category: string): string {
  return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  assessmentBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  assessment_improved: {
    backgroundColor: Colors.successLight,
  },
  assessment_stable: {
    backgroundColor: Colors.primaryLight,
  },
  assessment_worsened: {
    backgroundColor: Colors.errorLight,
  },
  assessment_inconclusive: {
    backgroundColor: Colors.surfaceVariant,
  },
  assessmentText: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  summary: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  metadata: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  imagesContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  imageWrapper: {
    flex: 1,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceVariant,
  },
  imageLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  noChanges: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: Spacing.xl,
  },
  changeCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
  },
  changeCard_improvement: {
    backgroundColor: Colors.successLight,
    borderLeftColor: Colors.success,
  },
  changeCard_concern: {
    backgroundColor: Colors.errorLight,
    borderLeftColor: Colors.error,
  },
  changeCard_neutral: {
    backgroundColor: Colors.surfaceVariant,
    borderLeftColor: Colors.textSecondary,
  },
  changeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  changeType: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  changeInfo: {
    flex: 1,
  },
  changeArea: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  changeCategory: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  severityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  severity_subtle: {
    backgroundColor: Colors.surfaceVariant,
  },
  severity_noticeable: {
    backgroundColor: Colors.warning,
  },
  severity_significant: {
    backgroundColor: Colors.primary,
  },
  severityText: {
    ...Typography.caption,
    color: Colors.textInverse,
    fontWeight: 'bold',
  },
  changeDescription: {
    ...Typography.bodySmall,
    color: Colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statCount: {
    ...Typography.h2,
    fontWeight: 'bold',
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
