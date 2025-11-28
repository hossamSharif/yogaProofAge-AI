/**
 * Navigation Type Definitions
 *
 * Type-safe route definitions for Expo Router.
 * Provides compile-time checking for navigation calls.
 */

/**
 * Onboarding Route Group
 * First-time user flow screens
 */
export type OnboardingRoutes = {
  '/(onboarding)/welcome': undefined;
  '/(onboarding)/tutorial': undefined;
  '/(onboarding)/goals': undefined;
};

/**
 * Auth Route Group
 * Authentication screens
 */
export type AuthRoutes = {
  '/(auth)/login': undefined;
  '/(auth)/register': undefined;
  '/(auth)/forgot-password': undefined;
};

/**
 * Main Tab Routes
 * Bottom tab navigation screens
 */
export type MainTabRoutes = {
  '/(main)/(tabs)/home': undefined;
  '/(main)/(tabs)/scanner': undefined;
  '/(main)/(tabs)/scanner/camera': undefined;
  '/(main)/(tabs)/scanner/results': undefined;
  '/(main)/(tabs)/scanner/profile': undefined;
  '/(main)/(tabs)/routines': undefined;
  '/(main)/(tabs)/routines/builder': undefined;
  '/(main)/(tabs)/routines/templates': undefined;
  '/(main)/(tabs)/routines/[id]': { id: string };
  '/(main)/(tabs)/routines/[id]/products': { id: string };
  '/(main)/(tabs)/routines/[id]/player': { id: string };
  '/(main)/(tabs)/routines/[id]/evaluator': { id: string };
  '/(main)/(tabs)/gallery': undefined;
  '/(main)/(tabs)/gallery/capture': undefined;
  '/(main)/(tabs)/gallery/compare': undefined;
  '/(main)/(tabs)/gallery/[id]': { id: string };
  '/(main)/(tabs)/more': undefined;
};

/**
 * Main Stack Routes
 * Non-tab screens in the main group
 */
export type MainStackRoutes = {
  '/(main)/diary': undefined;
  '/(main)/diary/entry': { date?: string };
  '/(main)/diary/[date]': { date: string };
  '/(main)/products': undefined;
  '/(main)/products/search': undefined;
  '/(main)/products/[id]': { id: string };
  '/(main)/notifications': undefined;
  '/(main)/settings': undefined;
  '/(main)/settings/profile': undefined;
  '/(main)/settings/privacy': undefined;
  '/(main)/settings/language': undefined;
  '/(main)/settings/backup': undefined;
  '/(main)/settings/notifications': undefined;
  '/(main)/settings/support': undefined;
  '/(main)/subscription': undefined;
  '/(main)/subscription/upgrade': undefined;
};

/**
 * All App Routes
 * Combined type for all navigable routes
 */
export type AppRoutes = OnboardingRoutes &
  AuthRoutes &
  MainTabRoutes &
  MainStackRoutes & {
    '/': undefined;
  };

/**
 * Route Names
 * Type for all valid route paths
 */
export type RouteName = keyof AppRoutes;

/**
 * Route Params
 * Get the params type for a specific route
 */
export type RouteParams<T extends RouteName> = AppRoutes[T];

/**
 * Navigation Screen Options
 * Common screen options for navigation
 */
export interface ScreenOptions {
  title?: string;
  headerShown?: boolean;
  presentation?: 'card' | 'modal' | 'transparentModal' | 'containedModal' | 'containedTransparentModal' | 'fullScreenModal' | 'formSheet';
  animation?: 'default' | 'fade' | 'flip' | 'simple_push' | 'slide_from_bottom' | 'slide_from_right' | 'slide_from_left' | 'none';
  gestureEnabled?: boolean;
}

/**
 * Tab Bar Configuration
 * Configuration for bottom tab navigator
 */
export interface TabConfig {
  name: string;
  icon: string;
  activeIcon?: string;
  label: string;
  badge?: number;
}

/**
 * Tab Bar Tabs
 */
export const TAB_CONFIG: Record<string, TabConfig> = {
  home: {
    name: 'home',
    icon: 'home-outline',
    activeIcon: 'home',
    label: 'Home',
  },
  scanner: {
    name: 'scanner',
    icon: 'scan-outline',
    activeIcon: 'scan',
    label: 'Scan',
  },
  routines: {
    name: 'routines',
    icon: 'calendar-outline',
    activeIcon: 'calendar',
    label: 'Routines',
  },
  gallery: {
    name: 'gallery',
    icon: 'images-outline',
    activeIcon: 'images',
    label: 'Gallery',
  },
  more: {
    name: 'more',
    icon: 'menu-outline',
    activeIcon: 'menu',
    label: 'More',
  },
};

/**
 * Deep Link Configuration
 */
export const DEEP_LINK_CONFIG = {
  prefixes: ['yogaageproof://', 'https://yogaageproof.app'],
  config: {
    screens: {
      '(onboarding)': {
        screens: {
          welcome: 'welcome',
          tutorial: 'tutorial',
          goals: 'goals',
        },
      },
      '(auth)': {
        screens: {
          login: 'login',
          register: 'register',
          'forgot-password': 'forgot-password',
        },
      },
      '(main)': {
        screens: {
          '(tabs)': {
            screens: {
              home: 'home',
              scanner: 'scanner',
              routines: 'routines',
              gallery: 'gallery',
              more: 'more',
            },
          },
          diary: 'diary',
          products: 'products',
          notifications: 'notifications',
          settings: 'settings',
          subscription: 'subscription',
        },
      },
    },
  },
};
