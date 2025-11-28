import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { Database } from '@/types/supabase.types';
import * as authService from '@/services/supabase/auth';
import * as databaseService from '@/services/supabase/database';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

interface AuthState {
  // State
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  initialize: () => Promise<void>;
}

/**
 * Auth Store
 *
 * Global authentication state management using Zustand.
 * Handles session, user, and profile state synchronization.
 *
 * Features:
 * - Session persistence (via Supabase client + AsyncStorage)
 * - Auto token refresh (30-day expiry per NFR-029)
 * - Profile syncing with database
 * - Auth state change listeners
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  error: null,

  // Setters
  setSession: session => set({ session }),
  setUser: user => set({ user }),
  setProfile: profile => set({ profile }),
  setLoading: isLoading => set({ isLoading }),
  setError: error => set({ error }),

  // Sign out
  signOut: async () => {
    try {
      await authService.signOut();
      set({
        session: null,
        user: null,
        profile: null,
        error: null,
      });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  // Refresh profile from database
  refreshProfile: async () => {
    const { user } = get();
    if (!user) {
      set({ profile: null });
      return;
    }

    try {
      const profile = await databaseService.getUserProfile(user.id);
      set({ profile });
    } catch (error: any) {
      console.error('Failed to refresh profile:', error);
      set({ error: error.message });
    }
  },

  // Initialize auth state
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });

      // Get current session
      const session = await authService.getSession();
      const user = session?.user || null;

      set({ session, user });

      // Fetch user profile if authenticated
      if (user) {
        const profile = await databaseService.getUserProfile(user.id);
        set({ profile });
      }

      // Setup auth state change listener
      authService.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);

        set({
          session: session || null,
          user: session?.user || null,
        });

        if (session?.user) {
          // Refresh profile on auth change
          const profile = await databaseService.getUserProfile(session.user.id);
          set({ profile });
        } else {
          set({ profile: null });
        }
      });

      // Setup automatic token refresh
      authService.setupTokenRefresh();

      set({ isLoading: false });
    } catch (error: any) {
      console.error('Failed to initialize auth:', error);
      set({
        error: error.message,
        isLoading: false,
        session: null,
        user: null,
        profile: null,
      });
    }
  },
}));

// Selectors for common use cases
export const useSession = () => useAuthStore(state => state.session);
export const useUser = () => useAuthStore(state => state.user);
export const useProfile = () => useAuthStore(state => state.profile);
export const useIsAuthenticated = () => useAuthStore(state => !!state.session);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useAuthError = () => useAuthStore(state => state.error);
