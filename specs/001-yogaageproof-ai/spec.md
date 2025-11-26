# Feature Specification: YogaAgeProof AI - Skincare Companion Mobile App

**Feature Branch**: `001-yogaageproof-ai`
**Created**: 2025-11-25
**Status**: Draft
**Input**: User description: "YogaAgeProof AI is an AI-driven skincare companion mobile app that empowers users to age-proof their face naturally by combining personalized routines, intelligent guidance, and holistic self-care tools. **Core Features & Flows:** - **AI Face Scanner:** Users analyze their skin with an AI-powered face scan, generating a personal skin profile with detected type and concerns. - **Routine Builder:** The AI analyzes the uploaded user photo, then automatically generates several personalized face yoga and skincare routines. The user selects their preferred routine. In the next step, users add products suggested for the selected routine, categorized by step (e.g., cleanser, serum, moisturizer). Users must pick products from these suggestions, and can search for more info or purchase online using the integrated search tool. - **Routine Player:** Step-by-step, blends face yoga sessions and product applications, with session imagery, usage advice, timers, and helpful tips. - **Routine Evaluator:** Allows users to analyze the effectiveness of completed routines, see improvement timelines, and receive notifications about gaps or recommendations. - **Skin Diary:** Users log daily mood, triggers, and skin state, reviewing entries in a calendar-based diary. - **AI Photo Gallery & Comparison:** Users capture and upload daily photos into a gallery. The AI highlights subtle skin changes over time; users can review before/after images and progress in a simple, intuitive viewer. - **Products Tool:** Browse and preview only those products suggested for the active routine, organized by step/category. Each product card features an 'AI' button for insights and an online search button for further info. (No compare, expiration management, wishlist, or shelves.) - **Notifications:** Centralized notifications center for reminders, tips, and alerts related to routines, progress, and updates. - **Personalization & Support:** Multi-language support, personal recommendations, notification management, privacy/data options, account management, and support/FAQ screens. **Onboarding & Tutorial:** - Welcome and onboarding consist of a three-screen slider tutorial introducing key app benefits, process (face scan → routine generation → daily progress), and main features. **Design System:** - **Palette:** Deep Green (#24543A), Muted Gold (#C8A55A), Off-White (#F4F0E8), Charcoal Text (#1E1E1E), Warm Grey (#6F6A61) - **Visual Style:** Modular, clean, nature-inspired UI with 'Liquid Glass' cards, gradients, and soft shadow. Geometric fonts (Inter, SF Pro). Smooth micro-interactions. - **Layout:** Responsive card-based grids, accessible navigation."

## Clarifications

### Session 2025-11-25

- Q: Where will the AI skin analysis model be hosted and executed? → A: Pure cloud-based API - All processing happens on backend servers
- Q: How will the product database be populated and maintained? → A: Third-party product API integration - Real-time data from skincare product services (e.g., SkinStore, Sephora API) with local caching
- Q: Where will user-captured progress photos be stored? → A: Hybrid - Photos stored on device with optional encrypted cloud backup for sync/recovery
- Q: What authentication methods should be supported for account creation and login? → A: Hybrid - Email/password plus social auth options (Google, Apple) for user choice
- Q: What mobile development framework/approach should be used? → A: React Native - Cross-platform with JavaScript, shared codebase, native module access

## User Scenarios & Testing *(mandatory)*

### User Story 1 - First-Time User Onboarding and Skin Analysis (Priority: P1)

A new user downloads the app, completes the onboarding tutorial, performs their first AI face scan, and receives a personalized skin profile identifying their skin type and concerns.

**Why this priority**: This is the foundational entry point for all users. Without a successful skin analysis, users cannot access personalized routines or any downstream features. This delivers immediate value by providing users with professional-grade skin insights.

**Independent Test**: Can be fully tested by installing the app, completing the 3-screen tutorial, taking a facial photo, and receiving a skin profile report showing detected skin type and concerns. Delivers value by giving users actionable skin insights.

**Acceptance Scenarios**:

1. **Given** a new user opens the app for the first time, **When** they swipe through the three onboarding screens, **Then** they are presented with an option to start their first face scan
2. **Given** the user initiates a face scan, **When** they capture or upload a facial photo, **Then** the AI analyzes the image and generates a skin profile within 10 seconds
3. **Given** the AI has analyzed the photo, **When** the analysis is complete, **Then** the user sees their detected skin type (e.g., oily, dry, combination, sensitive) and a list of identified concerns (e.g., fine lines, dark spots, uneven texture)
4. **Given** the user has received their skin profile, **When** they view the results, **Then** they can see explanations for each identified concern and recommendations for next steps

