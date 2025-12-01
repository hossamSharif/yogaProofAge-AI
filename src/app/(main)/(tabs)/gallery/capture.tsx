import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography as Text } from '@/components/common';
import { Colors, Spacing, Layout } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useGalleryStore } from '@/stores/gallery.store';
import { useAuthStore } from '@/stores/auth.store';
import { savePhoto } from '@/services/storage/local';
import { canCapturePhoto, getStorageWarningMessage } from '@/utils/storage';
import { validateImage } from '@/utils/imageValidation';

/**
 * Photo Capture Screen (T111)
 *
 * Camera interface for capturing progress photos
 * Implements FR-049: Photo capture with camera interface
 */
export default function CaptureScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const { user } = useAuthStore();
  const { capturePhoto } = useGalleryStore();

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [isCapturing, setIsCapturing] = useState(false);

  // Request camera permission on mount
  React.useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);

      // Check storage space before capturing
      const hasSpace = await canCapturePhoto();
      if (!hasSpace) {
        const storageStatus = await import('@/utils/storage').then(m => m.getStorageStatus());
        const warning = getStorageWarningMessage(await storageStatus);

        Alert.alert(warning.title, warning.message, [
          { text: 'Cancel', style: 'cancel' },
          ...warning.actions.map(action => ({
            text: action.label,
            onPress: () => {
              if (action.action === 'enable_cloud') {
                router.push('/(main)/settings/backup');
              } else if (action.action === 'change_quality') {
                router.push('/(main)/settings/photo-quality');
              }
            },
          })),
        ]);
        return;
      }

      // Capture photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
      });

      if (!photo || !user?.id) return;

      // Validate image quality
      const validation = await validateImage(photo.uri);
      if (!validation.isValid) {
        Alert.alert(
          'Photo Quality Issue',
          validation.errors.join('\n'),
          [
            { text: 'Retry', style: 'default' },
            { text: 'Use Anyway', onPress: () => saveAndUpload(photo.uri) },
          ]
        );
        return;
      }

      // Save and upload photo
      await saveAndUpload(photo.uri);
    } catch (error) {
      console.error('Failed to capture photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const saveAndUpload = async (uri: string) => {
    if (!user?.id) return;

    try {
      // Generate photo ID
      const photoId = `photo_${Date.now()}_${user.id}`;

      // Save to local storage with encryption
      const storageResult = await savePhoto(uri, photoId);

      // Save metadata to database
      await capturePhoto({
        user_id: user.id,
        local_uri: storageResult.localUri,
        captured_at: new Date().toISOString(),
        file_size_bytes: storageResult.sizeBytes,
        cloud_url: null,
        cloud_path: null,
        lighting_conditions: 'auto', // Could be detected from EXIF
        is_deleted: false,
      });

      Alert.alert('Success', 'Photo saved successfully!', [
        { text: 'Take Another', style: 'default' },
        { text: 'View Gallery', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Failed to save photo:', error);
      Alert.alert('Error', 'Failed to save photo. Please try again.');
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
              <Ionicons name="close" size={28} color={Colors.textInverse} />
            </TouchableOpacity>
          </View>
          <View style={styles.permissionContent}>
            <Ionicons name="camera-outline" size={64} color={Colors.textInverse} />
            <Text variant="h3" style={styles.permissionTitle}>
              Camera Permission Required
            </Text>
            <Text variant="body" style={styles.permissionText}>
              We need access to your camera to take progress photos.
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text variant="bodyBold" style={styles.permissionButtonText}>
                Grant Permission
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header with close button */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
              <Ionicons name="close" size={28} color={Colors.textInverse} />
            </TouchableOpacity>
          </View>

          {/* Face guide overlay */}
          <View style={styles.guideContainer}>
            <View style={styles.faceGuide} />
            <Text variant="body" style={styles.guideText}>
              Position your face within the oval
            </Text>
          </View>

          {/* Bottom controls */}
          <View style={styles.controls}>
            <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
              <Ionicons name="camera-reverse" size={32} color={Colors.textInverse} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
              onPress={handleCapture}
              disabled={isCapturing}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <View style={styles.controlButton} />
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    width: 280,
    height: 360,
    borderRadius: 140,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderStyle: 'dashed',
  },
  guideText: {
    color: Colors.textInverse,
    marginTop: Spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Spacing.xl,
    paddingHorizontal: Layout.screenPadding,
  },
  controlButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.textInverse,
  },
  permissionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
  },
  permissionTitle: {
    color: Colors.textInverse,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  permissionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 24,
  },
  permissionButtonText: {
    color: Colors.textInverse,
  },
});
