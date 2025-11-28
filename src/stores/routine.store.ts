import { create } from 'zustand';
import { Database } from '@/types/supabase.types';
import * as databaseService from '@/services/supabase/database';

type Routine = Database['public']['Tables']['routines']['Row'];
type RoutineStep = Database['public']['Tables']['routine_steps']['Row'];
type RoutineSession = Database['public']['Tables']['routine_sessions']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

/**
 * Extended routine step with product data
 */
export interface RoutineStepWithProduct extends RoutineStep {
  products?: Product | null;
}

/**
 * Routine option from AI generation (FR-015: 3-5 options)
 */
export interface RoutineOption {
  title: string;
  description: string;
  focusArea: string;
  estimatedDurationMinutes: number;
  benefits: string[];
  steps: Array<{
    stepNumber: number;
    stepType: 'face_yoga' | 'product_application';
    title: string;
    instructions: string;
    tips?: string;
    durationSeconds: number;
    imageUrl?: string;
    productCategory?: string;
    productAmount?: string;
  }>;
}

/**
 * Session tracking for routine player
 */
export interface ActiveSession {
  id: string;
  routineId: string;
  startedAt: string;
  currentStepIndex: number;
  completedSteps: string[];
  skippedSteps: string[];
  isPaused: boolean;
  pausedAt?: string;
  totalPausedDuration: number;
}

interface RoutineState {
  // Routines State
  routines: Routine[];
  activeRoutine: Routine | null;
  isLoading: boolean;
  error: string | null;

  // Routine Generation State
  generatedOptions: RoutineOption[];
  isGenerating: boolean;
  selectedOptionIndex: number | null;

  // Active Routine Steps
  activeRoutineSteps: RoutineStepWithProduct[];
  isLoadingSteps: boolean;

  // Session State (FR-029, FR-031, FR-032)
  activeSession: ActiveSession | null;
  recentSessions: RoutineSession[];

  // Actions - Routine Management
  fetchUserRoutines: (userId: string) => Promise<void>;
  fetchActiveRoutine: (userId: string) => Promise<void>;
  fetchRoutineSteps: (routineId: string) => Promise<void>;
  createRoutine: (routine: Omit<Routine, 'id' | 'created_at' | 'updated_at'>) => Promise<Routine>;
  createRoutineSteps: (
    routineId: string,
    steps: Array<Omit<RoutineStep, 'id' | 'routine_id' | 'created_at'>>
  ) => Promise<RoutineStep[]>;
  activateRoutine: (routineId: string, userId: string) => Promise<void>;

  // Actions - Routine Generation (FR-015, FR-017)
  setGeneratedOptions: (options: RoutineOption[]) => void;
  selectOption: (index: number) => void;
  clearGeneratedOptions: () => void;

  // Actions - Session Management (FR-029, FR-031, FR-032)
  startSession: (userId: string, routineId: string) => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  completeStep: (stepId: string) => void;
  skipStep: (stepId: string) => void;
  completeSession: () => Promise<void>;
  abandonSession: () => Promise<void>;

  // Actions - Session History
  fetchRecentSessions: (userId: string, limit?: number) => Promise<void>;

  // Error handling
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  clearState: () => void;
}

/**
 * Routine Store
 *
 * Manages routine state for User Story 2 (Routine Creation) and User Story 3 (Routine Player).
 *
 * Implements:
 * - T077: Create routine store with Zustand
 * - FR-016: Routine CRUD operations
 * - FR-018: Routine activation logic
 * - FR-029: Session tracking (start, pause, resume, complete)
 * - FR-031: Session logging
 * - FR-032: Step completion tracking
 */
