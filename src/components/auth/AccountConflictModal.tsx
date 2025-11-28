import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Typography as Text, Button, Input } from '@/components/common';
import { Colors, Spacing, BorderRadius, Shadows, Layout } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

/**
 * Account Conflict Modal
 *
 * Displayed when social auth sign-in conflicts with existing email account.
 * Provides options to link accounts or use a different email.
 *
 * Implements:
 * - FR-089: Account conflict resolution
 * - FR-005: Account linking
 */

interface AccountConflictModalProps {
  visible: boolean;
  email: string;
  provider: 'google' | 'apple';
  onLinkAccount: (password: string) => Promise<void>;
  onUseDifferentEmail: () => void;
  onClose: () => void;
}

export function AccountConflictModal({
  visible,
  email,
  provider,
  onLinkAccount,
  onUseDifferentEmail,
  onClose,
}: AccountConflictModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const providerName = provider === 'google' ? 'Google' : 'Apple';
  const providerIcon = provider === 'google' ? 'logo-google' : 'logo-apple';
  const providerColor = provider === 'google' ? '#DB4437' : Colors.text;

  const handleLinkAccount = async () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onLinkAccount(password);
    } catch (err: any) {
      setError(err.message || 'Failed to link accounts. Please check your password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <View style={styles.modal}>
                {/* Close button */}
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                  <Ionicons name="close" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>

                {/* Icon */}
                <View style={styles.iconContainer}>
                  <View style={styles.iconBadge}>
                    <Ionicons name="mail-outline" size={32} color={Colors.primary} />
                  </View>
                  <View style={styles.providerBadge}>
                    <Ionicons name={providerIcon} size={16} color={providerColor} />
                  </View>
                </View>

                {/* Title */}
                <Text variant="h2" style={styles.title}>
                  Account Already Exists
                </Text>

                {/* Description */}
                <Text variant="body" style={styles.description}>
                  An account with <Text variant="label" style={styles.emailText}>{email}</Text> already exists.
                  Would you like to link your {providerName} account?
                </Text>

                {/* Link account section */}
                <View style={styles.linkSection}>
                  <Text variant="label" style={styles.sectionTitle}>
                    Link {providerName} Account
                  </Text>
                  <Text variant="caption" style={styles.sectionDescription}>
                    Enter your password to link your {providerName} account and sign in with either method in the future.
                  </Text>

                  <Input
                    label="Current Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your account password"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    error={error || undefined}
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

                  <Button
                    title={`Link ${providerName} Account`}
                    variant="primary"
                    onPress={handleLinkAccount}
                    loading={isLoading}
                    disabled={isLoading}
                    fullWidth
                    leftIcon={<Ionicons name={providerIcon} size={20} color={Colors.textInverse} />}
                  />
                </View>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text variant="caption" style={styles.dividerText}>or</Text>
                  <View style={styles.divider} />
                </View>

                {/* Use different email */}
                <Button
                  title="Use Different Email"
                  variant="outline"
                  onPress={onUseDifferentEmail}
                  fullWidth
                />

                {/* Help text */}
                <Text variant="caption" style={styles.helpText}>
                  Create a new account with a different email address
                </Text>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.screenPadding,
  },
  modal: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...Shadows.xl,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    zIndex: 1,
  },
  iconContainer: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
    ...Shadows.sm,
  },
  title: {
    textAlign: 'center',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  description: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  emailText: {
    color: Colors.primary,
  },
  linkSection: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.text,
  },
  sectionDescription: {
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
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
  helpText: {
    textAlign: 'center',
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
});

export default AccountConflictModal;
