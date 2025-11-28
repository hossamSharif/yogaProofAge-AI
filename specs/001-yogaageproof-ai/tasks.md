# Tasks: YogaAgeProof AI

**Branch**: `001-yogaageproof-ai` | **Date**: 2025-11-26 (Updated: 2025-11-26)
**Input**: Design documents from `/specs/001-yogaageproof-ai/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **Checkbox**: ALWAYS `- [ ]`
- **[ID]**: Task ID (T001, T002, T003...)
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (e.g., [US1], [US2]) - only for user story tasks
- Include exact file paths in descriptions

---

## Phase 0: Research & Documentation

**Purpose**: Gather technical documentation and framework references using Ref MCP

- [X] T001 [P] Use mcp__Ref__ref_search_documentation to fetch React Native 0.76 documentation
- [X] T002 [P] Use mcp__Ref__ref_search_documentation to fetch Expo SDK 52 documentation
- [X] T003 [P] Use mcp__Ref__ref_search_documentation to fetch Supabase JS Client 2.x documentation
- [X] T004 [P] Use mcp__Ref__ref_search_documentation to fetch React Navigation 7.x documentation

**Checkpoint**: Technical documentation ready for implementation reference

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize React Native Expo project and configure development environment

- [X] T005 Initialize Expo project with TypeScript and Expo SDK 52 in project root
- [X] T006 [P] Install core dependencies: React Navigation 7.x, Zustand 5.x, Reanimated 3.x in package.json
- [X] T007 [P] Install Supabase client (@supabase/supabase-js 2.x) and configure environment variables in .env
- [X] T008 [P] Setup MMKV for local storage (react-native-mmkv) in package.json
- [X] T009 [P] Configure TypeScript strict mode and path aliases in tsconfig.json
- [X] T010 [P] Setup ESLint and Prettier configurations in .eslintrc.js and .prettierrc
- [X] T011 [P] Install Expo modules: expo-camera, expo-image-picker, expo-file-system, expo-secure-store, expo-notifications in package.json
- [X] T012 [P] Setup Jest and React Native Testing Library configuration in jest.config.js
- [X] T013 Create project directory structure per plan.md in src/
- [X] T014 [P] Configure app.json with Expo settings, splash screen, and app icons
- [X] T015 [P] Create contracts directory structure in specs/001-yogaageproof-ai/contracts/ with placeholder files: supabase-schema.sql, ai-service-api.yaml, navigation-routes.md, product-data-source.md (to be populated in Phase 2+)
- [X] T016 [P] Setup i18next for internationalization with English default in src/i18n/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T017 Setup Supabase client singleton in src/services/supabase/client.ts
- [X] T018 [P] Database schema applied via Supabase Management API: 12 ENUMs, 13 tables, 13 indexes, triggers, functions, and RLS policies
- [X] T019 [P] progress-photos storage bucket created via Supabase Storage API (private, 10MB limit, image types only)
- [X] T020 [P] RLS policies for progress-photos bucket created (user-owned folder structure)
- [X] T021 [P] Use mcp__supabase__generate_typescript_types with output path src/types/supabase.types.ts
- [X] T022 [P] Implement Supabase auth service wrapper in src/services/supabase/auth.ts using generated types
- [X] T023 [P] Implement Supabase database query utilities in src/services/supabase/database.ts using generated types
- [X] T024 [P] Implement Supabase storage utilities in src/services/supabase/storage.ts
- [X] T025 Create auth store with Zustand (session, user state) in src/stores/auth.store.ts
- [X] T026 [P] Create design system constants (colors, typography, spacing) in src/constants/
- [X] T027 [P] Build base UI components: Button, Card, Input, Typography in src/components/common/
- [X] T028 Create Expo Router root layout with auth guard in src/app/_layout.tsx
- [X] T029 [P] Implement navigation type definitions in src/types/navigation.types.ts
- [X] T030 [P] Create error handling utilities and custom error types in src/utils/errors.ts
- [X] T031 Implement centralized error handler in src/utils/errorHandler.ts per plan.md Error Handling Strategy with retry logic (exponential backoff 1s, 2s, 4s), fallback behavior (template routines, cached data), and user-friendly messaging for AI API failures, database failures, and storage failures
- [X] T032 [P] Implement network connectivity detection with NetInfo in src/utils/network.ts
- [X] T033 [P] Setup Expo notifications service and push token registration in src/services/notifications/push.ts
- [X] T034 Install @anthropic-ai/sdk in package.json and create Claude API client wrapper in src/services/ai/client.ts with API key from environment variable ANTHROPIC_API_KEY, using claude-3-5-sonnet-20241022 model
- [X] T035 Implement Claude API rate limiting and request queue in src/services/ai/client.ts per NFR-009: 50 requests/min limit with client-side throttling, request queuing for overflow, and exponential backoff (1s, 2s, 4s) for 429 rate limit responses
- [X] T036 [P] Implement image compression utility for photo uploads in src/utils/image.ts targeting <2MB per NFR-010
- [X] T037 [P] N/A - Password hashing handled by Supabase Auth server-side (client-side hashing not needed per security best practices)
- [X] T038 [P] Configured Supabase Auth JWT expiry to 7 days (max allowed) with refresh token rotation enabled per NFR-029
- [X] T039 [P] Implement auth token refresh interceptor in src/services/supabase/auth.ts

**Checkpoint**: Foundation ready (including error handling and rate limiting) - user story implementation can now begin in parallel

**Phase 2 Status**: ✅ COMPLETE - All 23/23 tasks done. Foundation ready for user story implementation.

---

## Phase 3: User Story 1 - First-Time User Onboarding and Skin Analysis (Priority: P1) 🎯 MVP

**Goal**: Enable new users to complete onboarding tutorial, perform first AI face scan, and receive personalized skin profile

**Independent Test**: Install app, complete 3-screen tutorial, take facial photo, receive skin profile report showing detected skin type and concerns

### Implementation for User Story 1

- [X] T040 [P] [US1] Create onboarding layout with route group in src/app/(onboarding)/_layout.tsx referencing mydeisgn/welcome_screen_1-4 and tutorial_step_1-3 designs
- [X] T041 [P] [US1] Create welcome slider screen (4 slides) in src/app/(onboarding)/welcome.tsx referencing mydeisgn/welcome_screen_1-4
- [X] T042 [P] [US1] Create tutorial steps screen (3 steps) in src/app/(onboarding)/tutorial.tsx referencing mydeisgn/tutorial_step_1-3
- [X] T043 [P] [US1] Create skin goals selection screen in src/app/(onboarding)/goals.tsx referencing mydeisgn/skin_goals_selection
- [X] T044 [US1] Create auth layout with route group in src/app/(auth)/_layout.tsx
- [X] T045 [P] [US1] Implement login/register screen in src/app/(auth)/login.tsx referencing mydeisgn/account_creation_login
- [X] T046 [P] [US1] Implement registration form screen in src/app/(auth)/register.tsx with password requirements validation (8+ chars, letters+numbers) per FR-007
- [X] T047 [P] [US1] Implement forgot password screen in src/app/(auth)/forgot-password.tsx with 1-hour token expiry per NFR-033
- [X] T048 [US1] Implement email/password authentication flow with password hashing in src/services/supabase/auth.ts per FR-003
- [X] T049 [P] [US1] Implement Google OAuth authentication using OAuth 2.0 in src/services/supabase/auth.ts per FR-004 and NFR-030
- [X] T050 [P] [US1] Implement Apple Sign-In authentication using OpenID Connect in src/services/supabase/auth.ts per FR-004, NFR-030, and NFR-031 (Apple App Store requirement)
- [X] T051 [P] [US1] Create account conflict resolution modal component in src/components/auth/AccountConflictModal.tsx with two action options: "Link Accounts" (requires password verification) and "Use Different Email"
- [X] T052 [US1] Implement account conflict detection in src/services/supabase/auth.ts that catches duplicate email errors during social auth sign-in and triggers conflict modal per FR-089
- [X] T053 [US1] Implement account linking handler in src/services/supabase/auth.ts that verifies existing account password and links social auth provider ID to user profile per FR-005 and FR-089
- [X] T054 [US1] Create user profile model operations in src/services/supabase/database.ts
- [X] T055 [US1] Create profile store with Zustand in src/stores/profile.store.ts
- [X] T056 [P] [US1] Create scanner home screen in src/app/(main)/(tabs)/scanner/index.tsx referencing mydeisgn/ai_face_scanner_-_camera_interface
- [X] T057 [P] [US1] Create camera interface screen with face detection guides and real-time positioning feedback in src/app/(main)/(tabs)/scanner/camera.tsx per FR-010 referencing mydeisgn/ai_face_scanner_-_camera_interface
- [X] T058 [P] [US1] Implement camera component with real-time photo capture in src/components/scanner/CameraView.tsx
- [X] T059 [US1] Implement image validation utility (minimum resolution, blur detection, face confidence score, lighting thresholds) in src/utils/imageValidation.ts per FR-009
- [X] T060 [US1] Implement skin analyzer service (Claude API integration) with <10s timeout and error handling in src/services/ai/skin-analyzer.ts per FR-011 and NFR-001
- [X] T061 [US1] Create skin profile model operations (create, read, activate) in src/services/supabase/database.ts
- [X] T062 [P] [US1] Create analysis results screen with skin type display in src/app/(main)/(tabs)/scanner/results.tsx referencing mydeisgn/ai_face_scanner_-_results_&_profile per FR-013
- [X] T063 [P] [US1] Create skin profile view screen with concerns list and explanations in src/app/(main)/(tabs)/scanner/profile.tsx referencing mydeisgn/ai_face_scanner_-_results_&_profile per FR-013
- [X] T064 [P] [US1] Build skin profile card component in src/components/scanner/SkinProfileCard.tsx
- [X] T065 [P] [US1] Build concerns list component with explanations in src/components/scanner/ConcernsList.tsx per FR-012
- [X] T066 [US1] Add onboarding completion tracking in profile store per FR-002
- [X] T067 [US1] Implement onboarding guard in root layout to redirect new users

**Checkpoint**: Users can register, complete onboarding, perform face scan, and receive skin analysis

**Phase 3 Status**: ✅ COMPLETE - All 28/28 tasks done (T040-T067). User Story 1 ready for testing.

---

## Phase 4: User Story 2 - Personalized Routine Creation and Product Selection (Priority: P1)

**Goal**: Enable users to receive AI-generated routines tailored to skin profile, select preferred routine, and choose products for each step

**Independent Test**: Use existing skin profile to generate multiple routine options, select one routine, review suggested products by category, add products to routine

### Implementation for User Story 2

- [ ] T068 [P] [US2] Create product model and database operations in src/services/supabase/database.ts
- [ ] T069 [P] [US2] Create product data source documentation in specs/001-yogaageproof-ai/contracts/product-data-source.md specifying Open Beauty Facts as source (https://world.openbeautyfacts.org/), schema mapping strategy (product name, brand, category, ingredients, image URL, availability status), filtering criteria (700-1000 products covering all routine categories), and attribution requirements ("Powered by Open Beauty Facts")
- [ ] T070 [P] [US2] Create product seed migration script specs/001-yogaageproof-ai/contracts/migrations/seed-products.sql that includes SQL stored procedure for product ingestion with data validation rules (required fields: name, brand, category, image URL) and category coverage checks per contract documentation
- [ ] T071 [P] [US2] Use mcp__supabase__apply_migration with seed-products.sql to create product seeding stored procedure and validate migration success
- [ ] T072 [P] [US2] Use mcp__supabase__create_function to create Supabase Edge Function 'ingest-products' in src/supabase/functions/ingest-products/ that fetches Open Beauty Facts data via API, filters to 700-1000 products per contract criteria, validates data quality (image URLs accessible, required fields present), and populates products table via stored procedure from T071
- [ ] T073 [P] [US2] Add data quality validation queries to seed-products.sql: check image URL accessibility (HTTP 200 status), verify required fields populated (name, brand, category), validate category coverage (at least 50 products per routine category: cleanser, toner, serum, moisturizer)
- [ ] T074 [P] [US2] Add Open Beauty Facts attribution footer to product screens per product-data-source.md: "Product data powered by Open Beauty Facts" with logo and link in src/app/(main)/products/ screens and src/components/routine/ProductCard.tsx
- [ ] T075 [P] [US2] Create routine model operations (create, read, update status) in src/services/supabase/database.ts per FR-016
- [ ] T076 [P] [US2] Create routine steps model operations in src/services/supabase/database.ts
- [ ] T077 [US2] Create routine store with Zustand (active routine, steps, sessions) in src/stores/routine.store.ts
- [ ] T078 [US2] Implement routine generator service (Claude API) generating 3-5 options in src/services/ai/routine-generator.ts per FR-015 and FR-017
- [ ] T079 [P] [US2] Create routines list screen in src/app/(main)/(tabs)/routines/index.tsx referencing mydeisgn/routine_builder_-_new_routine
- [ ] T080 [P] [US2] Create routine builder screen (AI generation trigger) in src/app/(main)/(tabs)/routines/builder.tsx referencing mydeisgn/routine_builder_-_new_routine
- [ ] T081 [P] [US2] Create expert templates screen in src/app/(main)/(tabs)/routines/templates.tsx referencing mydeisgn/routine_builder_-_expert_templates
- [ ] T082 [P] [US2] Build routine card component displaying title, focus, duration, benefits in src/components/routine/RoutineCard.tsx per FR-017
- [ ] T083 [P] [US2] Build routine option selector component (3-5 options) in src/components/routine/RoutineSelector.tsx per FR-015
- [ ] T084 [US2] Create routine detail screen showing steps in src/app/(main)/(tabs)/routines/[id]/index.tsx
- [ ] T085 [P] [US2] Create product selection screen with category filters in src/app/(main)/(tabs)/routines/[id]/products.tsx referencing mydeisgn/product_tools_-_overview per FR-019
- [ ] T086 [P] [US2] Build product card component with AI insights button and online search button in src/components/routine/ProductCard.tsx per FR-021
- [ ] T087 [P] [US2] Build product category filter component in src/components/routine/CategoryFilter.tsx per FR-069
- [ ] T088 [US2] Implement product insight service (Claude API) generating personalized suitability explanations in src/services/ai/product-insights.ts per FR-067
- [ ] T089 [P] [US2] Build product insight modal component in src/components/routine/ProductInsightModal.tsx
- [ ] T090 [US2] Implement online product search integration (browser link) in src/utils/productSearch.ts per FR-023 and FR-068
- [ ] T091 [US2] Add routine activation logic (set status='active', archive previous) in routine store per FR-018
- [ ] T092 [US2] Implement product selection validation (all required steps have products) in src/utils/routineValidation.ts per FR-022

**Checkpoint**: Users can generate AI routines, select preferred routine, and add products for each step

---

## Phase 5: User Story 3 - Daily Routine Execution with Guided Player (Priority: P1)

**Goal**: Enable users to perform daily face yoga and skincare routine with step-by-step guidance, timers, imagery, and tips

**Independent Test**: Start saved routine in player, follow each step with visual guides and timers, complete session

### Implementation for User Story 3

- [ ] T093 [P] [US3] Create routine session model operations (create, update, complete) in src/services/supabase/database.ts per FR-031
- [ ] T094 [P] [US3] Create step completion model operations in src/services/supabase/database.ts per FR-032
- [ ] T095 [P] [US3] Create routine player screen with step navigation in src/app/(main)/(tabs)/routines/[id]/player.tsx referencing mydeisgn/routine_player_-_video_guide and routine_player_-_product_focus per FR-024 and FR-025
- [ ] T096 [P] [US3] Build face yoga step component with animation and countdown timer in src/components/routine/FaceYogaStep.tsx per FR-026
- [ ] T097 [P] [US3] Build product application step component with instructions, tips, and recommended amount in src/components/routine/ProductStep.tsx per FR-027
- [ ] T098 [P] [US3] Build progress indicator component showing step position in src/components/routine/ProgressIndicator.tsx per FR-028
- [ ] T099 [P] [US3] Build countdown timer component in src/components/routine/Timer.tsx
- [ ] T100 [P] [US3] Build tips display component in src/components/routine/TipsCard.tsx per FR-030
- [ ] T101 [US3] Implement routine session tracking (start, pause, resume, complete) in routine store per FR-029
- [ ] T102 [US3] Implement step completion tracking with status (completed/skipped) in routine store per FR-032
- [ ] T103 [US3] Cache routine content (steps, images, instructions) in MMKV for offline access in src/utils/cache.ts per NFR-005
- [ ] T104 [P] [US3] Build session completion summary component in src/components/routine/SessionSummary.tsx
- [ ] T105 [US3] Add session logging to database on completion with timestamp, duration, and step counts per FR-031
- [ ] T106 [US3] Implement local notification scheduling for routine reminders in src/services/notifications/scheduler.ts per FR-071

**Checkpoint**: Users can execute complete routine sessions with guided player and offline support

---

## Phase 6: User Story 4 - Progress Tracking with Photo Gallery and AI Comparison (Priority: P2)

**Goal**: Enable users to capture daily photos organized in gallery and use AI comparison to visualize skin changes over time

**Independent Test**: Capture multiple photos over time, view gallery by date, select before/after photos for AI comparison, review highlighted changes

### Implementation for User Story 4

- [ ] T107 [P] [US4] Create progress photo model operations (create, read, delete) in src/services/supabase/database.ts per FR-050 and FR-060
- [ ] T108 [P] [US4] Create photo comparison model operations in src/services/supabase/database.ts
- [ ] T109 [US4] Create gallery store with Zustand (photos, sync status, selections) in src/stores/gallery.store.ts
- [ ] T110 [P] [US4] Create gallery index screen with chronological photo grid in src/app/(main)/(tabs)/gallery/index.tsx referencing mydeisgn/photo_comparison per FR-054
- [ ] T111 [P] [US4] Create photo capture screen with camera interface in src/app/(main)/(tabs)/gallery/capture.tsx per FR-049
- [ ] T112 [P] [US4] Create photo detail screen with metadata (capture date, lighting conditions, cloud backup status) in src/app/(main)/(tabs)/gallery/[id].tsx per FR-059
- [ ] T113 [P] [US4] Create photo comparison screen (before/after selection) in src/app/(main)/(tabs)/gallery/compare.tsx referencing mydeisgn/photo_comparison per FR-055 and FR-057
- [ ] T114 [P] [US4] Build photo thumbnail component with date overlay in src/components/gallery/PhotoThumbnail.tsx
- [ ] T115 [P] [US4] Build photo grid component with lazy loading in src/components/gallery/PhotoGrid.tsx
- [ ] T116 [P] [US4] Build photo selector component (2 photo selection) in src/components/gallery/PhotoSelector.tsx per FR-055
- [ ] T117 [US4] Implement local photo storage using Expo FileSystem with device-level encryption (iOS Data Protection API, Android EncryptedFile) in src/services/storage/local.ts per FR-050 and NFR-016
- [ ] T118 [US4] Implement photo comparison service (Claude API) with <15s timeout analyzing texture, tone, fine lines in src/services/ai/photo-comparison.ts per FR-056 and NFR-002
- [ ] T119 [P] [US4] Build comparison results component with side-by-side images and annotated change areas in src/components/gallery/ComparisonResults.tsx per FR-057
- [ ] T120 [P] [US4] Build zoom/pan viewer for comparison images in src/components/gallery/ImageViewer.tsx per FR-058
- [ ] T121 [US4] Implement cloud backup upload to Supabase Storage (opt-in) with end-to-end encryption and user-specific keys in src/services/storage/cloud.ts per FR-051, FR-052, NFR-017, and NFR-018
- [ ] T122 [US4] Implement background sync queue for photos when on WiFi to avoid cellular data charges in src/services/storage/sync.ts per FR-053 and NFR-025
- [ ] T123 [US4] Implement photo restoration from cloud backup within 5 minutes for typical galleries in src/services/storage/restore.ts per FR-062 and NFR-027
- [ ] T124 [US4] Add storage space monitoring and warnings (<500MB available) with quality/compression options in src/utils/storage.ts per FR-061 and NFR-024

**Checkpoint**: Users can capture photos, view gallery, and compare photos with AI-powered analysis

---

## Phase 7: User Story 5 - Routine Effectiveness Analysis and Recommendations (Priority: P2)

**Goal**: Enable users to analyze routine effectiveness, view improvement timelines, and receive AI recommendations

**Independent Test**: Review completed routine history (7+ sessions), view effectiveness metrics and timelines, receive AI recommendations for adjustments

### Implementation for User Story 5

- [ ] T125 [P] [US5] Create AI recommendations model operations in src/services/supabase/database.ts
- [ ] T126 [P] [US5] Create routine evaluator screen with metrics dashboard in src/app/(main)/(tabs)/routines/[id]/evaluator.tsx referencing mydeisgn/routine_evaluator per FR-033
- [ ] T127 [P] [US5] Build consistency metrics component (sessions per week, adherence %) in src/components/routine/ConsistencyMetrics.tsx per FR-034
- [ ] T128 [P] [US5] Build improvement timeline chart component in src/components/routine/ImprovementTimeline.tsx per FR-035
- [ ] T129 [P] [US5] Build recommendations list component in src/components/routine/RecommendationsList.tsx per FR-037
- [ ] T130 [US5] Implement routine evaluator service (Claude API) for analysis after minimum 7 sessions in src/services/ai/routine-evaluator.ts per FR-036 and FR-037
- [ ] T131 [US5] Implement consistency calculation using Supabase function in src/services/supabase/database.ts per FR-034
- [ ] T132 [US5] Create session history query with filtering (date range, status) in src/services/supabase/database.ts per FR-039
- [ ] T133 [P] [US5] Build session history component with list view showing dates, completion status, duration in src/components/routine/SessionHistory.tsx per FR-039
- [ ] T134 [US5] Implement gap detection for missed routine sessions in src/utils/routineAnalytics.ts per FR-038
- [ ] T135 [US5] Create notification for routine adherence encouragement in src/services/notifications/generators.ts per FR-038
- [ ] T136 [US5] Implement recommendation action handling (modify routine, adjust schedule) in routine store per FR-040

**Checkpoint**: Users can evaluate routine effectiveness and receive actionable recommendations

---

## Phase 8: User Story 6 - Daily Skin Diary for Holistic Tracking (Priority: P3)

**Goal**: Enable users to log daily mood, triggers, and skin condition in calendar-based diary

**Independent Test**: Create daily diary entries with mood, triggers, and skin notes; review entries in calendar view to identify patterns

### Implementation for User Story 6

- [ ] T137 [P] [US6] Create diary entry model operations (create, read, update, delete) in src/services/supabase/database.ts per FR-041 and FR-047
- [ ] T138 [US6] Create diary store with Zustand (entries, selected date) in src/stores/diary.store.ts
- [ ] T139 [P] [US6] Create diary calendar screen with entry indicators in src/app/(main)/diary/index.tsx referencing mydeisgn/skin_diary_1 per FR-046
- [ ] T140 [P] [US6] Create diary entry form screen (new/edit) in src/app/(main)/diary/entry.tsx referencing mydeisgn/skin_diary_2 per FR-041
- [ ] T141 [P] [US6] Create diary entry detail screen in src/app/(main)/diary/[date].tsx
- [ ] T142 [P] [US6] Build calendar component with custom date cells showing entry indicators in src/components/diary/Calendar.tsx per FR-046
- [ ] T143 [P] [US6] Build mood selector component (predefined moods: stressed, calm, energized, tired) in src/components/diary/MoodSelector.tsx per FR-042
- [ ] T144 [P] [US6] Build trigger tags component (tags + free text) in src/components/diary/TriggerTags.tsx per FR-043
- [ ] T145 [P] [US6] Build skin condition notes input component in src/components/diary/SkinNotes.tsx per FR-044
- [ ] T146 [US6] Implement diary entry CRUD operations with date uniqueness constraint per FR-045 and FR-047
- [ ] T147 [P] [US6] Build entry list view component for calendar dates in src/components/diary/EntryList.tsx
- [ ] T148 [US6] Link diary entries to routine sessions (show completed routines on date) in src/services/supabase/database.ts per FR-048

**Checkpoint**: Users can log and review daily diary entries to track patterns

---

## Phase 9: User Story 7 - Product Discovery and AI Insights (Priority: P3)

**Goal**: Enable users to browse routine products, view AI insights about suitability, and search online

**Independent Test**: Navigate to Products Tool, browse products filtered by routine step, view AI insights, use search to find purchase options

### Implementation for User Story 7

- [ ] T149 [P] [US7] Create products index screen with category filters in src/app/(main)/products/index.tsx referencing mydeisgn/product_tools_-_overview per FR-063 and FR-064
- [ ] T150 [P] [US7] Create product detail screen with full information (ingredients, benefits, usage) in src/app/(main)/products/[id].tsx referencing mydeisgn/product_online_search per FR-066
- [ ] T151 [P] [US7] Create product search screen (online search) in src/app/(main)/products/search.tsx referencing mydeisgn/product_online_search per FR-068
- [ ] T152 [P] [US7] Build product list component with filtering in src/components/products/ProductList.tsx per FR-069
- [ ] T153 [P] [US7] Build product detail card component displaying name, brand, category, thumbnail in src/components/products/ProductDetail.tsx per FR-065 and FR-066
- [ ] T154 [US7] Implement product filtering by active routine in src/services/supabase/database.ts per FR-063
- [ ] T155 [US7] Implement product search query with category and skin type filters in src/services/supabase/database.ts per FR-069
- [ ] T156 [P] [US7] Build AI insights display component for products in src/components/products/AIInsights.tsx per FR-067
- [ ] T157 [US7] Implement online search handler (browser link with product name) in src/utils/productSearch.ts per FR-068

**Checkpoint**: Users can explore products, get AI insights, and search for purchase options

---

## Phase 10: User Story 8 - Notifications for Reminders and Engagement (Priority: P3)

**Goal**: Enable users to receive timely notifications for routine reminders, progress milestones, and AI tips

**Independent Test**: Enable notifications, receive routine reminders at scheduled times, view progress alerts, manage notification preferences

### Implementation for User Story 8

- [ ] T158 [P] [US8] Create notification model operations (create, read, mark as read, delete) in src/services/supabase/database.ts per FR-075 and FR-078
- [ ] T159 [P] [US8] Create notifications center screen in src/app/(main)/notifications.tsx referencing mydeisgn/notifications_page per FR-075 and FR-076
- [ ] T160 [P] [US8] Build notification list component with categorization (reminders, tips, milestones, updates) in src/components/notifications/NotificationList.tsx per FR-076
- [ ] T161 [P] [US8] Build notification item component with tap handler in src/components/notifications/NotificationItem.tsx
- [ ] T162 [US8] Implement push notification token registration on app launch in src/services/notifications/push.ts
- [ ] T163 [US8] Implement local notification scheduling for routine reminders at user-scheduled times in src/services/notifications/scheduler.ts per FR-071 and FR-077
- [ ] T164 [US8] Implement milestone notification generator (7, 14, 30 day streaks) in src/services/notifications/generators.ts per FR-072
- [ ] T165 [US8] Implement AI tip notification generator (based on routine data) in src/services/notifications/generators.ts per FR-073
- [ ] T166 [US8] Implement notification deep link routing to relevant screens in src/utils/deepLinking.ts
- [ ] T167 [US8] Create notification preferences screen in src/app/(main)/settings/notifications.tsx per FR-077
- [ ] T168 [US8] Build notification toggle component (enable/disable by type, set preferred times) in src/components/settings/NotificationToggles.tsx per FR-077

**Checkpoint**: Users receive timely notifications and can manage preferences

---

## Phase 11: User Story 9 - Personalization and Account Management (Priority: P3)

**Goal**: Enable users to customize app experience with multi-language support, manage account, adjust privacy, and access support

**Independent Test**: Change language preferences, update account information, adjust privacy settings, access help documentation

### Implementation for User Story 9

- [ ] T169 [P] [US9] Create settings index screen with menu in src/app/(main)/settings/index.tsx referencing mydeisgn/settings_1-6
- [ ] T170 [P] [US9] Create edit profile screen in src/app/(main)/settings/profile.tsx referencing mydeisgn/edit_profile per FR-080
- [ ] T171 [P] [US9] Create privacy settings screen in src/app/(main)/settings/privacy.tsx per FR-081
- [ ] T172 [P] [US9] Create language selection screen in src/app/(main)/settings/language.tsx per FR-079
- [ ] T173 [P] [US9] Create cloud backup settings screen in src/app/(main)/settings/backup.tsx per FR-081
- [ ] T174 [P] [US9] Create support/FAQ screen in src/app/(main)/settings/support.tsx per FR-083 and FR-084
- [ ] T175 [P] [US9] Build profile edit form component in src/components/settings/ProfileForm.tsx per FR-080
- [ ] T176 [P] [US9] Build language selector component with available languages (5 minimum at launch) in src/components/settings/LanguageSelector.tsx per FR-079
- [ ] T177 [P] [US9] Build privacy controls component (data sharing, cloud backup) in src/components/settings/PrivacyControls.tsx per FR-081
- [ ] T178 [P] [US9] Build FAQ accordion component organized by topic with keyword search in src/components/settings/FAQAccordion.tsx per FR-083 and FR-084
- [ ] T179 [US9] Add translation files for 5 languages (en, es, fr, de, ja) in src/i18n/locales/ per SC-010
- [ ] T180 [US9] Implement language change handler with immediate UI update in src/stores/profile.store.ts per FR-079
- [ ] T181 [US9] Implement profile update operations (email, password, display name) in src/services/supabase/auth.ts per FR-080
- [ ] T182 [US9] Implement password recovery flow via email with 1-hour token expiry in src/services/supabase/auth.ts per FR-087 and NFR-033
- [ ] T183 [US9] Implement social account linking/unlinking in src/services/supabase/auth.ts per FR-088
- [ ] T184 [US9] Implement cloud backup toggle with user consent tracking and opt-in disclosure in src/services/storage/cloud.ts per FR-081 and NFR-018
- [ ] T185 [P] [US9] Build contact support form component in src/components/settings/ContactSupport.tsx per FR-085
- [ ] T186 [US9] Create home dashboard screen with quick actions in src/app/(main)/(tabs)/home.tsx referencing mydeisgn/home_dashboard per FR-086
- [ ] T187 [P] [US9] Build dashboard summary component (active routine, consistency stats) in src/components/home/Dashboard.tsx per FR-082

**Checkpoint**: Users can personalize app, manage account, and access support resources

---

## Phase 12: Subscription & Additional Features

**Purpose**: Implement subscription management and cross-cutting features

- [ ] T188 [P] Create subscription model operations in src/services/supabase/database.ts
- [ ] T189 [P] Create subscription status screen in src/app/(main)/subscription/index.tsx referencing mydeisgn/manage_subscriptions
- [ ] T190 [P] Create subscription upgrade flow screen in src/app/(main)/subscription/upgrade.tsx referencing mydeisgn/subscription_flow_-_free_trial_pro_features
- [ ] T191 [P] Build subscription plans comparison component in src/components/subscription/PlanComparison.tsx
- [ ] T192 Use mcp__stripe__create_product to create subscription product in Stripe dashboard
- [ ] T193 Use mcp__stripe__create_price to create monthly and annual pricing tiers
- [ ] T194 Integrate Stripe payment sheet using Stripe React Native SDK with price IDs from T193
- [ ] T195 Use mcp__supabase__create_function to create webhook handler for Stripe subscription events (checkout.session.completed, customer.subscription.updated, customer.subscription.deleted)
- [ ] T196 Configure Stripe webhook endpoint URL pointing to Supabase edge function from T195
- [ ] T197 [P] Build feature gate utility for pro-only features in src/utils/featureGates.ts
- [ ] T198 [P] Create more tab menu screen in src/app/(main)/(tabs)/more/index.tsx
- [ ] T199 [P] Build bottom tab navigator component in src/app/(main)/(tabs)/_layout.tsx
- [ ] T200 Implement deep linking configuration in app.json per FR-086
- [ ] T201 [P] Create 404 not found screen in src/app/+not-found.tsx

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T202 [P] Add loading states and skeleton screens to all major views
- [ ] T203 [P] Add error boundary components with user-friendly messages per plan.md Error Handling Strategy
- [ ] T204 [P] Implement retry logic for failed AI API calls with exponential backoff (1s, 2s, 4s) per plan.md Error Handling Strategy
- [ ] T205 [P] Add accessibility labels and screen reader support to all interactive elements
- [ ] T206 [P] Optimize image loading with progressive loading and caching
- [ ] T207 [P] Add haptic feedback for key interactions (button taps, step completion)
- [ ] T208 [P] Implement analytics tracking for key user events for SC-001 through SC-015 measurement
- [ ] T209 Create splash screen and app icon assets in assets/
- [ ] T210 [P] Add pull-to-refresh for data lists (routines, gallery, notifications)
- [ ] T211 [P] Implement optimistic UI updates for data mutations
- [ ] T212 [P] Add input validation with user-friendly error messages per plan.md Error Handling Strategy
- [ ] T213 Test app offline functionality (routine player with cached content, cached photos, diary entries, cached products) per plan.md Offline Mode specifications
- [ ] T214 [P] Validate edge case handling for poor quality photo uploads: Test blurry images, wrong angles, insufficient lighting - verify FR-009 validation triggers user-friendly error messages with retry guidance per plan.md Error Handling Strategy
- [ ] T215 [P] Validate edge case handling for inconsistent routine completion: Test users who skip 7+ consecutive sessions - verify FR-038 gap detection sends encouragement notifications and Routine Evaluator (FR-036) handles insufficient data gracefully with minimum 7 sessions requirement
- [ ] T216 [P] Validate edge case handling for account conflicts: Test social auth sign-in with email matching existing email/password account - verify FR-089 conflict resolution modal appears with link/use-different-email options and T051-T053 implementation works correctly
- [ ] T217 [P] Validate edge case handling for offline photo comparison attempts: Test photo comparison selection when offline - verify user sees "Requires Internet" message per plan.md offline mode blocking operations
- [ ] T218 [P] Validate edge case handling for storage space limits: Test photo capture when device storage <500MB - verify NFR-024 warning appears and user can choose lower quality/compression options per FR-061
- [ ] T219 Perform security audit checklist:
  - [ ] Verify password requirements (8+ chars, letters+numbers) enforced client and server-side per FR-007 and NFR-028
  - [ ] Verify JWT tokens expire after 30 days inactivity per NFR-029
  - [ ] Verify OAuth 2.0/OpenID Connect used for social auth per NFR-030
  - [ ] Verify HTTPS used for all API calls (Claude, Supabase) per NFR-007
  - [ ] Verify local photos use device encryption (iOS Data Protection, Android EncryptedFile) per NFR-016
  - [ ] Verify cloud photos use end-to-end encryption with user-specific keys per NFR-017
  - [ ] Verify photos sent to Claude API are not stored by provider per NFR-022
  - [ ] Verify no API keys or secrets in source code - all in environment variables (ANTHROPIC_API_KEY, Supabase URL, Supabase anon key)
  - [ ] Verify Sign in with Apple implemented per Apple App Store requirements NFR-031
  - [ ] Verify password recovery uses 1-hour expiry tokens per NFR-033
  - [ ] Verify bcrypt password hashing with cost factor 12 per T037 and NFR-028
  - [ ] Verify social auth tokens securely stored with device-level encryption per NFR-032
- [ ] T220 [P] Implement offline queue for write operations (diary entries, session logs) with sync when connection restored in src/services/offline/queue.ts per plan.md Offline Mode
- [ ] T221 [P] Add network status monitor and offline mode indicator in src/components/common/OfflineIndicator.tsx per plan.md Offline Mode
- [ ] T222 [P] Run performance profiling and optimize render cycles targeting 60fps animations per plan.md Performance Goals
- [ ] T223 [P] Test on multiple device sizes and orientations per NFR-035
- [ ] T224 [P] Validate app bundle size <50MB per NFR-043 before production build
- [ ] T225 [P] Create app store screenshots and metadata
- [ ] T226 Use mcp__expo__start to configure eas.json with development, preview, and production build profiles
- [ ] T227 Use mcp__expo__start to run development build and test on physical device
- [ ] T228 Use mcp__expo__start to configure EAS Update channels (development, preview, production)
- [ ] T229 Use mcp__expo__start to publish initial OTA update to preview channel
- [ ] T230 Run quickstart.md validation and update documentation
- [ ] T231 Use mcp__expo__start to create final production build and test on physical devices per NFR-034 (iOS 13.0+, Android API 23+)
- [ ] T232 Submit app to App Store and Google Play Store

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-11)**: All depend on Foundational phase completion
  - User Stories 1-3 (P1): Core MVP features - complete first
  - User Stories 4-5 (P2): Enhanced features - complete after MVP
  - User Stories 6-9 (P3): Supporting features - complete after P2
- **Subscription (Phase 12)**: Can be done in parallel with US6-US9
- **Polish (Phase 13)**: Depends on all desired user stories being complete

### User Story Dependencies

**No Inter-Story Dependencies**: Each user story is independently testable and deliverable

- **US1 (Onboarding & Scan)**: Foundation for all other stories - provides auth and skin profile
- **US2 (Routine Creation)**: Uses skin profile from US1
- **US3 (Routine Player)**: Uses routines from US2
- **US4 (Photo Gallery)**: Independent feature
- **US5 (Routine Evaluator)**: Uses sessions from US3
- **US6 (Diary)**: Independent feature, optionally links to US3 sessions
- **US7 (Products)**: Uses products from US2, but browsable independently
- **US8 (Notifications)**: Cross-cutting feature enhancing all stories
- **US9 (Settings)**: Cross-cutting feature for all stories

### Within Each User Story

- Models before services
- Services before UI screens
- Core screens before supplementary components
- All tasks within a story complete before story is considered done

### Parallel Opportunities

**Phase 1 (Setup)**: T006-T016 can all run in parallel after T005
**Phase 2 (Foundational)**: T018-T039 can run in parallel (with groups: MCP tools T018-T021, Services T022-T024, UI foundation T026-T029, Utilities T030-T039)
**User Stories**: Once Foundational is complete, all user stories can begin in parallel (with sufficient team capacity)
**Within Stories**: All tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# After Foundational phase completes, launch US1 screens in parallel:
Task T040: "Create onboarding layout"
Task T041: "Create welcome slider screen"
Task T042: "Create tutorial steps screen"
Task T043: "Create skin goals selection screen"

# Then launch auth screens in parallel:
Task T045: "Implement login/register screen"
Task T046: "Implement registration form screen"
Task T047: "Implement forgot password screen"

# Then launch scanner screens in parallel:
Task T056: "Create scanner home screen"
Task T057: "Create camera interface screen"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup (T001-T016)
2. Complete Phase 2: Foundational (T017-T039) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T040-T067) - Onboarding & Scan
4. Complete Phase 4: User Story 2 (T068-T092) - Routine Creation
5. Complete Phase 5: User Story 3 (T093-T106) - Routine Player
6. **STOP and VALIDATE**: Test complete user journey independently
7. Deploy/demo MVP

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test independently → MVP foundation
3. Add US2 → Test independently → MVP core value
4. Add US3 → Test independently → Deploy/Demo (Complete MVP!)
5. Add US4 → Test independently → Enhanced progress tracking
6. Add US5 → Test independently → Smart recommendations
7. Add US6-US9 → Test independently → Full feature set
8. Polish → Production ready

### Parallel Team Strategy

With 3+ developers after Foundational phase:

- **Developer A**: US1 (Onboarding & Scan)
- **Developer B**: US2 (Routine Creation)
- **Developer C**: US4 (Photo Gallery)

After MVP (US1-3):

- **Developer A**: US5 (Evaluator)
- **Developer B**: US6 (Diary) + US8 (Notifications)
- **Developer C**: US7 (Products) + US9 (Settings)

---

## Task Summary

**Total Tasks**: 232 (updated from 205)
**Setup Tasks**: 12 (T001-T016) - was 11
**Foundational Tasks**: 23 (T017-T039) - was 17
**User Story 1 Tasks**: 28 (T040-T067) - was 25
**User Story 2 Tasks**: 25 (T068-T092) - was 20
**User Story 3 Tasks**: 14 (T093-T106) - was 14
**User Story 4 Tasks**: 18 (T107-T124) - was 18
**User Story 5 Tasks**: 12 (T125-T136) - was 12
**User Story 6 Tasks**: 12 (T137-T148) - was 12
**User Story 7 Tasks**: 9 (T149-T157) - was 9
**User Story 8 Tasks**: 11 (T158-T168) - was 11
**User Story 9 Tasks**: 19 (T169-T187) - was 19
**Subscription Tasks**: 14 (T188-T201) - was 13
**Polish Tasks**: 31 (T202-T232) - was 26

**Changes Applied**:
- Added 1 task in Phase 1 (contracts directory structure)
- Added 2 tasks in Phase 2 (centralized error handler, rate limiting)
- Added 3 tasks in Phase 3 (reordered account conflict resolution)
- Added 2 tasks in Phase 4 (constitution-compliant product seeding via MCP)
- Added 5 tasks in Phase 13 (edge case validation)
- Moved error handling from Phase 13 to Phase 2 (foundational)
- Enhanced task descriptions with FR/NFR references and design asset references

**Parallel Opportunities**: 89 tasks marked [P] can run in parallel with others in their phase (up from 78)
**MVP Scope (US1-3)**: 67 implementation tasks (T040-T106) - up from 59
**Full Feature Set**: All 232 tasks

---

## Notes

- All file paths assume Expo Router structure in src/app/
- [P] indicates parallelizable tasks (different files, no dependencies)
- [US#] indicates which user story the task belongs to
- Each user story is independently completable and testable
- **Use MCP tools**: Supabase MCP for database, Stripe MCP for payments, Expo MCP for builds - per project constitution
- Commit after logical groups of related tasks
- Stop at checkpoints to validate user stories independently
- Follow design references in mydeisgn/ directory for UI implementation (referenced throughout tasks)
- All AI operations use Claude API via Anthropic (@anthropic-ai/sdk)
- Error handling strategy from plan.md integrated throughout (retry logic, fallbacks, user messaging)
- Constitution compliance: All database operations via Supabase MCP (T017-T021, T069-T074)
- Security requirements referenced explicitly (NFR-016, NFR-017, NFR-028-NFR-033)
- Edge cases from spec.md validated in Phase 13 (T214-T218)
