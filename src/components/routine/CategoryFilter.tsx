import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Typography as Text } from '@/components/common';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ProductCategory } from '@/types/supabase.types';

interface CategoryFilterProps {
  selectedCategory: ProductCategory | null;
  onSelectCategory: (category: ProductCategory | null) => void;
  showAll?: boolean;
}

/**
 * Category icons mapping
 */
const CATEGORY_ICONS: Record<ProductCategory, string> = {
  cleanser: 'water-outline',
  toner: 'flask-outline',
  serum: 'eyedrop-outline',
  moisturizer: 'sunny-outline',
  eye_cream: 'eye-outline',
  treatment: 'medkit-outline',
  sunscreen: 'shield-outline',
  mask: 'flower-outline',
  oil: 'beaker-outline',
};

/**
 * Category display names
 */
const CATEGORY_NAMES: Record<ProductCategory, string> = {
  cleanser: 'Cleanser',
  toner: 'Toner',
  serum: 'Serum',
  moisturizer: 'Moisturizer',
  eye_cream: 'Eye Cream',
  treatment: 'Treatment',
  sunscreen: 'Sunscreen',
  mask: 'Mask',
  oil: 'Facial Oil',
};

/**
 * All product categories in routine order
 */
const CATEGORIES: ProductCategory[] = [
  'cleanser',
  'toner',
  'serum',
  'treatment',
  'moisturizer',
  'eye_cream',
  'sunscreen',
  'mask',
  'oil',
];

/**
 * CategoryFilter Component
 *
 * Implements T087: Build product category filter component
 * Per FR-069: Filter products by category
 *
 * Features:
 * - Horizontal scrolling category chips
 * - Visual selection indicator
 * - "All" option to clear filter
 * - Icons for each category
 */
export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  showAll = true,
}: CategoryFilterProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {showAll && (
          <TouchableOpacity
            style={[
              styles.chip,
              selectedCategory === null && styles.selectedChip,
            ]}
            onPress={() => onSelectCategory(null)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="apps-outline"
              size={16}
              color={selectedCategory === null ? Colors.textInverse : Colors.text}
            />
            <Text
              variant="caption"
              style={[
                styles.chipText,
                selectedCategory === null && styles.selectedChipText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
        )}

        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.chip,
              selectedCategory === category && styles.selectedChip,
            ]}
            onPress={() => onSelectCategory(category)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={CATEGORY_ICONS[category] as any}
              size={16}
              color={
                selectedCategory === category ? Colors.textInverse : Colors.text
              }
            />
            <Text
              variant="caption"
              style={[
                styles.chipText,
                selectedCategory === category && styles.selectedChipText,
              ]}
            >
              {CATEGORY_NAMES[category]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

/**
 * Get category icon name
 */
export function getCategoryIcon(category: ProductCategory): string {
  return CATEGORY_ICONS[category] || 'cube-outline';
}

/**
 * Get category display name
 */
export function getCategoryName(category: ProductCategory): string {
  return CATEGORY_NAMES[category] || category;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.text,
    fontWeight: '500',
  },
  selectedChipText: {
    color: Colors.textInverse,
  },
});

export default CategoryFilter;
