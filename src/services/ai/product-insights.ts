/**
 * Product Insights Service
 *
 * Implements T088: Product insight service (Claude API) generating personalized suitability explanations
 * Per FR-067: AI-powered product insights based on user's skin profile
 *
 * Uses Claude AI to analyze product ingredients and formulation
 * against user's skin type and concerns.
 */

import { createMessage, executeClaudeRequest } from './client';
import { Database } from '@/types/supabase.types';

type Product = Database['public']['Tables']['products']['Row'];
type SkinProfile = Database['public']['Tables']['skin_profiles']['Row'];

// Product insight timeout (20 seconds)
const INSIGHT_TIMEOUT = 20000;

/**
 * Product insight response structure
 */
export interface ProductInsight {
  suitabilityScore: number; // 0-100
  suitabilityLabel: 'Excellent' | 'Good' | 'Fair' | 'Not Recommended';
  summary: string;
  pros: string[];
  cons: string[];
  usageTips: string[];
  alternatives?: string[];
}

/**
 * Parse concerns from skin profile JSONB
 */
function parseConcerns(concerns: any): Array<{ type: string; severity: string; areas: string[] }> {
  if (!concerns) return [];
  if (Array.isArray(concerns)) return concerns;
  if (concerns.concerns && Array.isArray(concerns.concerns)) {
    return concerns.concerns;
  }
  return [];
}

/**
 * Build system prompt for product analysis
 */
function buildSystemPrompt(): string {
  return `You are an expert skincare formulator and dermatology consultant. Your role is to analyze skincare products and provide personalized recommendations based on a user's skin profile.

When analyzing products, consider:
1. Ingredient compatibility with the user's skin type
2. Active ingredients that address their specific concerns
3. Potential irritants or sensitizing ingredients
4. Product texture and absorption for their skin type
5. Optimal usage timing and layering

Your analysis should be honest and balanced - highlight both benefits and potential drawbacks.

OUTPUT FORMAT (JSON):
{
  "suitabilityScore": number (0-100),
  "suitabilityLabel": "Excellent" | "Good" | "Fair" | "Not Recommended",
  "summary": "2-3 sentence personalized summary",
  "pros": ["benefit 1", "benefit 2", ...],
  "cons": ["consideration 1", ...],
  "usageTips": ["specific tip for this user", ...],
  "alternatives": ["alternative product type if score is low"]
}

SUITABILITY GUIDELINES:
- 80-100 (Excellent): Perfect match for skin type and concerns
- 60-79 (Good): Generally suitable with minor considerations
- 40-59 (Fair): May work but with cautions
- 0-39 (Not Recommended): Contains potential irritants or unsuitable ingredients`;
}

/**
 * Build user prompt with product and skin profile context
 */
function buildUserPrompt(product: Product, skinProfile: SkinProfile): string {
  const concerns = parseConcerns(skinProfile.concerns);
  const ingredients = Array.isArray(product.ingredients)
    ? (product.ingredients as string[]).join(', ')
    : 'Not listed';
  const benefits = Array.isArray(product.benefits)
    ? (product.benefits as string[]).join(', ')
    : 'Not specified';
  const skinTypes = Array.isArray(product.skin_types)
    ? (product.skin_types as string[]).join(', ')
    : 'Not specified';

  return `Analyze this product for the user's skin profile:

PRODUCT INFORMATION:
- Name: ${product.name}
- Brand: ${product.brand}
- Category: ${product.category}
- Description: ${product.description || 'Not provided'}
- Key Ingredients: ${ingredients}
- Claimed Benefits: ${benefits}
- Labeled for Skin Types: ${skinTypes}
- Usage Instructions: ${product.usage_instructions || 'Not provided'}

USER'S SKIN PROFILE:
- Skin Type: ${skinProfile.skin_type}
- Concerns: ${concerns.map(c => `${c.type} (${c.severity})`).join(', ') || 'None specific'}
- Analysis Confidence: ${Math.round((skinProfile.analysis_confidence || 0) * 100)}%

Please provide a personalized analysis of this product's suitability. Return only valid JSON.`;
}

/**
 * Parse Claude's response into ProductInsight
 */
