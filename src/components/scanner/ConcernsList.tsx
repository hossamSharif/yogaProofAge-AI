import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Typography as Text, Card } from '@/components/common';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

/**
 * Concerns List Component
 *
 * Displays detected skin concerns with severity and explanations.
 *
 * Implements:
 * - FR-012: Skin concerns identification with explanations
 * - T065: Build ConcernsList component
 */

export interface SkinConcern {
  type: string;
  severity: 'mild' | 'moderate' | 'severe';
  areas: string[];
  explanation?: string;
}

interface ConcernsListProps {
  concerns: SkinConcern[];
  compact?: boolean;
  showExplanations?: boolean;
}

const concernIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  fine_lines: 'git-branch-outline',
  wrinkles: 'git-commit-outline',
  dark_spots: 'ellipse',
  uneven_tone: 'color-palette-outline',
  acne: 'alert-circle-outline',
  large_pores: 'grid-outline',
  dryness: 'sunny-outline',
  oiliness: 'water-outline',
  redness: 'flame-outline',
  sensitivity: 'alert-outline',
  dullness: 'cloudy-outline',
  texture: 'layers-outline',
  dark_circles: 'moon-outline',
  sagging: 'arrow-down-outline',
  dehydration: 'water-outline',
};

const severityConfig = {
  mild: {
    color: Colors.success,
    label: 'Mild',
    bgColor: Colors.success + '15',
  },
  moderate: {
    color: Colors.warning,
    label: 'Moderate',
    bgColor: Colors.warning + '15',
  },
  severe: {
    color: Colors.error,
    label: 'Severe',
    bgColor: Colors.error + '15',
  },
};

export function ConcernsList({
  concerns,
  compact = false,
  showExplanations = false,
}: ConcernsListProps) {
  if (!concerns || concerns.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
        <Text variant="body" style={styles.emptyText}>
          No significant concerns detected!
        </Text>
        <Text variant="caption" style={styles.emptySubtext}>
          Your skin looks healthy. Keep up the good work!
        </Text>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      {concerns.map((concern, index) => (
        <ConcernItem
          key={`${concern.type}-${index}`}
          concern={concern}
          index={index}
          compact={compact}
          showExplanation={showExplanations}
        />
      ))}
    </View>
  );
}

interface ConcernItemProps {
  concern: SkinConcern;
  index: number;
  compact: boolean;
  showExplanation: boolean;
}

function ConcernItem({ concern, index, compact, showExplanation }: ConcernItemProps) {
  const [expanded, setExpanded] = useState(showExplanation);
  const rotateValue = useSharedValue(showExplanation ? 1 : 0);

  const icon = concernIcons[concern.type] || 'help-circle-outline';
  const severity = severityConfig[concern.severity] || severityConfig.moderate;
  const displayName = concern.type?.replace(/_/g, ' ') || 'Unknown';

  const toggleExpand = () => {
    rotateValue.value = withTiming(expanded ? 0 : 1, { duration: 200 });
    setExpanded(!expanded);
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateValue.value * 180}deg` }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(300).delay(index * 50)}
    >
      <Card style={[styles.concernCard, compact && styles.concernCardCompact]}>
        <TouchableOpacity
          style={styles.concernHeader}
          onPress={toggleExpand}
          activeOpacity={0.7}
        >
          <View style={styles.concernInfo}>
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: severity.bgColor }]}>
              <Ionicons name={icon} size={compact ? 18 : 22} color={severity.color} />
            </View>

            {/* Name and severity */}
            <View style={styles.concernDetails}>
              <Text
                variant={compact ? 'bodySmall' : 'label'}
                style={styles.concernName}
              >
                {displayName}
              </Text>
              <View style={styles.severityRow}>
                <View style={[styles.severityBadge, { backgroundColor: severity.bgColor }]}>
                  <View style={[styles.severityDot, { backgroundColor: severity.color }]} />
                  <Text variant="caption" style={[styles.severityText, { color: severity.color }]}>
                    {severity.label}
                  </Text>
                </View>
                {concern.areas && concern.areas.length > 0 && (
                  <Text variant="caption" style={styles.areasText}>
                    {concern.areas.join(', ')}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Expand chevron */}
          {concern.explanation && (
            <Animated.View style={chevronStyle}>
              <Ionicons name="chevron-down" size={20} color={Colors.textTertiary} />
            </Animated.View>
          )}
        </TouchableOpacity>

        {/* Explanation */}
        {expanded && concern.explanation && (
          <View style={styles.explanationContainer}>
            <Text variant="bodySmall" style={styles.explanationText}>
              {concern.explanation}
            </Text>
          </View>
        )}
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    color: Colors.text,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  concernCard: {
    padding: 0,
    overflow: 'hidden',
  },
  concernCardCompact: {
    // Compact mode adjustments
  },
  concernHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  concernInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  concernDetails: {
    flex: 1,
  },
  concernName: {
    color: Colors.text,
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  severityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '500',
  },
  areasText: {
    color: Colors.textSecondary,
    textTransform: 'capitalize',
    fontSize: 11,
  },
  explanationContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    marginTop: 0,
  },
  explanationText: {
    color: Colors.textSecondary,
    lineHeight: 20,
    paddingTop: Spacing.sm,
  },
});

export default ConcernsList;
