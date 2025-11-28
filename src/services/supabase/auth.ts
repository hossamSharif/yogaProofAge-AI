import { supabase } from './client';
import * as SecureStore from 'expo-secure-store';
import { Database } from '@/types/supabase.types';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

/**
 * Supabase Authentication Service
 *
 * Handles all authentication operations including:
 * - Email/password auth (FR-003, FR-007)
 * - Social auth (Google OAuth 2.0, Apple OpenID Connect) (FR-004, NFR-030, NFR-031)
 * - Account linking and conflict resolution (FR-005, FR-089)
 * - Password recovery (FR-087, NFR-033)
 * - Session management with 30-day JWT expiry (NFR-029)
 */

export interface SignUpParams {
  email: string;
  password: string;
  displayName: string;
  dateOfBirth?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface AccountConflictError {
  code: 'ACCOUNT_CONFLICT';
  existingEmail: string;
  provider: 'email' | 'google' | 'apple';
}

/**
 * Sign up with email and password
 * Implements FR-003, FR-007 (password requirements: 8+ chars, letters+numbers)
 */
export async function signUpWithEmail(params: SignUpParams) {
  const { email, password, displayName, dateOfBirth } = params;

  // Validate password requirements (FR-007)
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error('Password must contain both letters and numbers');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error('Failed to create user');

  // Create user profile
  const profileData: UserProfileInsert = {
    id: data.user.id,
    display_name: displayName,
    date_of_birth: dateOfBirth || null,
  };

  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert(profileData);

  if (profileError) throw profileError;

  return data;
}

/**
 * Sign in with email and password
 * Implements FR-003
 */
export async function signInWithEmail(params: SignInParams) {
  const { email, password } = params;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data;
}

/**
 * Sign in with Google OAuth 2.0
 * Implements FR-004, NFR-030
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'yogaageproof://auth/callback',
    },
  });

  if (error) throw error;

  return data;
}

/**
 * Sign in with Apple (OpenID Connect)
 * Implements FR-004, NFR-030, NFR-031 (required for App Store)
 */
export async function signInWithApple() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: 'yogaageproof://auth/callback',
    },
  });

  if (error) throw error;

  return data;
}

/**
 * Detect account conflict during social auth
 * Implements FR-089
 */
export function isAccountConflict(error: any): error is AccountConflictError {
  return (
    error?.code === 'email_exists' ||
    error?.message?.includes('already registered') ||
    error?.message?.includes('email already exists')
  );
}

/**
 * Link social auth provider to existing account
 * Implements FR-005, FR-089
 * Requires password verification before linking
 */
export async function linkSocialAccount(
  email: string,
  password: string,
  provider: 'google' | 'apple'
) {
  // Verify existing account password
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) throw new Error('Password verification failed');
  if (!signInData.user) throw new Error('User not found');

  // Link the social provider
  const { data, error } = await supabase.auth.linkIdentity({
    provider,
  });

  if (error) throw error;

  return data;
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;

  // Clear any cached auth tokens
  await SecureStore.deleteItemAsync('auth_token');
}

/**
 * Get current session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

/**
 * Send password recovery email
 * Implements FR-087, NFR-033 (1-hour token expiry configured in Supabase)
 */
export async function sendPasswordRecoveryEmail(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'yogaageproof://auth/reset-password',
  });

  if (error) throw error;

  return data;
}

/**
 * Update password with recovery token
 * Implements FR-087
 */
export async function updatePasswordWithToken(newPassword: string) {
  // Validate password requirements (FR-007)
  if (newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    throw new Error('Password must contain both letters and numbers');
  }

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;

  return data;
}

/**
 * Update user email
 * Implements FR-080
 */
export async function updateEmail(newEmail: string) {
  const { data, error } = await supabase.auth.updateUser({
    email: newEmail,
  });

  if (error) throw error;

  return data;
}

/**
 * Update user password
 * Implements FR-080
 */
export async function updatePassword(newPassword: string) {
  // Validate password requirements (FR-007)
  if (newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    throw new Error('Password must contain both letters and numbers');
  }

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;

  return data;
}

/**
 * Link additional social auth provider to account
 * Implements FR-088
 */
export async function linkIdentity(provider: 'google' | 'apple') {
  const { data, error } = await supabase.auth.linkIdentity({
    provider,
  });

  if (error) throw error;

  return data;
}

/**
 * Unlink social auth provider from account
 * Implements FR-088
 */
export async function unlinkIdentity(provider: 'google' | 'apple') {
  const user = await getCurrentUser();
  if (!user) throw new Error('No authenticated user');

  const identity = user.identities?.find(id => id.provider === provider);
  if (!identity) throw new Error(`${provider} identity not found`);

  const { data, error } = await supabase.auth.unlinkIdentity(identity);

  if (error) throw error;

  return data;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

/**
 * Refresh the current session
 * Implements T039 - Auth token refresh interceptor
 * Tokens expire after 30 days of inactivity (NFR-029)
 */
export async function refreshSession() {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) throw error;

  // Store refreshed token securely
  if (data.session?.access_token) {
    await SecureStore.setItemAsync('auth_token', data.session.access_token);
  }

  return data.session;
}

/**
 * Setup automatic token refresh
 * Implements T039 - Auth token refresh interceptor
 */
export function setupTokenRefresh() {
  // Supabase client handles automatic token refresh
  // This function sets up additional monitoring
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'TOKEN_REFRESHED' && session?.access_token) {
      await SecureStore.setItemAsync('auth_token', session.access_token);
    } else if (event === 'SIGNED_OUT') {
      await SecureStore.deleteItemAsync('auth_token');
    }
  });
}
