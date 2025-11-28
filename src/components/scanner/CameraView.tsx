import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { CameraView as ExpoCameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { Typography as Text, Button } from '@/components/common';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const GUIDE_SIZE = width * 0.75;

/**
 * Camera View Component
 *
 * Reusable camera component with face detection guides and positioning feedback.
 *
 * Implements:
 * - FR-010: Real-time positioning feedback
 * - Face detection guides overlay
 */

interface CameraViewProps {
  style?: any;
  showGuides?: boolean;
  showFeedback?: boolean;
  disabled?: boolean;
}

export interface CameraViewRef {
  takePicture: (options?: any) => Promise<any>;
}

export const CameraView = forwardRef<CameraViewRef, CameraViewProps>(
  ({ style, showGuides = true, showFeedback = true, disabled = false }, ref) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<CameraType>('front');
    const cameraRef = useRef<ExpoCameraView>(null);

    // Animation for scanning effect
    const scanLinePosition = useSharedValue(0);

    useEffect(() => {
      if (!disabled) {
        scanLinePosition.value = withRepeat(
          withTiming(1, { duration: 2000, easing: Easing.linear }),
          -1,
          true
        );
      }
    }, [disabled]);

    const scanLineStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: scanLinePosition.value * (GUIDE_SIZE - 4) }],
    }));

    useImperativeHandle(ref, () => ({
      takePicture: async (options = {}) => {
        if (!cameraRef.current) {
          throw new Error('Camera not ready');
        }
        return cameraRef.current.takePictureAsync({
          quality: 0.85,
          base64: true,
          skipProcessing: false,
          ...options,
        });
      },
    }));

    // Handle permission states
    if (!permission) {
      return (
        <View style={[styles.container, styles.permissionContainer, style]}>
          <Text variant="body" style={styles.permissionText}>
            Checking camera permissions...
          </Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={[styles.container, styles.permissionContainer, style]}>
          <Text variant="h3" style={styles.permissionTitle}>
            Camera Access Required
          </Text>
          <Text variant="body" style={styles.permissionText}>
            We need camera access to analyze your skin. Your photos are processed
            securely and never stored without your consent.
          </Text>
          <Button
            title="Grant Permission"
            variant="primary"
            onPress={requestPermission}
          />
        </View>
      );
    }

    return (
      <View style={[styles.container, style]}>
        <ExpoCameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          mode="picture"
        />

        {/* Face guide overlay */}
        {showGuides && (
          <View style={styles.guideOverlay}>
            <View style={styles.guideContainer}>
              {/* Corner guides */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />

              {/* Face outline */}
              <View style={styles.faceOutline} />

              {/* Scanning line animation */}
              {!disabled && (
                <Animated.View style={[styles.scanLine, scanLineStyle]} />
              )}
            </View>
          </View>
        )}

        {/* Dimmed areas outside guide */}
        <View style={styles.dimOverlay}>
          <View style={styles.dimTop} />
          <View style={styles.dimMiddle}>
            <View style={styles.dimSide} />
            <View style={styles.guideCutout} />
            <View style={styles.dimSide} />
          </View>
          <View style={styles.dimBottom} />
        </View>
      </View>
    );
  }
);

CameraView.displayName = 'CameraView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  permissionTitle: {
    color: Colors.textInverse,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  permissionText: {
    color: Colors.textInverse,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    opacity: 0.8,
  },
  guideOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideContainer: {
    width: GUIDE_SIZE,
    height: GUIDE_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.primary,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: BorderRadius.lg,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: BorderRadius.lg,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: BorderRadius.lg,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: BorderRadius.lg,
  },
  faceOutline: {
    position: 'absolute',
    top: '15%',
    left: '15%',
    width: '70%',
    height: '85%',
    borderRadius: GUIDE_SIZE * 0.35,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
  },
  scanLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: Colors.primary,
    opacity: 0.6,
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  dimTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height: (height - GUIDE_SIZE) / 2 - 60,
  },
  dimMiddle: {
    flexDirection: 'row',
    height: GUIDE_SIZE,
  },
  dimSide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: (width - GUIDE_SIZE) / 2,
  },
  guideCutout: {
    width: GUIDE_SIZE,
    height: GUIDE_SIZE,
  },
  dimBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default CameraView;
