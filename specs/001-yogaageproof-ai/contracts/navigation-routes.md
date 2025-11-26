# Navigation Routes Contract: YogaAgeProof AI

**Branch**: `001-yogaageproof-ai` | **Date**: 2025-11-26

## Overview

This document defines the navigation structure using Expo Router (file-based routing). Routes map directly to file paths in `src/app/`.

---

## Route Groups

### Authentication Group: `(auth)`

Screens for unauthenticated users.

| Route | File Path | Screen | Design Reference |
|-------|-----------|--------|------------------|
| `/login` | `(auth)/login.tsx` | Login/Register | `account_creation_\_login` |
| `/register` | `(auth)/register.tsx` | Registration Form | `account_creation_\_login` |
| `/forgot-password` | `(auth)/forgot-password.tsx` | Password Reset | - |

**Navigation Flow**:
```
/login ↔ /register
/login → /forgot-password → /login
/login → /(onboarding) (on success, first time)
/login → /(main) (on success, returning user)
```

---

### Onboarding Group: `(onboarding)`

First-time user experience screens.

| Route | File Path | Screen | Design Reference |
|-------|-----------|--------|------------------|
| `/welcome` | `(onboarding)/welcome.tsx` | Welcome Slider | `welcome_screen_1-4` |
| `/tutorial` | `(onboarding)/tutorial.tsx` | Tutorial Steps | `tutorial_step_1-3` |
| `/goals` | `(onboarding)/goals.tsx` | Skin Goals Selection | `skin_goals_selection` |

**Navigation Flow**:
```
/welcome (4 slides) → /tutorial (3 steps) → /goals → /(main)/scanner
```

**Skip Behavior**: Users can skip to `/goals` from any onboarding screen.

---

### Main App Group: `(main)`

Authenticated app screens with bottom tab navigation.

#### Tab Navigator: `(tabs)`

| Tab | Route | Icon | Design Reference |
|-----|-------|------|------------------|
| Home | `/home` | Home | `home_dashboard` |
| Scanner | `/scanner` | Camera/Scan | `ai_face_scanner_*` |
| Routines | `/routines` | Calendar/List | `routine_*` |
| Gallery | `/gallery` | Image | `photo_comparison` |
| More | `/more` | Menu | - |

---

### Home Tab

| Route | File Path | Screen | Design Reference |
|-------|-----------|--------|------------------|
| `/home` | `(main)/(tabs)/home.tsx` | Dashboard | `home_dashboard` |

**Features**:
- Active routine summary
- Quick actions (Start Routine, Take Photo, Log Diary)
- Recent notifications preview
- Progress stats

---

### Scanner Tab

| Route | File Path | Screen | Design Reference |
|-------|-----------|--------|------------------|
| `/scanner` | `(main)/(tabs)/scanner/index.tsx` | Scanner Home | - |
| `/scanner/camera` | `(main)/(tabs)/scanner/camera.tsx` | Camera Interface | `ai_face_scanner_-_camera_interface` |
| `/scanner/results` | `(main)/(tabs)/scanner/results.tsx` | Analysis Results | `ai_face_scanner_-_results_&_profile` |
| `/scanner/profile` | `(main)/(tabs)/scanner/profile.tsx` | Skin Profile View | `ai_face_scanner_-_results_&_profile` |

**Navigation Flow**:
```
/scanner → /scanner/camera → /scanner/results → /scanner/profile
/scanner/profile → /routines/builder (Generate Routine)
```

**Deep Links**:
- `yogaageproof://scanner/camera` - Open camera directly
- `yogaageproof://scanner/results/{profileId}` - View specific results

---

### Routines Tab

| Route | File Path | Screen | Design Reference |
|-------|-----------|--------|------------------|
| `/routines` | `(main)/(tabs)/routines/index.tsx` | Routines List | - |
| `/routines/builder` | `(main)/(tabs)/routines/builder.tsx` | Routine Builder | `routine_builder_-_new_routine` |
| `/routines/templates` | `(main)/(tabs)/routines/templates.tsx` | Expert Templates | `routine_builder_-_expert_templates` |
| `/routines/[id]` | `(main)/(tabs)/routines/[id].tsx` | Routine Detail | - |
| `/routines/[id]/player` | `(main)/(tabs)/routines/[id]/player.tsx` | Routine Player | `routine_player_-_video_guide` |
| `/routines/[id]/products` | `(main)/(tabs)/routines/[id]/products.tsx` | Product Focus | `routine_player_-_product_focus` |
| `/routines/[id]/evaluator` | `(main)/(tabs)/routines/[id]/evaluator.tsx` | Routine Evaluator | `routine_evaluator` |

**Navigation Flow**:
```
/routines → /routines/builder → /routines/[id] (routine created)
/routines → /routines/templates → /routines/builder (template selected)
/routines/[id] → /routines/[id]/player → /routines/[id]/evaluator
```

**Deep Links**:
- `yogaageproof://routines/player` - Start active routine
- `yogaageproof://routines/{id}` - View specific routine

---

### Gallery Tab

