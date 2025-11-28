import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Typography as Text, Button, Card } from '@/components/common';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Database } from '@/types/supabase.types';

type Product = Database['public']['Tables']['products']['Row'];
type SkinProfile = Database['public']['Tables']['skin_profiles']['Row'];

interface ProductInsight {
  suitabilityScore: number; // 0-100
  suitabilityLabel: 'Excellent' | 'Good' | 'Fair' | 'Not Recommended';
  summary: string;
  pros: string[];
  cons: string[];
  usageTips: string[];
  alternatives?: string[];
}

interface ProductInsightModalProps {
  visible: boolean;
  onClose: () => void;
  product: Product | null;
  skinProfile: SkinProfile | null;
  insight?: ProductInsight | null;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Get color based on suitability score
 */
function getSuitabilityColor(score: number): string {
  if (score >= 80) return Colors.success;
  if (score >= 60) return '#4CAF50'; // Light green
  if (score >= 40) return Colors.warning;
  return Colors.error;
}

/**
 * ProductInsightModal Component
 *
 * Implements T089: Build product insight modal component
 * Per FR-067: Display AI-generated personalized product insights
 *
 * Features:
 * - Suitability score with visual indicator
 * - Pros and cons list
 * - Usage tips specific to user's skin
 * - Alternative product suggestions
 */
export function ProductInsightModal({
  visible,
  onClose,
  product,
  skinProfile,
  insight,
  isLoading = false,
  error = null,
}: ProductInsightModalProps) {
  if (!product) return null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text variant="body" style={styles.loadingText}>
            Analyzing product for your skin...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={Colors.error} />
          <Text variant="body" style={styles.errorText}>
            {error}
          </Text>
          <Button
            title="Try Again"
            variant="outline"
            onPress={onClose}
          />
        </View>
      );
    }

    if (!insight) {
      return (
        <View style={styles.noInsightContainer}>
          <Ionicons name="sparkles" size={48} color={Colors.textTertiary} />
          <Text variant="body" style={styles.noInsightText}>
            No insights available for this product yet.
          </Text>
        </View>
      );
    }

    const suitabilityColor = getSuitabilityColor(insight.suitabilityScore);

    return (
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Suitability Score */}
        <View style={styles.scoreSection}>
          <View style={[styles.scoreCircle, { borderColor: suitabilityColor }]}>
            <Text variant="h1" style={[styles.scoreText, { color: suitabilityColor }]}>
              {insight.suitabilityScore}
            </Text>
            <Text variant="caption" style={styles.scoreLabel}>
              /100
            </Text>
          </View>
          <View style={styles.scoreInfo}>
            <View style={[styles.suitabilityBadge, { backgroundColor: suitabilityColor }]}>
              <Text variant="body" style={styles.suitabilityText}>
                {insight.suitabilityLabel}
              </Text>
            </View>
            <Text variant="caption" style={styles.skinTypeLabel}>
              for {skinProfile?.skin_type || 'your'} skin
            </Text>
          </View>
        </View>

        {/* Summary */}
        <Card style={styles.summaryCard}>
          <Text variant="body" style={styles.summary}>
            {insight.summary}
          </Text>
        </Card>

        {/* Pros */}
        {insight.pros.length > 0 && (
          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <Ionicons name="thumbs-up" size={18} color={Colors.success} />
              <Text variant="h4" style={styles.listTitle}>
                Pros
              </Text>
            </View>
            {insight.pros.map((pro, index) => (
              <View key={index} style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text variant="body" style={styles.listItemText}>
                  {pro}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Cons */}
        {insight.cons.length > 0 && (
          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <Ionicons name="thumbs-down" size={18} color={Colors.warning} />
              <Text variant="h4" style={styles.listTitle}>
                Considerations
              </Text>
            </View>
            {insight.cons.map((con, index) => (
              <View key={index} style={styles.listItem}>
                <Ionicons name="alert-circle" size={16} color={Colors.warning} />
                <Text variant="body" style={styles.listItemText}>
                  {con}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Usage Tips */}
        {insight.usageTips.length > 0 && (
          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <Ionicons name="bulb" size={18} color={Colors.primary} />
              <Text variant="h4" style={styles.listTitle}>
                Usage Tips
              </Text>
            </View>
            {insight.usageTips.map((tip, index) => (
              <View key={index} style={styles.listItem}>
                <Ionicons name="information-circle" size={16} color={Colors.primary} />
                <Text variant="body" style={styles.listItemText}>
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Alternatives */}
        {insight.alternatives && insight.alternatives.length > 0 && (
          <View style={styles.alternativesSection}>
            <Text variant="h4" style={styles.alternativesTitle}>
              Similar Products to Consider
            </Text>
            {insight.alternatives.map((alt, index) => (
              <View key={index} style={styles.alternativeItem}>
                <Ionicons name="swap-horizontal" size={16} color={Colors.textSecondary} />
                <Text variant="body" style={styles.alternativeText}>
                  {alt}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="sparkles" size={24} color={Colors.primary} />
            <Text variant="h3" style={styles.headerTitle}>
              AI Insights
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text variant="h4" style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text variant="caption" style={styles.productBrand}>
            {product.brand} • {product.category.replace('_', ' ')}
          </Text>
        </View>

        {/* Content */}
        {renderContent()}

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title="Close"
            variant="outline"
            onPress={onClose}
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    color: Colors.text,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  productInfo: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.backgroundSecondary,
  },
  productName: {
    color: Colors.text,
    marginBottom: 4,
  },
  productBrand: {
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  errorText: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  noInsightContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  noInsightText: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  scoreText: {
    fontWeight: '700',
  },
  scoreLabel: {
    color: Colors.textSecondary,
    marginTop: -4,
  },
  scoreInfo: {
    flex: 1,
  },
  suitabilityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  suitabilityText: {
    color: Colors.textInverse,
    fontWeight: '600',
  },
  skinTypeLabel: {
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  summaryCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  summary: {
    color: Colors.text,
    lineHeight: 22,
  },
  listSection: {
    marginBottom: Spacing.lg,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  listTitle: {
    color: Colors.text,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  listItemText: {
    flex: 1,
    color: Colors.textSecondary,
  },
  alternativesSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  alternativesTitle: {
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  alternativeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  alternativeText: {
    color: Colors.textSecondary,
    flex: 1,
  },
  bottomPadding: {
    height: Spacing.xl,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});

export default ProductInsightModal;
