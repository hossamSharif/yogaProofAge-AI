import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Notification Scheduler Service (T106, FR-071, FR-077)
 *
 * Handles scheduling of local notifications for routine reminders.
 * Supports custom reminder times set by user.
 */

// Notification channel ID for Android
const ROUTINE_REMINDER_CHANNEL = 'routine-reminders';

/**
 * Initialize notification handling
 */
export async function initializeNotifications(): Promise<void> {
  // Set notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Create notification channel for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ROUTINE_REMINDER_CHANNEL, {
      name: 'Routine Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
      enableLights: true,
      lightColor: '#4A90E2',
    });
  }
}

/**
 * Schedule a daily routine reminder notification (FR-071)
 *
 * @param time - Time object with hour (0-23) and minute (0-59)
 * @param title - Notification title
 * @param body - Notification body
 * @param routineId - Associated routine ID (optional, for deep linking)
 * @returns Notification identifier
 */
export async function scheduleRoutineReminder(
  time: { hour: number; minute: number },
  title: string = 'Time for your routine!',
  body: string = 'Complete your skincare and face yoga routine to maintain your progress.',
  routineId?: string
): Promise<string> {
  try {
    // Cancel any existing routine reminders
    await cancelRoutineReminder();

    const trigger: Notifications.DailyTriggerInput = {
      hour: time.hour,
      minute: time.minute,
      repeats: true,
    };

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: {
          type: 'routine_reminder',
          routineId,
          scheduledFor: `${time.hour}:${time.minute}`,
        },
        categoryIdentifier: 'routine',
        ...(Platform.OS === 'android' && {
          channelId: ROUTINE_REMINDER_CHANNEL,
        }),
      },
      trigger,
    });

    // Store the notification ID for later cancellation
    await storeNotificationId('routine_reminder', notificationId);

    return notificationId;
  } catch (error) {
    console.error('Error scheduling routine reminder:', error);
    throw error;
  }
}

/**
 * Schedule multiple reminder times (FR-077)
 *
 * @param times - Array of time objects
 * @param title - Notification title
 * @param body - Notification body
 * @param routineId - Associated routine ID
 * @returns Array of notification identifiers
 */
export async function scheduleMultipleReminders(
  times: Array<{ hour: number; minute: number }>,
  title?: string,
  body?: string,
  routineId?: string
): Promise<string[]> {
  const notificationIds: string[] = [];

  for (let i = 0; i < times.length; i++) {
    const time = times[i];
    const customTitle = title || `Routine reminder ${i + 1}`;

    try {
      const trigger: Notifications.DailyTriggerInput = {
        hour: time.hour,
        minute: time.minute,
        repeats: true,
      };

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: customTitle,
          body:
            body ||
            'Complete your skincare and face yoga routine to maintain your progress.',
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {
            type: 'routine_reminder',
            routineId,
            reminderIndex: i,
            scheduledFor: `${time.hour}:${time.minute}`,
          },
          categoryIdentifier: 'routine',
          ...(Platform.OS === 'android' && {
            channelId: ROUTINE_REMINDER_CHANNEL,
          }),
        },
        trigger,
      });

      notificationIds.push(notificationId);
      await storeNotificationId(`routine_reminder_${i}`, notificationId);
    } catch (error) {
      console.error(`Error scheduling reminder ${i}:`, error);
    }
  }

  return notificationIds;
}

/**
 * Cancel routine reminder notification
 */
export async function cancelRoutineReminder(): Promise<void> {
  try {
    const notificationId = await getStoredNotificationId('routine_reminder');
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      await removeStoredNotificationId('routine_reminder');
    }
  } catch (error) {
    console.error('Error canceling routine reminder:', error);
  }
}

/**
 * Cancel all routine reminder notifications
 */
export async function cancelAllRoutineReminders(): Promise<void> {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of scheduledNotifications) {
      const data = notification.content.data as { type?: string };
      if (data?.type === 'routine_reminder') {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    // Clear stored IDs
    const keys = ['routine_reminder'];
    for (let i = 0; i < 10; i++) {
      // Support up to 10 reminders
      keys.push(`routine_reminder_${i}`);
    }

    for (const key of keys) {
      await removeStoredNotificationId(key);
    }
  } catch (error) {
    console.error('Error canceling all routine reminders:', error);
  }
}

/**
 * Get all scheduled routine reminders
 *
 * @returns Array of scheduled notifications
 */
export async function getScheduledRoutineReminders(): Promise<
  Notifications.NotificationRequest[]
> {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    return scheduledNotifications.filter(notification => {
      const data = notification.content.data as { type?: string };
      return data?.type === 'routine_reminder';
    });
  } catch (error) {
    console.error('Error getting scheduled reminders:', error);
    return [];
  }
}

/**
 * Check if routine reminders are enabled
 *
 * @returns true if at least one reminder is scheduled
 */
export async function areRemindersEnabled(): Promise<boolean> {
  const reminders = await getScheduledRoutineReminders();
  return reminders.length > 0;
}

/**
 * Schedule a one-time notification (for testing or special events)
 *
 * @param delaySeconds - Delay in seconds before notification fires
 * @param title - Notification title
 * @param body - Notification body
 * @param data - Additional data
 */
export async function scheduleOneTimeNotification(
  delaySeconds: number,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<string> {
  try {
    const trigger: Notifications.TimeIntervalTriggerInput = {
      seconds: delaySeconds,
      repeats: false,
    };

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        data: {
          ...data,
          type: 'one_time',
        },
        ...(Platform.OS === 'android' && {
          channelId: ROUTINE_REMINDER_CHANNEL,
        }),
      },
      trigger,
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling one-time notification:', error);
    throw error;
  }
}

// ============================================================================
// Helper functions for storing notification IDs
// ============================================================================

import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'notification-ids' });

async function storeNotificationId(key: string, id: string): Promise<void> {
  storage.set(key, id);
}

async function getStoredNotificationId(key: string): Promise<string | null> {
  return storage.getString(key) || null;
}

async function removeStoredNotificationId(key: string): Promise<void> {
  storage.delete(key);
}
