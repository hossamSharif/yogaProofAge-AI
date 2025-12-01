import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

/**
 * Image Viewer Component with Zoom/Pan (T120)
 *
 * Interactive image viewer with pinch-to-zoom and pan gestures
 * Implements FR-058: Zoom and pan for detailed comparison
 */

interface ImageViewerProps {
  uri: string;
  minZoom?: number;
  maxZoom?: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ImageViewer: React.FC<ImageViewerProps> = ({
  uri,
  minZoom = 1,
  maxZoom = 4,
}) => {
  // Shared values for zoom and pan
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Pinch gesture for zoom
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      const newScale = savedScale.value * e.scale;
      scale.value = Math.min(Math.max(newScale, minZoom), maxZoom);
    })
    .onEnd(() => {
      savedScale.value = scale.value;

      // Reset to min zoom if below threshold
      if (scale.value < minZoom + 0.1) {
        scale.value = withSpring(minZoom);
        savedScale.value = minZoom;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  // Pan gesture for moving zoomed image
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Only allow panning when zoomed in
      if (scale.value > minZoom) {
        const maxTranslateX = (SCREEN_WIDTH * (scale.value - 1)) / 2;
        const maxTranslateY = (SCREEN_HEIGHT * (scale.value - 1)) / 2;

        const newTranslateX = savedTranslateX.value + e.translationX;
        const newTranslateY = savedTranslateY.value + e.translationY;

        translateX.value = Math.min(Math.max(newTranslateX, -maxTranslateX), maxTranslateX);
        translateY.value = Math.min(Math.max(newTranslateY, -maxTranslateY), maxTranslateY);
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Double tap to zoom
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e) => {
      if (scale.value === minZoom) {
        // Zoom in to 2x
        scale.value = withSpring(2);
        savedScale.value = 2;

        // Center on tap location
        const tapX = e.x - SCREEN_WIDTH / 2;
        const tapY = e.y - SCREEN_HEIGHT / 2;
        translateX.value = withSpring(-tapX);
        translateY.value = withSpring(-tapY);
        savedTranslateX.value = -tapX;
        savedTranslateY.value = -tapY;
      } else {
        // Reset zoom
        scale.value = withSpring(minZoom);
        savedScale.value = minZoom;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  // Compose gestures
  const composedGesture = Gesture.Simultaneous(
    doubleTapGesture,
    Gesture.Simultaneous(pinchGesture, panGesture)
  );

  // Animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.imageContainer, animatedStyle]}>
          <Image
            source={{ uri }}
            style={styles.image}
            resizeMode="contain"
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});
