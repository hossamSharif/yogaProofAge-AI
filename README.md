# YogaAgeProof AI

A cross-platform mobile application combining AI-powered face scanning for skin analysis, personalized face yoga and skincare routine generation, guided routine execution, progress photo tracking with AI comparison, and skin diary journaling.

## Tech Stack

- **Framework**: React Native 0.76+ with Expo SDK 52
- **Language**: TypeScript 5.x
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: Zustand 5.x
- **Navigation**: Expo Router (React Navigation 7.x)
- **AI**: Claude API (Anthropic)
- **Animations**: React Native Reanimated 3.x
- **Local Storage**: MMKV
- **Internationalization**: i18next
- **Testing**: Jest + React Native Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Add your API keys to .env
# - EXPO_PUBLIC_SUPABASE_URL
# - EXPO_PUBLIC_SUPABASE_ANON_KEY
# - EXPO_PUBLIC_ANTHROPIC_API_KEY
```

### Development

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run tests
npm test

# Lint code
npm run lint
```

## Project Structure

```
src/
├── app/                 # Expo Router screens
├── components/          # React components
├── services/            # Business logic
│   ├── supabase/       # Database, auth, storage
│   └── ai/             # Claude API integrations
├── stores/             # Zustand state stores
├── utils/              # Utility functions
├── constants/          # Theme, colors, spacing
├── types/              # TypeScript types
└── i18n/               # Internationalization
```

## Features

- **AI Face Scanner**: Skin analysis and profile generation
- **Routine Builder**: Personalized routines with product recommendations
- **Routine Player**: Guided face yoga and skincare sessions
- **Progress Gallery**: Photo tracking with AI-powered comparison
- **Skin Diary**: Daily mood, triggers, and skin condition logging
- **Multi-language Support**: English, Spanish, French, German, Japanese

## Documentation

See `specs/001-yogaageproof-ai/` for detailed specification, implementation plan, and technical documentation.

## License

Private - All Rights Reserved