| Route | File Path | Screen | Design Reference |
|-------|-----------|--------|------------------|
| `/gallery` | `(main)/(tabs)/gallery/index.tsx` | Photo Gallery | - |
| `/gallery/capture` | `(main)/(tabs)/gallery/capture.tsx` | Capture Photo | - |
| `/gallery/compare` | `(main)/(tabs)/gallery/compare.tsx` | Photo Comparison | `photo_comparison` |
| `/gallery/[id]` | `(main)/(tabs)/gallery/[id].tsx` | Photo Detail | - |

**Navigation Flow**:
```
/gallery → /gallery/capture → /gallery (photo saved)
/gallery → /gallery/compare (select 2 photos) → /gallery/compare (results)
```

---

### More Tab

| Route | File Path | Screen | Design Reference |
|-------|-----------|--------|------------------|
| `/more` | `(main)/(tabs)/more/index.tsx` | More Menu | - |

**Sub-sections accessible from More**:
- Diary
- Products
- Notifications
- Settings
- Subscription

---

### Diary Section

| Route | File Path | Screen | Design Reference |
|-------|-----------|--------|------------------|
| `/diary` | `(main)/diary/index.tsx` | Diary Calendar | `skin_diary_1` |
| `/diary/entry` | `(main)/diary/entry.tsx` | New/Edit Entry | `skin_diary_2` |
| `/diary/[date]` | `(main)/diary/[date].tsx` | Entry Detail | `skin_diary_2` |

**Navigation Flow**:
```
/diary → /diary/entry (new entry)
/diary → /diary/[date] (view entry) → /diary/entry (edit)
```

---

### Products Section

| Route | File Path | Screen | Design Reference |
|-------|-----------|--------|------------------|
| `/products` | `(main)/products/index.tsx` | Products Overview | `product_tools_-_overview` |
| `/products/[id]` | `(main)/products/[id].tsx` | Product Detail | - |
| `/products/search` | `(main)/products/search.tsx` | Online Search | `product_online_search` |

**Navigation Flow**:
```
/products → /products/[id] → /products/search (external link)
```

---

### Notifications Section

| Route | File Path | Screen | Design Reference |
|-------|-----------|--------|------------------|
| `/notifications` | `(main)/notifications.tsx` | Notifications Center | `notifications_page` |

**Deep Links**:
- `yogaageproof://notifications` - Open notifications
- Notification tap routes to relevant screen based on `data.route`

---

### Settings Section

| Route | File Path | Screen | Design Reference |
|-------|-----------|--------|------------------|
| `/settings` | `(main)/settings/index.tsx` | Settings Main | `settings_1` |
| `/settings/profile` | `(main)/settings/profile.tsx` | Edit Profile | `edit_profile` |
| `/settings/notifications` | `(main)/settings/notifications.tsx` | Notification Prefs | `settings_2` |
| `/settings/privacy` | `(main)/settings/privacy.tsx` | Privacy Settings | `settings_3` |
| `/settings/language` | `(main)/settings/language.tsx` | Language Selection | `settings_4` |
| `/settings/backup` | `(main)/settings/backup.tsx` | Cloud Backup | `settings_5` |
| `/settings/support` | `(main)/settings/support.tsx` | Help & Support | `settings_6` |

---

### Subscription Section

| Route | File Path | Screen | Design Reference |
|-------|-----------|--------|------------------|
| `/subscription` | `(main)/subscription/index.tsx` | Subscription Status | `manage_subscriptions` |
| `/subscription/upgrade` | `(main)/subscription/upgrade.tsx` | Upgrade Flow | `subscription_flow_-_free_trial_\_pro_features` |

---

## Route Parameters

### Dynamic Segments

| Pattern | Type | Example | Description |
|---------|------|---------|-------------|
| `[id]` | UUID | `/routines/abc-123` | Entity identifier |
| `[date]` | ISO Date | `/diary/2025-11-26` | Calendar date |

### Query Parameters

| Route | Parameter | Type | Description |
|-------|-----------|------|-------------|
| `/scanner/results` | `profileId` | UUID | View specific profile |
| `/gallery/compare` | `before`, `after` | UUID | Pre-select photos |
| `/routines/builder` | `templateId` | UUID | Start from template |
| `/products` | `category` | string | Filter by category |

---

## Navigation Guards

### Authentication Guard

```typescript
// Applied to (main) group
const AuthGuard = () => {
  const { session } = useAuth();
  if (!session) {
    return <Redirect href="/login" />;
  }
  return <Slot />;
};
```

### Onboarding Guard

```typescript
// Check if onboarding completed
const OnboardingGuard = () => {
  const { profile } = useProfile();
  if (!profile?.onboarding_completed) {
    return <Redirect href="/welcome" />;
  }
  return <Slot />;
};
```

### Subscription Guard

```typescript
// For pro-only features
const SubscriptionGuard = ({ children }) => {
  const { subscription } = useSubscription();
  if (subscription?.plan !== 'pro') {
    return <Redirect href="/subscription/upgrade" />;
  }
  return children;
};
```

---

