import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface TipsCardProps {
  /**
   * Tips text to display
   */
  tips: string | string[];
  /**
   * Optional title for the tips section
   */
  title?: string;
  /**
   * Icon name from Ionicons
   */
  icon?: keyof typeof Ionicons.glyphMap;
  /**
   * Variant style
   */
  variant?: 'default' | 'info' | 'success';
}

/**
 * Tips Display Component (T100, FR-030)
 *
 * Displays helpful tips and guidance for routine steps.
 * Supports single tip string or array of tips.
 */
export const TipsCard: React.FC<TipsCardProps> = ({
  tips,
  title = 'Tips',
  icon = 'bulb-outline',
  variant = 'default',
}) => {
  const tipsArray = Array.isArray(tips) ? tips : [tips];

  return (
    <View style={[styles.container, styles[`container${capitalize(variant)}`]]}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons
          name={icon}
          size={20}
          color={variant === 'default' ? Colors.primary : Colors[`${variant}Dark` as keyof typeof Colors]}
          style={styles.icon}
        />
        <Text style={[styles.title, styles[`title${capitalize(variant)}`]]}>{title}</Text>
      </View>

      {/* Tips list */}
      <View style={styles.tipsContainer}>
        {tipsArray.map((tip, index) => (
          <View key={index} style={styles.tipRow}>
            <View style={[styles.bullet, styles[`bullet${capitalize(variant)}`]]} />
            <Text style={[styles.tipText, styles[`tipText${capitalize(variant)}`]]}>{tip}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
  },
  containerDefault: {
    backgroundColor: Colors.backgroundMuted,
    borderColor: Colors.border,
  },
  containerInfo: {
    backgroundColor: Colors.infoLight,
    borderColor: Colors.info,
  },
  containerSuccess: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  icon: {
    marginRight: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
  },
  titleDefault: {
    color: Colors.text,
  },
  titleInfo: {
    color: Colors.infoDark,
  },
  titleSuccess: {
    color: Colors.successDark,
  },
  tipsContainer: {
    gap: Spacing.xs,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: Spacing.sm,
  },
  bulletDefault: {
    backgroundColor: Colors.primary,
  },
  bulletInfo: {
    backgroundColor: Colors.info,
  },
  bulletSuccess: {
    backgroundColor: Colors.success,
  },
  tipText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.md,
  },
  tipTextDefault: {
    color: Colors.textMuted,
  },
  tipTextInfo: {
    color: Colors.infoDark,
  },
  tipTextSuccess: {
    color: Colors.successDark,
  },
});
