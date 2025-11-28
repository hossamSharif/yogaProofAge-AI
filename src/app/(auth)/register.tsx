import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Typography as Text, Button, Input } from '@/components/common';
import { Colors, Spacing, BorderRadius, Layout } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as authService from '@/services/supabase/auth';

/**
 * Registration Form Screen
 *
 * Create new account with email/password
 * Reference: mydeisgn/account_creation_login
 *
 * Implements:
 * - FR-003: Email/password registration
 * - FR-007: Password requirements (8+ chars, letters+numbers)
 */

interface ValidationErrors {
  displayName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterScreen() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Display name validation
    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (displayName.trim().length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation (FR-007)
    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      if (password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/[a-zA-Z]/.test(password)) {
        newErrors.password = 'Password must contain at least one letter';
      } else if (!/[0-9]/.test(password)) {
        newErrors.password = 'Password must contain at least one number';
      }
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setSubmitError(null);

      await authService.signUpWithEmail({
        email: email.trim(),
        password,
        displayName: displayName.trim(),
      });

      // Registration successful, navigate to main app
      router.replace('/(main)/(tabs)/home');
    } catch (err: any) {
      setSubmitError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (): { level: number; label: string; color: string } => {
    if (!password) return { level: 0, label: '', color: Colors.border };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-zA-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    if (password.length >= 12) strength++;

    if (strength <= 2) return { level: strength, label: 'Weak', color: Colors.error };
    if (strength <= 3) return { level: strength, label: 'Medium', color: Colors.warning };
    return { level: strength, label: 'Strong', color: Colors.success };
  };

  const passwordStrength = getPasswordStrength();

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

        {/* Header */}
        <View style={styles.header}>
          <Text variant="h1" style={styles.title}>
            Create Account
          </Text>
          <Text variant="body" style={styles.subtitle}>
            Start your skincare transformation today
          </Text>
        </View>

        {/* Registration form */}
        <View style={styles.form}>
          <Input
            label="Display Name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="How should we call you?"
            autoCapitalize="words"
            autoComplete="name"
            error={errors.displayName}
            leftIcon={<Ionicons name="person-outline" size={20} color={Colors.textSecondary} />}
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
            leftIcon={<Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />}
          />

          <View>
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password-new"
              error={errors.password}
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

            {/* Password strength indicator */}
            {password && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4, 5].map(level => (
                    <View
                      key={level}
                      style={[
                        styles.strengthBar,
                        passwordStrength.level >= level && {
                          backgroundColor: passwordStrength.color,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text variant="caption" style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                  {passwordStrength.label}
                </Text>
              </View>
            )}

            {/* Password requirements */}
            <View style={styles.requirements}>
              <PasswordRequirement
                met={password.length >= 8}
                text="At least 8 characters"
              />
              <PasswordRequirement
                met={/[a-zA-Z]/.test(password)}
                text="Contains a letter"
              />
              <PasswordRequirement
                met={/[0-9]/.test(password)}
                text="Contains a number"
              />
            </View>
          </View>

          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter your password"
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoComplete="password-new"
            error={errors.confirmPassword}
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            }
          />

          {/* Submit error */}
          {submitError && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={Colors.error} />
              <Text variant="caption" style={styles.errorText}>
                {submitError}
              </Text>
            </View>
          )}

          {/* Register button */}
          <Button
            title="Create Account"
            variant="primary"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
            style={styles.registerButton}
          />

          {/* Terms notice */}
          <Text variant="caption" style={styles.terms}>
            By creating an account, you agree to our{' '}
            <Text variant="caption" style={styles.termsLink}>
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text variant="caption" style={styles.termsLink}>
              Privacy Policy
            </Text>
          </Text>
        </View>

        {/* Sign in link */}
        <View style={styles.signInContainer}>
          <Text variant="body" style={styles.signInText}>
            Already have an account?{' '}
          </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text variant="body" style={styles.signInLink}>
                Sign In
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface PasswordRequirementProps {
  met: boolean;
  text: string;
}

function PasswordRequirement({ met, text }: PasswordRequirementProps) {
  return (
    <View style={styles.requirement}>
      <Ionicons
        name={met ? 'checkmark-circle' : 'ellipse-outline'}
        size={14}
        color={met ? Colors.success : Colors.textTertiary}
      />
      <Text
        variant="caption"
        style={[styles.requirementText, met && styles.requirementMet]}
      >
        {text}
      </Text>
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
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['3xl'],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: Spacing.md,
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
  form: {
    gap: Spacing.md,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  strengthBars: {
    flexDirection: 'row',
    flex: 1,
    gap: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  strengthLabel: {
    minWidth: 50,
  },
  requirements: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  requirementText: {
    color: Colors.textTertiary,
  },
  requirementMet: {
    color: Colors.success,
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
  registerButton: {
    marginTop: Spacing.md,
  },
  terms: {
    textAlign: 'center',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.primary,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing['2xl'],
  },
  signInText: {
    color: Colors.textSecondary,
  },
  signInLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
