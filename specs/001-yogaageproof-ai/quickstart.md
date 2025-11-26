# Quickstart Guide: YogaAgeProof AI

**Branch**: `001-yogaageproof-ai` | **Date**: 2025-11-26

## Prerequisites

### Required Software

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20.x LTS | Runtime environment |
| npm | 10.x | Package manager |
| Expo CLI | Latest | Development framework |
| Git | Latest | Version control |

### Development Accounts

| Service | Purpose | Setup URL |
|---------|---------|-----------|
| Supabase | Backend (auth, database, storage) | https://supabase.com |
| Expo | Build service, push notifications | https://expo.dev |
| Anthropic | AI API (Claude) | https://console.anthropic.com |
| Stripe | Payments (via MCP) | https://stripe.com |
| Apple Developer | iOS builds, Sign in with Apple | https://developer.apple.com |
| Google Cloud | Google Sign-In | https://console.cloud.google.com |

### Mobile Development (Optional)

- **iOS**: macOS with Xcode 15+ for iOS simulator
- **Android**: Android Studio with emulator or physical device
- **Expo Go**: Install on physical device for quick testing

### MCP Tools (Prerequisites - Must be configured before development)

| MCP Server | Purpose | Required |
|------------|---------|----------|
| Supabase MCP | Database, authentication, storage operations | Yes |
| Stripe MCP | Payment and subscription operations | Yes |
| Expo MCP | Dev server, builds, EAS, OTA updates | Yes |
| Ref MCP | Documentation and design references | Yes |

> **Important**: All MCP servers must be configured and running before starting development. Never use direct CLI commands or SDK calls for operations covered by MCP tools.

---

## Quick Setup

### 1. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd yogaAgeProofAi

# Switch to feature branch
git checkout 001-yogaageproof-ai

# Install dependencies
npm install
```

### 2. Environment Configuration

Create `.env` file in project root:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI Service (Claude API)
ANTHROPIC_API_KEY=your-api-key

# Stripe (via MCP - keys managed by MCP tool)
# No direct keys needed - use Stripe MCP tool

# Expo
EXPO_PROJECT_ID=your-expo-project-id
```

### 3. Supabase Setup

#### Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Create new project
3. Copy URL and anon key to `.env`

#### Run Database Migration

```bash
# Using Supabase CLI
npx supabase init
npx supabase db push --db-url "postgres://..."

# Or manually via Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Copy contents of specs/001-yogaageproof-ai/contracts/supabase-schema.sql
# 3. Run query
```

#### Configure Authentication

1. Go to Authentication > Providers
2. Enable Email provider
3. Enable Google OAuth:
   - Create OAuth credentials in Google Cloud Console
   - Add client ID/secret to Supabase
4. Enable Apple Sign-In:
   - Configure in Apple Developer Console
   - Add credentials to Supabase

#### Create Storage Bucket

1. Go to Storage
2. Create bucket: `progress-photos`
3. Set to private (non-public)
4. Apply RLS policies from schema file

### 4. Start Development

All Expo operations should be performed via **Expo MCP server**:

| Operation | Via Expo MCP |
|-----------|--------------|
| Start dev server | Expo MCP: `expo start` |
| Run iOS simulator | Expo MCP: `expo run:ios` |
| Run Android emulator | Expo MCP: `expo run:android` |
| Build with EAS | Expo MCP: `eas build` |
| OTA Update | Expo MCP: `eas update` |

> **Note**: Do not use direct CLI commands like `npm start` or `npx expo start`. All development server and build operations must go through the Expo MCP server.

---

## Project Structure Overview

```
yogaAgeProofAi/
├── src/
│   ├── app/              # Expo Router screens
│   ├── components/       # Reusable UI components
│   ├── services/         # Business logic (Supabase, AI)
│   ├── stores/           # Zustand state stores
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── constants/        # Theme, colors, config
│   └── types/            # TypeScript definitions
│
├── mydeisgn/             # Design reference assets
│   └── [screen]/
│       ├── code.html     # Reference HTML
│       └── screen.png    # Design mockup
│
├── specs/
│   └── 001-yogaageproof-ai/
│       ├── spec.md       # Feature specification
│       ├── plan.md       # Implementation plan
│       ├── research.md   # Technology decisions
│       ├── data-model.md # Database schema docs
│       ├── quickstart.md # This file
│       └── contracts/    # API contracts
│
├── tests/                # Test files
├── app.json              # Expo configuration
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

---

## Key Development Commands

### Via Expo MCP (Required)

| Operation | Use Expo MCP For |
|-----------|------------------|
| Dev server | `expo start` |
| iOS simulator | `expo run:ios` |
| Android emulator | `expo run:android` |
| EAS builds | `eas build` |
| OTA updates | `eas update` |
| Package install | `expo install [package]` |

### Direct Commands (Non-MCP)

| Command | Description |
|---------|-------------|
| `npm test` | Run Jest tests |
| `npm run test:e2e` | Run Detox E2E tests |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript check |

---

## MCP Tool Integration

### Supabase MCP

All database operations MUST use Supabase MCP tool:

```typescript
// DO: Use MCP tool for database access
// Supabase MCP handles all queries, mutations, auth

