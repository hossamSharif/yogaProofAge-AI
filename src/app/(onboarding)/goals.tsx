import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Typography as Text, Button } from '@/components/common';
import { Colors, Spacing, BorderRadius, Layout, Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';

/**
 * Skin Goals Selection Screen
 *
 * Allow users to select their primary skin goals for personalization
 * Reference: mydeisgn/skin_goals_selection
 */

interface SkinGoal {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const skinGoals: SkinGoal[] = [
  {
    id: 'anti_aging',
    title: 'Anti-Aging',
    description: 'Reduce fine lines, wrinkles, and maintain youthful skin',
    icon: 'sparkles-outline',
  },
  {
    id: 'hydration',
    title: 'Deep Hydration',
    description: 'Combat dryness and restore moisture balance',
    icon: 'water-outline',
  },
  {
    id: 'acne',
    title: 'Clear Skin',
    description: 'Reduce breakouts and achieve clearer complexion',
    icon: 'sunny-outline',
  },
  {
    id: 'brightness',
    title: 'Radiance & Glow',
    description: 'Brighten dull skin and achieve healthy glow',
    icon: 'flash-outline',
  },
  {
    id: 'firmness',
    title: 'Lift & Firm',
    description: 'Improve skin elasticity and facial contours',
    icon: 'trending-up-outline',
  },
  {
    id: 'dark_spots',
    title: 'Even Tone',
    description: 'Reduce dark spots and achieve uniform skin tone',
    icon: 'color-palette-outline',
  },
  {
    id: 'pores',
    title: 'Minimize Pores',
    description: 'Reduce appearance of enlarged pores',
    icon: 'grid-outline',
  },
  {
    id: 'sensitivity',
    title: 'Calm & Soothe',
    description: 'Reduce redness and sensitivity',
    icon: 'leaf-outline',
  },
];

interface GoalCardProps {
  goal: SkinGoal;
  selected: boolean;
  onPress: () => void;
  index: number;
}

function GoalCard({ goal, selected, onPress, index }: GoalCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <Animated.View
      entering={FadeIn.duration(400).delay(index * 50)}
      style={animatedStyle}
    >
      <TouchableOpacity
        style={[styles.goalCard, selected && styles.goalCardSelected]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View
          style={[styles.iconContainer, selected && styles.iconContainerSelected]}
        >
          <Ionicons
            name={goal.icon}
            size={24}
            color={selected ? Colors.textInverse : Colors.primary}
          />
        </View>
        <View style={styles.goalTextContainer}>
          <Text
            variant="label"
            style={[styles.goalTitle, selected && styles.goalTitleSelected]}
          >
            {goal.title}
          </Text>
          <Text variant="caption" style={styles.goalDescription}>
            {goal.description}
          </Text>
        </View>
        {selected && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function GoalsScreen() {
  const router = useRouter();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(id => id !== goalId);
      }
      if (prev.length >= 3) {
        Alert.alert(
          'Maximum Goals',
          'You can select up to 3 primary skin goals. Remove one to add another.',
          [{ text: 'OK' }]
        );
        return prev;
      }
      return [...prev, goalId];
    });
  };

  const handleContinue = () => {
    if (selectedGoals.length === 0) {
      Alert.alert(
        'Select Goals',
        'Please select at least one skin goal to personalize your experience.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Navigate to auth/login to create account
    router.push('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h1" style={styles.title}>
          What are your skin goals?
        </Text>
        <Text variant="body" style={styles.subtitle}>
          Select up to 3 goals to personalize your routine. You can always change
          these later.
        </Text>
      </View>

      {/* Goals list */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.goalsContainer}
        showsVerticalScrollIndicator={false}
      >
        {skinGoals.map((goal, index) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            selected={selectedGoals.includes(goal.id)}
            onPress={() => toggleGoal(goal.id)}
            index={index}
          />
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.selectionInfo}>
          <Text variant="bodySmall" style={styles.selectionText}>
            {selectedGoals.length}/3 goals selected
          </Text>
        </View>
        <Button
          title="Continue"
          variant="primary"
          onPress={handleContinue}
          disabled={selectedGoals.length === 0}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing['4xl'],
    paddingBottom: Spacing.lg,
  },
  title: {
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  goalsContainer: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  goalCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  iconContainerSelected: {
    backgroundColor: Colors.primary,
  },
  goalTextContainer: {
    flex: 1,
  },
  goalTitle: {
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  goalTitleSelected: {
    color: Colors.primary,
  },
  goalDescription: {
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  checkmark: {
    marginLeft: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing['3xl'],
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.background,
  },
  selectionInfo: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  selectionText: {
    color: Colors.textSecondary,
  },
});
