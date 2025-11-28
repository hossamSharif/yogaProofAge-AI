import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Typography as Text, Button } from '@/components/common';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { CameraView } from '@/components/scanner/CameraView';
import { validateImage, ValidationResult } from '@/utils/imageValidation';
import { analyzeSkin } from '@/services/ai/skin-analyzer';
import { useProfileStore } from '@/stores/profile.store';
import { useUser } from '@/stores/auth.store';
import { StatusBar } from 'expo-status-bar';

/**
 * Camera Interface Screen
 *
 * Real-time camera with face detection guides and positioning feedback.
 * Reference: mydeisgn/ai_face_scanner_-_camera_interface
 *
 * Implements:
 * - FR-009: Photo quality validation
 * - FR-010: Real-time positioning feedback
 * - FR-011: AI skin analysis trigger
 * - NFR-001: <10s analysis time
 */

type CaptureState = 'ready' | 'capturing' | 'validating' | 'analyzing';

export default function CameraScreen() {
  const router = useRouter();
  const user = useUser();
  const { createSkinProfile } = useProfileStore();

  const [captureState, setCaptureState] = useState<CaptureState>('ready');
  const [validationFeedback, setValidationFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cameraRef = useRef<any>(null);

  const handleCapture = useCallback(async () => {
    if (captureState !== 'ready' || !cameraRef.current) return;

    try {
      setCaptureState('capturing');
      setError(null);
      setValidationFeedback(null);

      // Capture photo
      const photo = await cameraRef.current.takePicture({
        quality: 0.85,
        base64: true,
        exif: true,
      });

      if (!photo?.uri) {
        throw new Error('Failed to capture photo');
      }

      // Validate image quality (FR-009)
      setCaptureState('validating');
      setValidationFeedback('Checking image quality...');

      const validation = await validateImage(photo.uri);

      if (!validation.isValid) {
        // Show validation errors and allow retry
        setError(validation.errors.join('. '));
        setCaptureState('ready');
        return;
      }

      // Analyze skin with AI (FR-011)
      setCaptureState('analyzing');
      setValidationFeedback('Analyzing your skin...');

      const analysisResult = await analyzeSkin({
        imageUri: photo.uri,
        imageBase64: photo.base64,
      });

      if (!analysisResult.success) {
        throw new Error(analysisResult.error || 'Analysis failed');
      }

      // Create skin profile in database
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const newProfile = await createSkinProfile({
        user_id: user.id,
        skin_type: analysisResult.skinType,
        concerns: analysisResult.concerns,
        analysis_confidence: analysisResult.confidence,
        source_photo_url: photo.uri,
        analysis_metadata: analysisResult.metadata,
        is_active: true,
      });

      // Navigate to results
      router.replace({
        pathname: '/(main)/(tabs)/scanner/results',
        params: { profileId: newProfile.id },
      });

    } catch (err: any) {
      console.error('Capture error:', err);
      setError(err.message || 'An error occurred. Please try again.');
      setCaptureState('ready');
    }
  }, [captureState, user, createSkinProfile, router]);

  const handleClose = () => {
    router.back();
  };

  const getStatusMessage = (): string => {
    switch (captureState) {
      case 'capturing':
        return 'Capturing...';
      case 'validating':
        return 'Checking quality...';
      case 'analyzing':
        return 'Analyzing your skin...';
      default:
        return 'Position your face in the frame';
    }
  };

  const isProcessing = captureState !== 'ready';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        showGuides
        showFeedback
        disabled={isProcessing}
      />

      {/* Overlay UI */}
      <View style={styles.overlay}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            disabled={isProcessing}
          >
            <Ionicons name="close" size={28} color={Colors.textInverse} />
          </TouchableOpacity>
          <Text variant="label" style={styles.topTitle}>
            AI Skin Scanner
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Status message */}
        <View style={styles.statusContainer}>
          <Text variant="body" style={styles.statusText}>
            {getStatusMessage()}
          </Text>
          {validationFeedback && (
            <Text variant="caption" style={styles.feedbackText}>
              {validationFeedback}
            </Text>
          )}
        </View>

        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={Colors.error} />
            <Text variant="bodySmall" style={styles.errorText}>
              {error}
            </Text>
          </View>
        )}

        {/* Bottom controls */}
        <View style={styles.bottomControls}>
          {/* Tips */}
          <View style={styles.tipsContainer}>
            <TipBadge icon="sunny-outline" text="Good lighting" />
            <TipBadge icon="eye-outline" text="Face forward" />
            <TipBadge icon="happy-outline" text="Neutral expression" />
          </View>

          {/* Capture button */}
          <View style={styles.captureContainer}>
            <TouchableOpacity
              style={[
                styles.captureButton,
                isProcessing && styles.captureButtonDisabled,
              ]}
              onPress={handleCapture}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="large" color={Colors.primary} />
              ) : (
                <View style={styles.captureInner} />
              )}
            </TouchableOpacity>
            <Text variant="caption" style={styles.captureHint}>
              {isProcessing ? 'Please wait...' : 'Tap to capture'}
            </Text>
          </View>

          {/* Flip camera placeholder */}
          <TouchableOpacity
            style={styles.flipButton}
            disabled={isProcessing}
          >
            <Ionicons
              name="camera-reverse-outline"
              size={28}
              color={isProcessing ? Colors.disabled : Colors.textInverse}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

interface TipBadgeProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

function TipBadge({ icon, text }: TipBadgeProps) {
  return (
    <View style={styles.tipBadge}>
      <Ionicons name={icon} size={14} color={Colors.textInverse} />
      <Text variant="caption" style={styles.tipBadgeText}>
        {text}
      </Text>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topTitle: {
    color: Colors.textInverse,
  },
  placeholder: {
    width: 44,
  },
  statusContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  statusText: {
    color: Colors.textInverse,
    textAlign: 'center',
  },
  feedbackText: {
    color: Colors.textInverse,
    opacity: 0.8,
    marginTop: Spacing.xs,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  errorText: {
    color: Colors.textInverse,
    flex: 1,
  },
  bottomControls: {
    paddingBottom: 50,
    paddingHorizontal: Spacing.lg,
  },
  tipsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  tipBadgeText: {
    color: Colors.textInverse,
    fontSize: 11,
  },
  captureContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 4,
    borderColor: Colors.textInverse,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  captureButtonDisabled: {
    borderColor: Colors.disabled,
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.textInverse,
  },
  captureHint: {
    color: Colors.textInverse,
    marginTop: Spacing.sm,
    opacity: 0.8,
  },
  flipButton: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: 65,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
