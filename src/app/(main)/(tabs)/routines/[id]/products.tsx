import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Typography as Text, Button, Card } from '@/components/common';
import {
  ProductCard,
  CategoryFilter,
  ProductInsightModal,
  OpenBeautyFactsAttribution,
} from '@/components/routine';
import { Colors, Spacing, Layout, BorderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoutineStore, useActiveRoutineSteps } from '@/stores/routine.store';
import { useSkinProfile } from '@/stores/profile.store';
import { useAuthStore } from '@/stores/auth.store';
import * as databaseService from '@/services/supabase/database';
import { getProductInsight, getFallbackInsight } from '@/services/ai/product-insights';
import { Database, ProductCategory } from '@/types/supabase.types';

type Product = Database['public']['Tables']['products']['Row'];
type RoutineStep = Database['public']['Tables']['routine_steps']['Row'];

interface StepProductSelection {
  stepId: string;
  stepTitle: string;
  stepNumber: number;
  productCategory: string | null;
  selectedProductId: string | null;
}

/**
 * Product Selection Screen
 *
 * Implements T085: Create product selection screen with category filters
 * Per FR-019-FR-023: Select products for routine steps
 *
 * Features:
 * - List of product application steps needing products
 * - Category-filtered product browsing
 * - AI insights for product suitability (FR-067)
 * - Online search integration (FR-068)
 * - Product selection validation (FR-022)
 */
