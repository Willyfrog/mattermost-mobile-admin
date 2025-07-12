# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native mobile application built with Expo and TypeScript, designed as a Mattermost Mobile Admin app. It uses Expo Router for navigation and follows the file-based routing pattern. The app includes a complete authentication flow to connect to Mattermost servers.

## Architecture

The app follows a standard Expo Router architecture:

- **app/**: Contains the main application screens using file-based routing
  - `login/`: Authentication flow (server URL, credentials, success screens)
  - `dashboard/`: Tab-based navigation group with index and two screens
  - `_layout.tsx`: Root layout handling fonts, themes, navigation stack, and auth provider
  - `modal.tsx`: Modal screen accessible from any tab
- **components/**: Reusable UI components with theming support
  - `Themed.tsx`: Theme-aware Text and View components
  - `useColorScheme.ts`: Color scheme detection (light/dark mode)
  - `useClientOnlyValue.ts`: Client-side only value hooks for web compatibility
- **services/**: API services and business logic
  - `mattermostClient.ts`: Mattermost API client wrapper
- **contexts/**: React contexts for global state
  - `AuthContext.tsx`: Authentication state management
- **hooks/**: Custom React hooks
  - `useAuth.ts`: Authentication hook
- **utils/**: Utility functions
  - `validation.ts`: Input validation functions
- **constants/**: Static configuration (Colors.ts for theme colors)
- **assets/**: Static assets (fonts, images)

## Key Technologies

- **Expo Router**: File-based routing with typed routes enabled
- **React Navigation**: Underlying navigation library
- **TypeScript**: Strict mode enabled with path mapping (`@/*` points to root)
- **React Native Reanimated**: Animation library
- **Theme System**: Light/dark mode support with automatic detection
- **Mattermost Client**: `@mattermost/client` for API communication
- **Authentication**: Context-based auth state management

## Development Commands

```bash
# Start development server
npm start

# Platform-specific development
npm run ios       # iOS simulator
npm run android   # Android emulator  
npm run web       # Web browser

# Testing
npm test         # Run Jest tests with watch mode
```

## Navigation Structure

The app uses a stack navigator with:
- Root level: Stack with login flow, tabs, and modal
- Login flow: Server URL → Credentials → Success screens
- Tabs level: Two tabs (index and two screens)
- Modal: Presented modally from any screen

## Authentication Flow

1. **Server URL Screen** (`/login/server`): User enters Mattermost server URL
2. **Credentials Screen** (`/login/credentials`): User enters username/password
3. **Success Screen** (`/login/success`): Shows successful connection
4. **Main App** (`/dashboard`): Tab-based navigation after authentication

## Mattermost Integration

- Uses `@mattermost/client` for API communication
- Validates server connectivity with ping endpoint
- Handles authentication errors with user-friendly messages
- Stores authentication state in React Context

## Theming

The app supports automatic light/dark mode switching:
- Theme colors defined in `constants/Colors.ts`
- Components use `useThemeColor` hook for dynamic colors
- Themed components available in `components/Themed.tsx`

## TypeScript Configuration

- Extends `expo/tsconfig.base`
- Strict mode enabled
- Path mapping: `@/*` resolves to project root
- Includes all TS/TSX files and Expo type definitions

## Testing

- Jest with `jest-expo` preset
- Test files in `components/__tests__/`
- Tests run in watch mode by default