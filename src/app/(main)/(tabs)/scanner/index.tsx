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
import { useSkinProfile, useProfileStore } from '@/stores/profile.store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkinProfileCard } from '@/components/scanner/SkinProfileCard';

/**
 * Scanner Home Screen
 *
 * Entry point for AI face scanner feature.
 * Shows current skin profile or prompts for first scan.
 * Reference: mydeisgn/ai_face_scanner_-_camera_interface
 *
 * Implements:
 * - FR-008: AI face scanner access
 * - FR-013: Skin profile display
 */

export default function ScannerHomeScreen() {
  const router = useRouter();
  const skinProfile = useSkinProfile();
  const { skinProfileHistory, fetchSkinProfileHistory } = useProfileStore();

  const handleStartScan = () => {
    router.push('/(main)/(tabs)/scanner/camera');
  };

  const handleViewProfile = () => {
    router.push('/(main)/(tabs)/scanner/profile');
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
          <Text variant="h1">AI Skin Scanner</Text>
          <Text variant="body" style={styles.subtitle}>
            Analyze your skin with AI for personalized recommendations
          </Text>
        </View>

        {/* Main CTA */}
        <Card style={styles.scanCard}>
          <View style={styles.scanIconContainer}>
            <Ionicons name="scan" size={64} color={Colors.primary} />
          </View>
          <Text variant="h3" style={styles.scanTitle}>
            {skinProfile ? 'Take a New Scan' : 'Start Your First Scan'}
          </Text>
          <Text variant="body" style={styles.scanDescription}>
            {skinProfile
              ? 'Update your skin profile with a fresh analysis'
              : 'Get a personalized skin profile in seconds with our AI-powered face scanner'}
          </Text>
          <Button
            title="Start Scan"
            variant="primary"
            onPress={handleStartScan}
            fullWidth
            leftIcon={<Ionicons name="camera" size={20} color={Colors.textInverse} />}
          />
        </Card>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text variant="label" style={styles.sectionTitle}>
            Tips for Best Results
          </Text>
          <View style={styles.tipsList}>
            <TipItem
              icon="sunny-outline"
              text="Use natural daylight for accurate skin tone detection"
            />
            <TipItem
              icon="eye-outline"
              text="Face the camera directly with eyes open"
            />
            <TipItem
              icon="water-outline"
              text="Remove makeup for most accurate analysis"
            />
            <TipItem
              icon="phone-portrait-outline"
              text="Hold your phone at arm's length, face filling the frame"
            />
          </View>
        </View>

        {/* Current Profile Summary */}
        {skinProfile && (
          <View style={styles.profileSection}>
            <View style={styles.sectionHeader}>
              <Text variant="label" style={styles.sectionTitle}>
                Current Profile
              </Text>
              <TouchableOpacity onPress={handleViewProfile}>
                <Text variant="bodySmall" style={styles.viewAllLink}>
                  View Details
                </Text>
              </TouchableOpacity>
            </View>
            <SkinProfileCard
              skinProfile={skinProfile}
              onPress={handleViewProfile}
              compact
            />
          </View>
        )}

        {/* How It Works */}
        <View style={styles.howItWorksContainer}>
          <Text variant="label" style={styles.sectionTitle}>
            How It Works
          </Text>
          <View style={styles.stepsContainer}>
            <StepItem
              number={1}
              title="Take Photo"
              description="Position your face in the frame"
            />
            <StepItem
              number={2}
              title="AI Analysis"
              description="Our AI analyzes skin type & concerns"
            />
            <StepItem
              number={3}
              title="Get Profile"
              description="Receive personalized skin insights"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface TipItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

function TipItem({ icon, text }: TipItemProps) {
  return (
    <View style={styles.tipItem}>
      <Ionicons name={icon} size={20} color={Colors.primary} />
      <Text variant="bodySmall" style={styles.tipText}>
        {text}
      </Text>
    </View>
  );
}

interface StepItemProps {
  number: number;
  title: string;
  description: string;
}

function StepItem({ number, title, description }: StepItemProps) {
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepNumber}>
        <Text variant="label" style={styles.stepNumberText}>
          {number}
        </Text>
      </View>
      <View style={styles.stepContent}>
        <Text variant="label" style={styles.stepTitle}>
          {title}
        </Text>
        <Text variant="caption" style={styles.stepDescription}>
          {description}
        </Text>
      </View>
    </View>
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
    paddingTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  subtitle: {
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  scanCard: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    marginBottom: Spacing.xl,
  },
  scanIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  scanTitle: {
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  scanDescription: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  tipsContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  viewAllLink: {
    color: Colors.primary,
  },
  tipsList: {
    gap: Spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  tipText: {
    flex: 1,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  profileSection: {
    marginBottom: Spacing.xl,
  },
  howItWorksContainer: {
    marginBottom: Spacing.xl,
  },
  stepsContainer: {
    gap: Spacing.md,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: Colors.textInverse,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitle: {
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  stepDescription: {
    color: Colors.textSecondary,
  },
});