---

### User Story 2 - Personalized Routine Creation and Product Selection (Priority: P1)

A user with a completed skin profile receives AI-generated face yoga and skincare routines tailored to their skin type and concerns, selects their preferred routine, and chooses suggested products for each step of the routine.

**Why this priority**: This is the core value proposition of the app - providing personalized, actionable skincare and face yoga routines. Without this, users cannot begin their age-proofing journey. This is independently valuable as users can immediately start following their routine.

**Independent Test**: Can be tested by using an existing skin profile to generate multiple routine options, selecting one routine, reviewing suggested products categorized by step (cleanser, serum, moisturizer, etc.), and adding products to the routine. Delivers a complete, personalized skincare plan.

**Acceptance Scenarios**:

1. **Given** a user has completed their skin profile, **When** they request routine generation, **Then** the AI generates 3-5 personalized routine options combining face yoga exercises and skincare steps
2. **Given** multiple routine options are presented, **When** the user reviews each option, **Then** each routine displays its focus (e.g., "Anti-Aging Focus", "Hydration Boost"), estimated duration, and key benefits
3. **Given** the user selects a preferred routine, **When** they proceed to product selection, **Then** they see suggested products categorized by routine step (cleanser, toner, serum, moisturizer, etc.)
4. **Given** suggested products are displayed for a step, **When** the user taps on a product, **Then** they can view product details, tap an "AI" button for personalized insights, and use a search button to find purchase options online
5. **Given** the user is selecting products, **When** they complete selections for all required steps, **Then** their personalized routine is saved and ready to execute

---

### User Story 3 - Daily Routine Execution with Guided Player (Priority: P1)

A user with an established routine uses the Routine Player to perform their daily face yoga and skincare regimen with step-by-step guidance, timers, imagery, and tips.

**Why this priority**: This is where users experience daily engagement and value realization. The guided player ensures proper execution of routines and builds the habit that drives long-term results. This can be tested independently once routines are created.

**Independent Test**: Can be tested by starting a saved routine in the player, following each step (face yoga exercises and product applications) with visual guides and timers, and completing the session. Delivers immediate daily value and habit formation.

**Acceptance Scenarios**:

1. **Given** a user has a saved routine, **When** they start the Routine Player, **Then** the first step is displayed with imagery, instructions, and relevant guidance
2. **Given** the user is on a face yoga step, **When** the step begins, **Then** they see demonstration imagery or animations, exercise instructions, and a countdown timer
3. **Given** the user is on a product application step, **When** the step begins, **Then** they see the product name, application instructions, usage tips, and recommended amount
4. **Given** the user completes a step, **When** they advance, **Then** the next step loads seamlessly with updated imagery and instructions
5. **Given** the user completes all steps in the routine, **When** the final step finishes, **Then** they see a completion confirmation and the session is logged for tracking

---

### User Story 4 - Progress Tracking with Photo Gallery and AI Comparison (Priority: P2)

A user regularly captures daily facial photos that are organized in a gallery, and uses AI-powered comparison tools to visualize skin changes and improvements over time.

**Why this priority**: This provides motivational feedback and validates the effectiveness of the user's routine, which is critical for retention. However, this requires multiple days of usage to deliver value, making it secondary to the core routine features.

**Independent Test**: Can be tested by capturing multiple photos over time, viewing them in the gallery organized by date, selecting before/after photos for AI comparison, and reviewing highlighted changes. Delivers motivation through visible progress.

**Acceptance Scenarios**:

1. **Given** a user wants to track progress, **When** they capture a daily facial photo, **Then** the photo is automatically dated, stored in the gallery, and available for future comparison
2. **Given** the user has multiple photos in the gallery, **When** they view the gallery, **Then** photos are displayed in chronological order with capture dates
3. **Given** the user selects two photos for comparison, **When** the AI analyzes the images, **Then** subtle skin changes are highlighted (e.g., reduced fine lines, improved texture, more even tone)
4. **Given** the AI has completed the comparison, **When** the user views results, **Then** they see before/after images side-by-side with annotated areas showing improvements or changes
5. **Given** the user reviews their progress, **When** they navigate the comparison viewer, **Then** they can easily zoom, pan, and toggle between images

---

### User Story 5 - Routine Effectiveness Analysis and Recommendations (Priority: P2)

A user who has completed multiple routine sessions uses the Routine Evaluator to analyze effectiveness, view improvement timelines, and receive AI-generated recommendations for optimizations or adjustments.

