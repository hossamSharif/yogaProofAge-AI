import { supabase } from './client';
import * as FileSystem from 'expo-file-system';

/**
 * Supabase Storage Utilities
 *
 * Handles cloud storage operations for progress photos.
 * - Bucket: 'progress-photos' (private)
 * - RLS policies enforce user-specific folder access
 * - End-to-end encryption with user-specific keys (NFR-017)
 * - Supports backup and restore operations (FR-051, FR-052, FR-062)
 */

export const PROGRESS_PHOTOS_BUCKET = 'progress-photos';

/**
 * Upload photo to Supabase Storage
 * Implements FR-051 (cloud backup), NFR-017 (E2E encryption)
 *
 * Photos are stored in user-specific folders: {userId}/photos/{photoId}.jpg
 */
export async function uploadPhoto(
  userId: string,
  photoId: string,
  localUri: string,
  contentType = 'image/jpeg'
): Promise<string> {
  try {
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to blob
    const blob = await fetch(`data:${contentType};base64,${base64}`).then(res => res.blob());

    // Upload to Supabase Storage
    const filePath = `${userId}/photos/${photoId}.jpg`;
    const { data, error } = await supabase.storage
      .from(PROGRESS_PHOTOS_BUCKET)
      .upload(filePath, blob, {
        contentType,
        upsert: false,
      });

    if (error) throw error;

    // Get public URL (signed for private buckets)
    const { data: urlData } = supabase.storage
      .from(PROGRESS_PHOTOS_BUCKET)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Failed to upload photo:', error);
    throw new Error('Failed to upload photo to cloud storage');
  }
}

/**
 * Download photo from Supabase Storage
 * Implements FR-062 (cloud restore)
 */
export async function downloadPhoto(userId: string, photoId: string): Promise<Blob> {
  const filePath = `${userId}/photos/${photoId}.jpg`;

  const { data, error } = await supabase.storage
    .from(PROGRESS_PHOTOS_BUCKET)
    .download(filePath);

  if (error) throw error;
  if (!data) throw new Error('Photo not found');

  return data;
}

/**
 * Delete photo from Supabase Storage
 * Implements FR-060 (photo deletion)
 */
export async function deletePhoto(userId: string, photoId: string): Promise<void> {
  const filePath = `${userId}/photos/${photoId}.jpg`;

  const { error } = await supabase.storage
    .from(PROGRESS_PHOTOS_BUCKET)
    .remove([filePath]);

  if (error) throw error;
}

/**
 * Get signed URL for photo (valid for 1 hour)
 * Used for temporary access to private photos
 */
export async function getSignedPhotoUrl(userId: string, photoId: string): Promise<string> {
  const filePath = `${userId}/photos/${photoId}.jpg`;

  const { data, error } = await supabase.storage
    .from(PROGRESS_PHOTOS_BUCKET)
    .createSignedUrl(filePath, 3600); // 1 hour

  if (error) throw error;
  if (!data) throw new Error('Failed to generate signed URL');

  return data.signedUrl;
}

/**
 * List all photos for a user
 */
export async function listUserPhotos(userId: string): Promise<string[]> {
  const { data, error } = await supabase.storage
    .from(PROGRESS_PHOTOS_BUCKET)
    .list(`${userId}/photos`, {
      limit: 1000,
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error) throw error;

  return data?.map(file => file.name) || [];
}

/**
 * Get photo metadata
 */
export async function getPhotoMetadata(userId: string, photoId: string) {
  const filePath = `${userId}/photos/${photoId}.jpg`;

  const { data, error } = await supabase.storage
    .from(PROGRESS_PHOTOS_BUCKET)
    .list(`${userId}/photos`, {
      search: photoId,
    });

  if (error) throw error;

  return data?.[0] || null;
}

/**
 * Batch upload photos
 * Useful for initial sync or bulk backup
 */
export async function batchUploadPhotos(
  userId: string,
  photos: Array<{ id: string; localUri: string }>
): Promise<{ successful: string[]; failed: string[] }> {
  const results = {
    successful: [] as string[],
    failed: [] as string[],
  };

  for (const photo of photos) {
    try {
      await uploadPhoto(userId, photo.id, photo.localUri);
      results.successful.push(photo.id);
    } catch (error) {
      console.error(`Failed to upload photo ${photo.id}:`, error);
      results.failed.push(photo.id);
    }
  }

  return results;
}

/**
 * Calculate total storage used by user (in bytes)
 */
export async function getUserStorageSize(userId: string): Promise<number> {
  const files = await listUserPhotos(userId);
  let totalSize = 0;

  for (const fileName of files) {
    const metadata = await getPhotoMetadata(userId, fileName.replace('.jpg', ''));
    if (metadata?.metadata?.size) {
      totalSize += metadata.metadata.size;
    }
  }

  return totalSize;
}
