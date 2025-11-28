import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Typography as Text, Button, Card } from '@/components/common';
import { Colors, Spacing, BorderRadius, Layout, Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useProfile, useSkinProfile } from '@/stores/profile.store';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Home Dashboard Screen
 *
 * Main dashboard with quick actions and status overview.
 * Reference: mydeisgn/home_dashboard
 *
 * Implements FR-086: Quick actions dashboard
 */

interface QuickActionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

function QuickAction({ title, icon, color, onPress }: QuickActionProps) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text variant="caption" style={styles.quickActionText}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const profile = useProfile();
  const skinProfile = useSkinProfile();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text variant="bodySmall" style={styles.greeting}>
              {greeting()}
            </Text>
            <Text variant="h2" style={styles.userName}>
              {profile?.display_name || 'Friend'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/(main)/notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={Colors.text} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text variant="label" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              title="Start Routine"
              icon="play-circle"
              color={Colors.primary}
              onPress={() => router.push('/(main)/(tabs)/routines')}
            />
            <QuickAction
              title="Skin Scan"
              icon="scan"
              color={Colors.secondary}
              onPress={() => router.push('/(main)/(tabs)/scanner/camera')}
            />
            <QuickAction
              title="Take Photo"
              icon="camera"
              color={Colors.success}
              onPress={() => router.push('/(main)/(tabs)/gallery/capture')}
            />
            <QuickAction
              title="Diary"
              icon="journal"
              color={Colors.info}
              onPress={() => router.push('/(main)/diary')}
            />
          </View>
        </View>

        {/* Skin Profile Card */}
        {skinProfile ? (
          <Card style={styles.skinProfileCard}>
            <View style={styles.skinProfileHeader}>
              <Text variant="label">Your Skin Profile</Text>
              <TouchableOpacity
                onPress={() => router.push('/(main)/(tabs)/scanner/profile')}
              >
                <Text variant="caption" style={styles.viewAllLink}>
                  View Details
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.skinProfileContent}>
              <View style={styles.skinTypeContainer}>
                <Text variant="bodySmall" style={styles.skinTypeLabel}>
                  Skin Type
                </Text>
                <Text variant="h3" style={styles.skinType}>
                  {skinProfile.skin_type?.charAt(0).toUpperCase() +
                    skinProfile.skin_type?.slice(1)}
                </Text>
              </View>
              <View style={styles.concernsPreview}>
                <Text variant="bodySmall" style={styles.concernsLabel}>
                  Top Concerns
                </Text>
                <View style={styles.concernTags}>
                  {(skinProfile.concerns as any[])?.slice(0, 3).map((concern, index) => (
                    <View key={index} style={styles.concernTag}>
                      <Text variant="caption" style={styles.concernTagText}>
                        {concern.type?.replace('_', ' ')}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </Card>
        ) : (
          <Card style={styles.noProfileCard}>
            <Ionicons name="scan-outline" size={48} color={Colors.primary} />
            <Text variant="label" style={styles.noProfileTitle}>
              Get Your Skin Profile
            </Text>
            <Text variant="bodySmall" style={styles.noProfileDescription}>
              Take a quick scan to receive personalized routines
            </Text>
            <Button
              title="Start Scan"
              variant="primary"
              onPress={() => router.push('/(main)/(tabs)/scanner/camera')}
              style={styles.scanButton}
            />
          </Card>
        )}

        {/* Today's Routine */}
        <Card style={styles.routineCard}>
          <View style={styles.routineHeader}>
            <Text variant="label">Today's Routine</Text>
            <TouchableOpacity onPress={() => router.push('/(main)/(tabs)/routines')}>
              <Text variant="caption" style={styles.viewAllLink}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.noRoutineContent}>
            <Ionicons name="calendar-outline" size={32} color={Colors.textTertiary} />
            <Text variant="bodySmall" style={styles.noRoutineText}>
              No routine scheduled for today
            </Text>
            <Button
              title="Create Routine"
              variant="outline"
              size="sm"
              onPress={() => router.push('/(main)/(tabs)/routines/builder')}
            />
          </View>
        </Card>

        {/* Progress Stats */}
        <View style={styles.statsContainer}>
          <Text variant="label" style={styles.sectionTitle}>
            Your Progress
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text variant="h2" style={styles.statValue}>
                0
              </Text>
              <Text variant="caption" style={styles.statLabel}>
                Day Streak
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text variant="h2" style={styles.statValue}>
                0
              </Text>
              <Text variant="caption" style={styles.statLabel}>
                Sessions
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text variant="h2" style={styles.statValue}>
                0
              </Text>
              <Text variant="caption" style={styles.statLabel}>
                Photos
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  greeting: {
    color: Colors.textSecondary,
  },
  userName: {
    color: Colors.text,
  },
  notificationButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
  },
  sectionTitle: {
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  quickActionsContainer: {
    marginBottom: Spacing.xl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  quickActionText: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  skinProfileCard: {
    marginBottom: Spacing.lg,
  },
  skinProfileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  viewAllLink: {
    color: Colors.primary,
  },
  skinProfileContent: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  skinTypeContainer: {
    flex: 1,
  },
  skinTypeLabel: {
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  skinType: {
    color: Colors.primary,
  },
  concernsPreview: {
    flex: 2,
  },
  concernsLabel: {
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  concernTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  concernTag: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  concernTagText: {
    color: Colors.primary,
    fontSize: 11,
  },
  noProfileCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  noProfileTitle: {
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  noProfileDescription: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  scanButton: {
    minWidth: 150,
  },
  routineCard: {
    marginBottom: Spacing.lg,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  noRoutineContent: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  noRoutineText: {
    color: Colors.textSecondary,
  },
  statsContainer: {
    marginTop: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: {
    color: Colors.primary,
  },
  statLabel: {
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
