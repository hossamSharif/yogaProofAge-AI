import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';

type CardVariant = 'elevated' | 'outlined' | 'filled';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: TouchableOpacityProps['onPress'];
  style?: ViewStyle;
  padding?: keyof typeof Spacing | number;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  onPress,
  style,
  padding = 'md',
}) => {
  const paddingValue = typeof padding === 'number' ? padding : Spacing[padding];

  const cardStyles: ViewStyle[] = [
    styles.base,
    styles[variant],
    { padding: paddingValue },
    style,
  ].filter(Boolean) as ViewStyle[];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  elevated: {
    backgroundColor: Colors.surface,
    ...Shadows.md,
  },
  outlined: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filled: {
    backgroundColor: Colors.backgroundSecondary,
  },
});

export default Card;
