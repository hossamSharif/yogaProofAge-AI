/**
 * Background Photo Sync Queue Service
 *
 * Implements FR-053, NFR-025:
 * - Background sync for photos when on WiFi
 * - Avoids cellular data charges
 * - Queues photos for upload and processes when connected
 * - Respects user's cloud backup preferences
 */

import NetInfo from '@react-native-community/netinfo';
import { uploadPhoto, isCloudBackupEnabled } from './cloud';
import { loadPhoto } from './local';
import * as databaseService from '@/services/supabase/database';

/**
 * Sync queue item
 */
interface SyncQueueItem {
  photoId: string;
  userId: string;
  localUri: string;
  addedAt: string;
  retryCount: number;
}

/**
 * In-memory sync queue (persisted in MMKV in production)
 */
let syncQueue: SyncQueueItem[] = [];
let isSyncing = false;

/**
 * Add photo to sync queue
 *
 * @param photoId - Photo ID
 * @param userId - User ID
 * @param localUri - Local photo URI
 */
export function addToSyncQueue(photoId: string, userId: string, localUri: string): void {
  // Check if already in queue
  const exists = syncQueue.some(item => item.photoId === photoId);

  if (!exists) {
    syncQueue.push({
      photoId,
      userId,
      localUri,
      addedAt: new Date().toISOString(),
      retryCount: 0,
    });

    // Trigger sync if conditions are met
    processSyncQueue().catch(console.error);
  }
}

/**
 * Remove photo from sync queue
 *
 * @param photoId - Photo ID
 */
export function removeFromSyncQueue(photoId: string): void {
  syncQueue = syncQueue.filter(item => item.photoId !== photoId);
}

/**
 * Get current sync queue
 *
 * @returns Array of sync queue items
 */
export function getSyncQueue(): SyncQueueItem[] {
  return [...syncQueue];
}

/**
 * Check if device is on WiFi connection
 *
 * @returns True if connected via WiFi
 *
 * Per NFR-025: Avoid cellular data charges
 */
async function isOnWiFi(): Promise<boolean> {
  const netInfo = await NetInfo.fetch();

  return (
    netInfo.isConnected === true &&
    netInfo.type === 'wifi' &&
    netInfo.isInternetReachable === true
  );
}

/**
 * Process sync queue and upload pending photos
 *
 * Per FR-053, NFR-025:
 * - Only syncs when on WiFi
 * - Processes queue in background
 * - Retries failed uploads (max 3 attempts)
 * - Updates database with cloud URLs
 *
 * @returns Number of photos successfully synced
 */
export async function processSyncQueue(): Promise<number> {
  // Prevent concurrent sync operations
  if (isSyncing) {
    return 0;
  }

  // Check if on WiFi
  const onWiFi = await isOnWiFi();
  if (!onWiFi) {
    console.log('Not on WiFi, skipping sync');
    return 0;
  }

  // Check if queue is empty
  if (syncQueue.length === 0) {
    return 0;
  }

  isSyncing = true;
  let successCount = 0;

  try {
    // Process items in queue
    const itemsToProcess = [...syncQueue];

    for (const item of itemsToProcess) {
      try {
        // Check if user still has cloud backup enabled
        const backupEnabled = await isCloudBackupEnabled(item.userId);

        if (!backupEnabled) {
          // User disabled backup, remove from queue
          removeFromSyncQueue(item.photoId);
          continue;
        }

        // Verify local photo still exists
        const localUri = await loadPhoto(item.photoId);

        if (!localUri) {
          console.warn(`Photo ${item.photoId} not found locally, removing from queue`);
          removeFromSyncQueue(item.photoId);
          continue;
        }

        // Upload photo to cloud
        const uploadResult = await uploadPhoto(localUri, item.photoId, item.userId);

        // Update database with cloud URL
        await databaseService.updateProgressPhoto(item.photoId, {
          cloud_url: uploadResult.cloudUrl,
          cloud_path: uploadResult.cloudPath,
        });

        // Remove from queue on success
        removeFromSyncQueue(item.photoId);
        successCount++;

        console.log(`Successfully synced photo ${item.photoId}`);
      } catch (error) {
        console.error(`Failed to sync photo ${item.photoId}:`, error);

        // Increment retry count
        const itemIndex = syncQueue.findIndex(qi => qi.photoId === item.photoId);
        if (itemIndex >= 0) {
          syncQueue[itemIndex].retryCount++;

          // Remove from queue if max retries exceeded
          if (syncQueue[itemIndex].retryCount >= 3) {
            console.error(`Max retries exceeded for photo ${item.photoId}, removing from queue`);
            removeFromSyncQueue(item.photoId);
          }
        }
      }
    }

    return successCount;
  } finally {
    isSyncing = false;
  }
}

/**
 * Start automatic background sync
 *
 * Sets up network listener to trigger sync when WiFi connects
 *
 * @returns Cleanup function to stop listening
 */
export function startBackgroundSync(): () => void {
  const unsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected && state.type === 'wifi' && state.isInternetReachable) {
      // WiFi connected, process sync queue
      processSyncQueue().catch(console.error);
    }
  });

  // Initial sync attempt
  processSyncQueue().catch(console.error);

  // Return cleanup function
  return unsubscribe;
}

/**
 * Force sync all pending photos (manual trigger)
 *
 * Useful for "Sync Now" button in settings
 *
 * @returns Number of photos successfully synced
 * @throws Error if not on WiFi
 */
export async function forceSyncAll(): Promise<number> {
  const onWiFi = await isOnWiFi();

  if (!onWiFi) {
    throw new Error('Cannot sync: Not connected to WiFi');
  }

  return await processSyncQueue();
}

/**
 * Get sync queue status
 *
 * @returns Sync status information
 */
export function getSyncStatus(): {
  queueLength: number;
  isSyncing: boolean;
  oldestItem: string | null;
} {
  const oldestItem = syncQueue.length > 0 ? syncQueue[0].addedAt : null;

  return {
    queueLength: syncQueue.length,
    isSyncing,
    oldestItem,
  };
}

/**
 * Clear entire sync queue (for testing or reset)
 *
 * @warning This will cancel all pending uploads
 */
export function clearSyncQueue(): void {
  syncQueue = [];
}

/**
 * Persistence Notes:
 *
 * In production, the sync queue should be persisted in MMKV so it survives:
 * - App restarts
 * - Background termination
 * - Device reboots
 *
 * Implementation:
 * 1. Load queue from MMKV on app start
 * 2. Save queue to MMKV on every modification
 * 3. Use react-native-mmkv for fast synchronous storage
 *
 * Background Task Notes:
 *
 * For true background sync, integrate with:
 * - iOS: BackgroundFetch API
 * - Android: WorkManager via expo-background-fetch
 *
 * This allows sync to happen even when app is in background/terminated
 */
