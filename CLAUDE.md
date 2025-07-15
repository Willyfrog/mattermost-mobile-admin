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
    - `index.tsx`: Main dashboard with logout button, server status, teams, and roles sections
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
  - `TeamCard.tsx`: Individual team display component with invitation settings and company info
  - `RoleCard.tsx`: Individual role display component with permissions and type indicators
  - `AuthAppDataIntegration.tsx`: Integration component for managing auth and app data lifecycle
- **services/**: API services and business logic
  - `mattermostClient.ts`: Mattermost API client wrapper with token persistence, user management, teams, and roles
  - `tokenStorage.ts`: Secure token storage service using expo-secure-store
- **contexts/**: React contexts for global state
  - `AuthContext.tsx`: Authentication state management
  - `AppDataContext.tsx`: Teams and roles data management with loading states and error handling
- **hooks/**: Custom React hooks
  - `useAuth.ts`: Authentication hook
  - `useAppData.ts`: Teams and roles data hook (exported from AppDataContext)
- **utils/**: Utility functions
  - `validation.ts`: Input validation functions including admin role validation
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
- **App Data Management**: Global state management for teams and roles with automatic lifecycle handling
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
2. **Login Start** (`/login`): Clears app data and redirects to server setup screen (if not authenticated)
3. **Server URL Screen** (`/login/server`): User enters Mattermost server URL
4. **Credentials Screen** (`/login/credentials`): User enters username/password  
5. **Admin Role Validation**: System checks if user has `system_admin` role - non-admin users are rejected with clear error message
6. **Success Screen** (`/login/success`): Shows successful connection, tokens are stored securely
7. **Main App** (`/dashboard`): Tab-based navigation after authentication with automatic teams/roles data fetching
8. **Logout**: Logout button in dashboard clears app data and redirects user back to login screen automatically

The app automatically handles navigation based on authentication state and persists login sessions across app restarts using secure token storage. The logout function includes automatic redirection to prevent users from getting stuck on authenticated screens. App data (teams and roles) is automatically fetched after authentication and cleared during logout or when entering the login flow.

### **Admin Role Requirement**
- **Access Control**: Only users with `system_admin` role can access the app
- **Validation**: Admin role checking happens immediately after successful authentication
- **Error Message**: Non-admin users see: "Access denied. This app is only available to system administrators."
- **Security**: Role validation prevents non-admin users from accessing any admin features

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
- Enforces admin role requirements during authentication
- Fetches teams and roles data from server with proper error handling and retry mechanisms

## API Methods

### MattermostService Methods
- `getAllTeams()`: Fetches all teams from server, handles both Team[] and TeamsWithCount responses
- `getAllRoles()`: Fetches system roles by predefined names (system_admin, team_admin, etc.)
- `searchUsers()`: Search users with pagination and filtering options
- `getAllUsers()`: Get all users with pagination
- `getUser(userId)`: Get specific user details
- `login()`: Authenticate user, validate admin role, and store tokens
- `logout()`: Clear authentication data and tokens
- `validateToken()`: Validate stored authentication token

### AppDataContext Methods
- `fetchTeams()`: Fetch teams data with loading state management
- `fetchRoles()`: Fetch roles data with loading state management
- `fetchAllData()`: Fetch both teams and roles data concurrently
- `clearAllData()`: Clear all teams and roles data from state
- `retryTeams()`: Retry failed teams data fetch
- `retryRoles()`: Retry failed roles data fetch

## User Management Features

- **User Search**: Debounced search with 300ms delay to prevent excessive API calls
- **User Listing**: Displays all users with pagination support
- **Filter Options**: Toggle to include/exclude deleted users in results
- **Pull-to-Refresh**: Refresh user data with proper error handling for empty search states
- **User Details**: Comprehensive user detail modal with profile information, roles, and activity
- **User Actions**: Quick action buttons for password reset, MFA reset, role changes, and user activation/deactivation
- **Loading States**: Separate loading indicators for initial load and refresh operations
- **Error Handling**: Comprehensive error states with user-friendly messages and retry functionality

## Teams and Roles Management

- **Teams Display**: Shows all teams from server with display name, handle, description, and company info
- **Roles Display**: Shows system roles with type indicators (built-in, scheme, custom) and permissions count
- **Data Fetching**: Automatically fetches teams and roles data after authentication
- **Data Lifecycle**: Clears teams/roles data on logout and login flow entry to prevent conflicts
- **Loading States**: Individual loading indicators for teams and roles sections
- **Error Handling**: Separate error states with retry functionality for teams and roles
- **5-Item Limit**: Dashboard shows first 5 teams and roles with "View All" links for future expansion
- **Card Design**: Consistent styling with server status card using theme colors and shadows

## UI/UX Features

- **Custom Gradient Headers**: Dashboard, users, and user detail screens use custom gradient headers
- **Hidden Tab Headers**: Tab headers are disabled to prevent visual gaps with custom headers
- **Modal Presentation**: User detail screen opens as a modal with smooth animation
- **Logout Button**: Integrated logout button in dashboard header with confirmation dialog
- **Loading Transitions**: Smooth loading states during authentication changes
- **Responsive Design**: Proper handling of different screen sizes and orientations
- **Action Buttons**: Grid layout with color-coded action buttons for user management
- **Card Layout**: Teams and roles cards with consistent theming, shadows, and interactive elements
- **Empty States**: Proper empty state handling for teams and roles sections
- **View All Links**: Placeholder links for future expansion to dedicated teams/roles screens

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
- **Admin Role Enforcement**: Only users with `system_admin` role can access the app
- **Role Validation**: Admin role checking happens during login, before token storage
- **Access Control**: Non-admin users are blocked at authentication level with clear error messages
- **Error Handling**: Sensitive information is not logged to console
- **Session Management**: Automatic logout on token validation failure
- **Logout Navigation**: Logout function automatically redirects to login screen
- **Loading States**: Proper loading indicators during authentication transitions
- **Data Security**: Teams and roles data is automatically cleared on logout to prevent data leakage between sessions

## Testing

- Jest with `jest-expo` preset
- Test files in `components/__tests__/`, `services/__tests__/`, and `utils/__tests__/`
- Tests run in watch mode by default
- Comprehensive test coverage for token storage, authentication, and admin role validation
- Dedicated tests for `validateSystemAdmin` function with edge cases
- Updated existing tests to handle admin role checking during login