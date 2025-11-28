import { supabase } from './client';
import { Database } from '@/types/supabase.types';

// Type aliases for cleaner code
type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

type SkinProfile = Database['public']['Tables']['skin_profiles']['Row'];
type SkinProfileInsert = Database['public']['Tables']['skin_profiles']['Insert'];
type SkinProfileUpdate = Database['public']['Tables']['skin_profiles']['Update'];

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];

type Routine = Database['public']['Tables']['routines']['Row'];
type RoutineInsert = Database['public']['Tables']['routines']['Insert'];
type RoutineUpdate = Database['public']['Tables']['routines']['Update'];

type RoutineStep = Database['public']['Tables']['routine_steps']['Row'];
type RoutineStepInsert = Database['public']['Tables']['routine_steps']['Insert'];

type RoutineSession = Database['public']['Tables']['routine_sessions']['Row'];
type RoutineSessionInsert = Database['public']['Tables']['routine_sessions']['Insert'];
type RoutineSessionUpdate = Database['public']['Tables']['routine_sessions']['Update'];

type StepCompletion = Database['public']['Tables']['step_completions']['Row'];
type StepCompletionInsert = Database['public']['Tables']['step_completions']['Insert'];

type DiaryEntry = Database['public']['Tables']['diary_entries']['Row'];
type DiaryEntryInsert = Database['public']['Tables']['diary_entries']['Insert'];
type DiaryEntryUpdate = Database['public']['Tables']['diary_entries']['Update'];

type ProgressPhoto = Database['public']['Tables']['progress_photos']['Row'];
type ProgressPhotoInsert = Database['public']['Tables']['progress_photos']['Insert'];
type ProgressPhotoUpdate = Database['public']['Tables']['progress_photos']['Update'];

type PhotoComparison = Database['public']['Tables']['photo_comparisons']['Row'];
type PhotoComparisonInsert = Database['public']['Tables']['photo_comparisons']['Insert'];

type Notification = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

type AIRecommendation = Database['public']['Tables']['ai_recommendations']['Row'];
type AIRecommendationInsert = Database['public']['Tables']['ai_recommendations']['Insert'];

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

/**
 * Supabase Database Query Utilities
 *
 * Provides typed database operations for all tables with RLS enabled.
 * All operations automatically respect Row Level Security policies.
 */