export default function ProductSelectionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuthStore();
  const skinProfile = useSkinProfile();
  const { fetchRoutineSteps } = useRoutineStore();
  const steps = useActiveRoutineSteps();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [selections, setSelections] = useState<Map<string, string>>(new Map());
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Insight modal state
  const [insightProduct, setInsightProduct] = useState<Product | null>(null);
  const [insightData, setInsightData] = useState<any>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  // Filter product application steps
  const productSteps = steps.filter(s => s.step_type === 'product_application');

  // Current step being configured
  const currentStep = productSteps[activeStepIndex];

  // Load routine steps on mount
  useEffect(() => {
    if (id) {
      fetchRoutineSteps(id);
    }
  }, [id]);

  // Initialize selections from existing step products
  useEffect(() => {
    const initialSelections = new Map<string, string>();
    productSteps.forEach(step => {
      if (step.product_id) {
        initialSelections.set(step.id, step.product_id);
      }
    });
    setSelections(initialSelections);

    // Set initial category filter based on first step
    if (productSteps.length > 0 && !selectedCategory) {
      const firstStep = productSteps[0];
      // Map step title to category
      const category = inferCategoryFromStep(firstStep);
      setSelectedCategory(category);
    }
  }, [steps]);

  // Load products when category changes
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const filters: { category?: string; isAvailable?: boolean } = {
          isAvailable: true,
        };
        if (selectedCategory) {
          filters.category = selectedCategory;
        }
        const data = await databaseService.getProducts(filters);
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, [selectedCategory]);

  // Infer category from step info
  const inferCategoryFromStep = (step: RoutineStep): ProductCategory => {
    const title = step.title.toLowerCase();
    if (title.includes('cleans')) return 'cleanser';
    if (title.includes('toner') || title.includes('tonic')) return 'toner';
    if (title.includes('serum') || title.includes('essence')) return 'serum';
    if (title.includes('moistur') || title.includes('cream')) return 'moisturizer';
    if (title.includes('eye')) return 'eye_cream';
    if (title.includes('sun') || title.includes('spf')) return 'sunscreen';
    if (title.includes('mask')) return 'mask';
    if (title.includes('oil')) return 'oil';
    return 'treatment';
  };

  const handleSelectProduct = useCallback((productId: string) => {
    if (!currentStep) return;

    setSelections(prev => {
      const newSelections = new Map(prev);
      if (newSelections.get(currentStep.id) === productId) {
        newSelections.delete(currentStep.id);
      } else {
        newSelections.set(currentStep.id, productId);
      }
      return newSelections;
    });
  }, [currentStep]);

  const handleNextStep = useCallback(() => {
    if (activeStepIndex < productSteps.length - 1) {
      const nextIndex = activeStepIndex + 1;
      setActiveStepIndex(nextIndex);
      // Update category filter for next step
      const nextStep = productSteps[nextIndex];
      setSelectedCategory(inferCategoryFromStep(nextStep));
    }
  }, [activeStepIndex, productSteps]);

  const handlePrevStep = useCallback(() => {
    if (activeStepIndex > 0) {
      const prevIndex = activeStepIndex - 1;
      setActiveStepIndex(prevIndex);
      const prevStep = productSteps[prevIndex];
      setSelectedCategory(inferCategoryFromStep(prevStep));
    }
  }, [activeStepIndex, productSteps]);

  const handleShowInsights = useCallback(async (product: Product) => {
    setInsightProduct(product);
    setInsightData(null);
    setInsightError(null);
    setIsLoadingInsight(true);

    if (!skinProfile) {
      setInsightData(getFallbackInsight(product, { skin_type: 'normal' } as any));
      setIsLoadingInsight(false);
      return;
    }

    try {
      const insight = await getProductInsight(product, skinProfile);
      setInsightData(insight);
    } catch (error: any) {
      console.error('Failed to get insight:', error);
      setInsightError('Unable to generate insights. Please try again.');
      // Use fallback
      setInsightData(getFallbackInsight(product, skinProfile));
    } finally {
      setIsLoadingInsight(false);
    }
  }, [skinProfile]);

  const handleCloseInsight = useCallback(() => {
    setInsightProduct(null);
    setInsightData(null);
    setInsightError(null);
  }, []);

  const handleSaveSelections = useCallback(async () => {
    if (!id) return;

    // Validate all required steps have products (T092)
    const missingSteps = productSteps.filter(step => !selections.has(step.id));
    if (missingSteps.length > 0) {
      Alert.alert(
        'Missing Products',
        `${missingSteps.length} step(s) still need products assigned. Do you want to continue anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save Anyway', onPress: () => saveToDatabase() },
        ]
      );
      return;
    }

    await saveToDatabase();
  }, [id, selections, productSteps]);

  const saveToDatabase = async () => {
    setIsSaving(true);
    try {
      // Update each step with selected product
      for (const [stepId, productId] of selections.entries()) {
        await databaseService.updateRoutineStep(stepId, {
          product_id: productId,
        });
      }

      Alert.alert('Success', 'Products have been assigned to your routine!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Failed to save selections:', error);
      Alert.alert('Error', 'Failed to save product selections. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (selections.size > 0) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved product selections. Are you sure you want to go back?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Discard', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  // Calculate progress
  const progress = productSteps.length > 0
    ? Math.round((selections.size / productSteps.length) * 100)
    : 0;

  const selectedProductId = currentStep ? selections.get(currentStep.id) : null;

  if (productSteps.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text variant="h3">Select Products</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
          <Text variant="body" style={styles.emptyText}>
            This routine doesn't have any product application steps.
          </Text>
          <Button title="Go Back" variant="primary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text variant="h3">Select Products</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text variant="caption" style={styles.progressText}>
          {selections.size} of {productSteps.length} products selected
        </Text>
      </View>

      {/* Step Navigator */}
      <View style={styles.stepNavigator}>
        <TouchableOpacity
          style={[styles.navButton, activeStepIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrevStep}
          disabled={activeStepIndex === 0}
        >
          <Ionicons name="chevron-back" size={20} color={activeStepIndex === 0 ? Colors.textTertiary : Colors.primary} />
        </TouchableOpacity>

        <View style={styles.currentStepInfo}>
          <Text variant="caption" style={styles.stepCount}>
            Step {activeStepIndex + 1} of {productSteps.length}
          </Text>
          <Text variant="h4" style={styles.stepTitle} numberOfLines={1}>
            {currentStep?.title}
          </Text>
          {currentStep?.product_amount && (
            <Text variant="caption" style={styles.stepAmount}>
              Amount: {currentStep.product_amount}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.navButton, activeStepIndex === productSteps.length - 1 && styles.navButtonDisabled]}
          onPress={handleNextStep}
          disabled={activeStepIndex === productSteps.length - 1}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={activeStepIndex === productSteps.length - 1 ? Colors.textTertiary : Colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Products List */}
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            isSelected={selectedProductId === item.id}
            onPress={() => handleSelectProduct(item.id)}
            onInsightsPress={() => handleShowInsights(item)}
            compact
          />
        )}
        contentContainerStyle={styles.productsList}
        ListEmptyComponent={
          <View style={styles.emptyProducts}>
            <Text variant="body" style={styles.emptyProductsText}>
              {isLoadingProducts ? 'Loading products...' : 'No products found in this category.'}
            </Text>
          </View>
        }
        ListFooterComponent={<OpenBeautyFactsAttribution />}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title={selections.size === productSteps.length ? 'Save & Continue' : `Save (${selections.size}/${productSteps.length})`}
          variant="primary"
          onPress={handleSaveSelections}
          loading={isSaving}
          fullWidth
        />
      </View>

      {/* Insight Modal */}
      <ProductInsightModal
        visible={insightProduct !== null}
        onClose={handleCloseInsight}
        product={insightProduct}
        skinProfile={skinProfile}
        insight={insightData}
        isLoading={isLoadingInsight}
        error={insightError}
      />
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
  progressSection: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  progressText: {
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  stepNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.md,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  currentStepInfo: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  stepCount: {
    color: Colors.textSecondary,
  },
  stepTitle: {
    color: Colors.text,
    textAlign: 'center',
  },
  stepAmount: {
    color: Colors.primary,
    marginTop: 2,
  },
  productsList: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Layout.screenPadding,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyProducts: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyProductsText: {
    color: Colors.textSecondary,
  },
  footer: {
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
