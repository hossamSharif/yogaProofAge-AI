/**
 * Push Notification Service
 *
 * Handles push notification registration, token management,
 * and notification delivery for the app.
 *
 * Features:
 * - Expo push token registration
 * - Permission handling
 * - Notification listeners
 * - Token refresh management
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

/**
 * Push Token Type
 */
export interface PushToken {
  token: string;
  type: 'expo' | 'apns' | 'fcm';
  platform: 'ios' | 'android';
}

/**
 * Notification Data
 */
export interface NotificationData {
  type?: 'routine_reminder' | 'progress_milestone' | 'ai_tip' | 'system';
  routineId?: string;
  screenPath?: string;
  [key: string]: unknown;
}

/**
 * Notification Response Handler Type
 */
type NotificationResponseHandler = (
  response: Notifications.NotificationResponse
) => void;

/**
 * Notification Received Handler Type
 */
type NotificationReceivedHandler = (
  notification: Notifications.Notification
) => void;

// Store for listeners
let responseListener: Notifications.Subscription | null = null;
let receivedListener: Notifications.Subscription | null = null;

/**
 * Register for push notifications and get the token
 * @returns Push token or null if registration fails
 */
export async function registerForPushNotifications(): Promise<PushToken | null> {
  // Check if physical device
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification permission not granted');
    return null;
  }

  // Configure Android notification channel
  if (Platform.OS === 'android') {
    await setupAndroidChannel();
  }

  try {
    // Get Expo push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    return {
      token: tokenData.data,
      type: 'expo',
      platform: Platform.OS as 'ios' | 'android',
    };
  } catch (error) {
    console.error('Failed to get push token:', error);
    return null;
  }
}

/**
 * Setup Android notification channel
 */
async function setupAndroidChannel(): Promise<void> {
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#6B4EFF',
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync('routine-reminders', {
    name: 'Routine Reminders',
    description: 'Daily routine reminder notifications',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
  });

  await Notifications.setNotificationChannelAsync('progress', {
    name: 'Progress Updates',
    description: 'Progress milestones and achievements',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync('tips', {
    name: 'AI Tips',
    description: 'Personalized skincare tips from AI',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
}

/**
 * Add listener for notification responses (when user taps notification)
 * @param handler Handler function
 * @returns Cleanup function
 */
export function addNotificationResponseListener(
  handler: NotificationResponseHandler
): () => void {
  responseListener = Notifications.addNotificationResponseReceivedListener(handler);

  return () => {
    if (responseListener) {
      Notifications.removeNotificationSubscription(responseListener);
      responseListener = null;
    }
  };
}

/**
 * Add listener for received notifications (when notification arrives while app is open)
 * @param handler Handler function
 * @returns Cleanup function
 */
export function addNotificationReceivedListener(
  handler: NotificationReceivedHandler
): () => void {
  receivedListener = Notifications.addNotificationReceivedListener(handler);

  return () => {
    if (receivedListener) {
      Notifications.removeNotificationSubscription(receivedListener);
      receivedListener = null;
    }
  };
}

/**
 * Remove all notification listeners
 */
export function removeAllListeners(): void {
  if (responseListener) {
    Notifications.removeNotificationSubscription(responseListener);
    responseListener = null;
  }
  if (receivedListener) {
    Notifications.removeNotificationSubscription(receivedListener);
    receivedListener = null;
  }
}

/**
 * Get the notification that launched the app (if any)
 * @returns Last notification response or null
 */
export async function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  return Notifications.getLastNotificationResponseAsync();
}

/**
 * Get badge count
 * @returns Current badge count
 */
export async function getBadgeCount(): Promise<number> {
  return Notifications.getBadgeCountAsync();
}

/**
 * Set badge count
 * @param count Badge count to set
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear badge count
 */
export async function clearBadgeCount(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}

/**
 * Dismiss all delivered notifications
 */
export async function dismissAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
}

/**
 * Dismiss a specific notification
 * @param identifier Notification identifier
 */
export async function dismissNotification(identifier: string): Promise<void> {
  await Notifications.dismissNotificationAsync(identifier);
}

/**
 * Check if notifications are enabled
 * @returns true if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  return settings.granted;
}

/**
 * Request notification permissions
 * @returns true if permission granted
 */
export async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Get all pending scheduled notifications
 * @returns Array of scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Cancel a scheduled notification
 * @param identifier Notification identifier
 */
export async function cancelScheduledNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export default {
  registerForPushNotifications,
  addNotificationResponseListener,
  addNotificationReceivedListener,
  removeAllListeners,
  getLastNotificationResponse,
  getBadgeCount,
  setBadgeCount,
  clearBadgeCount,
  dismissAllNotifications,
  dismissNotification,
  areNotificationsEnabled,
  requestPermissions,
  getScheduledNotifications,
  cancelScheduledNotification,
  cancelAllScheduledNotifications,
};