**Why this priority**: This feature enhances user outcomes by providing data-driven insights and adaptive recommendations, but requires historical data from multiple sessions. It's valuable for long-term engagement but not essential for initial routine execution.

**Independent Test**: Can be tested by reviewing completed routine history, viewing effectiveness metrics and improvement timelines, and receiving AI recommendations for routine adjustments. Delivers optimization insights.

**Acceptance Scenarios**:

1. **Given** a user has completed at least 7 routine sessions, **When** they open the Routine Evaluator, **Then** they see a summary of completed sessions, consistency metrics, and overall progress
2. **Given** the evaluator displays progress data, **When** the user views improvement timelines, **Then** they see charts or visualizations showing skin improvement trends correlated with routine adherence
3. **Given** the AI identifies gaps or opportunities, **When** the user reviews recommendations, **Then** they receive specific suggestions (e.g., "Increase hydration step frequency", "Add evening routine for better results")
4. **Given** recommendations are presented, **When** the user wants to act on them, **Then** they can easily modify their routine or schedule based on the suggestions
5. **Given** the user has inconsistent routine completion, **When** the evaluator detects gaps, **Then** they receive gentle notifications encouraging routine adherence

---

### User Story 6 - Daily Skin Diary for Holistic Tracking (Priority: P3)

A user logs daily observations including mood, environmental triggers, and skin condition in a calendar-based diary, and can review historical entries to identify patterns and correlations.

**Why this priority**: This provides holistic context and helps users identify triggers affecting their skin, but it's supplementary to the core routine and progress tracking features. It's valuable for advanced users seeking deeper insights.

**Independent Test**: Can be tested by creating daily diary entries with mood selections, trigger inputs, and skin state notes, then reviewing entries in a calendar view to spot patterns. Delivers contextual insights.

**Acceptance Scenarios**:

1. **Given** a user wants to log their daily state, **When** they create a diary entry, **Then** they can select their mood from predefined options, note environmental triggers (e.g., stress, diet, weather), and describe skin condition
2. **Given** the user has created a diary entry, **When** they save it, **Then** the entry is associated with the current date and appears in the calendar view
3. **Given** the user has multiple diary entries, **When** they view the calendar, **Then** entries are visually indicated on their respective dates
4. **Given** the user selects a date in the calendar, **When** they view the entry, **Then** they see their logged mood, triggers, skin notes, and any routines completed that day
5. **Given** the user reviews historical diary data, **When** they look for patterns, **Then** they can identify correlations between triggers and skin changes

---

### User Story 7 - Product Discovery and AI Insights (Priority: P3)

A user browses suggested products for their active routine organized by step/category, views AI-generated insights about product suitability, and searches online for product information or purchasing options.

**Why this priority**: This enhances the product selection experience and helps users make informed choices, but it's supplementary since product suggestions are already presented during routine creation. This is a deeper exploration tool.

**Independent Test**: Can be tested by navigating to the Products Tool, browsing products filtered by routine step, viewing AI insights for specific products, and using search functionality to find purchase options. Delivers informed product decisions.

**Acceptance Scenarios**:

1. **Given** a user has an active routine, **When** they open the Products Tool, **Then** they see only products suggested for their routine, organized by category/step
2. **Given** products are displayed, **When** the user taps a product card, **Then** they see detailed product information including ingredients, benefits, and usage instructions
3. **Given** the user is viewing a product, **When** they tap the "AI" button, **Then** they receive personalized insights explaining why this product suits their skin type and concerns
4. **Given** the user wants to purchase a product, **When** they tap the online search button, **Then** they are directed to search results or purchase options for that specific product
5. **Given** the user is browsing products, **When** they filter by step/category, **Then** only relevant products for that step are displayed

---

### User Story 8 - Notifications for Reminders and Engagement (Priority: P3)

A user receives timely notifications for routine reminders, progress milestones, AI tips, and system updates through a centralized notifications center.

**Why this priority**: Notifications enhance engagement and adherence, but they are supporting features rather than core functionality. The app should work fully without notifications for users who prefer not to use them.

**Independent Test**: Can be tested by enabling notifications, receiving routine reminders at scheduled times, viewing progress alerts, and managing notification preferences. Delivers improved adherence.

**Acceptance Scenarios**:

