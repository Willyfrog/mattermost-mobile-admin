# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native mobile application built with Expo and TypeScript, designed as a Mattermost Mobile Admin app. It uses Expo Router for navigation and follows the file-based routing pattern. The app includes a complete authentication flow to connect to Mattermost servers.

## Architecture

The app follows a standard Expo Router architecture:

- **app/**: Contains the main application screens using file-based routing
  - `index.tsx`: Root route handler that redirects based on authentication state
  - `login/`: Authentication flow (server URL, credentials, success screens)
    - `index.tsx`: Redirects to server setup screen
  - `dashboard/`: Tab-based navigation group with index and users screens
  - `_layout.tsx`: Root layout handling fonts, themes, navigation stack, and auth provider
  - `modal.tsx`: Modal screen accessible from any tab
- **components/**: Reusable UI components with theming support
  - `Themed.tsx`: Theme-aware Text and View components
  - `useColorScheme.ts`: Color scheme detection (light/dark mode)
  - `useClientOnlyValue.ts`: Client-side only value hooks for web compatibility
  - `UserCard.tsx`: Individual user display component with status indicators
  - `UserList.tsx`: FlatList component for displaying users with refresh control
  - `SearchInput.tsx`: Debounced search input component
  - `FilterSwitch.tsx`: Toggle switch for filtering options
  - `LoadingState.tsx`: Loading indicator component
- **services/**: API services and business logic
  - `mattermostClient.ts`: Mattermost API client wrapper with token persistence and user management
  - `tokenStorage.ts`: Secure token storage service using expo-secure-store
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
- **Authentication**: Context-based auth state management with persistent token storage
- **Secure Storage**: `expo-secure-store` for encrypted token persistence

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

The app uses a stack navigator with conditional routing based on authentication:
- **Root level**: Stack with index route, login flow, dashboard tabs, and modal
- **Index route** (`/`): Automatically redirects to `/login` or `/dashboard` based on auth state
- **Login flow**: `/login` → `/login/server` → `/login/credentials` → `/login/success`
- **Dashboard tabs**: Two tabs (index and users screens) after authentication
- **Modal**: Presented modally from any screen

## Authentication Flow

1. **App Start** (`/`): Root index checks stored authentication tokens and redirects appropriately
2. **Login Start** (`/login`): Redirects to server setup screen (if not authenticated)
3. **Server URL Screen** (`/login/server`): User enters Mattermost server URL
4. **Credentials Screen** (`/login/credentials`): User enters username/password  
5. **Success Screen** (`/login/success`): Shows successful connection, tokens are stored securely
6. **Main App** (`/dashboard`): Tab-based navigation after authentication

The app automatically handles navigation based on authentication state and persists login sessions across app restarts using secure token storage.

## Mattermost Integration

- Uses `@mattermost/client` for API communication
- Validates server connectivity with ping endpoint
- Handles authentication errors with user-friendly messages
- Stores authentication state in React Context with persistent token storage
- Automatically restores authentication on app start from secure storage
- Validates stored tokens and cleans up invalid sessions

## User Management Features

- **User Search**: Debounced search with 300ms delay to prevent excessive API calls
- **User Listing**: Displays all users with pagination support
- **Filter Options**: Toggle to include/exclude deleted users in results
- **Pull-to-Refresh**: Refresh user data with proper error handling for empty search states
- **User Details**: Shows user status, roles, and basic profile information
- **Loading States**: Separate loading indicators for initial load and refresh operations
- **Error Handling**: Comprehensive error states with user-friendly messages

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

## Security

- **Token Storage**: Uses `expo-secure-store` for encrypted token persistence
- **Authentication Tokens**: Securely stored and automatically restored on app start
- **Token Validation**: Validates stored tokens and cleans up invalid sessions
- **Error Handling**: Sensitive information is not logged to console
- **Session Management**: Automatic logout on token validation failure

## Testing

- Jest with `jest-expo` preset
- Test files in `components/__tests__/` and `services/__tests__/`
- Tests run in watch mode by default
- Comprehensive test coverage for token storage and authentication