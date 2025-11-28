import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Typography as Text, Button } from '@/components/common';
import { Colors, Spacing, BorderRadius, Layout } from '@/constants/theme';

const { width } = Dimensions.get('window');

/**
 * Welcome Slider Screen
 *
 * 4-slide introduction to YogaAgeProof AI features
 * Reference: mydeisgn/welcome_screen_1-4
 */

interface SlideData {
  id: string;
  title: string;
  description: string;
  image: any; // ImageSourcePropType
}

const slides: SlideData[] = [
  {
    id: '1',
    title: 'AI-Powered Skin Analysis',
    description:
      'Take a photo and let our AI analyze your skin type, concerns, and create a personalized profile just for you.',
    image: require('@/assets/images/onboarding/slide1.png'),
  },
  {
    id: '2',
    title: 'Personalized Routines',
    description:
      'Get customized face yoga and skincare routines tailored to your unique skin needs and goals.',
    image: require('@/assets/images/onboarding/slide2.png'),
  },
  {
    id: '3',
    title: 'Track Your Progress',
    description:
      'Capture daily photos and watch your transformation with AI-powered before/after comparisons.',
    image: require('@/assets/images/onboarding/slide3.png'),
  },
  {
    id: '4',
    title: 'Achieve Your Skin Goals',
    description:
      'Stay consistent with guided sessions, reminders, and expert tips to reveal your best skin.',
    image: require('@/assets/images/onboarding/slide4.png'),
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index || 0);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.push('/(onboarding)/tutorial');
    }
  };

  const handleSkip = () => {
    router.push('/(onboarding)/goals');
  };

  const renderSlide = ({ item }: { item: SlideData }) => (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
      </View>
      <View style={styles.textContainer}>
        <Text variant="h1" style={styles.title}>
          {item.title}
        </Text>
        <Text variant="body" style={styles.description}>
          {item.description}
        </Text>
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[styles.dot, currentIndex === index && styles.activeDot]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      <View style={styles.footer}>
        {renderPagination()}

        <View style={styles.buttonContainer}>
          <Button
            title="Skip"
            variant="ghost"
            onPress={handleSkip}
            style={styles.skipButton}
          />
          <Button
            title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            variant="primary"
            onPress={handleNext}
            style={styles.nextButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  slide: {
    width,
    flex: 1,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing['4xl'],
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.8,
    height: '100%',
  },
  textContainer: {
    flex: 0.4,
    justifyContent: 'flex-start',
    paddingTop: Spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.md,
    color: Colors.text,
  },
  description: {
    textAlign: 'center',
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.md,
  },
  footer: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing['3xl'],
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.xs,
  },
  activeDot: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  nextButton: {
    flex: 2,
  },
});
