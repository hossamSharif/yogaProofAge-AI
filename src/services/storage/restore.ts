/**
 * Photo Restoration Service
 *
 * Implements FR-062, NFR-027:
 * - Restore photos from cloud backup
 * - Complete restoration within 5 minutes for typical galleries (100+ photos)
 * - Batch download with progress tracking
 * - Handle partial restoration failures gracefully
 */

import { downloadPhoto, isCloudBackupEnabled } from './cloud';
import { loadPhoto, savePhoto } from './local';
import * as databaseService from '@/services/supabase/database';
import { supabase } from '@/services/supabase/client';

/**
 * Restoration progress callback
 */
export type RestorationProgressCallback = (progress: {
  current: number;
  total: number;
  percentage: number;
  currentPhotoId: string;
}) => void;

/**
 * Restoration result
 */
export interface RestorationResult {
  totalPhotos: number;
  successCount: number;
  failureCount: number;
  failedPhotoIds: string[];
  durationMs: number;
}

/**
 * Restore all user photos from cloud backup
 *
 * @param userId - User ID
 * @param onProgress - Optional progress callback
 * @returns Restoration result with statistics
 *
 * Per NFR-027: Target restoration within 5 minutes for typical galleries (100+ photos)
 * Uses parallel downloads (batch size: 5) to optimize speed
 */
export async function restoreAllPhotos(
  userId: string,
  onProgress?: RestorationProgressCallback
): Promise<RestorationResult> {
  const startTime = Date.now();

  try {
    // Check if user has cloud backup enabled
    const backupEnabled = await isCloudBackupEnabled(userId);

    if (!backupEnabled) {
      throw new Error('Cloud backup is not enabled for this user');
    }

    // Get all user's photos from database
    const photos = await databaseService.getProgressPhotos(userId);

    const totalPhotos = photos.length;
    let successCount = 0;
    let failureCount = 0;
    const failedPhotoIds: string[] = [];

    // Process photos in batches (parallel downloads)
    const BATCH_SIZE = 5;

    for (let i = 0; i < photos.length; i += BATCH_SIZE) {
      const batch = photos.slice(i, i + BATCH_SIZE);

      // Download batch in parallel
      const promises = batch.map(async photo => {
        try {
          // Check if photo already exists locally
          const existingUri = await loadPhoto(photo.id);

          if (existingUri) {
            // Photo already exists, skip
            return { success: true, photoId: photo.id };
          }

          // Check if photo has cloud backup
          if (!photo.cloud_path) {
            throw new Error('Photo has no cloud backup');
          }

          // Download and decrypt photo
          const localUri = await downloadPhoto(photo.cloud_path, photo.id, userId);

          // Update progress
          if (onProgress) {
            const current = i + batch.indexOf(photo) + 1;
            onProgress({
              current,
              total: totalPhotos,
              percentage: Math.round((current / totalPhotos) * 100),
              currentPhotoId: photo.id,
            });
          }

          return { success: true, photoId: photo.id };
        } catch (error) {
          console.error(`Failed to restore photo ${photo.id}:`, error);
          return { success: false, photoId: photo.id };
        }
      });

      // Wait for batch to complete
      const results = await Promise.all(promises);

      // Count successes and failures
      results.forEach(result => {
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
          failedPhotoIds.push(result.photoId);
        }
      });
    }

    const durationMs = Date.now() - startTime;

    return {
      totalPhotos,
      successCount,
      failureCount,
      failedPhotoIds,
      durationMs,
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;

    throw {
      error: (error as Error).message,
      durationMs,
    };
  }
}

/**
 * Restore a single photo from cloud backup
 *
 * @param photoId - Photo ID
 * @param userId - User ID
 * @returns True if restored successfully
 *
 * Useful for on-demand restoration when viewing a specific photo
 */
export async function restoreSinglePhoto(photoId: string, userId: string): Promise<boolean> {
  try {
    // Check if photo already exists locally
    const existingUri = await loadPhoto(photoId);

    if (existingUri) {
      return true; // Already exists
    }

    // Check if user has cloud backup enabled
    const backupEnabled = await isCloudBackupEnabled(userId);

    if (!backupEnabled) {
      throw new Error('Cloud backup is not enabled');
    }

    // Get photo metadata from database
    const photos = await databaseService.getProgressPhotos(userId);
    const photo = photos.find(p => p.id === photoId);

    if (!photo) {
      throw new Error('Photo not found in database');
    }

    if (!photo.cloud_path) {
      throw new Error('Photo has no cloud backup');
    }

    // Download and decrypt photo
    await downloadPhoto(photo.cloud_path, photoId, userId);

    return true;
  } catch (error) {
    console.error(`Failed to restore photo ${photoId}:`, error);
    return false;
  }
}

