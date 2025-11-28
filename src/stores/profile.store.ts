import { create } from 'zustand';
import { Database } from '@/types/supabase.types';
import * as databaseService from '@/services/supabase/database';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type SkinProfile = Database['public']['Tables']['skin_profiles']['Row'];

/**
 * Skin Goals (for onboarding)
 */
export type SkinGoal =
  | 'anti_aging'
  | 'hydration'
  | 'acne'
  | 'brightness'
  | 'firmness'
  | 'dark_spots'
  | 'pores'
  | 'sensitivity';

interface ProfileState {
  // User Profile State
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  // Skin Profile State
  skinProfile: SkinProfile | null;
  skinProfileHistory: SkinProfile[];
  isSkinProfileLoading: boolean;

  // Onboarding State
  selectedGoals: SkinGoal[];
  onboardingCompleted: boolean;

  // User Profile Actions
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: (userId: string) => Promise<void>;

  // Skin Profile Actions
  setSkinProfile: (skinProfile: SkinProfile | null) => void;
  fetchActiveSkinProfile: (userId: string) => Promise<void>;
  fetchSkinProfileHistory: (userId: string) => Promise<void>;
  createSkinProfile: (profile: Omit<SkinProfile, 'id' | 'created_at'>) => Promise<SkinProfile>;

  // Onboarding Actions
  setSelectedGoals: (goals: SkinGoal[]) => void;
  toggleGoal: (goal: SkinGoal) => void;
  completeOnboarding: (userId: string) => Promise<void>;

  // Error handling
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  clearState: () => void;
}

/**
 * Profile Store
 *
 * Manages user profile and skin profile state.
 * Handles onboarding completion tracking (FR-002, T066).
 */
export const useProfileStore = create<ProfileState>((set, get) => ({
  // Initial state
  profile: null,
  isLoading: false,
  error: null,
  skinProfile: null,
  skinProfileHistory: [],
  isSkinProfileLoading: false,
  selectedGoals: [],
  onboardingCompleted: false,

  // User Profile Actions
  setProfile: profile =>
    set({
      profile,
      onboardingCompleted: profile?.onboarding_completed || false,
    }),

  updateProfile: async updates => {
    const { profile } = get();
    if (!profile) return;

    try {
      set({ isLoading: true, error: null });
      const updatedProfile = await databaseService.updateUserProfile(profile.id, updates);
      set({
        profile: updatedProfile,
        onboardingCompleted: updatedProfile.onboarding_completed || false,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  refreshProfile: async userId => {
    try {
      set({ isLoading: true, error: null });
      const profile = await databaseService.getUserProfile(userId);
      set({
        profile,
        onboardingCompleted: profile?.onboarding_completed || false,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Skin Profile Actions
  setSkinProfile: skinProfile => set({ skinProfile }),

  fetchActiveSkinProfile: async userId => {
    try {
      set({ isSkinProfileLoading: true });
      const skinProfile = await databaseService.getActiveSkinProfile(userId);
      set({ skinProfile, isSkinProfileLoading: false });
    } catch (error: any) {
      set({ error: error.message, isSkinProfileLoading: false });
    }
  },

  fetchSkinProfileHistory: async userId => {
    try {
      set({ isSkinProfileLoading: true });
      const history = await databaseService.getSkinProfileHistory(userId);
      set({ skinProfileHistory: history, isSkinProfileLoading: false });
    } catch (error: any) {
      set({ error: error.message, isSkinProfileLoading: false });
    }
  },

  createSkinProfile: async profileData => {
    try {
      set({ isSkinProfileLoading: true });

      // Deactivate current active profile
      const { skinProfile: currentActive } = get();
      if (currentActive) {
        await databaseService.updateSkinProfile(currentActive.id, { is_active: false });
      }

      // Create new profile
      const newProfile = await databaseService.createSkinProfile(profileData);

      set({
        skinProfile: newProfile,
        isSkinProfileLoading: false,
      });

      // Refresh history
      await get().fetchSkinProfileHistory(profileData.user_id);

      return newProfile;
    } catch (error: any) {
      set({ error: error.message, isSkinProfileLoading: false });
      throw error;
    }
  },

  // Onboarding Actions
  setSelectedGoals: goals => set({ selectedGoals: goals }),

  toggleGoal: goal => {
    const { selectedGoals } = get();
    if (selectedGoals.includes(goal)) {
      set({ selectedGoals: selectedGoals.filter(g => g !== goal) });
    } else if (selectedGoals.length < 3) {
      set({ selectedGoals: [...selectedGoals, goal] });
    }
  },

  /**
   * Complete onboarding
   * Implements FR-002: Onboarding completion tracking
   * Implements T066: Add onboarding completion tracking in profile store
   */
  completeOnboarding: async userId => {
    try {
      set({ isLoading: true, error: null });

      // Update profile in database
      await databaseService.updateUserProfile(userId, {
        onboarding_completed: true,
      });

      // Update local state
      const { profile } = get();
      if (profile) {
        set({
          profile: { ...profile, onboarding_completed: true },
          onboardingCompleted: true,
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Error handling
  setError: error => set({ error }),
  setLoading: isLoading => set({ isLoading }),
  clearState: () =>
    set({
      profile: null,
      skinProfile: null,
      skinProfileHistory: [],
      selectedGoals: [],
      onboardingCompleted: false,
      isLoading: false,
      error: null,
    }),
}));

// Selectors
export const useProfile = () => useProfileStore(state => state.profile);
export const useSkinProfile = () => useProfileStore(state => state.skinProfile);
export const useOnboardingCompleted = () => useProfileStore(state => state.onboardingCompleted);
export const useSelectedGoals = () => useProfileStore(state => state.selectedGoals);
export const useProfileLoading = () => useProfileStore(state => state.isLoading);
export const useProfileError = () => useProfileStore(state => state.error);
