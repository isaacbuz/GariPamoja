# GariPamoja Mobile App

React Native mobile application for the GariPamoja car sharing platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation configuration
│   ├── services/        # API services
│   ├── utils/           # Utility functions
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Redux store and slices
│   ├── types/           # TypeScript type definitions
│   └── constants/       # App constants
├── assets/              # Images, fonts, etc.
├── __tests__/           # Test files
└── App.tsx              # Root component
```

## 🛠️ Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Check TypeScript types

### Code Style

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety

### Path Aliases

The following path aliases are configured:

- `@/` → `src/`
- `@components/` → `src/components/`
- `@screens/` → `src/screens/`
- `@navigation/` → `src/navigation/`
- `@services/` → `src/services/`
- `@utils/` → `src/utils/`
- `@hooks/` → `src/hooks/`
- `@store/` → `src/store/`
- `@types/` → `src/types/`
- `@constants/` → `src/constants/`
- `@assets/` → `assets/`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 📱 Features

- **Authentication**: Login, registration, OTP verification
- **Car Listings**: Browse, search, and filter cars
- **Booking**: Complete booking workflow
- **Payments**: Stripe, M-Pesa, PayPal integration
- **Messaging**: In-app chat between users
- **AI Chatbot**: Multi-language customer support
- **Maps**: Location-based car search
- **Notifications**: Push notifications

## 🎨 Design System

### Colors

```typescript
const colors = {
  primary: '#2563EB',    // Blue
  secondary: '#10B981',  // Green
  accent: '#F59E0B',     // Orange
  error: '#EF4444',      // Red
  background: '#F9FAFB',
  text: '#111827',
};
```

### Typography

- **Heading 1**: 32px, Bold
- **Heading 2**: 24px, Semibold
- **Body**: 16px, Regular
- **Caption**: 14px, Regular

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
```

## 📦 Key Dependencies

- **Navigation**: React Navigation 6
- **State Management**: Redux Toolkit
- **API Calls**: Axios + React Query
- **Forms**: React Hook Form
- **UI Components**: React Native Paper
- **Maps**: React Native Maps
- **Payments**: Stripe React Native
- **Localization**: i18n-js

## 🚀 Building for Production

### iOS

```bash
# Build for iOS
expo build:ios
```

### Android

```bash
# Build for Android
expo build:android
```

## 📄 License

This project is proprietary and confidential. 