// ============================================================================
// USER PROFILES
// ============================================================================

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserProfile(
  userId: string,
  updates: UserProfileUpdate
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// SKIN PROFILES
// ============================================================================

export async function createSkinProfile(profile: SkinProfileInsert): Promise<SkinProfile> {
  const { data, error } = await supabase
    .from('skin_profiles')
    .insert(profile)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getActiveSkinProfile(userId: string): Promise<SkinProfile | null> {
  const { data, error } = await supabase
    .from('skin_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data;
}

export async function getSkinProfileHistory(userId: string): Promise<SkinProfile[]> {
  const { data, error } = await supabase
    .from('skin_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateSkinProfile(
  profileId: string,
  updates: SkinProfileUpdate
): Promise<SkinProfile> {
  const { data, error } = await supabase
    .from('skin_profiles')
    .update(updates)
    .eq('id', profileId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSkinProfileById(profileId: string): Promise<SkinProfile | null> {
  const { data, error } = await supabase
    .from('skin_profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// ============================================================================
// PRODUCTS
// ============================================================================

export async function getProducts(filters?: {
  category?: string;
  skinTypes?: string[];
  isAvailable?: boolean;
}): Promise<Product[]> {
  let query = supabase.from('products').select('*');

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.isAvailable !== undefined) {
    query = query.eq('is_available', filters.isAvailable);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getProductById(productId: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// ============================================================================
// ROUTINES
// ============================================================================

export async function createRoutine(routine: RoutineInsert): Promise<Routine> {
  const { data, error } = await supabase
    .from('routines')
    .insert(routine)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRoutineById(routineId: string): Promise<Routine | null> {
  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .eq('id', routineId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getUserRoutines(userId: string): Promise<Routine[]> {
  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getActiveRoutine(userId: string): Promise<Routine | null> {
  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateRoutine(
  routineId: string,
  updates: RoutineUpdate
): Promise<Routine> {
  const { data, error } = await supabase
    .from('routines')
    .update(updates)
    .eq('id', routineId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function activateRoutine(routineId: string, userId: string): Promise<Routine> {
  // Archive current active routine first
  await supabase
    .from('routines')
    .update({ status: 'archived' })
    .eq('user_id', userId)
    .eq('status', 'active');

  // Activate new routine
  const { data, error } = await supabase
    .from('routines')
    .update({ status: 'active' })
    .eq('id', routineId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// ROUTINE STEPS
// ============================================================================

export async function createRoutineSteps(steps: RoutineStepInsert[]): Promise<RoutineStep[]> {
  const { data, error } = await supabase
    .from('routine_steps')
    .insert(steps)
    .select();

  if (error) throw error;
  return data;
}

export async function getRoutineSteps(routineId: string): Promise<RoutineStep[]> {
  const { data, error } = await supabase
    .from('routine_steps')
    .select('*, products(*)')
    .eq('routine_id', routineId)
    .order('step_number', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function updateRoutineStep(
  stepId: string,
  updates: Partial<RoutineStep>
): Promise<RoutineStep> {
  const { data, error } = await supabase
    .from('routine_steps')
    .update(updates)
    .eq('id', stepId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRoutineStep(stepId: string): Promise<void> {
  const { error } = await supabase
    .from('routine_steps')
    .delete()
    .eq('id', stepId);

  if (error) throw error;
}

// ============================================================================
// ROUTINE SESSIONS
// ============================================================================

export async function createRoutineSession(
  session: RoutineSessionInsert
): Promise<RoutineSession> {
  const { data, error } = await supabase
    .from('routine_sessions')
    .insert(session)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRoutineSession(
  sessionId: string,
  updates: RoutineSessionUpdate
): Promise<RoutineSession> {
  const { data, error } = await supabase
    .from('routine_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function completeRoutineSession(
  sessionId: string,
  completedAt: string,
  totalDuration: number,
  stepsCompleted: number,
  stepsSkipped: number
): Promise<RoutineSession> {
  const { data, error } = await supabase
    .from('routine_sessions')
    .update({
      status: 'completed',
      completed_at: completedAt,
      total_duration_seconds: totalDuration,
      steps_completed: stepsCompleted,
      steps_skipped: stepsSkipped,
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRoutineSessions(
  userId: string,
  filters?: {
    routineId?: string;
    status?: 'in_progress' | 'completed' | 'abandoned';
    startDate?: string;
    endDate?: string;
  }
): Promise<RoutineSession[]> {
  let query = supabase
    .from('routine_sessions')
    .select('*, routines(*)')
    .eq('user_id', userId)
    .order('started_at', { ascending: false });

  if (filters?.routineId) {
    query = query.eq('routine_id', filters.routineId);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.startDate) {
    query = query.gte('started_at', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('started_at', filters.endDate);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

// ============================================================================
// STEP COMPLETIONS
// ============================================================================

export async function createStepCompletion(
  completion: StepCompletionInsert
): Promise<StepCompletion> {
  const { data, error } = await supabase
    .from('step_completions')
    .insert(completion)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSessionCompletions(sessionId: string): Promise<StepCompletion[]> {
  const { data, error } = await supabase
    .from('step_completions')
    .select('*')
    .eq('session_id', sessionId)
    .order('started_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// ============================================================================
// DIARY ENTRIES
// ============================================================================

export async function createDiaryEntry(entry: DiaryEntryInsert): Promise<DiaryEntry> {
  const { data, error } = await supabase
    .from('diary_entries')
    .insert(entry)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDiaryEntry(
  entryId: string,
  updates: DiaryEntryUpdate
): Promise<DiaryEntry> {
  const { data, error } = await supabase
    .from('diary_entries')
    .update(updates)
    .eq('id', entryId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDiaryEntry(userId: string, date: string): Promise<DiaryEntry | null> {
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('entry_date', date)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getDiaryEntries(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<DiaryEntry[]> {
  let query = supabase
    .from('diary_entries')
    .select('*')
    .eq('user_id', userId)
    .order('entry_date', { ascending: false });

  if (startDate) {
    query = query.gte('entry_date', startDate);
  }

  if (endDate) {
    query = query.lte('entry_date', endDate);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function deleteDiaryEntry(entryId: string): Promise<void> {
  const { error } = await supabase.from('diary_entries').delete().eq('id', entryId);

  if (error) throw error;
}

// ============================================================================
// PROGRESS PHOTOS
// ============================================================================

export async function createProgressPhoto(photo: ProgressPhotoInsert): Promise<ProgressPhoto> {
  const { data, error } = await supabase
    .from('progress_photos')
    .insert(photo)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProgressPhoto(
  photoId: string,
  updates: ProgressPhotoUpdate
): Promise<ProgressPhoto> {
  const { data, error } = await supabase
    .from('progress_photos')
    .update(updates)
    .eq('id', photoId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProgressPhotos(userId: string): Promise<ProgressPhoto[]> {
  const { data, error } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .order('captured_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function softDeletePhoto(photoId: string): Promise<void> {
  const { error } = await supabase
    .from('progress_photos')
    .update({ is_deleted: true })
    .eq('id', photoId);

  if (error) throw error;
}

// ============================================================================
// PHOTO COMPARISONS
// ============================================================================

export async function createPhotoComparison(
  comparison: PhotoComparisonInsert
): Promise<PhotoComparison> {
  const { data, error } = await supabase
    .from('photo_comparisons')
    .insert(comparison)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPhotoComparisons(userId: string): Promise<PhotoComparison[]> {
  const { data, error } = await supabase
    .from('photo_comparisons')
    .select('*, before_photo:progress_photos!before_photo_id(*), after_photo:progress_photos!after_photo_id(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export async function createNotification(notification: NotificationInsert): Promise<Notification> {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) throw error;
}

export async function deleteNotification(notificationId: string): Promise<void> {
  const { error } = await supabase.from('notifications').delete().eq('id', notificationId);

  if (error) throw error;
}

// ============================================================================
// AI RECOMMENDATIONS
// ============================================================================

export async function createAIRecommendation(
  recommendation: AIRecommendationInsert
): Promise<AIRecommendation> {
  const { data, error } = await supabase
    .from('ai_recommendations')
    .insert(recommendation)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAIRecommendations(userId: string): Promise<AIRecommendation[]> {
  const { data, error } = await supabase
    .from('ai_recommendations')
    .select('*')
    .eq('user_id', userId)
    .eq('is_actioned', false)
    .order('created_at', { ascending: false});

  if (error) throw error;
  return data || [];
}

export async function markRecommendationAsActioned(recommendationId: string): Promise<void> {
  const { error } = await supabase
    .from('ai_recommendations')
    .update({ is_actioned: true, actioned_at: new Date().toISOString() })
    .eq('id', recommendationId);

  if (error) throw error;
}

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// ============================================================================
// DATABASE FUNCTIONS
// ============================================================================

export async function calculateRoutineConsistency(
  userId: string,
  days = 30
): Promise<number> {
  const { data, error } = await supabase.rpc('calculate_routine_consistency', {
    p_user_id: userId,
    p_days: days,
  });

  if (error) throw error;
  return data || 0;
}

export async function getActiveRoutineWithSteps(userId: string) {
  const { data, error } = await supabase.rpc('get_active_routine', {
    p_user_id: userId,
  });

  if (error) throw error;
  return data || [];
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { data, error } = await supabase.rpc('get_unread_notification_count', {
    p_user_id: userId,
  });

  if (error) throw error;
  return data || 0;
}
