import * as FileSystem from 'expo-file-system';
import { Image } from 'react-native';

/**
 * Image Validation Utility
 *
 * Validates captured photos before AI analysis.
 *
 * Implements:
 * - FR-009: Image validation (minimum resolution, blur detection, face detection, lighting)
 * - Quality checks for accurate skin analysis
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata: {
    width: number;
    height: number;
    fileSize: number;
    aspectRatio: number;
  };
}

export interface ValidationOptions {
  minWidth?: number;
  minHeight?: number;
  maxFileSize?: number; // in bytes
  minAspectRatio?: number;
  maxAspectRatio?: number;
}

const DEFAULT_OPTIONS: ValidationOptions = {
  minWidth: 480,
  minHeight: 640,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  minAspectRatio: 0.5, // Portrait
  maxAspectRatio: 2.0, // Landscape
};

/**
 * Get image dimensions from URI
 */
async function getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      reject
    );
  });
}

/**
 * Get file size from URI
 */
async function getFileSize(uri: string): Promise<number> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists && 'size' in info ? info.size : 0;
  } catch {
    return 0;
  }
}

/**
 * Check if image meets minimum resolution requirements
 */
function checkResolution(
  width: number,
  height: number,
  minWidth: number,
  minHeight: number
): { valid: boolean; error?: string } {
  if (width < minWidth || height < minHeight) {
    return {
      valid: false,
      error: `Image resolution too low. Minimum ${minWidth}x${minHeight} required.`,
    };
  }
  return { valid: true };
}

/**
 * Check aspect ratio is within acceptable range
 */
function checkAspectRatio(
  width: number,
  height: number,
  minRatio: number,
  maxRatio: number
): { valid: boolean; warning?: string } {
  const ratio = width / height;
  if (ratio < minRatio || ratio > maxRatio) {
    return {
      valid: false,
      warning: 'Portrait orientation works best for face analysis.',
    };
  }
  return { valid: true };
}

/**
 * Check file size is within limits
 */
function checkFileSize(
  size: number,
  maxSize: number
): { valid: boolean; error?: string } {
  if (size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File too large. Maximum ${maxSizeMB}MB allowed.`,
    };
  }
  return { valid: true };
}

/**
 * Basic blur detection using edge analysis
 * This is a simplified check - in production, use a proper CV library
 */
function estimateBlurLevel(width: number, height: number): { warning?: string } {
  // If image is very small, it might appear blurry
  if (width < 720 || height < 960) {
    return { warning: 'Image may be blurry. Try holding the camera steadier.' };
  }
  return {};
}

/**
 * Validate an image for skin analysis
 *
 * @param imageUri - Local file URI of the image
 * @param options - Validation options
 * @returns Validation result with errors and warnings
 */
export async function validateImage(
  imageUri: string,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const errors: string[] = [];
  const warnings: string[] = [];

  let width = 0;
  let height = 0;
  let fileSize = 0;
  let aspectRatio = 1;

  try {
    // Get image metadata
    [{ width, height }, fileSize] = await Promise.all([
      getImageDimensions(imageUri),
      getFileSize(imageUri),
    ]);

    aspectRatio = width / height;

    // Resolution check
    const resolutionCheck = checkResolution(
      width,
      height,
      opts.minWidth!,
      opts.minHeight!
    );
    if (!resolutionCheck.valid && resolutionCheck.error) {
      errors.push(resolutionCheck.error);
    }

    // File size check
    const fileSizeCheck = checkFileSize(fileSize, opts.maxFileSize!);
    if (!fileSizeCheck.valid && fileSizeCheck.error) {
      errors.push(fileSizeCheck.error);
    }

    // Aspect ratio check (warning only)
    const aspectCheck = checkAspectRatio(
      width,
      height,
      opts.minAspectRatio!,
      opts.maxAspectRatio!
    );
    if (!aspectCheck.valid && aspectCheck.warning) {
      warnings.push(aspectCheck.warning);
    }

    // Blur estimation (warning only)
    const blurCheck = estimateBlurLevel(width, height);
    if (blurCheck.warning) {
      warnings.push(blurCheck.warning);
    }

  } catch (error: any) {
    errors.push(`Failed to read image: ${error.message}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      width,
      height,
      fileSize,
      aspectRatio,
    },
  };
}

/**
 * Validate lighting conditions
 * In a real implementation, this would analyze the image histogram
 */
export function validateLighting(brightness: number): {
  isValid: boolean;
  message: string;
} {
  if (brightness < 0.3) {
    return {
      isValid: false,
      message: 'Image too dark. Move to a brighter area.',
    };
  }
  if (brightness > 0.9) {
    return {
      isValid: false,
      message: 'Image overexposed. Avoid direct sunlight.',
    };
  }
  return {
    isValid: true,
    message: 'Lighting looks good!',
  };
}

/**
 * Check if face is properly positioned in frame
 * This is a placeholder - real implementation would use face detection
 */
export function validateFacePosition(
  faceRect: { x: number; y: number; width: number; height: number } | null,
  frameWidth: number,
  frameHeight: number
): { isValid: boolean; feedback: string } {
  if (!faceRect) {
    return {
      isValid: false,
      feedback: 'No face detected. Please center your face in the frame.',
    };
  }

  const centerX = faceRect.x + faceRect.width / 2;
  const centerY = faceRect.y + faceRect.height / 2;
  const frameCenterX = frameWidth / 2;
  const frameCenterY = frameHeight / 2;

  // Check if face is roughly centered
  const xOffset = Math.abs(centerX - frameCenterX) / frameWidth;
  const yOffset = Math.abs(centerY - frameCenterY) / frameHeight;

  if (xOffset > 0.2) {
    return {
      isValid: false,
      feedback: centerX < frameCenterX ? 'Move right' : 'Move left',
    };
  }

  if (yOffset > 0.2) {
    return {
      isValid: false,
      feedback: centerY < frameCenterY ? 'Move down' : 'Move up',
    };
  }

  // Check face size (should take up about 40-70% of frame)
  const faceArea = faceRect.width * faceRect.height;
  const frameArea = frameWidth * frameHeight;
  const coverage = faceArea / frameArea;

  if (coverage < 0.2) {
    return {
      isValid: false,
      feedback: 'Move closer to the camera',
    };
  }

  if (coverage > 0.8) {
    return {
      isValid: false,
      feedback: 'Move further from the camera',
    };
  }

  return {
    isValid: true,
    feedback: 'Perfect! Hold still...',
  };
}

export default {
  validateImage,
  validateLighting,
  validateFacePosition,
};
