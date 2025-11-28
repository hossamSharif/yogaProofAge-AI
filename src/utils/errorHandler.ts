import {
  AppError,
  AIAPIError,
  AIRateLimitError,
  AITimeoutError,
  DatabaseError,
  NetworkError,
  StorageError,
  isRetryableError,
  getUserFriendlyMessage,
} from './errors';

/**
 * Centralized Error Handler
 *
 * Implements plan.md Error Handling Strategy:
 * - Retry logic with exponential backoff (1s, 2s, 4s)
 * - Fallback behavior for AI operations
 * - User-friendly error messaging
 * - Error logging and reporting
 *
 * Per NFR-001, NFR-002, NFR-009 timeout and rate limit requirements
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: any, attempt: number) => boolean;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 4000, // 4 seconds
  shouldRetry: (error: any, attempt: number) => {
    // Don't retry client errors (400, 401, 403, 413)
    if (error?.status && [400, 401, 403, 413].includes(error.status)) {
      return false;
    }

    // Retry network errors, rate limits, and server errors
    return isRetryableError(error);
  },
};

/**
 * Exponential backoff delay calculation
 * Returns delay in milliseconds: 1s, 2s, 4s
 */
function getBackoffDelay(attempt: number, initialDelay: number, maxDelay: number): number {
  const delay = initialDelay * Math.pow(2, attempt);
  return Math.min(delay, maxDelay);
}

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute function with retry logic
 *
 * Example:
 * ```ts
 * const result = await withRetry(
 *   () => fetchDataFromAPI(),
 *   { maxRetries: 3 }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      const shouldRetry = opts.shouldRetry(error, attempt);
      const isLastAttempt = attempt === opts.maxRetries;

      if (!shouldRetry || isLastAttempt) {
        throw error;
      }

      // Calculate backoff delay
      const delay = getBackoffDelay(attempt, opts.initialDelay, opts.maxDelay);

      console.log(`Retry attempt ${attempt + 1}/${opts.maxRetries} after ${delay}ms`);

      // Wait before retrying
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Execute function with timeout
 *
 * Example:
 * ```ts
 * const result = await withTimeout(
 *   () => analyzePhoto(photo),
 *   10000 // 10 seconds per NFR-001
 * );
 * ```
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  operation = 'operation'
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new AITimeoutError(operation)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Handle AI API errors with fallback behavior
 * Per plan.md Error Handling Strategy
 */
export interface AIErrorFallback<T> {
  onSkinAnalysis?: () => T;
  onRoutineGeneration?: () => T;
  onPhotoComparison?: () => T;
  onProductInsights?: () => T;
  onRoutineEvaluation?: () => T;
}

export async function handleAIError<T>(
  error: any,
  operation: keyof AIErrorFallback<T>,
  fallback?: AIErrorFallback<T>
): Promise<T | null> {
  console.error(`AI ${operation} error:`, error);

  // Log error for monitoring
  logError(error, { operation, service: 'AI' });

  // Return fallback if available
  if (fallback && fallback[operation]) {
    return fallback[operation]!();
  }

  // Re-throw if no fallback
  throw error;
}

/**
 * Handle database errors
 * Per plan.md Error Handling Strategy
 */
export async function handleDatabaseError(error: any, operation: string): Promise<void> {
  console.error(`Database ${operation} error:`, error);

  // Log error
  logError(error, { operation, service: 'database' });

  // Wrap in DatabaseError if not already
  if (!(error instanceof DatabaseError)) {
    throw new DatabaseError(
      getUserFriendlyMessage(error),
      'DATABASE_ERROR',
      true,
      { originalError: error.message }
    );
  }

  throw error;
}

/**
 * Handle storage errors
 * Per plan.md Error Handling Strategy
 */
export async function handleStorageError(error: any, operation: string): Promise<void> {
  console.error(`Storage ${operation} error:`, error);

  // Log error
  logError(error, { operation, service: 'storage' });

  // Wrap in StorageError if not already
  if (!(error instanceof StorageError)) {
    throw new StorageError(
      getUserFriendlyMessage(error),
      'STORAGE_ERROR',
      false,
      { originalError: error.message }
    );
  }

  throw error;
}

/**
 * Log error for monitoring and debugging
 * In production, this would send to error tracking service (e.g., Sentry)
 */
export function logError(error: any, context?: Record<string, any>): void {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: error?.message || 'Unknown error',
    code: error?.code,
    stack: error?.stack,
    context,
  };

  // Console log in development
  if (__DEV__) {
    console.error('Error logged:', errorLog);
  }

  // TODO: Send to error tracking service in production
  // Example: Sentry.captureException(error, { contexts: { custom: context } });
}

/**
 * Display error to user
 * Returns user-friendly error message
 */
export function displayError(error: any): string {
  return getUserFriendlyMessage(error);
}

/**
 * Check if operation should use fallback behavior
 * Based on error type and availability status
 */
export function shouldUseFallback(error: any): boolean {
  // Use fallback for network errors and timeouts
  if (isRetryableError(error)) {
    return true;
  }

  // Use fallback for server errors (500-level)
  if (error?.status >= 500) {
    return true;
  }

  return false;
}