1. **Given** a user has enabled notifications, **When** their scheduled routine time approaches, **Then** they receive a reminder notification to perform their routine
2. **Given** the user reaches a progress milestone, **When** the milestone is detected, **Then** they receive a celebratory notification highlighting their achievement
3. **Given** the AI generates a personalized tip, **When** the tip is ready, **Then** the user receives a notification with the insight
4. **Given** the user has pending notifications, **When** they open the notifications center, **Then** they see a chronological list of all notifications with clear categorization
5. **Given** the user wants to customize notifications, **When** they access notification settings, **Then** they can enable/disable specific notification types and set preferred times

---

### User Story 9 - Personalization and Account Management (Priority: P3)

A user customizes their app experience through multi-language support, manages their account settings, adjusts privacy preferences, and accesses support resources and FAQs.

**Why this priority**: These are essential utility features for app usability and user control, but they don't directly contribute to the core skincare journey. They're necessary for a complete app experience but secondary to core features.

**Independent Test**: Can be tested by changing language preferences, updating account information, adjusting privacy settings, and accessing help documentation. Delivers control and accessibility.

**Acceptance Scenarios**:

1. **Given** a user opens app settings, **When** they access language options, **Then** they can select from available languages and the interface updates immediately
2. **Given** a user wants to manage their account, **When** they access account settings, **Then** they can update personal information, email, and password
3. **Given** a user is concerned about privacy, **When** they access privacy settings, **Then** they can control data sharing preferences, photo storage options, and account visibility
4. **Given** a user needs help, **When** they access the support section, **Then** they can browse FAQs, search for topics, and contact support if needed
5. **Given** a user receives personal recommendations, **When** they review them, **Then** recommendations are based on their skin profile, routine history, and progress data

---

### Edge Cases

- What happens when a user's face scan photo is poor quality (blurry, wrong angle, insufficient lighting)?
- How does the system handle users who skip multiple consecutive routine sessions?
- What happens when a user tries to compare photos taken under very different lighting conditions or angles?
- How does the app respond when a user has not selected products for all required steps in their routine?
- What happens if a user wants to switch routines mid-cycle before completing the evaluation period?
- How does the system handle users in regions where suggested products are not available for purchase?
- What happens when a user logs contradictory information in their skin diary (e.g., reports improvement but AI detects degradation)?
- How does the app handle photo storage when the user's device is running low on storage space?
- What happens when multiple skin concerns are detected with conflicting treatment approaches?
- How does the system respond when a user wants to delete their progress photos or diary entries?
- What happens when a user tries to sign in with Google/Apple using an email that already exists as an email/password account?
- How does the system handle a user who loses access to their social authentication provider (e.g., deleted Google account)?
- What happens when social authentication (Google/Apple) services are temporarily unavailable?
- How does the system handle users who want to convert their social auth account to email/password or vice versa?

## Requirements *(mandatory)*

### Functional Requirements

#### Onboarding & Initial Setup
- **FR-001**: System MUST provide a three-screen slider tutorial on first app launch introducing key benefits, the workflow (face scan → routine generation → daily progress), and main features
- **FR-002**: Users MUST be able to skip the onboarding tutorial and proceed directly to account creation
- **FR-003**: System MUST support account creation via email and password with basic profile information (name, date of birth optional)
- **FR-004**: System MUST support account creation and login via social authentication providers (Google Sign-In and Apple Sign-In)
- **FR-005**: System MUST link social authentication accounts to user profiles, allowing users to log in with either method once linked
- **FR-006**: System MUST allow users to select their preferred language during initial setup from supported options
- **FR-007**: Email/password accounts MUST enforce minimum password requirements (8+ characters, mix of letters and numbers)

#### AI Face Scanner
- **FR-008**: Users MUST be able to capture facial photos using device camera or upload existing photos from device gallery
- **FR-009**: System MUST validate photo quality (resolution, lighting, face detection) before accepting for analysis
- **FR-010**: System MUST provide real-time guidance during photo capture (e.g., face positioning, lighting feedback)
- **FR-011**: System MUST analyze facial photos and detect skin type (oily, dry, combination, sensitive, normal) within 10 seconds
- **FR-012**: System MUST identify visible skin concerns including fine lines, wrinkles, dark spots, uneven texture, hyperpigmentation, redness, and dullness
- **FR-013**: System MUST generate a comprehensive skin profile displaying detected skin type and all identified concerns with explanatory descriptions
- **FR-014**: System MUST persist skin profiles and allow users to update their profile by performing new scans