// DON'T: Direct database connections
// Never bypass MCP for Supabase operations
```

### Stripe MCP

All payment operations MUST use Stripe MCP tool:

```typescript
// DO: Use MCP tool for payments
// Stripe MCP handles subscriptions, invoices, customers

// DON'T: Direct Stripe SDK calls
// Never bypass MCP for payment operations
```

### Expo MCP

All Expo development and build operations MUST use Expo MCP server:

```typescript
// DO: Use Expo MCP for all development operations
// - Starting dev server
// - Running simulators/emulators
// - EAS builds (development, preview, production)
// - OTA updates
// - Package installation

// DON'T: Use direct CLI commands
// Never run `npx expo start`, `eas build`, etc. directly
// All Expo operations must go through the MCP server
```

### Ref MCP

For documentation and design references:

```typescript
// Use ref MCP to load design files, documentation
// Supports: mydeisgn/*.html, *.png, PDFs, markdown
```

---

## Design Reference Workflow

When implementing screens:

1. **Check design reference**:
   ```bash
   # View design files
   ls mydeisgn/[screen_name]/
   # Contains: code.html, screen.png
   ```

2. **Match exactly**:
   - Use `code.html` for component structure
   - Use `screen.png` for visual reference
   - Follow brand colors, typography, spacing

3. **Design tokens**:
   ```typescript
   // src/constants/colors.ts
   export const colors = {
     primary: '#24543A',      // Deep Green
     accent: '#C8A55A',       // Muted Gold
     background: '#F4F0E8',   // Off-White
     text: '#1E1E1E',         // Charcoal
     textSecondary: '#6F6A61' // Warm Grey
   };
   ```

---

## Testing Strategy

### Unit Tests (Jest)

```bash
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- path/to/file    # Specific file
```

### Integration Tests

```bash
npm run test:integration
```

### E2E Tests (Detox)

```bash
# iOS
npm run test:e2e:ios

# Android
npm run test:e2e:android
```

---

## Common Issues & Solutions

### Issue: Expo Go not connecting

```bash
# Try using tunnel mode
npx expo start --tunnel
```

### Issue: Supabase auth not working

1. Check `.env` variables are set
2. Verify Supabase project URL and key
3. Check Authentication settings in dashboard

### Issue: TypeScript errors

```bash
# Regenerate types from Supabase
npx supabase gen types typescript --project-id your-id > src/types/supabase.types.ts
```

### Issue: Native module errors

```bash
# Clear caches and reinstall
rm -rf node_modules
npm install
npx expo start -c
```

---

## Deployment

### Development Builds

```bash
# iOS simulator build
eas build --profile development --platform ios

# Android emulator build
eas build --profile development --platform android
```

### Production Builds

```bash
# iOS App Store
eas build --profile production --platform ios

# Android Play Store
eas build --profile production --platform android
```

### OTA Updates

```bash
# Push update to published builds
eas update --branch production --message "Bug fixes"
```

---

## Resources

### Documentation

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Expo Router Documentation](https://expo.github.io/router/docs)

### Design Assets

- Design references: `mydeisgn/` directory
- Brand guidelines: See spec.md Style & Design Guidelines section

### API Contracts

- Database schema: `contracts/supabase-schema.sql`
- AI service API: `contracts/ai-service-api.yaml`
- Navigation routes: `contracts/navigation-routes.md`

---

## Next Steps

After environment setup:

1. Run `/speckit.tasks` to generate implementation tasks
2. Begin with Phase 1 tasks (project setup, auth)
3. Implement screens following design references
4. Use MCP tools for all integrations
