/**
 * Routine Validation Utilities
 *
 * Implements T092: Product selection validation
 * Per FR-022: All required steps have products assigned
 *
 * Validates routine configuration before activation.
 */

import { Database } from '@/types/supabase.types';

type RoutineStep = Database['public']['Tables']['routine_steps']['Row'];
type Routine = Database['public']['Tables']['routines']['Row'];

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code: string;
  message: string;
  stepId?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  stepId?: string;
}

/**
 * Validate routine is ready for activation
 * Per FR-022: All required steps have products
 */
export function validateRoutineForActivation(
  routine: Routine,
  steps: RoutineStep[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check routine has steps
  if (steps.length === 0) {
    errors.push({
      code: 'NO_STEPS',
      message: 'Routine must have at least one step.',
    });
  }

  // Check product application steps have products
  const productSteps = steps.filter(s => s.step_type === 'product_application');
  const missingProducts = productSteps.filter(s => !s.product_id);

  if (missingProducts.length > 0) {
    missingProducts.forEach(step => {
      errors.push({
        code: 'MISSING_PRODUCT',
        message: `Step "${step.title}" needs a product assigned.`,
        stepId: step.id,
      });
    });
  }

  // Check all steps have instructions
  const missingInstructions = steps.filter(s => !s.instructions || s.instructions.trim().length === 0);
  if (missingInstructions.length > 0) {
    missingInstructions.forEach(step => {
      warnings.push({
        code: 'MISSING_INSTRUCTIONS',
        message: `Step "${step.title}" has no instructions.`,
        stepId: step.id,
      });
    });
  }

  // Check routine has valid duration
  if (routine.estimated_duration_minutes <= 0) {
    warnings.push({
      code: 'INVALID_DURATION',
      message: 'Routine duration should be greater than 0.',
    });
  }

  // Check steps have valid durations
  const invalidDurations = steps.filter(s => s.duration_seconds <= 0);
  if (invalidDurations.length > 0) {
    invalidDurations.forEach(step => {
      warnings.push({
        code: 'INVALID_STEP_DURATION',
        message: `Step "${step.title}" has invalid duration.`,
        stepId: step.id,
      });
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate routine step configuration
 */
export function validateStep(step: Partial<RoutineStep>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Required fields
  if (!step.title || step.title.trim().length === 0) {
    errors.push({
      code: 'MISSING_TITLE',
      message: 'Step title is required.',
    });
  }

  if (!step.instructions || step.instructions.trim().length === 0) {
    errors.push({
      code: 'MISSING_INSTRUCTIONS',
      message: 'Step instructions are required.',
    });
  }

  if (!step.step_type) {
    errors.push({
      code: 'MISSING_TYPE',
      message: 'Step type is required.',
    });
  }

  if (!step.duration_seconds || step.duration_seconds <= 0) {
    errors.push({
      code: 'INVALID_DURATION',
      message: 'Step duration must be greater than 0.',
    });
  }

  // Product step validation
  if (step.step_type === 'product_application' && !step.product_id) {
    warnings.push({
      code: 'MISSING_PRODUCT',
      message: 'Product application step should have a product assigned.',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculate total routine duration from steps
 */
export function calculateTotalDuration(steps: RoutineStep[]): number {
  const totalSeconds = steps.reduce((sum, step) => sum + step.duration_seconds, 0);
  return Math.ceil(totalSeconds / 60); // Convert to minutes
}

/**
 * Check if routine can be played offline
 * Routine needs cached content for offline playback
 */
export function canPlayOffline(steps: RoutineStep[]): boolean {
  // All steps need instructions (images/videos can be cached separately)
  return steps.every(s => s.instructions && s.instructions.length > 0);
}

/**
 * Get completion percentage for routine setup
 */
export function getSetupProgress(routine: Routine, steps: RoutineStep[]): number {
  if (steps.length === 0) return 0;

  let completedChecks = 0;
  let totalChecks = 0;

  // Check: Has title
  totalChecks++;
  if (routine.title) completedChecks++;

  // Check: Has focus area
  totalChecks++;
  if (routine.focus_area) completedChecks++;

  // Check: Has duration
  totalChecks++;
  if (routine.estimated_duration_minutes > 0) completedChecks++;

  // Check: Has steps
  totalChecks++;
  if (steps.length > 0) completedChecks++;

  // Check: All steps have instructions
  totalChecks++;
  if (steps.every(s => s.instructions)) completedChecks++;

  // Check: Product steps have products
  const productSteps = steps.filter(s => s.step_type === 'product_application');
  if (productSteps.length > 0) {
    totalChecks++;
    if (productSteps.every(s => s.product_id)) completedChecks++;
  }

  return Math.round((completedChecks / totalChecks) * 100);
}

export default {
  validateRoutineForActivation,
  validateStep,
  calculateTotalDuration,
  canPlayOffline,
  getSetupProgress,
};
