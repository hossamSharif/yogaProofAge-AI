/**
 * Custom Error Types
 *
 * Defines application-specific errors with context for better error handling.
 * Per plan.md Error Handling Strategy
 */

export class AppError extends Error {
  code: string;
  retryable: boolean;
  metadata?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    retryable = false,
    metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.retryable = retryable;
    this.metadata = metadata;
  }
}

// AI API Errors
export class AIAPIError extends AppError {
  constructor(message: string, code: string, retryable = true, metadata?: Record<string, any>) {
    super(message, code, retryable, metadata);
    this.name = 'AIAPIError';
  }
}

export class AIRateLimitError extends AIAPIError {
  constructor(retryAfter?: number) {
    super(
      'Service is busy. Please wait a moment and try again.',
      'AI_RATE_LIMIT',
      true,
      { retryAfter }
    );
    this.name = 'AIRateLimitError';
  }
}

export class AITimeoutError extends AIAPIError {
  constructor(operation: string) {
    super(
      'Analysis is taking longer than expected. Would you like to continue waiting?',
      'AI_TIMEOUT',
      true,
      { operation }
    );
    this.name = 'AITimeoutError';
  }
}

// Database Errors
export class DatabaseError extends AppError {
  constructor(message: string, code: string, retryable = true, metadata?: Record<string, any>) {
    super(message, code, retryable, metadata);
    this.name = 'DatabaseError';
  }
}

// Network Errors
export class NetworkError extends AppError {
  constructor(message = 'Unable to connect. Check your internet connection and try again.') {
    super(message, 'NETWORK_ERROR', true);
    this.name = 'NetworkError';
  }
}

// Storage Errors
export class StorageError extends AppError {
  constructor(message: string, code: string, retryable = false, metadata?: Record<string, any>) {
    super(message, code, retryable, metadata);
    this.name = 'StorageError';
  }
}

export class StorageFullError extends StorageError {
  constructor() {
    super(
      'Storage space is running low. Please free up space or adjust photo quality settings.',
      'STORAGE_FULL',
      false
    );
    this.name = 'StorageFullError';
  }
}

// Validation Errors
export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', false, { field });
    this.name = 'ValidationError';
  }
}

/**
 * Error type guards
 */
export function isNetworkError(error: any): error is NetworkError {
  return error instanceof NetworkError || error?.code === 'NETWORK_ERROR';
}

export function isRateLimitError(error: any): error is AIRateLimitError {
  return error instanceof AIRateLimitError || error?.code === 'AI_RATE_LIMIT' || error?.status === 429;
}

export function isTimeoutError(error: any): error is AITimeoutError {
  return error instanceof AITimeoutError || error?.code === 'AI_TIMEOUT';
}

export function isRetryableError(error: any): boolean {
  return error?.retryable === true || isNetworkError(error) || isRateLimitError(error);
}

/**
 * Get user-friendly error message
 * Per plan.md Error Handling Strategy user messaging
 */
export function getUserFriendlyMessage(error: any): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (isNetworkError(error)) {
    return 'Unable to connect. Check your internet connection and try again.';
  }

  if (isRateLimitError(error)) {
    return 'Service is busy. Please wait a moment and try again.';
  }

  if (error?.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  if (error?.code === '500' || error?.status === 500) {
    return "We're experiencing technical difficulties. Please try again in a few minutes.";
  }

  // Default generic message
  return 'Something went wrong. Please try again.';
}
