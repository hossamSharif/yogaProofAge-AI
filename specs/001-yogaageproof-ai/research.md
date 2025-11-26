# Research: YogaAgeProof AI

**Branch**: `001-yogaageproof-ai` | **Date**: 2025-11-26
**Phase**: 0 - Research & Decision Documentation

## Overview

This document consolidates technology decisions and research findings for the YogaAgeProof AI mobile application. All decisions align with the user requirements: React Native + Expo, Supabase backend, client-side logic, MCP tools for integrations.

---

## 1. AI Skin Analysis Service

### Decision: Claude AI API via Anthropic

**Rationale**:
- Multi-modal capability for image analysis
- High accuracy in detecting skin features and concerns
- Consistent, reliable API with documented response formats
- Can generate personalized routine recommendations based on analysis
- No facial data stored by provider (ephemeral processing per NFR-022)

**Alternatives Considered**:
| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| AWS Rekognition | Mature, well-documented | Limited skin-specific analysis, requires custom model training | Not specialized for skincare analysis |
| Google Cloud Vision | Good face detection | General-purpose, needs custom logic for skin concerns | Would need significant post-processing |
| Custom ML Model | Full control | Requires ML expertise, hosting, maintenance | Out of scope, user specified cloud API |

**Implementation**:
- Send compressed photo (<2MB) to Claude API with structured prompt
- Parse JSON response for skin type, concerns, confidence scores
- Cache analysis results in Supabase for user history
- Implement retry logic with exponential backoff

---

## 2. Product Data API

### Decision: Open-source product database with manual curation

**Rationale**:
- Major skincare APIs (Sephora, SkinStore) don't offer public API access
- Open Beauty Facts provides community-driven product data
- Can supplement with manually curated product recommendations
- Products stored in Supabase for full control and offline access

**Alternatives Considered**:
| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| Sephora API | Comprehensive catalog | Not publicly available, requires partnership | No public access |
| Amazon Product API | Large catalog | Requires affiliate account, rate limits | Not skincare-specific |
| Web scraping | Access to any site | Legal issues, maintenance burden, fragile | Terms of service violations |

**Implementation**:
- Seed Supabase with curated skincare products (~500-1000 products)
- Organize by category: cleanser, toner, serum, moisturizer, treatment, sunscreen
- Include AI-compatible metadata: ingredients, skin type suitability, concerns addressed
- "Online search" button opens browser with product name query
- Product data refreshed periodically via Supabase Edge Functions if needed

---

## 3. Backend-as-a-Service: Supabase

### Decision: Supabase (User Requirement)

**Rationale**:
- User explicitly specified Supabase for all backend needs
- Provides PostgreSQL, Auth, Storage, Edge Functions in one platform
- React Native SDK available (@supabase/supabase-js)
- Row Level Security (RLS) for data isolation
- Real-time subscriptions for notifications sync

**Implementation Strategy**:
- Supabase Auth: Email/password + Google OAuth + Apple Sign-In
- Supabase Database: PostgreSQL with typed client generation
- Supabase Storage: User photos with bucket policies
- Edge Functions: Only if client-side processing insufficient (e.g., scheduled jobs)

**MCP Integration**:
- All database operations MUST use Supabase MCP tool as specified
- No direct PostgreSQL connections from client beyond Supabase SDK

---

## 4. Mobile Framework: React Native + Expo

### Decision: Expo SDK 52 (Managed Workflow)

**Rationale**:
- User specified React Native with Expo
- Managed workflow simplifies native module handling
- Expo SDK 52 is latest stable (Nov 2025)
- Built-in support for Camera, Notifications, FileSystem, ImagePicker
- EAS Build for app store deployment

**Key Expo Modules**:
| Module | Purpose |
|--------|---------|
| expo-camera | Photo capture for face scanning |
| expo-image-picker | Gallery photo selection |
| expo-file-system | Local photo storage/caching |
| expo-notifications | Push notifications |
| expo-secure-store | Secure token storage |
| expo-router | File-based navigation |
| expo-apple-authentication | Apple Sign-In |

**Alternatives Considered**:
| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| Bare React Native | Full native control | More complex setup, manual linking | User specified Expo |
| Flutter | Good performance | Different language (Dart), not specified | User specified React Native |

---

## 5. State Management

### Decision: Zustand with MMKV persistence

**Rationale**:
- Simpler API than Redux, less boilerplate
- Built-in TypeScript support
- Easy persistence with zustand/persist middleware
- MMKV provides fast, encrypted local storage (10x faster than AsyncStorage)

**Store Architecture**:
```
stores/
├── auth.store.ts      # Auth state, user session
├── profile.store.ts   # Skin profile, preferences
├── routine.store.ts   # Active routine, sessions, steps
├── gallery.store.ts   # Photos, comparisons, sync status
├── diary.store.ts     # Diary entries, calendar state
└── notifications.store.ts  # Notification list, unread count
```

**Alternatives Considered**:
| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| Redux Toolkit | Industry standard, DevTools | More boilerplate, steeper learning curve | Overkill for this app's needs |
| React Context | Built-in, no deps | Re-render issues, not designed for complex state | Performance concerns |
| Jotai | Atomic, flexible | Less established patterns | Zustand has better persistence story |

---

## 6. Photo Storage Strategy

### Decision: Hybrid Local + Cloud (Supabase Storage)

**Rationale**:
- User requirement: "Hybrid - Photos stored on device with optional encrypted cloud backup"
- Local-first for performance and offline access
- Cloud backup opt-in per NFR-018
- Supabase Storage for cloud backup with bucket policies