## Deep Link Configuration

### URL Scheme

```
yogaageproof://[path]
```

### Universal Links (iOS)

```
https://app.yogaageproof.com/[path]
```

### App Links (Android)

```
https://app.yogaageproof.com/[path]
```

### Notification Deep Links

| Notification Type | Route |
|-------------------|-------|
| routine_reminder | `/routines/player` |
| progress_milestone | `/gallery` |
| ai_tip | `/notifications` |
| system_update | `/notifications` |

---

## Screen Transitions

### Default Transitions

| Platform | Type | Duration |
|----------|------|----------|
| iOS | Push (slide right) | 350ms |
| Android | Material shared axis | 300ms |

### Modal Screens

- `/scanner/camera` - Full screen modal
- `/gallery/capture` - Full screen modal
- `/subscription/upgrade` - Bottom sheet modal

### Custom Transitions

```typescript
// Routine player: fade transition
<Stack.Screen
  name="routines/[id]/player"
  options={{
    animation: 'fade',
    presentation: 'fullScreenModal',
  }}
/>
```

---

## File Structure

```
src/app/
├── _layout.tsx                 # Root layout with providers
├── +not-found.tsx              # 404 screen
│
├── (auth)/
│   ├── _layout.tsx             # Auth stack layout
│   ├── login.tsx
│   ├── register.tsx
│   └── forgot-password.tsx
│
├── (onboarding)/
│   ├── _layout.tsx             # Onboarding stack
│   ├── welcome.tsx
│   ├── tutorial.tsx
│   └── goals.tsx
│
└── (main)/
    ├── _layout.tsx             # Main layout with guards
    │
    ├── (tabs)/
    │   ├── _layout.tsx         # Tab navigator
    │   ├── home.tsx
    │   │
    │   ├── scanner/
    │   │   ├── _layout.tsx
    │   │   ├── index.tsx
    │   │   ├── camera.tsx
    │   │   ├── results.tsx
    │   │   └── profile.tsx
    │   │
    │   ├── routines/
    │   │   ├── _layout.tsx
    │   │   ├── index.tsx
    │   │   ├── builder.tsx
    │   │   ├── templates.tsx
    │   │   └── [id]/
    │   │       ├── index.tsx
    │   │       ├── player.tsx
    │   │       ├── products.tsx
    │   │       └── evaluator.tsx
    │   │
    │   ├── gallery/
    │   │   ├── _layout.tsx
    │   │   ├── index.tsx
    │   │   ├── capture.tsx
    │   │   ├── compare.tsx
    │   │   └── [id].tsx
    │   │
    │   └── more/
    │       └── index.tsx
    │
    ├── diary/
    │   ├── _layout.tsx
    │   ├── index.tsx
    │   ├── entry.tsx
    │   └── [date].tsx
    │
    ├── products/
    │   ├── _layout.tsx
    │   ├── index.tsx
    │   ├── [id].tsx
    │   └── search.tsx
    │
    ├── notifications.tsx
    │
    ├── settings/
    │   ├── _layout.tsx
    │   ├── index.tsx
    │   ├── profile.tsx
    │   ├── notifications.tsx
    │   ├── privacy.tsx
    │   ├── language.tsx
    │   ├── backup.tsx
    │   └── support.tsx
    │
    └── subscription/
        ├── _layout.tsx
        ├── index.tsx
        └── upgrade.tsx
```

---

## TypeScript Types

```typescript
// src/types/navigation.types.ts

export type RootStackParamList = {
  '(auth)': undefined;
  '(onboarding)': undefined;
  '(main)': undefined;
};

export type AuthStackParamList = {
  login: undefined;
  register: undefined;
  'forgot-password': undefined;
};

export type OnboardingStackParamList = {
  welcome: undefined;
  tutorial: undefined;
  goals: undefined;
};

export type MainTabParamList = {
  home: undefined;
  scanner: undefined;
  routines: undefined;
  gallery: undefined;
  more: undefined;
};

export type ScannerStackParamList = {
  index: undefined;
  camera: undefined;
  results: { profileId?: string };
  profile: { profileId: string };
};

export type RoutinesStackParamList = {
  index: undefined;
  builder: { templateId?: string };
  templates: undefined;
  '[id]': { id: string };
  '[id]/player': { id: string };
  '[id]/products': { id: string };
  '[id]/evaluator': { id: string };
};

export type GalleryStackParamList = {
  index: undefined;
  capture: undefined;
  compare: { before?: string; after?: string };
  '[id]': { id: string };
};

export type DiaryStackParamList = {
  index: undefined;
  entry: { date?: string };
  '[date]': { date: string };
};

export type ProductsStackParamList = {
  index: { category?: string };
  '[id]': { id: string };
  search: { query?: string; productId?: string };
};

export type SettingsStackParamList = {
  index: undefined;
  profile: undefined;
  notifications: undefined;
  privacy: undefined;
  language: undefined;
  backup: undefined;
  support: undefined;
};

export type SubscriptionStackParamList = {
  index: undefined;
  upgrade: undefined;
};
```