#### Routine Builder
- **FR-015**: System MUST automatically generate 3-5 personalized routine options based on the user's skin profile
- **FR-016**: Each generated routine MUST combine face yoga exercises and skincare application steps in a logical sequence
- **FR-017**: Each routine option MUST display a descriptive title, focus area (e.g., "Anti-Aging", "Hydration"), estimated duration, and key benefits
- **FR-018**: Users MUST be able to select one routine from the generated options
- **FR-019**: System MUST present suggested products categorized by routine step (cleanser, toner, serum, moisturizer, etc.) after routine selection
- **FR-020**: Users MUST be able to select products for each required step from the suggested options
- **FR-021**: Each product card MUST display product name, category/step, and provide an "AI" button for personalized insights and an online search button for purchasing information
- **FR-022**: System MUST validate that all required routine steps have product selections before allowing routine activation
- **FR-023**: Users MUST be able to search for additional product information and purchase options through integrated search functionality

#### Routine Player
- **FR-024**: Users MUST be able to start their saved routine from the Routine Player interface
- **FR-025**: System MUST present routine steps sequentially with step-by-step navigation
- **FR-026**: For face yoga steps, system MUST display demonstration imagery or animations, exercise instructions, and countdown timers
- **FR-027**: For product application steps, system MUST display product name, application instructions, usage tips, and recommended amount
- **FR-028**: System MUST provide progress indicators showing current step position within the overall routine
- **FR-029**: Users MUST be able to pause, resume, and navigate between steps during routine execution
- **FR-030**: System MUST display helpful tips and best practices throughout the routine session
- **FR-031**: System MUST log completed routine sessions with timestamp and completion status
- **FR-032**: Users MUST be able to mark individual steps as completed or skipped

#### Routine Evaluator
- **FR-033**: System MUST track and store all completed routine sessions with completion dates and times
- **FR-034**: System MUST calculate and display routine consistency metrics (e.g., sessions per week, adherence percentage)
- **FR-035**: System MUST generate improvement timelines visualizing skin progress correlated with routine adherence
- **FR-036**: System MUST analyze routine effectiveness after a minimum of 7 completed sessions
- **FR-037**: System MUST generate AI-powered recommendations for routine optimizations based on adherence patterns and progress data
- **FR-038**: System MUST identify gaps in routine execution and provide gentle encouragement notifications
- **FR-039**: Users MUST be able to view detailed session history with dates, completion status, and duration
- **FR-040**: Users MUST be able to modify their active routine based on evaluator recommendations

#### Skin Diary
- **FR-041**: Users MUST be able to create daily diary entries with date association
- **FR-042**: Diary entries MUST allow users to select mood from predefined options (e.g., stressed, calm, energized, tired)
- **FR-043**: Diary entries MUST allow users to log environmental triggers as free text or predefined tags (e.g., stress, diet changes, weather, sleep quality)
- **FR-044**: Diary entries MUST allow users to describe skin condition with free text notes
- **FR-045**: System MUST persist all diary entries and associate them with the creation date
- **FR-046**: System MUST display diary entries in a calendar view with visual indicators for days with entries
- **FR-047**: Users MUST be able to view, edit, and delete existing diary entries
- **FR-048**: System MUST display routine completion data alongside diary entries for correlation analysis

#### AI Photo Gallery & Comparison
- **FR-049**: Users MUST be able to capture daily facial photos using device camera
- **FR-050**: System MUST automatically timestamp and store photos locally on the device
- **FR-051**: System MUST provide optional encrypted cloud backup for progress photos with user consent
- **FR-052**: Users MUST be able to enable/disable cloud backup in privacy settings
- **FR-053**: System MUST sync photos across devices when cloud backup is enabled
- **FR-054**: System MUST display photos in chronological order in the gallery view, loading from local storage first for performance
- **FR-055**: Users MUST be able to select two photos for AI-powered before/after comparison
- **FR-056**: System MUST analyze selected photo pairs and highlight subtle skin changes (e.g., fine line reduction, texture improvement, tone evening)
- **FR-057**: System MUST display comparison results with side-by-side before/after images and annotated change areas
- **FR-058**: Users MUST be able to zoom, pan, and toggle between comparison images
- **FR-059**: System MUST store photo metadata including capture date, lighting conditions if detectable, analysis results, and cloud backup status
- **FR-060**: Users MUST be able to delete photos from the gallery, with options to delete from device only or both device and cloud
- **FR-061**: System MUST warn users about device storage space requirements and offer photo quality/compression options
- **FR-062**: System MUST restore photos from cloud backup when user logs in on a new device (if cloud backup enabled)