**Implementation**:
1. **Local Storage**: expo-file-system in app documents directory
2. **Cloud Backup**: Supabase Storage bucket with user-specific path
3. **Sync Status**: Track per-photo (local-only, pending, synced)
4. **Encryption**: Supabase Storage uses server-side encryption
5. **Compression**: Images compressed to <2MB before upload

**Storage Buckets**:
```
progress-photos/
├── {user_id}/
│   ├── {photo_id}.jpg
│   └── ...
```

---

## 7. Payment Integration: Stripe

### Decision: Stripe via MCP Tool (User Requirement)

**Rationale**:
- User explicitly specified Stripe MCP tool for payments
- Design includes subscription and manage_subscriptions screens
- Stripe React Native SDK for client-side payment sheet

**Implementation**:
- All Stripe operations MUST use Stripe MCP tool
- Subscription tiers: Free (limited scans), Pro (unlimited)
- Payment sheet for subscription management
- Webhook handling via Supabase Edge Function if needed

---

## 8. Push Notifications

### Decision: Expo Notifications + Supabase for scheduling

**Rationale**:
- Expo Notifications handles push tokens and delivery
- Client-side scheduling for routine reminders
- Supabase for storing notification preferences and history

**Implementation**:
- Register push token on app launch, store in Supabase
- Local notifications for routine reminders (scheduled on device)
- Remote notifications for system updates, tips (via Expo Push API)
- Notification center screen aggregates all types

---

## 9. Navigation Architecture

### Decision: Expo Router (File-based routing)

**Rationale**:
- Built into Expo SDK 52
- File-based routing matches React web patterns
- Deep linking support out of the box
- Type-safe navigation with generated types

**Route Groups**:
```
app/
├── (auth)/        # Unauthenticated routes
├── (onboarding)/  # First-time user flow
├── (main)/        # Authenticated app
│   └── (tabs)/    # Bottom tab navigator
└── _layout.tsx    # Root layout with auth check
```

---

## 10. UI Component Library

### Decision: Custom components with React Native core + Reanimated

**Rationale**:
- Design system is custom (Liquid Glass style)
- Design assets provide exact specifications
- React Native Reanimated for smooth 60fps animations
- No UI library matches the "Liquid Glass" aesthetic

**Component Strategy**:
- Build design system components matching `mydeisgn/` assets
- Use React Native's built-in components as base
- Reanimated for micro-interactions and transitions
- Shared theme constants for colors, typography, spacing

**Design Tokens**:
```typescript
colors: {
  primary: '#24543A',      // Deep Green
  accent: '#C8A55A',       // Muted Gold
  background: '#F4F0E8',   // Off-White
  text: '#1E1E1E',         // Charcoal
  textSecondary: '#6F6A61' // Warm Grey
}
```

---

## 11. Offline Support

### Decision: Routine content cached, AI features require connectivity

**Rationale**:
- NFR-005 requires offline routine playback
- AI analysis inherently requires cloud connectivity
- Supabase offline support via local-first sync

**Implementation**:
- Routine steps, imagery, instructions cached in MMKV/FileSystem
- Offline detection via NetInfo
- Queue AI requests when back online
- Graceful degradation: hide AI features when offline

---

## 12. Internationalization (i18n)

### Decision: expo-localization + i18next

**Rationale**:
- FR-079 requires multi-language support
- SC-010 targets 5+ languages at launch
- i18next is industry standard with React integration

**Implementation**:
- expo-localization for device locale detection
- react-i18next for translation integration
- Translation files in JSON format
- Languages: English (default), Spanish, French, German, Japanese

---

## 13. Expo Development Operations

### Decision: Expo MCP Server

**Rationale**:
- Consistent with MCP-first architecture (Supabase MCP, Stripe MCP, Ref MCP)
- Centralized automation for all dev/build operations
- Maintainable, follows best practices
- Seamless integration with EAS throughout development lifecycle

**Implementation**:
- All Expo CLI operations through Expo MCP server
- Development server management via MCP
- Mobile simulator/emulator automation via MCP
- EAS builds (development, preview, production) via MCP
- OTA updates via MCP
- Package installation (`expo install`) via MCP

**Key Operations via MCP**:
| Operation | MCP Capability |
|-----------|----------------|
| `expo start` | Development server |
| `expo run:ios/android` | Simulator/emulator |
| `eas build` | Cloud builds |
| `eas update` | OTA updates |
| `eas submit` | App store submission |
| `expo install` | Package management |

**Important**: Never use direct Expo CLI commands. All operations must go through the Expo MCP server.

---

## Summary of Key Decisions

| Area | Decision | Key Rationale |
|------|----------|---------------|
| AI Service | Claude API | Multi-modal, skin analysis capable |
| Product Data | Curated Supabase DB | No public skincare APIs available |
| Backend | Supabase | User requirement |
| Framework | Expo SDK 52 | User requirement, managed workflow |
| State | Zustand + MMKV | Simple, fast, good persistence |
| Photos | Hybrid local/cloud | User requirement, performance |
| Payments | Stripe MCP | User requirement |
| Notifications | Expo + client scheduling | Simple, cross-platform |
| Navigation | Expo Router | File-based, type-safe |
| UI | Custom + Reanimated | Match design assets exactly |
| Offline | Cached routines | NFR-005 requirement |
| i18n | i18next | Industry standard |
| Expo Ops | Expo MCP Server | MCP-first architecture, automation |

---

## Open Items Resolved

All NEEDS CLARIFICATION items from Technical Context have been resolved:
- Language/Version: TypeScript 5.x, Expo SDK 52
- Testing: Jest + RTL + Detox
- Target Platform: iOS 13+, Android API 23+
- Performance Goals: Defined per spec
- Constraints: Defined per spec
- Scale/Scope: ~30 screens, 5+ languages, 10k users