function parseInsightResponse(response: string): ProductInsight {
  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = response;

    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonStr.trim());

    // Validate and normalize the response
    return {
      suitabilityScore: Math.min(100, Math.max(0, parsed.suitabilityScore || 50)),
      suitabilityLabel: parsed.suitabilityLabel || 'Fair',
      summary: parsed.summary || 'Analysis unavailable.',
      pros: Array.isArray(parsed.pros) ? parsed.pros : [],
      cons: Array.isArray(parsed.cons) ? parsed.cons : [],
      usageTips: Array.isArray(parsed.usageTips) ? parsed.usageTips : [],
      alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives : undefined,
    };
  } catch (error) {
    console.error('Failed to parse product insight:', error);
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

/**
 * Generate personalized product insight
 *
 * @param product - Product to analyze
 * @param skinProfile - User's skin profile
 * @returns ProductInsight with suitability analysis
 *
 * Implements FR-067: AI-powered product suitability explanations
 */
export async function getProductInsight(
  product: Product,
  skinProfile: SkinProfile
): Promise<ProductInsight> {
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(product, skinProfile);

  const response = await executeClaudeRequest(
    async () => {
      const result = await createMessage({
        messages: [{ role: 'user', content: userPrompt }],
        system: systemPrompt,
        maxTokens: 1024,
        temperature: 0.7,
      });

      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in AI response');
      }

      return textContent.text;
    },
    INSIGHT_TIMEOUT,
    'Product insight analysis'
  );

  return parseInsightResponse(response);
}

/**
 * Generate batch insights for multiple products
 * Useful for comparing products in a category
 */
export async function getBatchProductInsights(
  products: Product[],
  skinProfile: SkinProfile
): Promise<Map<string, ProductInsight>> {
  const insights = new Map<string, ProductInsight>();

  // Process in batches to respect rate limits
  for (const product of products) {
    try {
      const insight = await getProductInsight(product, skinProfile);
      insights.set(product.id, insight);
    } catch (error) {
      console.error(`Failed to get insight for product ${product.id}:`, error);
      // Continue with other products
    }
  }

  return insights;
}

/**
 * Get quick suitability check without full analysis
 * Faster, uses less tokens, good for list views
 */
export async function getQuickSuitability(
  product: Product,
  skinProfile: SkinProfile
): Promise<{ score: number; label: string }> {
  const systemPrompt = `You are a skincare expert. Given a product and skin profile, provide a quick suitability score.
Return only JSON: {"score": number (0-100), "label": "Excellent"|"Good"|"Fair"|"Not Recommended"}`;

  const userPrompt = `Product: ${product.name} (${product.category}) by ${product.brand}
Skin Type: ${skinProfile.skin_type}
Quick suitability?`;

  try {
    const response = await executeClaudeRequest(
      async () => {
        const result = await createMessage({
          messages: [{ role: 'user', content: userPrompt }],
          system: systemPrompt,
          maxTokens: 100,
          temperature: 0.5,
        });

        const textContent = result.content.find(c => c.type === 'text');
        if (!textContent || textContent.type !== 'text') {
          throw new Error('No text content');
        }

        return textContent.text;
      },
      10000, // 10 second timeout for quick check
      'Quick suitability check'
    );

    const parsed = JSON.parse(response.trim());
    return {
      score: Math.min(100, Math.max(0, parsed.score || 50)),
      label: parsed.label || 'Fair',
    };
  } catch (error) {
    // Return neutral result on error
    return { score: 50, label: 'Fair' };
  }
}

/**
 * Fallback insight for when AI is unavailable
 * Based on simple ingredient matching rules
 */
export function getFallbackInsight(
  product: Product,
  skinProfile: SkinProfile
): ProductInsight {
  const skinTypes = Array.isArray(product.skin_types)
    ? (product.skin_types as string[]).map(t => t.toLowerCase())
    : [];

  const userSkinType = skinProfile.skin_type.toLowerCase();
  const isMatch = skinTypes.length === 0 || skinTypes.includes(userSkinType);

  if (isMatch) {
    return {
      suitabilityScore: 70,
      suitabilityLabel: 'Good',
      summary: `This ${product.category.replace('_', ' ')} appears to be suitable for ${userSkinType} skin based on its labeled skin types.`,
      pros: ['Labeled as suitable for your skin type'],
      cons: ['Full ingredient analysis not available'],
      usageTips: ['Patch test before full use', 'Follow package instructions'],
    };
  } else {
    return {
      suitabilityScore: 40,
      suitabilityLabel: 'Fair',
      summary: `This product may not be optimized for ${userSkinType} skin. Consider products specifically formulated for your skin type.`,
      pros: [],
      cons: ['Not specifically formulated for your skin type'],
      usageTips: ['Patch test recommended', 'Monitor for any reactions'],
      alternatives: [`Look for ${product.category.replace('_', ' ')}s labeled for ${userSkinType} skin`],
    };
  }
}

export default {
  getProductInsight,
  getBatchProductInsights,
  getQuickSuitability,
  getFallbackInsight,
};