#### Products Tool
- **FR-063**: System MUST display only products suggested for the user's active routine
- **FR-064**: Products MUST be organized by routine step/category (cleanser, toner, serum, moisturizer, etc.)
- **FR-065**: Each product card MUST display product name, brand, category, and thumbnail image
- **FR-066**: Users MUST be able to view detailed product information including ingredients, benefits, and usage instructions
- **FR-067**: System MUST provide an "AI" button on each product card that generates personalized insights explaining product suitability for the user's skin type and concerns
- **FR-068**: System MUST provide an online search button that directs users to search results or purchase options for the specific product
- **FR-069**: Users MUST be able to filter products by routine step/category
- **FR-070**: System MUST NOT include product comparison, expiration management, wishlist, or shelf organization features

#### Notifications
- **FR-071**: System MUST send routine reminder notifications at user-scheduled times if notifications are enabled
- **FR-072**: System MUST send progress milestone notifications when users reach significant achievements
- **FR-073**: System MUST send AI-generated tip notifications with personalized skincare insights
- **FR-074**: System MUST send update notifications for app features and important announcements
- **FR-075**: Users MUST be able to view all notifications in a centralized notifications center
- **FR-076**: Notifications MUST be displayed in chronological order with clear categorization (reminders, tips, milestones, updates)
- **FR-077**: Users MUST be able to manage notification preferences including enabling/disabling specific types and setting preferred delivery times
- **FR-078**: Users MUST be able to mark notifications as read and delete notifications

#### Personalization & Support
- **FR-079**: System MUST support multiple languages with immediate interface updates upon language selection
- **FR-080**: Users MUST be able to update account information including email and password
- **FR-081**: System MUST provide privacy settings allowing users to control data sharing preferences, photo cloud backup options, and account visibility
- **FR-082**: System MUST generate personal recommendations based on skin profile, routine history, and progress data
- **FR-083**: Users MUST be able to access a comprehensive FAQ section organized by topic
- **FR-084**: Users MUST be able to search FAQ content by keywords
- **FR-085**: System MUST provide a contact support mechanism for users to submit questions or issues
- **FR-086**: System MUST maintain user session state across app restarts
- **FR-087**: System MUST implement secure password recovery via email for email/password accounts
- **FR-088**: System MUST allow users to link or unlink social authentication accounts from their profile
- **FR-089**: System MUST detect account conflicts when a user attempts to sign in with a social account using an email already associated with an existing email/password account, present a clear modal explaining the conflict, and offer two options: (a) link the social account to the existing account after password verification, or (b) use a different email address for the social account

### Non-Functional Requirements

#### Performance & Reliability
- **NFR-001**: AI face scan analysis via cloud API MUST complete within 10 seconds under normal network conditions (3G or better)
- **NFR-002**: AI photo comparison via cloud API MUST complete within 15 seconds for standard comparisons
- **NFR-003**: Cloud AI API MUST have 99.5% uptime availability
- **NFR-004**: System MUST handle AI API failures gracefully with user-friendly error messages and retry options
- **NFR-005**: App MUST cache routine content (steps, imagery, instructions) for offline playback

#### Integration & External Dependencies
- **NFR-006**: System MUST integrate with Claude API (Anthropic) for all AI operations including skin analysis, routine generation, photo comparison, product insights, and routine evaluation via claude-3-5-sonnet-20241022 model
- **NFR-007**: All photo uploads to cloud AI services MUST be transmitted over HTTPS with end-to-end encryption
- **NFR-008**: Cloud AI API requests MUST include authentication tokens to prevent unauthorized access
- **NFR-009**: System MUST implement rate limiting and request throttling to manage API costs
- **NFR-010**: System MUST compress photos before uploading to cloud AI services (target: <2MB per image) without compromising analysis accuracy
- **NFR-011**: System MUST use a curated, self-hosted product database seeded from open skincare product datasets (e.g., Open Beauty Facts, CosDNA) with initial 500-1000 products covering all routine categories, updated quarterly via manual imports
- **NFR-012**: Product data from Supabase database MUST be cached in MMKV for offline access, with cache refresh on app startup if network available
- **NFR-013**: System MUST handle network failures during product fetching gracefully by serving cached data with visual indicator showing last update time
- **NFR-014**: Product records MUST include availability status field (in_stock/out_of_stock/discontinued) manually updated during quarterly imports, with UI displaying status to users

