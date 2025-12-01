/**
 * Storage Space Monitoring and Warnings
 *
 * Implements FR-061, NFR-024:
 * - Monitor device storage space
 * - Warn users when storage < 500MB available
 * - Provide quality/compression options when low on space
 */

import { getAvailableStorage, getTotalStorageUsed, isStorageLow } from '@/services/storage/local';

/**
 * Storage status levels
 */
export type StorageLevel = 'healthy' | 'warning' | 'critical' | 'full';

/**
 * Storage status information
 */
export interface StorageStatus {
  level: StorageLevel;
  availableBytes: number;
  usedByAppBytes: number;
  percentageUsed: number;
  shouldWarn: boolean;
  shouldBlock: boolean;
  message: string;
}

/**
 * Quality/compression options for saving space
 */
export interface CompressionOption {
  id: string;
  label: string;
  description: string;
  quality: number; // 0.0 - 1.0
  targetSizeKB: number;
  estimatedPhotos: number;
}

// Thresholds (bytes)
const LOW_STORAGE_THRESHOLD = 500 * 1024 * 1024; // 500MB
const CRITICAL_STORAGE_THRESHOLD = 100 * 1024 * 1024; // 100MB
const FULL_STORAGE_THRESHOLD = 50 * 1024 * 1024; // 50MB

/**
 * Get current storage status
 *
 * @returns Storage status with level and warnings
 *
 * Per NFR-024: Warn when available space < 500MB
 */
export async function getStorageStatus(): Promise<StorageStatus> {
  const availableBytes = await getAvailableStorage();
  const usedByAppBytes = await getTotalStorageUsed();

  // Estimate total device storage (not always accurate, but useful for percentage)
  const totalDeviceStorage = 64 * 1024 * 1024 * 1024; // Assume 64GB device as baseline
  const usedPercentage = Math.round(((totalDeviceStorage - availableBytes) / totalDeviceStorage) * 100);

  // Determine storage level
  let level: StorageLevel;
  let message: string;
  let shouldWarn: boolean;
  let shouldBlock: boolean;

  if (availableBytes < FULL_STORAGE_THRESHOLD) {
    level = 'full';
    message = 'Storage is almost full. Delete photos or free up space to continue.';
    shouldWarn = true;
    shouldBlock = true;
  } else if (availableBytes < CRITICAL_STORAGE_THRESHOLD) {
    level = 'critical';
    message = 'Storage space critically low. Consider deleting old photos or lowering quality.';
    shouldWarn = true;
    shouldBlock = false;
  } else if (availableBytes < LOW_STORAGE_THRESHOLD) {
    level = 'warning';
    message = 'Storage space running low. You may want to enable cloud backup or lower photo quality.';
    shouldWarn = true;
    shouldBlock = false;
  } else {
    level = 'healthy';
    message = 'Storage space is healthy.';
    shouldWarn = false;
    shouldBlock = false;
  }

  return {
    level,
    availableBytes,
    usedByAppBytes,
    percentageUsed: usedPercentage,
    shouldWarn,
    shouldBlock,
    message,
  };
}

/**
 * Get compression options based on available storage
 *
 * @param availableBytes - Available storage in bytes
 * @returns Array of compression options
 *
 * Per FR-061: Provide quality/compression options when storage is low
 */
export function getCompressionOptions(availableBytes: number): CompressionOption[] {
  const isLowStorage = availableBytes < LOW_STORAGE_THRESHOLD;

  const options: CompressionOption[] = [
    {
      id: 'high',
      label: 'High Quality',
      description: 'Best for detailed comparison (2MB per photo)',
      quality: 0.9,
      targetSizeKB: 2048,
      estimatedPhotos: Math.floor(availableBytes / (2048 * 1024)),
    },
    {
      id: 'medium',
      label: 'Medium Quality',
      description: 'Balanced quality and storage (1MB per photo)',
      quality: 0.7,
      targetSizeKB: 1024,
      estimatedPhotos: Math.floor(availableBytes / (1024 * 1024)),
    },
    {
      id: 'low',
      label: 'Lower Quality',
      description: 'Save storage space (500KB per photo)',
      quality: 0.5,
      targetSizeKB: 512,
      estimatedPhotos: Math.floor(availableBytes / (512 * 1024)),
    },
  ];

  // If storage is low, recommend medium or low quality
  if (isLowStorage) {
    options[1].description += ' (Recommended for low storage)';
  }

  return options;
}

/**
 * Get recommended compression setting
 *
 * @param availableBytes - Available storage in bytes
 * @returns Recommended compression option ID
 */
