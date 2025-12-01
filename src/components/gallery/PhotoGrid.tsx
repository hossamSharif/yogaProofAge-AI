import React, { useMemo } from 'react';
import { View, FlatList, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import { PhotoThumbnail } from './PhotoThumbnail';
import { PhotoWithSync } from '@/stores/gallery.store';
import { Spacing } from '@/constants/theme';

/**
 * Photo Grid Component with Lazy Loading (T115)
 *
 * Displays photos in chronological grid with lazy loading
 * Implements FR-054: Gallery organized by date
 */

interface PhotoGridProps {
  photos: PhotoWithSync[];
  selectedPhotoIds?: string[];
  onPhotoPress?: (photo: PhotoWithSync) => void;
  onPhotoLongPress?: (photo: PhotoWithSync) => void;
  selectionMode?: boolean;
  numColumns?: number;
  style?: ViewStyle;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  selectedPhotoIds = [],
  onPhotoPress,
  onPhotoLongPress,
  selectionMode = false,
  numColumns = 3,
  style,
}) => {
  // Calculate thumbnail size based on screen width and columns
  const thumbnailSize = useMemo(() => {
    const totalSpacing = Spacing.md * (numColumns + 1);
    return Math.floor((SCREEN_WIDTH - totalSpacing) / numColumns);
  }, [numColumns]);

  // Group photos by date for section headers (optional enhancement)
  const photoItems = useMemo(() => {
    return photos.map(photo => ({
      ...photo,
      isSelected: selectedPhotoIds.includes(photo.id),
    }));
  }, [photos, selectedPhotoIds]);

  const renderPhoto = ({ item }: { item: typeof photoItems[0] }) => {
    return (
      <View style={styles.photoItem}>
        <PhotoThumbnail
          uri={item.local_uri || ''}
          date={item.captured_at}
          selected={item.isSelected}
          syncStatus={item.syncStatus}
          onPress={() => onPhotoPress?.(item)}
          size={thumbnailSize}
        />
      </View>
    );
  };

  const keyExtractor = (item: typeof photoItems[0]) => item.id;

  // Empty state
  if (photos.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        {/* Empty state UI can be added here */}
      </View>
    );
  }

  return (
    <FlatList
      data={photoItems}
      renderItem={renderPhoto}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      contentContainerStyle={[styles.grid, style]}
      columnWrapperStyle={styles.row}
      // Performance optimizations for lazy loading
      initialNumToRender={12} // Load first 4 rows (3 cols x 4 rows)
      maxToRenderPerBatch={6} // Render 2 rows at a time
      windowSize={5} // Keep 5 screens worth of items in memory
      removeClippedSubviews={true}
      updateCellsBatchingPeriod={50}
      // Pull to refresh (optional)
      // onRefresh={onRefresh}
      // refreshing={isRefreshing}
    />
  );
};

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: Spacing.md,
  },
  photoItem: {
    marginHorizontal: Spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
});
