import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Typography as Text, Button } from '@/components/common';
import { RoutineCard } from '@/components/routine';
import { Colors, Spacing, Layout } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoutineStore, useRoutines, useActiveRoutine, useRoutineLoading } from '@/stores/routine.store';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Routines List Screen
 *
 * Implements T079: Create routines list screen
 * Per FR-016: Display user's routines with quick access to routine builder
 *
 * Features:
 * - List of user's routines with active indicator
 * - Quick access to routine builder
 * - Play button to start routine immediately
 * - Pull to refresh
 */
export default function RoutinesScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const routines = useRoutines();
  const activeRoutine = useActiveRoutine();
  const isLoading = useRoutineLoading();
  const { fetchUserRoutines, fetchActiveRoutine } = useRoutineStore();

  const userId = session?.user?.id;

  // Fetch routines on mount and focus
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchUserRoutines(userId);
        fetchActiveRoutine(userId);
      }
    }, [userId])
  );

  const handleRefresh = useCallback(() => {
    if (userId) {
      fetchUserRoutines(userId);
      fetchActiveRoutine(userId);
    }
  }, [userId]);

  const handleRoutinePress = (routineId: string) => {
    router.push(`/(main)/(tabs)/routines/${routineId}`);
  };

  const handlePlayPress = (routineId: string) => {
    router.push(`/(main)/(tabs)/routines/${routineId}/player`);
  };

  const handleCreateRoutine = () => {
    router.push('/(main)/(tabs)/routines/builder');
  };

  const handleTemplates = () => {
    router.push('/(main)/(tabs)/routines/templates');
  };

  // Filter routines by status
  const draftRoutines = routines.filter(r => r.status === 'draft');
  const archivedRoutines = routines.filter(r => r.status === 'archived');

  const hasRoutines = routines.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="h1">Routines</Text>
        <TouchableOpacity onPress={handleTemplates} style={styles.templatesButton}>
          <Ionicons name="document-text-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {!hasRoutines ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color={Colors.textTertiary} />
          <Text variant="h3" style={styles.emptyTitle}>
            No Routines Yet
          </Text>
          <Text variant="body" style={styles.emptyText}>
            Create your first personalized routine based on your skin profile
          </Text>
          <Button
            title="Create Routine"
            variant="primary"
            onPress={handleCreateRoutine}
            leftIcon={<Ionicons name="add" size={20} color={Colors.textInverse} />}
          />
          <Button
            title="Browse Templates"
            variant="outline"
            onPress={handleTemplates}
            leftIcon={<Ionicons name="document-text-outline" size={20} color={Colors.primary} />}
            style={styles.secondaryButton}
          />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
        >
          {/* Active Routine Section */}
          {activeRoutine && (
            <View style={styles.section}>
              <Text variant="h4" style={styles.sectionTitle}>
                Active Routine
              </Text>
              <RoutineCard
                routine={activeRoutine}
                isActive
                onPress={() => handleRoutinePress(activeRoutine.id)}
                onPlayPress={() => handlePlayPress(activeRoutine.id)}
              />
            </View>
          )}

          {/* Draft Routines Section */}
          {draftRoutines.length > 0 && (
            <View style={styles.section}>
              <Text variant="h4" style={styles.sectionTitle}>
                Draft Routines
              </Text>
              {draftRoutines.map(routine => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  onPress={() => handleRoutinePress(routine.id)}
                  showPlayButton={false}
                />
              ))}
            </View>
          )}

          {/* Archived Routines Section */}
          {archivedRoutines.length > 0 && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => {/* Toggle visibility */}}
              >
                <Text variant="h4" style={styles.sectionTitle}>
                  Archived ({archivedRoutines.length})
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
              {archivedRoutines.slice(0, 3).map(routine => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  onPress={() => handleRoutinePress(routine.id)}
                  showPlayButton={false}
                />
              ))}
            </View>
          )}

          {/* Create New Button */}
          <View style={styles.createSection}>
            <Button
              title="Create New Routine"
              variant="primary"
              onPress={handleCreateRoutine}
              leftIcon={<Ionicons name="add" size={20} color={Colors.textInverse} />}
              fullWidth
            />
          </View>
        </ScrollView>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  templatesButton: {
    padding: Spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.md,
  },
  emptyTitle: {
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  secondaryButton: {
    marginTop: Spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  createSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
