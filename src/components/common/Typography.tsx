import React from 'react';
import { Text, TextStyle, TextProps } from 'react-native';
import { Colors, Typography as TypographyTheme } from '@/constants/theme';

type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'overline';

type TypographyWeight = 'regular' | 'medium' | 'semibold' | 'bold';

type TypographyColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'inverse'
  | 'error'
  | 'success'
  | 'warning';

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  weight?: TypographyWeight;
  color?: TypographyColor;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

const variantStyles: Record<TypographyVariant, TextStyle> = {
  h1: {
    fontSize: TypographyTheme.fontSize['4xl'],
    lineHeight: TypographyTheme.fontSize['4xl'] * TypographyTheme.lineHeight.tight,
    fontWeight: TypographyTheme.fontWeight.bold,
  },
  h2: {
    fontSize: TypographyTheme.fontSize['3xl'],
    lineHeight: TypographyTheme.fontSize['3xl'] * TypographyTheme.lineHeight.tight,
    fontWeight: TypographyTheme.fontWeight.bold,
  },
  h3: {
    fontSize: TypographyTheme.fontSize['2xl'],
    lineHeight: TypographyTheme.fontSize['2xl'] * TypographyTheme.lineHeight.tight,
    fontWeight: TypographyTheme.fontWeight.semibold,
  },
  h4: {
    fontSize: TypographyTheme.fontSize.xl,
    lineHeight: TypographyTheme.fontSize.xl * TypographyTheme.lineHeight.tight,
    fontWeight: TypographyTheme.fontWeight.semibold,
  },
  h5: {
    fontSize: TypographyTheme.fontSize.lg,
    lineHeight: TypographyTheme.fontSize.lg * TypographyTheme.lineHeight.tight,
    fontWeight: TypographyTheme.fontWeight.medium,
  },
  body1: {
    fontSize: TypographyTheme.fontSize.base,
    lineHeight: TypographyTheme.fontSize.base * TypographyTheme.lineHeight.normal,
    fontWeight: TypographyTheme.fontWeight.regular,
  },
  body2: {
    fontSize: TypographyTheme.fontSize.sm,
    lineHeight: TypographyTheme.fontSize.sm * TypographyTheme.lineHeight.normal,
    fontWeight: TypographyTheme.fontWeight.regular,
  },
  caption: {
    fontSize: TypographyTheme.fontSize.xs,
    lineHeight: TypographyTheme.fontSize.xs * TypographyTheme.lineHeight.normal,
    fontWeight: TypographyTheme.fontWeight.regular,
  },
  overline: {
    fontSize: TypographyTheme.fontSize.xs,
    lineHeight: TypographyTheme.fontSize.xs * TypographyTheme.lineHeight.normal,
    fontWeight: TypographyTheme.fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
};

const colorMap: Record<TypographyColor, string> = {
  primary: Colors.text,
  secondary: Colors.textSecondary,
  tertiary: Colors.textTertiary,
  inverse: Colors.textInverse,
  error: Colors.error,
  success: Colors.success,
  warning: Colors.warning,
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  weight,
  color = 'primary',
  align = 'left',
  style,
  children,
  ...props
}) => {
  const textStyles: TextStyle[] = [
    variantStyles[variant],
    { color: colorMap[color] },
    { textAlign: align },
    weight && { fontWeight: TypographyTheme.fontWeight[weight] },
    style as TextStyle,
  ].filter(Boolean) as TextStyle[];

  return (
    <Text style={textStyles} {...props}>
      {children}
    </Text>
  );
};

// Convenience components
export const H1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h1" {...props} />
);

export const H2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h2" {...props} />
);

export const H3: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h3" {...props} />
);

export const H4: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h4" {...props} />
);

export const H5: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h5" {...props} />
);

export const Body1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body1" {...props} />
);

export const Body2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body2" {...props} />
);

export const Caption: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="caption" {...props} />
);

export const Overline: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="overline" {...props} />
);

export default Typography;
