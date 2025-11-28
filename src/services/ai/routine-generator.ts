/**
 * Routine Generator Service
 *
 * Implements T078: Routine generator service (Claude API) generating 3-5 options
 *
 * Uses Claude AI to generate personalized face yoga and skincare routines
 * based on user's skin profile (FR-015, FR-017).
 *
 * Features:
 * - Generates 3-5 routine options per FR-015
 * - Each routine includes title, focus, duration, benefits per FR-017
 * - Combines face yoga exercises with product application steps
 * - Tailored to detected skin type and concerns
 */

import { createMessage, executeClaudeRequest, CLAUDE_MODEL } from './client';
import { Database } from '@/types/supabase.types';
import { RoutineOption } from '@/stores/routine.store';

type SkinProfile = Database['public']['Tables']['skin_profiles']['Row'];

// Routine generation timeout (30 seconds)
const ROUTINE_GENERATION_TIMEOUT = 30000;

/**
 * Skin concern details for prompt context
 */
interface SkinConcern {
  type: string;
  severity: string;
  areas: string[];
}

/**
 * Parse concerns from skin profile JSONB
 */
function parseConcerns(concerns: any): SkinConcern[] {
  if (!concerns) return [];
  if (Array.isArray(concerns)) return concerns as SkinConcern[];
  if (concerns.concerns && Array.isArray(concerns.concerns)) {
    return concerns.concerns as SkinConcern[];
  }
  return [];
}

/**
 * Build the system prompt for routine generation
 */
function buildSystemPrompt(): string {
  return `You are an expert face yoga instructor and skincare specialist. Your role is to create personalized skincare and face yoga routines based on a user's skin profile.

You will generate 3-5 unique routine options, each with different focuses (e.g., anti-aging, hydration, firming, brightening). Each routine should combine face yoga exercises with product application steps in a logical sequence.

IMPORTANT GUIDELINES:

1. FACE YOGA EXERCISES:
   - Include 3-5 face yoga exercises per routine
   - Each exercise should target specific concerns or areas
   - Provide clear, step-by-step instructions
   - Duration: 30-90 seconds per exercise
   - Include tips for proper form and breathing

2. PRODUCT APPLICATION STEPS:
   - Include 3-5 product steps per routine (cleanser, toner, serum, moisturizer, etc.)
   - Specify the product category for each step
   - Provide application technique instructions
   - Include recommended amounts (e.g., "pea-sized", "2-3 drops")
   - Duration: 30-60 seconds per step

3. ROUTINE STRUCTURE:
   - Total duration: 10-20 minutes
   - Logical order: cleanse → tone → face yoga → serums/treatments → moisturize
   - Alternate between product and exercise steps where appropriate
   - Morning vs evening considerations if relevant

4. OUTPUT FORMAT:
   Return a JSON array with 3-5 routine options. Each option should have:
   - title: A catchy, descriptive name
   - description: 1-2 sentence summary
   - focusArea: Primary benefit (e.g., "Anti-Aging", "Hydration", "Firming")
   - estimatedDurationMinutes: Total routine time
   - benefits: Array of 3-5 specific benefits
   - steps: Array of steps with:
     - stepNumber: Sequential order
     - stepType: "face_yoga" or "product_application"
     - title: Step name
     - instructions: Detailed how-to
     - tips: Optional helpful tips
     - durationSeconds: Time for this step
     - productCategory: For product steps (cleanser, toner, serum, moisturizer, eye_cream, treatment, sunscreen, mask, oil)
     - productAmount: For product steps (e.g., "pea-sized", "2 pumps")`;
}

/**
 * Build the user prompt with skin profile context
 */
function buildUserPrompt(skinProfile: SkinProfile, goals?: string[]): string {
  const concerns = parseConcerns(skinProfile.concerns);
  const concernsList = concerns
    .map(c => `- ${c.type} (${c.severity}) in areas: ${c.areas.join(', ')}`)
    .join('\n');

  let prompt = `Please create personalized routine options for a user with the following skin profile:

SKIN TYPE: ${skinProfile.skin_type}

DETECTED CONCERNS:
${concernsList || '- No specific concerns detected'}

ANALYSIS CONFIDENCE: ${Math.round((skinProfile.analysis_confidence || 0) * 100)}%`;

  if (goals && goals.length > 0) {
    prompt += `

USER GOALS:
${goals.map(g => `- ${g.replace('_', ' ')}`).join('\n')}`;
  }

  prompt += `

Please generate 3-5 distinct routine options tailored to this profile. Each routine should have a different focus area while addressing the user's skin type and concerns. Return only valid JSON.`;

  return prompt;
}