#### Security & Privacy
- **NFR-016**: Progress photos stored locally MUST use device-level encryption (iOS: Data Protection API, Android: EncryptedFile)
- **NFR-017**: Cloud backup of photos MUST use end-to-end encryption with user-specific encryption keys
- **NFR-018**: Cloud backup MUST be opt-in and clearly disclosed during onboarding and in privacy settings
- **NFR-019**: Users MUST be able to download all their cloud-backed photos and delete them from cloud storage at any time
- **NFR-020**: Photo deletion from cloud MUST be permanent and irreversible within 30 days of deletion request
- **NFR-021**: System MUST NOT share user photos with third parties (including AI service providers) without explicit user consent
- **NFR-022**: Photos sent to AI services for analysis MUST be processed ephemerally and not stored by the AI provider
- **NFR-028**: User passwords MUST be hashed using industry-standard algorithms (e.g., bcrypt, Argon2) with appropriate salt
- **NFR-029**: Authentication tokens (session, JWT) MUST expire after 30 days of inactivity
- **NFR-030**: Social authentication (Google, Apple) MUST use OAuth 2.0 or OpenID Connect protocols
- **NFR-031**: System MUST comply with Apple App Store requirements for Sign in with Apple when other social login options are offered
- **NFR-032**: System MUST securely store social authentication tokens with device-level encryption
- **NFR-033**: Password recovery MUST use time-limited, single-use tokens sent via email with 1-hour expiration

#### Storage & Data Management
- **NFR-023**: Local photo storage MUST support at least 100 photos (estimated 200-500 MB) without performance degradation
- **NFR-024**: System MUST notify users when device storage falls below 500 MB available space
- **NFR-025**: Cloud photo backup MUST sync in background when on WiFi to avoid cellular data charges
- **NFR-026**: System MUST provide manual sync trigger and display sync status (last synced time, pending uploads)
- **NFR-027**: Photo restoration from cloud backup MUST complete within 5 minutes for typical galleries (50-100 photos)

#### Technical Platform & Constraints
- **NFR-034**: App MUST be built using React Native framework for cross-platform development (iOS and Android)
- **NFR-035**: App MUST target minimum iOS 13.0 and Android API level 23 (Android 6.0) for broad device compatibility
- **NFR-036**: React Native version MUST be 0.76 or higher (required by Expo SDK 52) for optimal performance and latest features
- **NFR-037**: Native modules MAY be used where React Native libraries are insufficient (e.g., advanced camera features, device encryption)
- **NFR-038**: App MUST use TypeScript for type safety and improved code maintainability
- **NFR-039**: State management MUST use a proven solution (Redux, Redux Toolkit, Zustand, or React Context for simpler cases)
- **NFR-040**: Local data persistence MUST use AsyncStorage or a higher-performance alternative (MMKV, WatermelonDB for complex data)
- **NFR-041**: UI components SHOULD leverage React Native's built-in components with custom styling to match the design system (Deep Green palette, Liquid Glass cards)
- **NFR-042**: Navigation MUST use React Navigation library for screen routing and deep linking support
- **NFR-043**: App bundle size SHOULD NOT exceed 50 MB on first install to maintain good download conversion rates

### Key Entities *(include if feature involves data)*

- **User Profile**: Represents an individual app user with account credentials (email, hashed password for email/password auth, or social auth provider ID for Google/Apple Sign-In), authentication method (email, google, apple, or linked combination), personal information (name, optional date of birth), language preference, notification settings, privacy preferences (including cloud backup opt-in status), and account creation date

- **Skin Profile**: Represents the AI-generated analysis of a user's skin, including detected skin type (oily, dry, combination, sensitive, normal), identified concerns (array of concerns like fine lines, dark spots, etc.), analysis timestamp, and reference to the source photo

- **Routine**: Represents a personalized skincare and face yoga regimen with a descriptive title, focus area, estimated duration, status (active/inactive), and an ordered list of routine steps. Each routine is associated with a specific user and skin profile

- **Routine Step**: Represents a single step within a routine, categorized as either "face yoga exercise" or "product application". Contains step number/order, type, instructions, demonstration imagery references, duration/timer value, and tips. For product steps, references the associated product

- **Product**: Represents a skincare product sourced from third-party APIs with name, brand, category/step (cleanser, serum, etc.), description, ingredients list, benefits, usage instructions, thumbnail image URL, price, availability status, external purchase link, and cache timestamp for data freshness tracking

- **Routine Session**: Represents a single execution of a routine by a user, with session start time, end time, completion status, array of completed steps, skipped steps, and total duration

- **Diary Entry**: Represents a daily log entry with entry date, selected mood (from predefined options), environmental triggers (array of tags or free text), skin condition notes (free text), and association to any completed routines on that date

