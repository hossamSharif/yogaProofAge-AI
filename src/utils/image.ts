import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

/**
 * Image Compression Utility
 *
 * Implements T036: Image compression for photo uploads
 * - Target: <2MB per photo (NFR-010)
 * - Quality adjustment based on size
 * - Resolution optimization
 */

const TARGET_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const MAX_DIMENSION = 1920; // Max width or height

export interface CompressOptions {
  maxSizeBytes?: number;
  maxDimension?: number;
  quality?: number;
}

/**
 * Compress image to target size
 * Iteratively reduces quality until target size is reached
 */
export async function compressImage(
  uri: string,
  options: CompressOptions = {}
): Promise<{ uri: string; width: number; height: number; size: number }> {
  const {
    maxSizeBytes = TARGET_SIZE_BYTES,
    maxDimension = MAX_DIMENSION,
    quality: initialQuality = 0.9,
  } = options;

  // Get original image info
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) {
    throw new Error('Image file not found');
  }

  let currentUri = uri;
  let currentQuality = initialQuality;
  let compressed = false;

  // Resize if dimensions exceed max
  const imageInfo = await ImageManipulator.manipulateAsync(
    currentUri,
    [
      {
        resize: {
          width: maxDimension,
          height: maxDimension,
        },
      },
    ],
    {
      compress: currentQuality,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  currentUri = imageInfo.uri;
  let currentSize = (await FileSystem.getInfoAsync(currentUri)).size || 0;

  // Iteratively reduce quality if still too large
  while (currentSize > maxSizeBytes && currentQuality > 0.1) {
    currentQuality -= 0.1;
    compressed = true;

    const result = await ImageManipulator.manipulateAsync(
      currentUri,
      [], // No additional transformations
      {
        compress: currentQuality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    currentUri = result.uri;
    const fileInfo = await FileSystem.getInfoAsync(currentUri);
    currentSize = fileInfo.size || 0;

    console.log(
      `Compressed image: quality=${currentQuality.toFixed(1)}, size=${(
        currentSize / 1024 / 1024
      ).toFixed(2)}MB`
    );
  }

  if (currentSize > maxSizeBytes) {
    console.warn(
      `Unable to compress image below target size. Final size: ${(
        currentSize / 1024 / 1024
      ).toFixed(2)}MB`
    );
  }

  return {
    uri: currentUri,
    width: imageInfo.width,
    height: imageInfo.height,
    size: currentSize,
  };
}

/**
 * Create thumbnail from image
 * For gallery display and faster loading
 */
export async function createThumbnail(
  uri: string,
  size = 200
): Promise<{ uri: string; width: number; height: number }> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: size, height: size } }],
    {
      compress: 0.7,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  return result;
}

/**
 * Get image dimensions without loading full image
 */
export async function getImageDimensions(
  uri: string
): Promise<{ width: number; height: number }> {
  // Use ImageManipulator to get dimensions efficiently
  const result = await ImageManipulator.manipulateAsync(uri, [], {
    compress: 1,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  return {
    width: result.width,
    height: result.height,
  };
}

/**
 * Check if image meets minimum resolution requirements
 * Per FR-009: Image validation
 */
export function meetsMinimumResolution(
  width: number,
  height: number,
  minDimension = 720
): boolean {
  return width >= minDimension && height >= minDimension;
}

/**
 * Calculate image file size
 */
export async function getImageSize(uri: string): Promise<number> {
  const info = await FileSystem.getInfoAsync(uri);
  return info.size || 0;
}

/**
 * Convert base64 to local file URI
 */
export async function base64ToUri(base64: string, filename: string): Promise<string> {
  const fileUri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return fileUri;
}

/**
 * Convert local URI to base64
 */
export async function uriToBase64(uri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64;
}

/**
 * Crop image to square (useful for profile pictures)
 */
export async function cropToSquare(uri: string): Promise<string> {
  const dimensions = await getImageDimensions(uri);
  const size = Math.min(dimensions.width, dimensions.height);

  const result = await ImageManipulator.manipulateAsync(
    uri,
    [
      {
        crop: {
          originX: (dimensions.width - size) / 2,
          originY: (dimensions.height - size) / 2,
          width: size,
          height: size,
        },
      },
    ],
    {
      compress: 0.9,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  return result.uri;
}
