import { MMKV } from 'react-native-mmkv';
import * as FileSystem from 'expo-file-system';
import { Database } from '@/types/supabase.types';

type RoutineStep = Database['public']['Tables']['routine_steps']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

/**
 * Cache Utility for Offline Access (T103, NFR-005)
 *
 * Implements caching strategy for routine content to enable offline playback.
 * Uses MMKV for metadata and Expo FileSystem for images.
 *
 * Caches:
 * - Routine steps (instructions, tips, metadata)
 * - Product information
 * - Step images (face yoga demonstrations, product photos)
 */

// Initialize MMKV storage
const cache = new MMKV({
  id: 'routine-cache',
  encryptionKey: 'yogaageproof-cache-key', // In production, use secure key from Expo SecureStore
});

const CACHE_DIR = `${FileSystem.cacheDirectory}routines/`;
const CACHE_VERSION_KEY = 'cache_version';
const CURRENT_CACHE_VERSION = '1.0';

/**
 * Cached routine data structure
 */
export interface CachedRoutine {
  id: string;
  steps: RoutineStep[];
  products: Record<string, Product>;
  cachedAt: string;
  version: string;
}

/**
 * Initialize cache directory
 */
async function ensureCacheDirectory(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
}

/**
 * Cache routine content for offline access (T103, NFR-005)
 *
 * @param routineId - Routine ID
 * @param steps - Routine steps with product data
 */
export async function cacheRoutineContent(
  routineId: string,
  steps: (RoutineStep & { products?: Product | null })[]
): Promise<void> {
  try {
    await ensureCacheDirectory();

    // Extract products from steps
    const products: Record<string, Product> = {};
    for (const step of steps) {
      if (step.products && step.product_id) {
        products[step.product_id] = step.products;
      }
    }

    // Cache images
    for (const step of steps) {
      if (step.image_url) {
        await cacheImage(step.image_url, `step_${step.id}`);
      }
      if (step.products?.image_url && step.product_id) {
        await cacheImage(step.products.image_url, `product_${step.product_id}`);
      }
    }

    // Store routine metadata and steps in MMKV
    const cachedRoutine: CachedRoutine = {
      id: routineId,
      steps: steps.map(({ products, ...step }) => step), // Remove product nested data
      products,
      cachedAt: new Date().toISOString(),
      version: CURRENT_CACHE_VERSION,
    };

    cache.set(`routine_${routineId}`, JSON.stringify(cachedRoutine));
  } catch (error) {
    console.error('Error caching routine content:', error);
    throw error;
  }
}

/**
 * Retrieve cached routine content
 *
 * @param routineId - Routine ID
 * @returns Cached routine or null if not cached
 */
export function getCachedRoutine(routineId: string): CachedRoutine | null {
  try {
    const cached = cache.getString(`routine_${routineId}`);
    if (!cached) return null;

    const routine: CachedRoutine = JSON.parse(cached);

    // Check cache version
    if (routine.version !== CURRENT_CACHE_VERSION) {
      console.warn('Cache version mismatch, invalidating cache');
      clearRoutineCache(routineId);
      return null;
    }

    return routine;
  } catch (error) {
    console.error('Error retrieving cached routine:', error);
    return null;
  }
}

/**
 * Get cached routine steps with local image URIs
 *
 * @param routineId - Routine ID
 * @returns Steps with local image URIs or null if not cached
 */
export async function getCachedRoutineSteps(
  routineId: string
): Promise<(RoutineStep & { products?: Product | null })[] | null> {
  const cached = getCachedRoutine(routineId);
  if (!cached) return null;

  // Map steps with local image URIs and product data
  const steps = await Promise.all(
    cached.steps.map(async step => {
      const localImageUri = step.image_url
        ? await getCachedImageUri(`step_${step.id}`)
        : null;

      const product = step.product_id ? cached.products[step.product_id] : null;
      const localProductImageUri =
        product?.image_url && step.product_id
          ? await getCachedImageUri(`product_${step.product_id}`)
          : null;

      return {
        ...step,
        image_url: localImageUri || step.image_url,
        products: product
          ? {
              ...product,
              image_url: localProductImageUri || product.image_url,
            }
          : null,
      };
    })
  );

  return steps;
}

