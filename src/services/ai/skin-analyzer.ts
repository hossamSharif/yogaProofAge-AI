import { claudeClient, requestWithRetry } from './client';
import { compressImage } from '@/utils/image';

/**
 * Skin Analyzer Service
 *
 * AI-powered skin analysis using Claude API with vision capabilities.
 *
 * Implements:
 * - FR-011: AI skin type and concern detection
 * - FR-012: Skin concerns identification with explanations
 * - NFR-001: Analysis completion within 10 seconds
 * - NFR-009: Rate limiting (50 requests/min)
 */

export type SkinType = 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal';

export interface SkinConcern {
  type: string;
  severity: 'mild' | 'moderate' | 'severe';
  areas: string[];
  explanation?: string;
}

export interface AnalysisInput {
  imageUri: string;
  imageBase64?: string;
}

export interface AnalysisResult {
  success: boolean;
  skinType: SkinType;
  concerns: SkinConcern[];
  confidence: number;
  metadata: {
    analysisVersion: string;
    modelUsed: string;
    timestamp: string;
    processingTimeMs: number;
  };
  error?: string;
}

// Skin concern types for reference
const CONCERN_TYPES = [
  'fine_lines',
  'wrinkles',
  'dark_spots',
  'uneven_tone',
  'acne',
  'large_pores',
  'dryness',
  'oiliness',
  'redness',
  'sensitivity',
  'dullness',
  'texture',
  'dark_circles',
  'sagging',
  'dehydration',
];

// Analysis prompt for Claude
const ANALYSIS_PROMPT = `You are a professional dermatological AI assistant. Analyze this facial photo and provide a detailed skin analysis.

Analyze the image and respond with a JSON object (no markdown, just valid JSON) containing:

{
  "skinType": "one of: oily, dry, combination, sensitive, normal",
  "concerns": [
    {
      "type": "concern type from: fine_lines, wrinkles, dark_spots, uneven_tone, acne, large_pores, dryness, oiliness, redness, sensitivity, dullness, texture, dark_circles, sagging, dehydration",
      "severity": "one of: mild, moderate, severe",
      "areas": ["list of affected facial areas"],
      "explanation": "brief user-friendly explanation of this concern"
    }
  ],
  "confidence": 0.85,
  "notes": "any additional observations about the skin"
}

Guidelines:
1. Be accurate but gentle in your assessment
2. Focus on the 3-5 most significant concerns
3. Provide actionable insights in explanations
4. Confidence should reflect image quality and visibility
5. Use friendly, non-clinical language for explanations

Return ONLY valid JSON, no additional text.`;

/**
 * Analyze skin from a facial photo
 *
 * @param input - Analysis input with image URI and optional base64
 * @returns Analysis result with skin type, concerns, and confidence
 */
export async function analyzeSkin(input: AnalysisInput): Promise<AnalysisResult> {
  const startTime = Date.now();

  try {
    // Compress image if needed (NFR-010: <2MB)
    let imageBase64 = input.imageBase64;

    if (!imageBase64) {
      const compressed = await compressImage(input.imageUri);
      imageBase64 = compressed.base64;
    }

    // Make API call with retry logic
    const response = await requestWithRetry(async () => {
      return claudeClient.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64!,
                },
              },
              {
                type: 'text',
                text: ANALYSIS_PROMPT,
              },
            ],
          },
        ],
      });
    });

    // Parse response
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format');
    }

    // Clean and parse JSON
    let jsonText = content.text.trim();
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?$/g, '');
    }

    const analysis = JSON.parse(jsonText);

    // Validate and normalize response
    const skinType = normalizeSkinType(analysis.skinType);
    const concerns = normalizeConcerns(analysis.concerns || []);
    const confidence = Math.min(Math.max(analysis.confidence || 0.7, 0), 1);

    const processingTimeMs = Date.now() - startTime;

    return {
      success: true,
      skinType,
      concerns,
      confidence,
      metadata: {
        analysisVersion: '1.0.0',
        modelUsed: 'claude-3-5-sonnet-20241022',
        timestamp: new Date().toISOString(),
        processingTimeMs,
      },
    };

  } catch (error: any) {
    console.error('Skin analysis error:', error);

    return {
      success: false,
      skinType: 'normal',
      concerns: [],
      confidence: 0,
      metadata: {
        analysisVersion: '1.0.0',
        modelUsed: 'claude-3-5-sonnet-20241022',
        timestamp: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime,
      },
      error: error.message || 'Analysis failed. Please try again.',
    };
  }
}

