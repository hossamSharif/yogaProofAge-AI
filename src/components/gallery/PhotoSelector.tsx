import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PhotoGrid } from './PhotoGrid';
import { PhotoWithSync } from '@/stores/gallery.store';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Button } from '@/components/common/Button';

/**
 * Photo Selector Component (T116)
 *
 * Allows selection of 2 photos for before/after comparison
 * Implements FR-055: Before/after photo selection
 */

interface PhotoSelectorProps {
  photos: PhotoWithSync[];
  beforePhoto: PhotoWithSync | null;
  afterPhoto: PhotoWithSync | null;
  onSelectBefore: (photo: PhotoWithSync) => void;
  onSelectAfter: (photo: PhotoWithSync) => void;
  onClearSelection: () => void;
  onCompare: () => void;
}

export const PhotoSelector: React.FC<PhotoSelectorProps> = ({
  photos,
  beforePhoto,
  afterPhoto,
  onSelectBefore,
  onSelectAfter,
  onClearSelection,
  onCompare,
}) => {
  const [selectionMode, setSelectionMode] = React.useState<'before' | 'after' | null>('before');

  const handlePhotoPress = (photo: PhotoWithSync) => {
    if (selectionMode === 'before') {
      onSelectBefore(photo);
      setSelectionMode('after');
    } else if (selectionMode === 'after') {
      onSelectAfter(photo);
      setSelectionMode(null);
    }
  };

  const selectedPhotoIds = [
    beforePhoto?.id,
    afterPhoto?.id,
  ].filter(Boolean) as string[];

  const canCompare = beforePhoto !== null && afterPhoto !== null;

  return (
    <View style={styles.container}>
      {/* Selection Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Select Photos to Compare</Text>

        {/* Selection Status */}
        <View style={styles.selectionStatus}>
          <View style={[styles.statusItem, beforePhoto && styles.statusItemComplete]}>
            <Text style={styles.statusLabel}>Before</Text>
            {beforePhoto && (
              <Text style={styles.statusDate}>
                {formatDate(beforePhoto.captured_at)}
              </Text>
            )}
          </View>

          <View style={styles.arrow}>
            <Text style={styles.arrowIcon}>→</Text>
          </View>

          <View style={[styles.statusItem, afterPhoto && styles.statusItemComplete]}>
            <Text style={styles.statusLabel}>After</Text>
            {afterPhoto && (
              <Text style={styles.statusDate}>
                {formatDate(afterPhoto.captured_at)}
              </Text>
            )}
          </View>
        </View>

        {/* Current Selection Instruction */}
        {selectionMode && (
          <View style={styles.instruction}>
            <Text style={styles.instructionText}>
              {selectionMode === 'before'
                ? 'Select the earlier photo (Before)'
                : 'Select the later photo (After)'}
            </Text>
          </View>
        )}
      </View>

      {/* Photo Grid */}
      <PhotoGrid
        photos={photos}
        selectedPhotoIds={selectedPhotoIds}
        onPhotoPress={handlePhotoPress}
        selectionMode={true}
      />

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Button
          title="Clear Selection"
          variant="outline"
          onPress={() => {
            onClearSelection();
            setSelectionMode('before');
          }}
          disabled={!beforePhoto && !afterPhoto}
          style={styles.button}
        />

        <Button
          title="Compare Photos"
          variant="primary"
          onPress={onCompare}
          disabled={!canCompare}
          style={styles.button}
        />
      </View>
    </View>
  );
};

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  selectionStatus: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statusItem: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statusItemComplete: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  statusLabel: {
    ...Typography.bodySmall,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  statusDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  arrow: {
    marginHorizontal: Spacing.sm,
  },
  arrowIcon: {
    fontSize: 24,
    color: Colors.primary,
  },
  instruction: {
    padding: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.sm,
  },
  instructionText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.md,
  },
  button: {
    flex: 1,
  },
});
