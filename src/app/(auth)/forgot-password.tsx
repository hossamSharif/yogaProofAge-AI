import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Typography as Text, Button, Input } from '@/components/common';
import { Colors, Spacing, BorderRadius, Layout } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as authService from '@/services/supabase/auth';

/**
 * Forgot Password Screen
 *
 * Send password recovery email to user
 *
 * Implements:
 * - FR-087: Password recovery flow
 * - NFR-033: 1-hour token expiry
 */

type ScreenState = 'email' | 'sent';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [screenState, setScreenState] = useState<ScreenState>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendEmail = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await authService.sendPasswordRecoveryEmail(email.trim());
      setScreenState('sent');
    } catch (err: any) {
      setError(err.message || 'Failed to send recovery email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setIsLoading(true);
      await authService.sendPasswordRecoveryEmail(email.trim());
    } catch (err: any) {
      setError('Failed to resend email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailForm = () => (
    <>
      <View style={styles.iconContainer}>
        <Ionicons name="lock-open-outline" size={48} color={Colors.primary} />
      </View>

      <Text variant="h1" style={styles.title}>
        Forgot Password?
      </Text>
      <Text variant="body" style={styles.subtitle}>
        No worries! Enter the email address associated with your account and we'll send you a link to reset your password.
      </Text>

      <View style={styles.form}>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email address"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoFocus
          error={error || undefined}
          leftIcon={<Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />}
        />

        <Button
          title="Send Reset Link"
          variant="primary"
          onPress={handleSendEmail}
          loading={isLoading}
          disabled={isLoading}
          fullWidth
          style={styles.submitButton}
        />
      </View>

      {/* Info about token expiry */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color={Colors.info} />
        <Text variant="caption" style={styles.infoText}>
          The reset link will expire after 1 hour for security reasons.
        </Text>
      </View>
    </>
  );

  const renderSentConfirmation = () => (
    <>
      <View style={styles.successIconContainer}>
        <Ionicons name="mail-outline" size={64} color={Colors.primary} />
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
        </View>
      </View>

      <Text variant="h1" style={styles.title}>
        Check Your Email
      </Text>
      <Text variant="body" style={styles.subtitle}>
        We've sent a password reset link to:
      </Text>
      <Text variant="label" style={styles.emailHighlight}>
        {email}
      </Text>

      <View style={styles.instructionsCard}>
        <Text variant="bodySmall" style={styles.instructionsTitle}>
          Next steps:
        </Text>
        <View style={styles.instructionItem}>
          <Text variant="bodySmall" style={styles.instructionNumber}>1.</Text>
          <Text variant="bodySmall" style={styles.instructionText}>
            Check your inbox (and spam folder)
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <Text variant="bodySmall" style={styles.instructionNumber}>2.</Text>
          <Text variant="bodySmall" style={styles.instructionText}>
            Click the reset link in the email
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <Text variant="bodySmall" style={styles.instructionNumber}>3.</Text>
          <Text variant="bodySmall" style={styles.instructionText}>
            Create your new password
          </Text>
        </View>
      </View>

      <View style={styles.resendContainer}>
        <Text variant="bodySmall" style={styles.resendText}>
          Didn't receive the email?
        </Text>
        <Button
          title="Resend Email"
          variant="outline"
          onPress={handleResendEmail}
          loading={isLoading}
          disabled={isLoading}
          size="sm"
        />
      </View>

      <Button
        title="Back to Sign In"
        variant="primary"
        onPress={() => router.replace('/(auth)/login')}
        fullWidth
        style={styles.backToLoginButton}
      />
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        {screenState === 'email' ? renderEmailForm() : renderSentConfirmation()}
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['3xl'],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -4,
    right: '35%',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
  },
  title: {
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  emailHighlight: {
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.info + '10',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  infoText: {
    color: Colors.info,
    flex: 1,
    lineHeight: 18,
  },
  instructionsCard: {
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  instructionsTitle: {
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  instructionNumber: {
    color: Colors.primary,
    fontWeight: '600',
    width: 20,
  },
  instructionText: {
    color: Colors.textSecondary,
    flex: 1,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  resendText: {
    color: Colors.textSecondary,
  },
  backToLoginButton: {
    marginTop: Spacing.md,
  },
});
