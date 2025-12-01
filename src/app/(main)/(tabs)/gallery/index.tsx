import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography as Text, Button } from '@/components/common';
import { Colors, Spacing, Layout } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGalleryStore } from '@/stores/gallery.store';
import { useAuthStore } from '@/stores/auth.store';
import { PhotoGrid } from '@/components/gallery/PhotoGrid';

/**
 * Photo Gallery Screen - Gallery Index with Photo Grid (T110)
 *
 * Displays progress photos in chronological grid
 * Implements FR-054: Gallery organized by date
 */
export default function GalleryScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { photos, isLoading, fetchPhotos } = useGalleryStore();

  useEffect(() => {
    if (user?.id) {
      fetchPhotos(user.id);
    }
  }, [user?.id]);

  const handlePhotoPress = (photo: any) => {
    router.push(`/(main)/(tabs)/gallery/${photo.id}`);
  };

  const handleCapturePhoto = () => {
    router.push('/(main)/(tabs)/gallery/capture');
  };

  const handleComparePhotos = () => {
    router.push('/(main)/(tabs)/gallery/compare');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="h1">Gallery</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleComparePhotos}
          >
            <Ionicons name="git-compare-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleCapturePhoto}
          >
            <Ionicons name="camera" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {photos.length === 0 && !isLoading ? (
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={64} color={Colors.textTertiary} />
          <Text variant="h3" style={styles.emptyTitle}>
            No Photos Yet
          </Text>
          <Text variant="body" style={styles.emptyText}>
            Start capturing daily photos to track your skin transformation
          </Text>
          <Button
            title="Take Your First Photo"
            variant="primary"
            onPress={handleCapturePhoto}
            leftIcon={<Ionicons name="camera" size={20} color={Colors.textInverse} />}
          />
        </View>
      ) : (
        <PhotoGrid
          photos={photos}
          onPhotoPress={handlePhotoPress}
        />
      )}

      {/* Floating Action Button for Quick Capture */}
      {photos.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCapturePhoto}
        >
          <Ionicons name="camera" size={28} color={Colors.textInverse} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconButton: {
    padding: Spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.md,
  },
  emptyTitle: {
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  fab: {
    position: 'absolute',
    right: Layout.screenPadding,
    bottom: Layout.screenPadding + 80, // Above tab bar
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
