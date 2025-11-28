import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography as Text, Card } from '@/components/common';
import { Colors, Spacing, BorderRadius, Layout } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth.store';

/**
 * More Tab Menu Screen
 *
 * Navigation hub for additional features:
 * Diary, Products, Settings, Subscription
 *
 * Implements T198: Create more tab menu screen
 */

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  badge?: string;
}

function MenuItem({ icon, title, subtitle, onPress, badge }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconContainer}>
        <Ionicons name={icon} size={22} color={Colors.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text variant="label" style={styles.menuTitle}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" style={styles.menuSubtitle}>
            {subtitle}
          </Text>
        )}
      </View>
      <View style={styles.menuRight}>
        {badge && (
          <View style={styles.badge}>
            <Text variant="caption" style={styles.badgeText}>
              {badge}
            </Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const router = useRouter();
  const { signOut } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="h1">More</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Features Section */}
        <View style={styles.section}>
          <Text variant="caption" style={styles.sectionTitle}>
            FEATURES
          </Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon="journal-outline"
              title="Skin Diary"
              subtitle="Track daily mood and triggers"
              onPress={() => router.push('/(main)/diary')}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="flask-outline"
              title="Products"
              subtitle="Browse skincare products"
              onPress={() => router.push('/(main)/products')}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="View all notifications"
              onPress={() => router.push('/(main)/notifications')}
            />
          </Card>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text variant="caption" style={styles.sectionTitle}>
            ACCOUNT
          </Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon="diamond-outline"
              title="Subscription"
              subtitle="Manage your plan"
              onPress={() => router.push('/(main)/subscription')}
              badge="Free"
            />
            <View style={styles.divider} />
            <MenuItem
              icon="settings-outline"
              title="Settings"
              subtitle="App preferences"
              onPress={() => router.push('/(main)/settings')}
            />
          </Card>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text variant="caption" style={styles.sectionTitle}>
            SUPPORT
          </Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon="help-circle-outline"
              title="Help & FAQ"
              subtitle="Get answers to common questions"
              onPress={() => router.push('/(main)/settings/support')}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="chatbubble-outline"
              title="Contact Support"
              subtitle="Reach out to our team"
              onPress={() => router.push('/(main)/settings/support')}
            />
          </Card>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text variant="label" style={styles.signOutText}>
            Sign Out
          </Text>
        </TouchableOpacity>

        {/* Version info */}
        <Text variant="caption" style={styles.versionText}>
          YogaAgeProof AI v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing['3xl'],
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    letterSpacing: 0.5,
  },
  menuCard: {
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    color: Colors.text,
  },
  menuSubtitle: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    color: Colors.textInverse,
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginLeft: 40 + Spacing.md,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  signOutText: {
    color: Colors.error,
  },
  versionText: {
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