/**
 * Cache an image from URL to local filesystem
 *
 * @param imageUrl - Remote image URL
 * @param key - Cache key identifier
 */
async function cacheImage(imageUrl: string, key: string): Promise<void> {
  try {
    await ensureCacheDirectory();

    const fileExtension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
    const localUri = `${CACHE_DIR}${key}.${fileExtension}`;

    // Check if already cached
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (fileInfo.exists) {
      return; // Already cached
    }

    // Download and cache image
    const downloadResult = await FileSystem.downloadAsync(imageUrl, localUri);

    if (downloadResult.status !== 200) {
      throw new Error(`Failed to download image: ${downloadResult.status}`);
    }

    // Store mapping in MMKV
    cache.set(`image_${key}`, localUri);
  } catch (error) {
    console.error(`Error caching image ${key}:`, error);
    // Don't throw - allow routine to be cached even if image caching fails
  }
}

/**
 * Get local URI for cached image
 *
 * @param key - Cache key identifier
 * @returns Local URI or null if not cached
 */
async function getCachedImageUri(key: string): Promise<string | null> {
  try {
    const localUri = cache.getString(`image_${key}`);
    if (!localUri) return null;

    // Verify file still exists
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (!fileInfo.exists) {
      // Clean up stale cache entry
      cache.delete(`image_${key}`);
      return null;
    }

    return localUri;
  } catch (error) {
    console.error(`Error retrieving cached image ${key}:`, error);
    return null;
  }
}

/**
 * Check if routine is cached and available offline
 *
 * @param routineId - Routine ID
 * @returns true if cached and valid
 */
export function isRoutineCached(routineId: string): boolean {
  const cached = getCachedRoutine(routineId);
  return cached !== null;
}

/**
 * Clear cache for specific routine
 *
 * @param routineId - Routine ID
 */
export async function clearRoutineCache(routineId: string): Promise<void> {
  try {
    const cached = getCachedRoutine(routineId);
    if (!cached) return;

    // Delete cached images
    for (const step of cached.steps) {
      const imageKey = `image_step_${step.id}`;
      const imageUri = cache.getString(imageKey);
      if (imageUri) {
        await FileSystem.deleteAsync(imageUri, { idempotent: true });
        cache.delete(imageKey);
      }

      if (step.product_id) {
        const productImageKey = `image_product_${step.product_id}`;
        const productImageUri = cache.getString(productImageKey);
        if (productImageUri) {
          await FileSystem.deleteAsync(productImageUri, { idempotent: true });
          cache.delete(productImageKey);
        }
      }
    }

    // Delete routine metadata
    cache.delete(`routine_${routineId}`);
  } catch (error) {
    console.error('Error clearing routine cache:', error);
  }
}

/**
 * Clear all cached routines
 */
export async function clearAllCache(): Promise<void> {
  try {
    // Delete all files in cache directory
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
    }

    // Clear MMKV cache
    cache.clearAll();

    // Recreate cache directory
    await ensureCacheDirectory();
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
}

/**
 * Get cache size in bytes
 *
 * @returns Total cache size in bytes
 */
export async function getCacheSize(): Promise<number> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) return 0;

    const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
    let totalSize = 0;

    for (const file of files) {
      const fileInfo = await FileSystem.getInfoAsync(`${CACHE_DIR}${file}`);
      if ('size' in fileInfo) {
        totalSize += fileInfo.size || 0;
      }
    }

    return totalSize;
  } catch (error) {
    console.error('Error calculating cache size:', error);
    return 0;
  }
}

/**
 * Get list of all cached routine IDs
 *
 * @returns Array of cached routine IDs
 */
export function getCachedRoutineIds(): string[] {
  try {
    const keys = cache.getAllKeys();
    return keys
      .filter(key => key.startsWith('routine_'))
      .map(key => key.replace('routine_', ''));
  } catch (error) {
    console.error('Error getting cached routine IDs:', error);
    return [];
  }
}
