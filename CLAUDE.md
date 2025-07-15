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
    - `_layout.tsx`: Tab layout with hidden headers to prevent visual gaps
    - `index.tsx`: Main dashboard with logout button and server status
    - `users.tsx`: User management screen with search and filtering
  - `user-detail.tsx`: User detail modal screen with comprehensive user information and management actions
  - `_layout.tsx`: Root layout handling fonts, themes, navigation stack, and auth provider
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
- **Root level**: Stack with index route, login flow, dashboard tabs, and user detail modal
- **Index route** (`/`): Automatically redirects to `/login` or `/dashboard` based on auth state
- **Login flow**: `/login` → `/login/server` → `/login/credentials` → `/login/success`
- **Dashboard tabs**: Two tabs (index and users screens) after authentication with hidden headers
- **User Detail Modal** (`/user-detail`): Modal screen accessible from user list with userId parameter
- **Tab Headers**: Disabled to prevent visual gaps with custom gradient headers

## Authentication Flow

1. **App Start** (`/`): Root index checks stored authentication tokens and redirects appropriately
2. **Login Start** (`/login`): Redirects to server setup screen (if not authenticated)
3. **Server URL Screen** (`/login/server`): User enters Mattermost server URL
4. **Credentials Screen** (`/login/credentials`): User enters username/password  
5. **Success Screen** (`/login/success`): Shows successful connection, tokens are stored securely
6. **Main App** (`/dashboard`): Tab-based navigation after authentication
7. **Logout**: Logout button in dashboard redirects user back to login screen automatically

The app automatically handles navigation based on authentication state and persists login sessions across app restarts using secure token storage. The logout function includes automatic redirection to prevent users from getting stuck on authenticated screens.

## User Detail Screen

The user detail screen (`/user-detail`) is a modal screen that provides comprehensive user information and management capabilities:

### **Navigation Flow**
- **Access**: Only accessible from users list by tapping on a user card
- **Route**: `/user-detail?userId={userId}` - requires userId parameter
- **Presentation**: Opens as a modal with smooth slide-up animation
- **Return**: Back button returns to users list

### **Screen Sections**
- **Header**: Custom gradient header with user name, status indicator, and back button
- **Profile Section**: Large avatar, display name, email, and role information
- **Basic Information**: Username, position, full name, and last activity timestamp
- **Quick Actions**: Grid of action buttons for user management tasks

### **Action Buttons**
- **Reset Password**: Red button to reset user password (UI only)
- **Reset MFA**: Orange button to reset multi-factor authentication (UI only)
- **Change Roles**: Blue button to modify user roles (UI only)
- **Activate/Deactivate**: Toggle button (green/red) to activate or deactivate user account (UI only)

### **Features**
- **Dynamic Data**: Fetches user details using `mattermostService.getUser(userId)`
- **Error Handling**: Comprehensive error states with retry functionality
- **Loading States**: Proper loading indicators during API calls
- **Theme Support**: Full light/dark mode compatibility
- **Responsive Design**: Adapts to different screen sizes

### **API Integration**
- Uses existing `mattermostService.getUser(userId)` method
- Handles network errors gracefully
- Provides retry functionality for failed requests
- Validates authentication state before loading

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
- **User Details**: Comprehensive user detail modal with profile information, roles, and activity
- **User Actions**: Quick action buttons for password reset, MFA reset, role changes, and user activation/deactivation
- **Loading States**: Separate loading indicators for initial load and refresh operations
- **Error Handling**: Comprehensive error states with user-friendly messages and retry functionality

## UI/UX Features

- **Custom Gradient Headers**: Dashboard, users, and user detail screens use custom gradient headers
- **Hidden Tab Headers**: Tab headers are disabled to prevent visual gaps with custom headers
- **Modal Presentation**: User detail screen opens as a modal with smooth animation
- **Logout Button**: Integrated logout button in dashboard header with confirmation dialog
- **Loading Transitions**: Smooth loading states during authentication changes
- **Responsive Design**: Proper handling of different screen sizes and orientations
- **Action Buttons**: Grid layout with color-coded action buttons for user management

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
- **Logout Navigation**: Logout function automatically redirects to login screen
- **Loading States**: Proper loading indicators during authentication transitions

## Testing

- Jest with `jest-expo` preset
- Test files in `components/__tests__/` and `services/__tests__/`
- Tests run in watch mode by default
- Comprehensive test coverage for token storage and authentication