- **Progress Photo**: Represents a captured facial photo for tracking purposes, with capture timestamp, local device file reference, cloud backup URL (if backup enabled), cloud sync status (synced/pending/local-only), storage location flags (device/cloud), metadata (lighting conditions if detectable), and optional analysis results from AI comparison

- **Photo Comparison**: Represents an AI analysis comparing two progress photos, with references to the before and after photos, analysis timestamp, detected changes (array of change descriptions with affected areas), and improvement metrics

- **Notification**: Represents a system notification with type (reminder, milestone, tip, update), message content, creation timestamp, read status, and delivery status

- **AI Recommendation**: Represents a personalized recommendation generated by the AI based on user data, with recommendation type (routine adjustment, product suggestion, behavioral tip), message content, creation timestamp, and data sources used for generation

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: New users can complete onboarding, perform their first face scan, and receive a skin profile within 5 minutes of app installation
- **SC-002**: The AI face scanner achieves at least 85% accuracy in skin type detection when validated against dermatologist assessments
- **SC-003**: Users can generate personalized routines and select products for all required steps within 10 minutes of completing their skin profile
- **SC-004**: At least 70% of users complete their first guided routine session within 24 hours of routine creation
- **SC-005**: Users who complete at least 14 routine sessions over 4 weeks report visible skin improvement in self-assessments
- **SC-006**: The AI photo comparison feature detects and highlights at least 3 measurable skin changes in 80% of before/after comparisons spanning 4+ weeks
- **SC-007**: Users maintain an average routine adherence rate of at least 60% (completing 4+ sessions per week) after the first month
- **SC-008**: At least 50% of active users log diary entries at least 3 times per week
- **SC-009**: Users can navigate to any main feature (Scanner, Routine Player, Gallery, Diary, Products, Notifications) within 3 taps from the home screen
- **SC-010**: The app supports at least 5 languages at launch with complete UI translation
- **SC-011**: Photo capture and AI analysis complete within 10 seconds for 95% of scans under normal network conditions
- **SC-012**: Users rate the Routine Player experience at least 4.0 out of 5.0 for ease of use and guidance quality
- **SC-013**: At least 60% of users who receive routine recommendations from the Evaluator take action (modify routine or schedule) within 7 days
- **SC-014**: Notification engagement rate reaches at least 40% (users who tap notifications to view content)
- **SC-015**: User retention rate reaches 50% at 30 days and 35% at 90 days post-installation

## Assumptions

- Users have smartphones with functional cameras capable of capturing photos at minimum 1080p resolution
- Users have stable internet connectivity for AI processing (face scanning, photo comparison, routine generation) and product search features. Routine player can work offline with cached content
- The AI models for skin analysis and photo comparison are pre-trained and deployed as cloud-based API services (no on-device processing)
- Product data is sourced from third-party skincare product APIs with real-time availability, pricing, and details, with local caching for performance and offline access
- Third-party product API providers offer sufficient product variety across categories (cleansers, serums, moisturizers, etc.) suitable for different skin types and concerns
- Face yoga exercise demonstrations (images or animations) and instructions are pre-created and stored in the app
- Users are willing to take regular facial photos for progress tracking purposes
- The app complies with relevant data privacy regulations (GDPR, CCPA, etc.) for storing photos and personal information
- Users understand that the app provides guidance and recommendations but is not a substitute for professional dermatological care
- Average routine duration is between 10-30 minutes based on selected routine complexity
- Users can commit to performing routines at least 3-4 times per week for optimal results
- The design system (Deep Green, Muted Gold, Off-White color palette with "Liquid Glass" cards and geometric fonts) is already finalized
- Multi-language support is prioritized for major languages based on target market analysis
- Product suggestions prioritize natural, accessible skincare products aligned with the "age-proof naturally" value proposition
- The app will be built using React Native for cross-platform development, targeting both iOS and Android platforms
- Development team has or will acquire expertise in React Native, TypeScript, and cross-platform mobile development
- React Native ecosystem provides sufficient libraries and native modules for all required functionality (camera, authentication, file storage, networking)
- Users have sufficient device storage for local photo gallery (estimated 200-500 MB for 100 photos)
- Progress photos are stored primarily on device with optional encrypted cloud backup for cross-device sync and recovery
- Cloud backup is opt-in and users maintain full control over photo deletion and data portability
- Cloud storage service provides secure, encrypted storage with 99.9% availability for photo backup
- Target devices (iOS 13.0+, Android 6.0+) represent sufficient market coverage for the target user base