/**
 * Parse Claude's response into RoutineOption array
 */
function parseRoutineOptions(response: string): RoutineOption[] {
  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = response;

    // Remove markdown code blocks if present
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    // Parse JSON
    const parsed = JSON.parse(jsonStr.trim());

    // Handle both array and object with routines property
    const options: any[] = Array.isArray(parsed) ? parsed : parsed.routines || parsed.options || [];

    // Validate and transform each option
    return options.map((opt, index) => ({
      title: opt.title || `Routine ${index + 1}`,
      description: opt.description || '',
      focusArea: opt.focusArea || opt.focus_area || 'General Skincare',
      estimatedDurationMinutes:
        opt.estimatedDurationMinutes ||
        opt.estimated_duration_minutes ||
        opt.duration ||
        15,
      benefits: Array.isArray(opt.benefits) ? opt.benefits : [],
      steps: (opt.steps || []).map((step: any, stepIndex: number) => ({
        stepNumber: step.stepNumber || step.step_number || stepIndex + 1,
        stepType: step.stepType || step.step_type || 'face_yoga',
        title: step.title || `Step ${stepIndex + 1}`,
        instructions: step.instructions || '',
        tips: step.tips,
        durationSeconds: step.durationSeconds || step.duration_seconds || step.duration || 60,
        imageUrl: step.imageUrl || step.image_url,
        productCategory: step.productCategory || step.product_category,
        productAmount: step.productAmount || step.product_amount,
      })),
    }));
  } catch (error) {
    console.error('Failed to parse routine options:', error);
    console.error('Response:', response);
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

/**
 * Generate personalized routine options using Claude AI
 *
 * @param skinProfile - User's current skin profile with type and concerns
 * @param goals - Optional user-selected skin goals
 * @returns Array of 3-5 RoutineOption objects
 *
 * Implements FR-015: Generate 3-5 routine options
 * Implements FR-017: Each includes title, focus, duration, benefits
 */
export async function generateRoutineOptions(
  skinProfile: SkinProfile,
  goals?: string[]
): Promise<RoutineOption[]> {
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(skinProfile, goals);

  const response = await executeClaudeRequest(
    async () => {
      const result = await createMessage({
        messages: [{ role: 'user', content: userPrompt }],
        system: systemPrompt,
        maxTokens: 4096,
        temperature: 0.8, // Some creativity for varied options
      });

      // Extract text from response
      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in AI response');
      }

      return textContent.text;
    },
    ROUTINE_GENERATION_TIMEOUT,
    'Routine generation'
  );

  return parseRoutineOptions(response);
}

/**
 * Generate a single routine with more detail
 * Used when user wants to customize a selected routine
 */
export async function generateDetailedRoutine(
  skinProfile: SkinProfile,
  focusArea: string,
  preferences?: {
    maxDuration?: number;
    includeProductTypes?: string[];
    excludeProductTypes?: string[];
  }
): Promise<RoutineOption> {
  const systemPrompt = `You are an expert face yoga instructor and skincare specialist. Create a single detailed routine focused on "${focusArea}" based on the user's skin profile.

Include comprehensive instructions for each step with:
- Detailed technique descriptions
- Breathing cues for face yoga
- Application methods for products
- Tips for maximizing effectiveness

Return a single routine as JSON with the structure:
{
  "title": "...",
  "description": "...",
  "focusArea": "...",
  "estimatedDurationMinutes": number,
  "benefits": ["...", "..."],
  "steps": [...]
}`;

  const concerns = parseConcerns(skinProfile.concerns);
  let userPrompt = `Create a detailed ${focusArea} routine for:

SKIN TYPE: ${skinProfile.skin_type}
CONCERNS: ${concerns.map(c => c.type).join(', ') || 'None specific'}`;

  if (preferences?.maxDuration) {
    userPrompt += `\nMAX DURATION: ${preferences.maxDuration} minutes`;
  }

  if (preferences?.includeProductTypes?.length) {
    userPrompt += `\nMUST INCLUDE: ${preferences.includeProductTypes.join(', ')}`;
  }

  if (preferences?.excludeProductTypes?.length) {
    userPrompt += `\nEXCLUDE: ${preferences.excludeProductTypes.join(', ')}`;
  }

  const response = await executeClaudeRequest(
    async () => {
      const result = await createMessage({
        messages: [{ role: 'user', content: userPrompt }],
        system: systemPrompt,
        maxTokens: 2048,
        temperature: 0.7,
      });

      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in AI response');
      }

      return textContent.text;
    },
    ROUTINE_GENERATION_TIMEOUT,
    'Detailed routine generation'
  );

  const options = parseRoutineOptions(`[${response}]`);
  return options[0];
}