/**
 * Normalize skin type to valid enum value
 */
function normalizeSkinType(type: string): SkinType {
  const normalized = type?.toLowerCase().trim();
  const validTypes: SkinType[] = ['oily', 'dry', 'combination', 'sensitive', 'normal'];

  if (validTypes.includes(normalized as SkinType)) {
    return normalized as SkinType;
  }

  // Handle variations
  if (normalized?.includes('oil')) return 'oily';
  if (normalized?.includes('dry')) return 'dry';
  if (normalized?.includes('combo') || normalized?.includes('combination')) return 'combination';
  if (normalized?.includes('sensitive')) return 'sensitive';

  return 'normal';
}

/**
 * Normalize and validate concerns array
 */
function normalizeConcerns(concerns: any[]): SkinConcern[] {
  if (!Array.isArray(concerns)) return [];

  return concerns
    .filter(concern => concern && typeof concern === 'object')
    .map(concern => ({
      type: normalizeConcernType(concern.type),
      severity: normalizeSeverity(concern.severity),
      areas: normalizeAreas(concern.areas),
      explanation: concern.explanation || generateDefaultExplanation(concern.type),
    }))
    .slice(0, 5); // Max 5 concerns
}

/**
 * Normalize concern type to valid value
 */
function normalizeConcernType(type: string): string {
  const normalized = type?.toLowerCase().replace(/\s+/g, '_').trim();

  if (CONCERN_TYPES.includes(normalized)) {
    return normalized;
  }

  // Handle common variations
  if (normalized?.includes('line') || normalized?.includes('wrinkle')) {
    return normalized.includes('fine') ? 'fine_lines' : 'wrinkles';
  }
  if (normalized?.includes('spot') || normalized?.includes('hyperpigment')) return 'dark_spots';
  if (normalized?.includes('pore')) return 'large_pores';
  if (normalized?.includes('acne') || normalized?.includes('breakout')) return 'acne';

  return type || 'texture';
}

/**
 * Normalize severity to valid value
 */
function normalizeSeverity(severity: string): 'mild' | 'moderate' | 'severe' {
  const normalized = severity?.toLowerCase().trim();

  if (normalized === 'mild' || normalized === 'low' || normalized === 'minor') {
    return 'mild';
  }
  if (normalized === 'severe' || normalized === 'high' || normalized === 'major') {
    return 'severe';
  }

  return 'moderate';
}

/**
 * Normalize areas array
 */
function normalizeAreas(areas: any): string[] {
  if (!areas) return [];
  if (typeof areas === 'string') return [areas];
  if (!Array.isArray(areas)) return [];

  return areas.filter(a => typeof a === 'string').map(a => a.toLowerCase().trim());
}

/**
 * Generate default explanation for a concern type
 */
function generateDefaultExplanation(type: string): string {
  const explanations: Record<string, string> = {
    fine_lines: 'Early signs of aging that can be addressed with proper hydration and targeted treatments.',
    wrinkles: 'Deeper lines that benefit from retinoids and moisturizing routines.',
    dark_spots: 'Areas of hyperpigmentation that can be improved with vitamin C and sun protection.',
    uneven_tone: 'Skin discoloration that responds well to exfoliation and brightening ingredients.',
    acne: 'Breakouts that can be managed with consistent cleansing and appropriate treatments.',
    large_pores: 'Visible pores that can be minimized with regular exfoliation and niacinamide.',
    dryness: 'Lack of moisture that needs rich, hydrating products.',
    oiliness: 'Excess sebum production that benefits from lightweight, mattifying products.',
    redness: 'Skin irritation that responds to soothing, calming ingredients.',
    sensitivity: 'Reactive skin that needs gentle, fragrance-free products.',
    dullness: 'Lack of radiance that improves with exfoliation and vitamin C.',
    texture: 'Uneven skin surface that benefits from regular exfoliation.',
    dark_circles: 'Under-eye discoloration that can be addressed with targeted eye treatments.',
    sagging: 'Loss of firmness that responds to firming ingredients and facial exercises.',
    dehydration: 'Lack of water content that needs hydrating serums and proper moisture balance.',
  };

  return explanations[type] || 'A common skin concern that can be addressed with the right skincare routine.';
}

export default {
  analyzeSkin,
};
