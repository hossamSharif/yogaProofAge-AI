import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { Typography as Text, Card, Button } from '@/components/common';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Database } from '@/types/supabase.types';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  onInsightsPress?: () => void;
  onSearchPress?: () => void;
  isSelected?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

/**
 * ProductCard Component
 *
 * Implements T086: Build product card component with AI insights button and online search button
 * Per FR-021: Display product details with actionable buttons
 *
 * Features:
 * - Product image, name, brand, category display
 * - AI Insights button for personalized suitability (FR-067)
 * - Online search button for purchase options (FR-068)
 * - Selection state for routine assignment
 */
export function ProductCard({
  product,
  onPress,
  onInsightsPress,
  onSearchPress,
  isSelected = false,
  showActions = true,
  compact = false,
}: ProductCardProps) {
  const handleOnlineSearch = () => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      // Default: Open Google search for the product
      const searchQuery = encodeURIComponent(`${product.name} ${product.brand} buy`);
      Linking.openURL(`https://www.google.com/search?q=${searchQuery}`);
    }
  };

  const skinTypes = Array.isArray(product.skin_types) ? product.skin_types as string[] : [];
  const benefits = Array.isArray(product.benefits) ? product.benefits as string[] : [];

  if (compact) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Card style={[styles.compactContainer, isSelected && styles.selectedContainer]}>
          <View style={styles.compactContent}>
            {product.image_url && (
              <Image
                source={{ uri: product.image_url }}
                style={styles.compactImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.compactInfo}>
              <Text variant="body" style={styles.compactName} numberOfLines={1}>
                {product.name}
              </Text>
              <Text variant="caption" style={styles.brand}>
                {product.brand}
              </Text>
            </View>
            {isSelected && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark" size={16} color={Colors.textInverse} />
              </View>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={[styles.container, isSelected && styles.selectedContainer]}>
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark" size={14} color={Colors.textInverse} />
            <Text variant="caption" style={styles.selectedText}>
              Selected
            </Text>
          </View>
        )}

        <View style={styles.content}>
          {product.image_url && (
            <Image
              source={{ uri: product.image_url }}
              style={styles.image}
              resizeMode="cover"
            />
          )}

          <View style={styles.info}>
            <View style={styles.categoryBadge}>
              <Text variant="caption" style={styles.categoryText}>
                {product.category.replace('_', ' ')}
              </Text>
            </View>

            <Text variant="h4" style={styles.name} numberOfLines={2}>
              {product.name}
            </Text>

            <Text variant="body" style={styles.brand}>
              {product.brand}
            </Text>

            {skinTypes.length > 0 && (
              <View style={styles.skinTypes}>
                <Text variant="caption" style={styles.skinTypesLabel}>
                  Good for:{' '}
                </Text>
                <Text variant="caption" style={styles.skinTypesValue}>
                  {skinTypes.slice(0, 3).join(', ')}
                </Text>
              </View>
            )}

            {benefits.length > 0 && (
              <View style={styles.benefitsPreview}>
                {benefits.slice(0, 2).map((benefit, index) => (
                  <View key={index} style={styles.benefitTag}>
                    <Text variant="caption" style={styles.benefitTagText}>
                      {benefit}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {showActions && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onInsightsPress}
              activeOpacity={0.7}
            >
              <Ionicons name="sparkles" size={18} color={Colors.primary} />
              <Text variant="caption" style={styles.actionButtonText}>
                AI Insights
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleOnlineSearch}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={18} color={Colors.primary} />
              <Text variant="caption" style={styles.actionButtonText}>
                Find Online
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

/**
 * Open Beauty Facts Attribution Footer
 *
 * Implements T074: Add Open Beauty Facts attribution footer
 * Per product-data-source.md: Display attribution with logo and link
 */
export function OpenBeautyFactsAttribution() {
  const handlePress = () => {
    Linking.openURL('https://world.openbeautyfacts.org/');
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.attribution}>
        <Text variant="caption" style={styles.attributionText}>
          Product data powered by{' '}
          <Text variant="caption" style={styles.attributionLink}>
            Open Beauty Facts
          </Text>
        </Text>
        <Ionicons
          name="open-outline"
          size={12}
          color={Colors.textSecondary}
          style={styles.attributionIcon}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedContainer: {
    borderColor: Colors.primary,
  },
  selectedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderBottomLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
  },
  selectedText: {
    color: Colors.textInverse,
    fontWeight: '600',
  },
  content: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundSecondary,
  },
  info: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  categoryText: {
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  name: {
    color: Colors.text,
    marginBottom: 2,
  },
  brand: {
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  skinTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.xs,
  },
  skinTypesLabel: {
    color: Colors.textSecondary,
  },
  skinTypesValue: {
    color: Colors.text,
    textTransform: 'capitalize',
  },
  benefitsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  benefitTag: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  benefitTagText: {
    color: Colors.success,
    fontSize: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
  },
  actionButtonText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  // Compact styles
  compactContainer: {
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  compactImage: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.backgroundSecondary,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    color: Colors.text,
    fontWeight: '500',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Attribution styles
  attribution: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: 4,
  },
  attributionText: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  attributionLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  attributionIcon: {
    marginLeft: 2,
  },
});

export default ProductCard;
