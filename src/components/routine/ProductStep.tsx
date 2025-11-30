import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Timer } from './Timer';
import { TipsCard } from './TipsCard';
import { Database } from '@/types/supabase.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RoutineStep = Database['public']['Tables']['routine_steps']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

interface ProductStepProps {
  /**
   * Routine step data
   */
  step: RoutineStep;
  /**
   * Product data (if assigned to this step)
   */
  product?: Product | null;
  /**
   * Whether the step is currently active (timer running)
   */
  isActive: boolean;
  /**
   * Callback when step timer completes
   */
  onComplete: () => void;
}

/**
 * Product Application Step Component (T097, FR-027)
 *
 * Displays a skincare product application step with:
 * - Product information
 * - Application instructions
 * - Recommended amount
 * - Tips
 * - Timer for application
 */
export const ProductStep: React.FC<ProductStepProps> = ({
  step,
  product,
  isActive,
  onComplete,
}) => {
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);

  React.useEffect(() => {
    if (isActive) {
      // Start timer after a brief delay
      const timeout = setTimeout(() => setIsTimerActive(true), 1000);
      return () => clearTimeout(timeout);
    } else {
      setIsTimerActive(false);
    }
  }, [isActive]);

  const handleTimerComplete = () => {
    setIsTimerActive(false);
    onComplete();
  };

  // Extract recommended amount from step metadata or use default
  const recommendedAmount = step.product_amount || 'A small amount';

  return (
    <View style={styles.container}>
      {/* Product Image */}
      <View style={styles.productContainer}>
        {product?.image_url ? (
          <Image
            source={{ uri: product.image_url }}
            style={styles.productImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="flask-outline" size={48} color={Colors.textMuted} />
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.category}>{step.product_category || 'Skincare Product'}</Text>
        <Text style={styles.title}>{step.title}</Text>
        {product && (
          <TouchableOpacity
            style={styles.productDetailsButton}
            onPress={() => setShowProductDetails(!showProductDetails)}
          >
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productBrand}>{product.brand}</Text>
            <Ionicons
              name={showProductDetails ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={Colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Product Details (expandable) */}
      {showProductDetails && product && (
        <View style={styles.detailsContainer}>
          {product.description && (
            <Text style={styles.description}>{product.description}</Text>
          )}
          {product.key_ingredients && product.key_ingredients.length > 0 && (
            <View style={styles.ingredientsSection}>
              <Text style={styles.ingredientsLabel}>Key Ingredients:</Text>
              <Text style={styles.ingredientsText}>
                {product.key_ingredients.join(', ')}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Timer */}
      <View style={styles.timerContainer}>
        <Timer
          durationSeconds={step.duration_seconds || 45}
          isActive={isTimerActive}
          onComplete={handleTimerComplete}
          size="md"
        />
      </View>

      {/* Application Instructions */}
      <View style={styles.contentContainer}>
        {/* Recommended Amount */}
        <View style={styles.amountCard}>
          <Ionicons name="water-outline" size={20} color={Colors.primary} />
          <View style={styles.amountTextContainer}>
            <Text style={styles.amountLabel}>Recommended Amount</Text>
            <Text style={styles.amountText}>{recommendedAmount}</Text>
          </View>
        </View>

        {/* Instructions */}
        {step.instructions && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsLabel}>Application Method:</Text>
            <Text style={styles.instructionsText}>{step.instructions}</Text>
          </View>
        )}

        {/* Tips */}
        {step.tips && (
          <View style={styles.tipsContainer}>
            <TipsCard
              tips={step.tips}
              title="Application Tips"
              icon="sparkles-outline"
              variant="info"
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  productContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.backgroundMuted,
  },
  productImage: {
    width: 160,
    height: 160,
    borderRadius: BorderRadius.lg,
  },
  placeholderImage: {
    width: 160,
    height: 160,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  infoContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.xs,
    alignItems: 'center',
  },
  category: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  productDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  productName: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
  },
  productBrand: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },
  detailsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.backgroundMuted,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  description: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    lineHeight: Typography.lineHeight.md,
  },
  ingredientsSection: {
    gap: Spacing.xxs,
  },
  ingredientsLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textMuted,
  },
  ingredientsText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text,
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  amountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  amountTextContainer: {
    flex: 1,
  },
  amountLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primaryDark,
  },
  amountText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
  },
  instructionsContainer: {
    gap: Spacing.xs,
  },
  instructionsLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textMuted,
  },
  instructionsText: {
    fontSize: Typography.fontSize.md,
    lineHeight: Typography.lineHeight.lg,
    color: Colors.text,
  },
  tipsContainer: {
    marginTop: Spacing.sm,
  },
});
