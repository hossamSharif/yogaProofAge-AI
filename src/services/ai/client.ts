import Anthropic from '@anthropic-ai/sdk';
import { withRetry, withTimeout } from '@/utils/errorHandler';
import { AIAPIError, AIRateLimitError } from '@/utils/errors';

/**
 * Claude API Client
 *
 * Implements T034-T035: Claude API client with rate limiting
 * - Model: claude-3-5-sonnet-20241022 per plan.md
 * - Rate limit: 50 requests/min (NFR-009)
 * - Client-side throttling and request queuing
 * - Exponential backoff for 429 responses (1s, 2s, 4s)
 *
 * All AI operations use this client:
 * - Skin analysis (FR-011, NFR-001: <10s timeout)
 * - Routine generation (FR-015)
 * - Photo comparison (FR-056, NFR-002: <15s timeout)
 * - Product insights (FR-067)
 * - Routine evaluation (FR-036)
 */

const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.warn('ANTHROPIC_API_KEY not configured. AI features will not work.');
}

// Initialize Anthropic client
const client = new Anthropic({
  apiKey: API_KEY || '',
});

// Claude model to use
export const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';

// Rate limiting configuration
const RATE_LIMIT = 50; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

// Request queue for rate limiting
interface QueuedRequest<T> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
  timestamp: number;
}

class RateLimiter {
  private queue: QueuedRequest<any>[] = [];
  private requestTimestamps: number[] = [];
  private processing = false;

  /**
   * Add request to queue
   */
  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        fn,
        resolve,
        reject,
        timestamp: Date.now(),
      });

      // Start processing if not already running
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  /**
   * Process queued requests with rate limiting
   */
  private async processQueue() {
    this.processing = true;

    while (this.queue.length > 0) {
      // Clean up old timestamps outside the rate window
      const now = Date.now();
      this.requestTimestamps = this.requestTimestamps.filter(
        ts => now - ts < RATE_WINDOW
      );

      // Check if we can make a request
      if (this.requestTimestamps.length < RATE_LIMIT) {
        // Dequeue and execute request
        const request = this.queue.shift();
        if (!request) break;

        try {
          this.requestTimestamps.push(Date.now());
          const result = await request.fn();
          request.resolve(result);
        } catch (error) {
          request.reject(error);
        }
      } else {
        // Rate limit exceeded, wait before processing next
        const oldestTimestamp = this.requestTimestamps[0];
        const waitTime = RATE_WINDOW - (now - oldestTimestamp);

        console.log(`Rate limit reached. Waiting ${waitTime}ms before next request`);

        await new Promise(resolve => setTimeout(resolve, waitTime + 100)); // Add 100ms buffer
      }
    }

    this.processing = false;
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Get requests made in current window
   */
  getCurrentRequestCount(): number {
    const now = Date.now();
    return this.requestTimestamps.filter(ts => now - ts < RATE_WINDOW).length;
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

/**
 * Execute Claude API call with rate limiting, retry logic, and timeout
 */
export async function executeClaudeRequest<T>(
  requestFn: () => Promise<T>,
  timeoutMs = 30000, // 30 second default timeout
  operation = 'AI operation'
): Promise<T> {
  return rateLimiter.enqueue(async () => {
    return withTimeout(
      async () => {
        return withRetry(
          requestFn,
          {
            maxRetries: 3,
            shouldRetry: (error, attempt) => {
              // Retry on rate limits (429)
              if (error?.status === 429 || error?.error?.type === 'rate_limit_error') {
                return true;
              }

              // Retry on server errors (500-504)
              if (error?.status && error.status >= 500 && error.status < 505) {
                return true;
              }

              // Don't retry client errors (400, 401, 403)
              if (error?.status && [400, 401, 403, 413].includes(error.status)) {
                return false;
              }

              // Retry network errors
              if (error?.message?.includes('network') || error?.message?.includes('ECONNREFUSED')) {
                return true;
              }

              return false;
            },
          }
        );
      },
      timeoutMs,
      operation
    );
  });
}

/**
 * Create a message with Claude
 * Base method used by all AI operations
 */
export async function createMessage(params: {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  system?: string;
  maxTokens?: number;
  temperature?: number;
}) {
  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: params.maxTokens || 4096,
      temperature: params.temperature || 1.0,
      system: params.system,
      messages: params.messages,
    });

    return response;
  } catch (error: any) {
    // Handle specific API errors
    if (error?.status === 429 || error?.error?.type === 'rate_limit_error') {
      throw new AIRateLimitError(error?.error?.retry_after);
    }

    // Wrap other errors
    throw new AIAPIError(
      error?.message || 'AI request failed',
      error?.error?.type || 'UNKNOWN_ERROR',
      error?.status >= 500,
      { status: error?.status }
    );
  }
}

/**
 * Stream a message with Claude
 * For longer operations where streaming responses is beneficial
 */
export async function streamMessage(params: {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  system?: string;
  maxTokens?: number;
  temperature?: number;
  onChunk: (chunk: string) => void;
}) {
  try {
    const stream = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: params.maxTokens || 4096,
      temperature: params.temperature || 1.0,
      system: params.system,
      messages: params.messages,
      stream: true,
    });

    let fullResponse = '';

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        const chunk = event.delta.text;
        fullResponse += chunk;
        params.onChunk(chunk);
      }
    }

    return fullResponse;
  } catch (error: any) {
    // Handle specific API errors
    if (error?.status === 429 || error?.error?.type === 'rate_limit_error') {
      throw new AIRateLimitError(error?.error?.retry_after);
    }

    throw new AIAPIError(
      error?.message || 'AI streaming failed',
      error?.error?.type || 'UNKNOWN_ERROR',
      error?.status >= 500,
      { status: error?.status }
    );
  }
}

/**
 * Get rate limiter stats
 */
export function getRateLimiterStats() {
  return {
    queueSize: rateLimiter.getQueueSize(),
    currentRequests: rateLimiter.getCurrentRequestCount(),
    rateLimit: RATE_LIMIT,
  };
}

export default {
  createMessage,
  streamMessage,
  executeClaudeRequest,
  getRateLimiterStats,
};
