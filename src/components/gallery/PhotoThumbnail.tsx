import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

/**
 * Photo Thumbnail Component (T114)
 *
 * Displays photo thumbnail with date overlay
 * Used in photo grid for gallery
 */

interface PhotoThumbnailProps {
  uri: string;
  date: string;
  selected?: boolean;
  syncStatus?: 'synced' | 'syncing' | 'not_synced' | 'error';
  onPress?: () => void;
  size?: number;
  style?: ViewStyle;
}

export const PhotoThumbnail: React.FC<PhotoThumbnailProps> = ({
  uri,
  date,
  selected = false,
  syncStatus,
  onPress,
  size = 120,
  style,
}) => {
  const formattedDate = formatDate(date);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        { width: size, height: size },
        selected && styles.selected,
        style,
      ]}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Date Overlay */}
      <View style={styles.dateOverlay}>
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>

      {/* Sync Status Indicator */}
      {syncStatus && (
        <View style={[styles.syncIndicator, styles[`sync_${syncStatus}`]]}>
          {getSyncIcon(syncStatus)}
        </View>
      )}

      {/* Selection Indicator */}
      {selected && (
        <View style={styles.selectionIndicator}>
          <View style={styles.checkmark} />
        </View>
      )}
    </TouchableOpacity>
  );
};

/**
 * Format date for thumbnail display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

/**
 * Get sync status icon (placeholder - use actual icons in production)
 */
function getSyncIcon(status: string): React.ReactNode {
  switch (status) {
    case 'synced':
      return <Text style={styles.syncIcon}>✓</Text>;
    case 'syncing':
      return <Text style={styles.syncIcon}>⟳</Text>;
    case 'error':
      return <Text style={styles.syncIcon}>!</Text>;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selected: {
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dateOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  dateText: {
    ...Typography.caption,
    color: Colors.textInverse,
    textAlign: 'center',
  },
  syncIndicator: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sync_synced: {
    backgroundColor: Colors.success,
  },
  sync_syncing: {
    backgroundColor: Colors.warning,
  },
  sync_not_synced: {
    backgroundColor: Colors.textSecondary,
  },
  sync_error: {
    backgroundColor: Colors.error,
  },
  syncIcon: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectionIndicator: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.textInverse,
  },
});