export const useRoutineStore = create<RoutineState>((set, get) => ({
  // Initial state
  routines: [],
  activeRoutine: null,
  isLoading: false,
  error: null,
  generatedOptions: [],
  isGenerating: false,
  selectedOptionIndex: null,
  activeRoutineSteps: [],
  isLoadingSteps: false,
  activeSession: null,
  recentSessions: [],

  // ============================================================================
  // ROUTINE MANAGEMENT
  // ============================================================================

  fetchUserRoutines: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const routines = await databaseService.getUserRoutines(userId);
      set({ routines, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchActiveRoutine: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const activeRoutine = await databaseService.getActiveRoutine(userId);
      set({ activeRoutine, isLoading: false });

      // Also fetch steps if we have an active routine
      if (activeRoutine) {
        get().fetchRoutineSteps(activeRoutine.id);
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchRoutineSteps: async (routineId: string) => {
    try {
      set({ isLoadingSteps: true });
      const steps = await databaseService.getRoutineSteps(routineId);
      set({ activeRoutineSteps: steps as RoutineStepWithProduct[], isLoadingSteps: false });
    } catch (error: any) {
      set({ error: error.message, isLoadingSteps: false });
    }
  },

  createRoutine: async (routineData) => {
    try {
      set({ isLoading: true, error: null });
      const routine = await databaseService.createRoutine(routineData);
      const { routines } = get();
      set({ routines: [routine, ...routines], isLoading: false });
      return routine;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createRoutineSteps: async (routineId, stepsData) => {
    try {
      set({ isLoadingSteps: true });
      const stepsToInsert = stepsData.map((step, index) => ({
        ...step,
        routine_id: routineId,
        step_number: step.step_number ?? index + 1,
      }));
      const steps = await databaseService.createRoutineSteps(stepsToInsert);
      set({ activeRoutineSteps: steps as RoutineStepWithProduct[], isLoadingSteps: false });
      return steps;
    } catch (error: any) {
      set({ error: error.message, isLoadingSteps: false });
      throw error;
    }
  },

  /**
   * Activate a routine (FR-018)
   * Sets status='active', archives previous active routine
   */
  activateRoutine: async (routineId: string, userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const routine = await databaseService.activateRoutine(routineId, userId);

      // Update local state
      const { routines } = get();
      const updatedRoutines = routines.map(r => ({
        ...r,
        status: r.id === routineId ? 'active' : r.status === 'active' ? 'archived' : r.status,
      })) as Routine[];

      set({
        activeRoutine: routine,
        routines: updatedRoutines,
        isLoading: false,
      });

      // Fetch steps for newly activated routine
      get().fetchRoutineSteps(routineId);
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // ============================================================================
  // ROUTINE GENERATION (FR-015, FR-017)
  // ============================================================================

  setGeneratedOptions: (options: RoutineOption[]) => {
    set({ generatedOptions: options, isGenerating: false, selectedOptionIndex: null });
  },

  selectOption: (index: number) => {
    set({ selectedOptionIndex: index });
  },

  clearGeneratedOptions: () => {
    set({ generatedOptions: [], selectedOptionIndex: null, isGenerating: false });
  },

  // ============================================================================
  // SESSION MANAGEMENT (FR-029, FR-031, FR-032)
  // ============================================================================

  /**
   * Start a new routine session (FR-029)
   */
  startSession: async (userId: string, routineId: string) => {
    try {
      const startedAt = new Date().toISOString();

      // Create session in database (FR-031)
      const session = await databaseService.createRoutineSession({
        user_id: userId,
        routine_id: routineId,
        started_at: startedAt,
        status: 'in_progress',
      });

      // Set active session in state
      set({
        activeSession: {
          id: session.id,
          routineId,
          startedAt,
          currentStepIndex: 0,
          completedSteps: [],
          skippedSteps: [],
          isPaused: false,
          totalPausedDuration: 0,
        },
      });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Pause session (FR-029)
   */
  pauseSession: () => {
    const { activeSession } = get();
    if (!activeSession || activeSession.isPaused) return;

    set({
      activeSession: {
        ...activeSession,
        isPaused: true,
        pausedAt: new Date().toISOString(),
      },
    });
  },

  /**
   * Resume session (FR-029)
   */
  resumeSession: () => {
    const { activeSession } = get();
    if (!activeSession || !activeSession.isPaused) return;

    const pausedDuration = activeSession.pausedAt
      ? Date.now() - new Date(activeSession.pausedAt).getTime()
      : 0;

    set({
      activeSession: {
        ...activeSession,
        isPaused: false,
        pausedAt: undefined,
        totalPausedDuration: activeSession.totalPausedDuration + pausedDuration,
      },
    });
  },

  /**
   * Mark step as completed (FR-032)
   */
  completeStep: (stepId: string) => {
    const { activeSession, activeRoutineSteps } = get();
    if (!activeSession) return;

    const completedSteps = [...activeSession.completedSteps, stepId];
    const nextStepIndex = Math.min(
      activeSession.currentStepIndex + 1,
      activeRoutineSteps.length - 1
    );

    set({
      activeSession: {
        ...activeSession,
        completedSteps,
        currentStepIndex: nextStepIndex,
      },
    });

    // Record step completion in database
    databaseService.createStepCompletion({
      session_id: activeSession.id,
      step_id: stepId,
      status: 'completed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });
  },

  /**
   * Skip step (FR-032)
   */
  skipStep: (stepId: string) => {
    const { activeSession, activeRoutineSteps } = get();
    if (!activeSession) return;

    const skippedSteps = [...activeSession.skippedSteps, stepId];
    const nextStepIndex = Math.min(
      activeSession.currentStepIndex + 1,
      activeRoutineSteps.length - 1
    );

    set({
      activeSession: {
        ...activeSession,
        skippedSteps,
        currentStepIndex: nextStepIndex,
      },
    });

    // Record step skip in database
    databaseService.createStepCompletion({
      session_id: activeSession.id,
      step_id: stepId,
      status: 'skipped',
      started_at: new Date().toISOString(),
    });
  },

  /**
   * Complete session (FR-029, FR-031)
   */
  completeSession: async () => {
    const { activeSession } = get();
    if (!activeSession) return;

    try {
      const completedAt = new Date().toISOString();
      const totalDuration = Math.floor(
        (Date.now() - new Date(activeSession.startedAt).getTime() - activeSession.totalPausedDuration) /
          1000
      );

      // Update session in database
      await databaseService.completeRoutineSession(
        activeSession.id,
        completedAt,
        totalDuration,
        activeSession.completedSteps.length,
        activeSession.skippedSteps.length
      );

      // Clear active session
      set({ activeSession: null });

      // Refresh recent sessions
      // Note: Would need userId here, typically passed or stored
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Abandon session (FR-029)
   */
  abandonSession: async () => {
    const { activeSession } = get();
    if (!activeSession) return;

    try {
      await databaseService.updateRoutineSession(activeSession.id, {
        status: 'abandoned',
      });

      set({ activeSession: null });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  // ============================================================================
  // SESSION HISTORY
  // ============================================================================

  fetchRecentSessions: async (userId: string, limit = 10) => {
    try {
      const sessions = await databaseService.getRoutineSessions(userId, {
        status: 'completed',
      });
      set({ recentSessions: sessions.slice(0, limit) });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  setError: (error: string | null) => set({ error }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  clearState: () =>
    set({
      routines: [],
      activeRoutine: null,
      generatedOptions: [],
      selectedOptionIndex: null,
      activeRoutineSteps: [],
      activeSession: null,
      recentSessions: [],
      isLoading: false,
      error: null,
    }),
}));

// ============================================================================
// SELECTORS
// ============================================================================

export const useRoutines = () => useRoutineStore(state => state.routines);
export const useActiveRoutine = () => useRoutineStore(state => state.activeRoutine);
export const useActiveRoutineSteps = () => useRoutineStore(state => state.activeRoutineSteps);
export const useGeneratedOptions = () => useRoutineStore(state => state.generatedOptions);
export const useSelectedOption = () => {
  const options = useRoutineStore(state => state.generatedOptions);
  const index = useRoutineStore(state => state.selectedOptionIndex);
  return index !== null ? options[index] : null;
};
export const useActiveSession = () => useRoutineStore(state => state.activeSession);
export const useCurrentStep = () => {
  const steps = useRoutineStore(state => state.activeRoutineSteps);
  const session = useRoutineStore(state => state.activeSession);
  return session ? steps[session.currentStepIndex] : null;
};
export const useRoutineLoading = () => useRoutineStore(state => state.isLoading);
export const useRoutineError = () => useRoutineStore(state => state.error);
