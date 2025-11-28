import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Typography as Text, Button, Input } from '@/components/common';
import { Colors, Spacing, BorderRadius, Layout, Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as authService from '@/services/supabase/auth';
import { useAuthStore } from '@/stores/auth.store';
import { AccountConflictModal } from '@/components/auth/AccountConflictModal';

/**
 * Login/Register Screen
 *
 * Entry point for authentication with email/password and social auth options
 * Reference: mydeisgn/account_creation_login
 *
 * Implements:
 * - FR-003: Email/password authentication
 * - FR-004: Social auth (Google OAuth 2.0, Apple OpenID Connect)
 * - NFR-030: OAuth 2.0/OpenID Connect protocols
 * - NFR-031: Apple Sign-In requirement
 */

export default function LoginScreen() {
  const router = useRouter();
  const { setLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Account conflict state
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictEmail, setConflictEmail] = useState('');
  const [conflictProvider, setConflictProvider] = useState<'google' | 'apple'>('google');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await authService.signInWithEmail({ email, password });
      router.replace('/(main)/(tabs)/home');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.signInWithGoogle();
    } catch (err: any) {
      if (authService.isAccountConflict(err)) {
        // Show account conflict modal
        setConflictEmail(email); // Use the email from the error if available
        setConflictProvider('google');
        setShowConflictModal(true);
      } else {
        setError(err.message || 'Failed to sign in with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.signInWithApple();
    } catch (err: any) {
      if (authService.isAccountConflict(err)) {
        // Show account conflict modal
        setConflictEmail(email);
        setConflictProvider('apple');
        setShowConflictModal(true);
      } else {
        setError(err.message || 'Failed to sign in with Apple');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkAccount = async (password: string) => {
    try {
      await authService.linkSocialAccount(conflictEmail, password, conflictProvider);
      setShowConflictModal(false);
      router.replace('/(main)/(tabs)/home');
    } catch (err: any) {
      Alert.alert('Link Failed', err.message || 'Failed to link accounts');
    }
  };

  const handleUseDifferentEmail = () => {
    setShowConflictModal(false);
    router.push('/(auth)/register');
  };

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
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h1" style={styles.title}>
            Welcome Back
          </Text>
          <Text variant="body" style={styles.subtitle}>
            Sign in to continue your skincare journey
          </Text>
        </View>

        {/* Social auth buttons */}
        <View style={styles.socialContainer}>
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleAppleSignIn}
              disabled={isLoading}
            >
              <Ionicons name="logo-apple" size={24} color={Colors.text} />
              <Text variant="label" style={styles.socialButtonText}>
                Continue with Apple
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Ionicons name="logo-google" size={24} color="#DB4437" />
            <Text variant="label" style={styles.socialButtonText}>
              Continue with Google
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text variant="caption" style={styles.dividerText}>
            or sign in with email
          </Text>
          <View style={styles.divider} />
        </View>

        {/* Email form */}
        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            leftIcon={<Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            }
          />

          {/* Error message */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={Colors.error} />
              <Text variant="caption" style={styles.errorText}>
                {error}
              </Text>
            </View>
          )}

          {/* Forgot password link */}
          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity style={styles.forgotPassword}>
              <Text variant="bodySmall" style={styles.forgotPasswordText}>
                Forgot password?
              </Text>
            </TouchableOpacity>
          </Link>

          {/* Sign in button */}
          <Button
            title="Sign In"
            variant="primary"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
            style={styles.signInButton}
          />
        </View>

        {/* Sign up link */}
        <View style={styles.signUpContainer}>
          <Text variant="body" style={styles.signUpText}>
            Don't have an account?{' '}
          </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text variant="body" style={styles.signUpLink}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>

      {/* Account conflict modal */}
      <AccountConflictModal
        visible={showConflictModal}
        email={conflictEmail}
        provider={conflictProvider}
        onLinkAccount={handleLinkAccount}
        onUseDifferentEmail={handleUseDifferentEmail}
        onClose={() => setShowConflictModal(false)}
      />
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
    paddingTop: Spacing['4xl'],
    paddingBottom: Spacing['3xl'],
  },
  header: {
    marginBottom: Spacing['2xl'],
  },
  title: {
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.textSecondary,
  },
  socialContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  socialButtonText: {
    color: Colors.text,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  dividerText: {
    color: Colors.textTertiary,
    paddingHorizontal: Spacing.md,
  },
  form: {
    gap: Spacing.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.error + '10',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  errorText: {
    color: Colors.error,
    flex: 1,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: Colors.primary,
  },
  signInButton: {
    marginTop: Spacing.md,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing['2xl'],
  },
  signUpText: {
    color: Colors.textSecondary,
  },
  signUpLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