export function getRecommendedCompression(availableBytes: number): string {
  if (availableBytes < CRITICAL_STORAGE_THRESHOLD) {
    return 'low';
  } else if (availableBytes < LOW_STORAGE_THRESHOLD) {
    return 'medium';
  } else {
    return 'high';
  }
}

/**
 * Format bytes to human-readable string
 *
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 GB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2));

  return `${value} ${sizes[i]}`;
}

/**
 * Estimate photos that can be stored
 *
 * @param availableBytes - Available storage in bytes
 * @param avgPhotoSizeBytes - Average photo size in bytes
 * @returns Estimated number of photos
 */
export function estimatePhotosCapacity(
  availableBytes: number,
  avgPhotoSizeBytes: number = 2 * 1024 * 1024 // Default 2MB
): number {
  // Reserve 100MB for system and other app data
  const usableBytes = Math.max(0, availableBytes - (100 * 1024 * 1024));
  return Math.floor(usableBytes / avgPhotoSizeBytes);
}

/**
 * Check if user can capture new photo
 *
 * @param avgPhotoSizeBytes - Expected photo size in bytes
 * @returns True if enough space available
 *
 * Per NFR-024: Block photo capture if storage critically low
 */
export async function canCapturePhoto(
  avgPhotoSizeBytes: number = 2 * 1024 * 1024
): Promise<boolean> {
  const status = await getStorageStatus();

  // Block if storage is full or would be critically low after capture
  return !status.shouldBlock && status.availableBytes > avgPhotoSizeBytes + CRITICAL_STORAGE_THRESHOLD;
}

/**
 * Get storage warning message for user
 *
 * @param status - Storage status
 * @returns User-friendly warning message with actions
 */
export function getStorageWarningMessage(status: StorageStatus): {
  title: string;
  message: string;
  actions: Array<{ label: string; action: string }>;
} {
  switch (status.level) {
    case 'full':
      return {
        title: 'Storage Full',
        message: `Your device has only ${formatBytes(status.availableBytes)} available. Free up space to continue taking photos.`,
        actions: [
          { label: 'Delete Old Photos', action: 'delete_photos' },
          { label: 'Free Up Space', action: 'open_settings' },
        ],
      };

    case 'critical':
      return {
        title: 'Storage Almost Full',
        message: `Only ${formatBytes(status.availableBytes)} remaining. Consider deleting old photos or enabling cloud backup.`,
        actions: [
          { label: 'Lower Quality', action: 'change_quality' },
          { label: 'Enable Cloud Backup', action: 'enable_cloud' },
          { label: 'Delete Old Photos', action: 'delete_photos' },
        ],
      };

    case 'warning':
      return {
        title: 'Low Storage Space',
        message: `You have ${formatBytes(status.availableBytes)} available. You can store approximately ${estimatePhotosCapacity(status.availableBytes)} more photos at current quality.`,
        actions: [
          { label: 'Enable Cloud Backup', action: 'enable_cloud' },
          { label: 'Lower Quality', action: 'change_quality' },
          { label: 'Continue', action: 'dismiss' },
        ],
      };

    default:
      return {
        title: 'Storage Healthy',
        message: `You have ${formatBytes(status.availableBytes)} available space.`,
        actions: [{ label: 'OK', action: 'dismiss' }],
      };
  }
}

/**
 * Storage monitoring hook data
 */
export interface StorageMonitorData {
  status: StorageStatus;
  options: CompressionOption[];
  recommended: string;
  canCapture: boolean;
}

/**
 * Get complete storage monitoring data
 *
 * Useful for storage management UI screens
 *
 * @returns Complete storage monitoring data
 */
export async function getStorageMonitorData(): Promise<StorageMonitorData> {
  const status = await getStorageStatus();
  const options = getCompressionOptions(status.availableBytes);
  const recommended = getRecommendedCompression(status.availableBytes);
  const canCapture = await canCapturePhoto();

  return {
    status,
    options,
    recommended,
    canCapture,
  };
}

/**
 * Usage Examples:
 *
 * 1. Before capturing photo:
 * ```
 * const canCapture = await canCapturePhoto();
 * if (!canCapture) {
 *   const status = await getStorageStatus();
 *   const warning = getStorageWarningMessage(status);
 *   showAlert(warning.title, warning.message, warning.actions);
 * }
 * ```
 *
 * 2. In settings screen:
 * ```
 * const monitorData = await getStorageMonitorData();
 * <StorageStatus status={monitorData.status} />
 * <CompressionOptions options={monitorData.options} recommended={monitorData.recommended} />
 * ```
 *
 * 3. Periodic monitoring:
 * ```
 * setInterval(async () => {
 *   const status = await getStorageStatus();
 *   if (status.shouldWarn) {
 *     showNotification(status.message);
 *   }
 * }, 60000); // Check every minute
 * ```
 */
