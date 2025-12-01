import { create } from 'zustand';
import { Database } from '@/types/supabase.types';
import * as databaseService from '@/services/supabase/database';

type ProgressPhoto = Database['public']['Tables']['progress_photos']['Row'];
type PhotoComparison = Database['public']['Tables']['photo_comparisons']['Row'];

/**
 * Photo comparison with related photo data
 */
export interface PhotoComparisonWithPhotos extends PhotoComparison {
  before_photo?: ProgressPhoto | null;
  after_photo?: ProgressPhoto | null;
}

/**
 * Photo selection for comparison (FR-055)
 */
export interface PhotoSelection {
  beforePhoto: ProgressPhoto | null;
  afterPhoto: ProgressPhoto | null;
}

/**
 * Sync status for cloud backup (FR-052, FR-053)
 */
export type SyncStatus = 'not_synced' | 'syncing' | 'synced' | 'error';

/**
 * Photo with sync metadata
 */
export interface PhotoWithSync extends ProgressPhoto {
  syncStatus: SyncStatus;
}

interface GalleryState {
  // Photos State
  photos: PhotoWithSync[];
  isLoading: boolean;
  error: string | null;

  // Photo Comparison State
  comparisons: PhotoComparisonWithPhotos[];
  isLoadingComparisons: boolean;
  currentComparison: PhotoComparisonWithPhotos | null;

  // Photo Selection for Comparison (FR-055)
  photoSelection: PhotoSelection;

  // Sync State (FR-051, FR-052, FR-053)
  syncQueue: string[]; // Photo IDs waiting to sync
  isSyncing: boolean;

  // Actions - Photo Management
  fetchPhotos: (userId: string) => Promise<void>;
  capturePhoto: (photo: Omit<ProgressPhoto, 'id' | 'created_at' | 'updated_at' | 'is_deleted'>) => Promise<ProgressPhoto>;
  deletePhoto: (photoId: string) => Promise<void>;
  updatePhotoMetadata: (photoId: string, updates: Partial<ProgressPhoto>) => Promise<void>;

  // Actions - Photo Comparison (FR-055, FR-056, FR-057)
  selectPhotoForComparison: (photo: ProgressPhoto, slot: 'before' | 'after') => void;
  clearPhotoSelection: () => void;
  fetchComparisons: (userId: string) => Promise<void>;
  setCurrentComparison: (comparison: PhotoComparisonWithPhotos | null) => void;

  // Actions - Cloud Backup & Sync (FR-051, FR-052, FR-053)
  addToSyncQueue: (photoId: string) => void;
  removeFromSyncQueue: (photoId: string) => void;
  updatePhotoSyncStatus: (photoId: string, status: SyncStatus) => void;

  // Utility Actions
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  photos: [],
  isLoading: false,
  error: null,
  comparisons: [],
  isLoadingComparisons: false,
  currentComparison: null,
  photoSelection: {
    beforePhoto: null,
    afterPhoto: null,
  },
  syncQueue: [],
  isSyncing: false,
};

export const useGalleryStore = create<GalleryState>((set, get) => ({
  ...initialState,

  // ========================================================================
  // Photo Management
  // ========================================================================

  fetchPhotos: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const photos = await databaseService.getProgressPhotos(userId);

      // Initialize sync status based on cloud_url presence
      const photosWithSync: PhotoWithSync[] = photos.map(photo => ({
        ...photo,
        syncStatus: photo.cloud_url ? 'synced' : 'not_synced',
      }));

      set({ photos: photosWithSync, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  capturePhoto: async (photo) => {
    set({ isLoading: true, error: null });
    try {
      const newPhoto = await databaseService.createProgressPhoto(photo);

      const photoWithSync: PhotoWithSync = {
        ...newPhoto,
        syncStatus: 'not_synced',
      };

      set(state => ({
        photos: [photoWithSync, ...state.photos],
        isLoading: false,
      }));

      // Add to sync queue if cloud backup is enabled (will be checked by sync service)
      get().addToSyncQueue(newPhoto.id);

      return newPhoto;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deletePhoto: async (photoId: string) => {
    set({ isLoading: true, error: null });
    try {
      await databaseService.softDeletePhoto(photoId);

      set(state => ({
        photos: state.photos.filter(p => p.id !== photoId),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updatePhotoMetadata: async (photoId: string, updates: Partial<ProgressPhoto>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPhoto = await databaseService.updateProgressPhoto(photoId, updates);

      set(state => ({
        photos: state.photos.map(p => {
          if (p.id === photoId) {
            return {
              ...p,
              ...updatedPhoto,
            };
          }
          return p;
        }),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  // ========================================================================
  // Photo Comparison
  // ========================================================================

  selectPhotoForComparison: (photo: ProgressPhoto, slot: 'before' | 'after') => {
    set(state => ({
      photoSelection: {
        ...state.photoSelection,
        [slot === 'before' ? 'beforePhoto' : 'afterPhoto']: photo,
      },
    }));
  },

  clearPhotoSelection: () => {
    set({
      photoSelection: {
        beforePhoto: null,
        afterPhoto: null,
      },
    });
  },

  fetchComparisons: async (userId: string) => {
    set({ isLoadingComparisons: true, error: null });
    try {
      const comparisons = await databaseService.getPhotoComparisons(userId);
      set({ comparisons, isLoadingComparisons: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoadingComparisons: false });
      throw error;
    }
  },

  setCurrentComparison: (comparison: PhotoComparisonWithPhotos | null) => {
    set({ currentComparison: comparison });
  },

  // ========================================================================
  // Cloud Backup & Sync
  // ========================================================================

  addToSyncQueue: (photoId: string) => {
    set(state => ({
      syncQueue: state.syncQueue.includes(photoId)
        ? state.syncQueue
        : [...state.syncQueue, photoId],
    }));
  },

  removeFromSyncQueue: (photoId: string) => {
    set(state => ({
      syncQueue: state.syncQueue.filter(id => id !== photoId),
    }));
  },

  updatePhotoSyncStatus: (photoId: string, status: SyncStatus) => {
    set(state => ({
      photos: state.photos.map(p =>
        p.id === photoId ? { ...p, syncStatus: status } : p
      ),
    }));
  },

  // ========================================================================
  // Utility
  // ========================================================================

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));
