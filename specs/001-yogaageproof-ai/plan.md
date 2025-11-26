# Implementation Plan: YogaAgeProof AI

**Branch**: `001-yogaageproof-ai` | **Date**: 2025-11-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-yogaageproof-ai/spec.md`

## Summary

Build YogaAgeProof AI as a cross-platform mobile application using React Native with Expo. The app combines AI-powered face scanning for skin analysis, personalized face yoga and skincare routine generation, guided routine execution, progress photo tracking with AI comparison, and skin diary journaling. Uses Supabase for authentication (email/password + social auth), database (PostgreSQL), and storage (user photos). All AI analysis is handled via cloud APIs. No custom backend - client-side logic with Supabase functions only if strictly necessary.

## Technical Context

**Language/Version**: TypeScript 5.x with React Native 0.76+ (Expo SDK 52)
**Primary Dependencies**:
- Expo SDK 52 (managed workflow)
- React Navigation 7.x
- Supabase JS Client 2.x (@supabase/supabase-js)
- Zustand 5.x (state management)
- React Native Reanimated 3.x (animations)
- Expo Camera, Expo Image Picker, Expo Notifications
- Stripe React Native SDK (payments via MCP)

**Storage**:
- Supabase PostgreSQL (user profiles, routines, diary entries, sessions, metadata)
- Supabase Storage (user-uploaded photos, cloud backup)
- MMKV (local secure storage for tokens, preferences)
- Expo FileSystem (local photo cache)

**Testing**: Jest + React Native Testing Library, Detox (E2E)
**Target Platform**: iOS 13.0+, Android API 23+ (React Native via Expo)
**Project Type**: Mobile application (cross-platform)
**Performance Goals**:
- AI face scan analysis < 10s
- AI photo comparison < 15s
- App launch < 3s
- 60fps UI animations
- Routine player offline-capable

**Constraints**:
- App bundle < 50MB
- Local photo storage: 100+ photos (200-500MB)
- Cloud AI API 99.5% uptime
- Photos compressed to <2MB before upload
- Offline routine playback required

**Scale/Scope**:
- ~30 screens based on design assets
- 5+ languages at launch
- 10k+ target users
- 9 user stories covering full feature set

**MCP Tools (Required)**:
- **Supabase MCP**: All database, authentication, and storage operations
- **Stripe MCP**: All payment and subscription operations
- **Expo MCP**: All development server, build, EAS, and OTA update operations
- **Ref MCP**: Documentation and design file references

> **Important**: Never custom-code these integrations. All operations must use designated MCP tools.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| Constitution not configured | N/A | Template constitution detected - no specific gates to enforce |

**Pre-Design Gate**: PASS (no constitution rules defined)

## Project Structure

### Documentation (this feature)

```text
specs/001-yogaageproof-ai/
├── plan.md              # This file
├── research.md          # Phase 0 output - technology decisions
├── data-model.md        # Phase 1 output - Supabase schema
├── quickstart.md        # Phase 1 output - dev setup guide
├── contracts/           # Phase 1 output - API contracts
│   ├── supabase-schema.sql
│   ├── ai-service-api.yaml
│   └── navigation-routes.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
# React Native Expo Mobile Application Structure
src/
├── app/                      # Expo Router app directory
│   ├── (auth)/               # Auth flow screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (onboarding)/         # Onboarding flow
│   │   ├── welcome.tsx
│   │   └── tutorial.tsx
│   ├── (main)/               # Main app tabs
│   │   ├── _layout.tsx       # Tab navigator
│   │   ├── home.tsx          # Dashboard
│   │   ├── scanner/          # AI Face Scanner
│   │   ├── routines/         # Routine Builder & Player
│   │   ├── gallery/          # Photo Gallery & Comparison
│   │   ├── diary/            # Skin Diary
│   │   ├── products/         # Products Tool
│   │   ├── notifications.tsx
│   │   └── settings/         # Settings screens
│   └── _layout.tsx           # Root layout
│
├── components/               # Reusable UI components
│   ├── common/               # Buttons, cards, inputs
│   ├── scanner/              # Scanner-specific components
│   ├── routine/              # Routine player components
│   ├── gallery/              # Gallery components
│   └── diary/                # Diary components
│
├── services/                 # Business logic services
│   ├── supabase/             # Supabase client & queries
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── database.ts
│   │   └── storage.ts
│   ├── ai/                   # AI service integrations
│   │   ├── skin-analyzer.ts
│   │   └── photo-comparison.ts
│   ├── notifications/        # Push notification handling
│   └── products/             # Product API integration
│
├── stores/                   # Zustand state stores
│   ├── auth.store.ts
│   ├── profile.store.ts
│   ├── routine.store.ts
│   ├── gallery.store.ts
│   └── diary.store.ts
│
├── hooks/                    # Custom React hooks
├── utils/                    # Utility functions
├── constants/                # App constants, theme
│   ├── colors.ts             # Brand palette
│   ├── typography.ts
│   └── spacing.ts
│
└── types/                    # TypeScript type definitions
    ├── supabase.types.ts     # Generated from schema
    ├── api.types.ts
    └── navigation.types.ts

tests/
├── unit/                     # Unit tests
├── integration/              # Integration tests
└── e2e/                      # Detox E2E tests

mydeisgn/                     # Design reference assets (existing)
├── [screen_name]/
│   ├── code.html             # Reference HTML
│   └── screen.png            # Design mockup
```

**Structure Decision**: Mobile application structure using Expo Router for file-based routing. All backend operations go through Supabase (database, auth, storage) with no custom server. AI processing is cloud-based via external APIs. Design assets in `mydeisgn/` directory contain 30 screen references.

## Design Assets Inventory

The following design screens are available in `mydeisgn/`:

| Category | Screens |
|----------|---------|
| Onboarding | welcome_screen_1-4, tutorial_step_1-3 |
| Authentication | account_creation_\_login |
| AI Scanner | ai_face_scanner_-_camera_interface, ai_face_scanner_-_results_&_profile, skin_goals_selection |
| Routines | routine_builder_-_new_routine, routine_builder_-_expert_templates, routine_player_-_video_guide, routine_player_-_product_focus, routine_evaluator |
| Gallery | photo_comparison |
| Diary | skin_diary_1, skin_diary_2 |
| Products | product_tools_-_overview, product_online_search |
| Notifications | notifications_page |
| Settings | settings_1-6, edit_profile |
| Subscription | subscription_flow_-_free_trial_\_pro_features, manage_subscriptions |
| Dashboard | home_dashboard |

## Complexity Tracking

> No constitution violations requiring justification.

| Decision | Rationale |
|----------|-----------|
| Supabase over custom backend | User requirement - reduces complexity, provides auth/db/storage in one |
| Expo managed workflow | Faster development, OTA updates, simpler native module access |
| Zustand over Redux | Simpler API, less boilerplate for this app's state needs |
| Cloud AI over on-device | User requirement - better accuracy, no model size constraints |