/**
 * Check restoration status for all photos
 *
 * @param userId - User ID
 * @returns Status summary
 *
 * Useful for displaying restoration progress UI
 */
export async function getRestorationStatus(userId: string): Promise<{
  totalPhotos: number;
  localPhotos: number;
  cloudOnlyPhotos: number;
  missingPhotos: number;
  percentageLocal: number;
}> {
  try {
    // Get all user's photos from database
    const photos = await databaseService.getProgressPhotos(userId);

    const totalPhotos = photos.length;
    let localPhotos = 0;
    let cloudOnlyPhotos = 0;
    let missingPhotos = 0;

    // Check each photo's availability
    for (const photo of photos) {
      const existingUri = await loadPhoto(photo.id);

      if (existingUri) {
        localPhotos++;
      } else if (photo.cloud_path) {
        cloudOnlyPhotos++;
      } else {
        missingPhotos++;
      }
    }

    const percentageLocal = totalPhotos > 0 ? Math.round((localPhotos / totalPhotos) * 100) : 100;

    return {
      totalPhotos,
      localPhotos,
      cloudOnlyPhotos,
      missingPhotos,
      percentageLocal,
    };
  } catch (error) {
    console.error('Failed to get restoration status:', error);
    throw error;
  }
}

/**
 * Estimate restoration time
 *
 * @param userId - User ID
 * @returns Estimated time in milliseconds
 *
 * Per NFR-027: Target 5 minutes for 100+ photos
 * Estimates ~3 seconds per photo with parallel downloads
 */
export async function estimateRestorationTime(userId: string): Promise<number> {
  try {
    const status = await getRestorationStatus(userId);

    // Estimate 3 seconds per photo with batching
    const photosToRestore = status.cloudOnlyPhotos;
    const estimatedSeconds = Math.ceil(photosToRestore / 5) * 3; // Batch of 5, 3s per batch

    return estimatedSeconds * 1000; // Convert to milliseconds
  } catch (error) {
    console.error('Failed to estimate restoration time:', error);
    return 0;
  }
}

/**
 * Verify cloud backup integrity
 *
 * Checks if all photos with cloud_path actually exist in cloud storage
 *
 * @param userId - User ID
 * @returns Integrity check result
 */
export async function verifyBackupIntegrity(userId: string): Promise<{
  totalCloudPhotos: number;
  validPhotos: number;
  brokenPhotos: number;
  brokenPhotoIds: string[];
}> {
  try {
    // Get all user's photos with cloud backup
    const photos = await databaseService.getProgressPhotos(userId);
    const cloudPhotos = photos.filter(p => p.cloud_path);

    const totalCloudPhotos = cloudPhotos.length;
    let validPhotos = 0;
    let brokenPhotos = 0;
    const brokenPhotoIds: string[] = [];

    // Check each cloud photo
    for (const photo of cloudPhotos) {
      try {
        // Try to get file metadata (doesn't download full file)
        const { data, error } = await supabase.storage
          .from('progress-photos')
          .list(userId, {
            search: `${photo.id}.jpg.encrypted`,
          });

        if (error || !data || data.length === 0) {
          brokenPhotos++;
          brokenPhotoIds.push(photo.id);
        } else {
          validPhotos++;
        }
      } catch (error) {
        brokenPhotos++;
        brokenPhotoIds.push(photo.id);
      }
    }

    return {
      totalCloudPhotos,
      validPhotos,
      brokenPhotos,
      brokenPhotoIds,
    };
  } catch (error) {
    console.error('Failed to verify backup integrity:', error);
    throw error;
  }
}

/**
 * Performance Notes:
 *
 * Per NFR-027: Target 5 minutes for typical galleries (100+ photos)
 *
 * Optimization strategies:
 * 1. Parallel downloads (batch size: 5)
 * 2. Skip already-downloaded photos
 * 3. Stream decryption (don't load entire file in memory)
 * 4. Use compression on uploads to reduce download size
 * 5. Show progress UI to keep user informed
 *
 * Typical performance:
 * - 100 photos @ 2MB each = 200MB total
 * - With 5 parallel downloads @ ~10MB/s WiFi = ~20 seconds per batch
 * - 20 batches = ~400 seconds = ~6.7 minutes (slightly over target)
 *
 * To meet 5-minute target:
 * - Increase batch size to 8-10 (with connection management)
 * - Compress photos more aggressively (<1MB each)
 * - Use CDN with better regional performance
 */