/**
 * Get fallback template routines when AI is unavailable
 * Implements Error Handling Strategy from plan.md
 */
export function getFallbackRoutines(skinType: string): RoutineOption[] {
  // Pre-built template routines as fallback
  const templates: RoutineOption[] = [
    {
      title: 'Morning Glow Routine',
      description: 'Start your day with a refreshing skincare routine combined with energizing face yoga.',
      focusArea: 'Brightening',
      estimatedDurationMinutes: 12,
      benefits: [
        'Wake up tired skin',
        'Reduce puffiness',
        'Boost circulation',
        'Prep skin for the day',
      ],
      steps: [
        {
          stepNumber: 1,
          stepType: 'product_application',
          title: 'Gentle Cleanse',
          instructions: 'Apply cleanser to damp face and massage in circular motions for 30 seconds. Rinse with lukewarm water.',
          tips: 'Use gentle pressure to avoid irritation',
          durationSeconds: 60,
          productCategory: 'cleanser',
          productAmount: 'pea-sized',
        },
        {
          stepNumber: 2,
          stepType: 'product_application',
          title: 'Toner Application',
          instructions: 'Apply toner to a cotton pad and gently sweep across face, avoiding eye area.',
          tips: 'Pat remaining product into skin for better absorption',
          durationSeconds: 30,
          productCategory: 'toner',
          productAmount: '2-3 drops',
        },
        {
          stepNumber: 3,
          stepType: 'face_yoga',
          title: 'Cheek Lift',
          instructions: 'Place fingers on cheekbones. Smile wide while pressing down gently. Hold for 5 seconds, release. Repeat 10 times.',
          tips: 'Keep your eyes relaxed during this exercise',
          durationSeconds: 60,
        },
        {
          stepNumber: 4,
          stepType: 'face_yoga',
          title: 'Forehead Smoother',
          instructions: 'Place both palms on forehead. Apply gentle pressure while raising eyebrows. Hold for 5 seconds. Repeat 8 times.',
          tips: 'Breathe deeply throughout',
          durationSeconds: 50,
        },
        {
          stepNumber: 5,
          stepType: 'product_application',
          title: 'Serum Application',
          instructions: 'Apply serum to fingertips and press into skin using gentle patting motions.',
          tips: 'Wait 30 seconds before next step for absorption',
          durationSeconds: 45,
          productCategory: 'serum',
          productAmount: '2-3 drops',
        },
        {
          stepNumber: 6,
          stepType: 'product_application',
          title: 'Moisturize',
          instructions: 'Apply moisturizer in upward strokes, starting from chin and moving to forehead.',
          tips: "Don't forget your neck!",
          durationSeconds: 45,
          productCategory: 'moisturizer',
          productAmount: 'pea-sized',
        },
      ],
    },
    {
      title: 'Evening Restore Routine',
      description: 'Wind down with a relaxing evening routine to repair and rejuvenate while you sleep.',
      focusArea: 'Anti-Aging',
      estimatedDurationMinutes: 15,
      benefits: [
        'Deep cleansing',
        'Relaxation',
        'Skin repair support',
        'Fine line reduction',
      ],
      steps: [
        {
          stepNumber: 1,
          stepType: 'product_application',
          title: 'Double Cleanse',
          instructions: 'First, massage oil cleanser onto dry face to remove makeup. Rinse. Follow with gel cleanser on damp skin.',
          tips: 'Take your time with the massage for better cleansing',
          durationSeconds: 90,
          productCategory: 'cleanser',
          productAmount: '2 pumps each',
        },
        {
          stepNumber: 2,
          stepType: 'face_yoga',
          title: 'Jaw Release',
          instructions: 'Open mouth wide, then slowly close while sliding lower jaw forward. Hold for 5 seconds. Repeat 8 times.',
          tips: 'This helps release tension from the day',
          durationSeconds: 60,
        },
        {
          stepNumber: 3,
          stepType: 'face_yoga',
          title: 'Eye Circle Massage',
          instructions: 'Using ring fingers, gently massage in circles around eyes starting from inner corners. Do 10 circles in each direction.',
          tips: 'Very light pressure only',
          durationSeconds: 60,
        },
        {
          stepNumber: 4,
          stepType: 'product_application',
          title: 'Treatment Serum',
          instructions: 'Apply treatment serum focusing on areas of concern. Pat gently to absorb.',
          tips: 'Allow time to absorb before next step',
          durationSeconds: 60,
          productCategory: 'treatment',
          productAmount: '3-4 drops',
        },
        {
          stepNumber: 5,
          stepType: 'product_application',
          title: 'Eye Cream',
          instructions: 'Dot eye cream around orbital bone using ring finger. Gently tap to absorb.',
          tips: 'Never pull or tug the delicate eye area',
          durationSeconds: 45,
          productCategory: 'eye_cream',
          productAmount: 'rice grain sized',
        },
        {
          stepNumber: 6,
          stepType: 'face_yoga',
          title: 'Face Relaxation',
          instructions: 'Close eyes, take 5 deep breaths. On each exhale, consciously relax all facial muscles.',
          tips: 'Let go of any tension held in your jaw, forehead, and around eyes',
          durationSeconds: 60,
        },
        {
          stepNumber: 7,
          stepType: 'product_application',
          title: 'Night Moisturizer',
          instructions: 'Apply a generous layer of night cream using upward strokes.',
          tips: 'Your skin repairs most while you sleep',
          durationSeconds: 45,
          productCategory: 'moisturizer',
          productAmount: 'generous amount',
        },
      ],
    },
    {
      title: 'Quick Refresh',
      description: 'A short but effective routine when you need a quick skin boost.',
      focusArea: 'Hydration',
      estimatedDurationMinutes: 8,
      benefits: [
        'Quick hydration boost',
        'Circulation increase',
        'Instant refreshment',
      ],
      steps: [
        {
          stepNumber: 1,
          stepType: 'product_application',
          title: 'Toner Mist',
          instructions: 'Spritz toner mist across face, keeping eyes closed.',
          tips: 'Hold bottle 6-8 inches from face',
          durationSeconds: 20,
          productCategory: 'toner',
          productAmount: '3-4 sprays',
        },
        {
          stepNumber: 2,
          stepType: 'face_yoga',
          title: 'Lion Face',
          instructions: 'Inhale deeply. On exhale, open mouth wide, stick out tongue, and widen eyes. Hold 5 seconds. Repeat 5 times.',
          tips: 'Great for releasing tension',
          durationSeconds: 45,
        },
        {
          stepNumber: 3,
          stepType: 'face_yoga',
          title: 'Fish Face',
          instructions: 'Suck in cheeks to make a fish face. Try to smile in this position. Hold 10 seconds. Repeat 5 times.',
          tips: 'Tones cheek muscles',
          durationSeconds: 60,
        },
        {
          stepNumber: 4,
          stepType: 'product_application',
          title: 'Hydrating Serum',
          instructions: 'Apply hydrating serum and press into slightly damp skin.',
          tips: 'Damp skin absorbs better',
          durationSeconds: 30,
          productCategory: 'serum',
          productAmount: '2 drops',
        },
        {
          stepNumber: 5,
          stepType: 'product_application',
          title: 'Light Moisturizer',
          instructions: 'Apply light moisturizer to seal in hydration.',
          tips: 'Use upward strokes',
          durationSeconds: 30,
          productCategory: 'moisturizer',
          productAmount: 'small amount',
        },
      ],
    },
  ];

  // Adjust based on skin type if needed
  return templates;
}

export default {
  generateRoutineOptions,
  generateDetailedRoutine,
  getFallbackRoutines,
};
