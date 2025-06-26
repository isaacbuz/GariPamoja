#!/bin/bash

# Simple script to create GitHub issues for Frontend Development

echo "🚀 Creating GitHub issues for Frontend & Payment Development"

# Create labels first
echo "📏 Creating labels..."
gh label create "frontend" --description "Frontend related tasks" --color "0052CC" 2>/dev/null || true
gh label create "authentication" --description "Authentication related" --color "5319E7" 2>/dev/null || true
gh label create "payment" --description "Payment integration" --color "FBCA04" 2>/dev/null || true
gh label create "ui" --description "User interface" --color "D4C5F9" 2>/dev/null || true
gh label create "setup" --description "Project setup" --color "C5DEF5" 2>/dev/null || true
gh label create "priority:high" --description "High priority" --color "D93F0B" 2>/dev/null || true
gh label create "api" --description "API integration" --color "1D76DB" 2>/dev/null || true
gh label create "navigation" --description "Navigation related" --color "BFD4F2" 2>/dev/null || true
gh label create "architecture" --description "Architecture decisions" --color "C2E0C6" 2>/dev/null || true

echo "📝 Creating issues..."

# Issue 1 - Already completed, but create for tracking
gh issue create \
  --title "Setup React Native project with TypeScript" \
  --body "## Task Description
Setup the React Native project with TypeScript configuration for the GariPamoja mobile app.

### Status: ✅ COMPLETED

### Subtasks
- [x] Initialize React Native project with Expo
- [x] Configure TypeScript
- [x] Setup ESLint and Prettier
- [x] Configure Jest for testing
- [x] Setup project structure

**Estimate**: 4 hours" \
  --label "frontend,setup,priority:high" || true

# Issue 2
gh issue create \
  --title "Implement authentication screens" \
  --body "## Task Description
Create authentication screens for user login and registration.

### Screens to Implement
- [ ] Login screen
- [ ] Registration screen
- [ ] Forgot password screen
- [ ] OTP verification screen
- [ ] Password reset screen

### UI Requirements
- Follow Material Design guidelines
- Support dark mode
- Responsive layout
- Loading states
- Error handling

**Estimate**: 8 hours" \
  --label "frontend,authentication,ui" || true

# Issue 3
gh issue create \
  --title "Implement authentication logic" \
  --body "## Task Description
Implement the authentication business logic and API integration.

### Features
- [ ] JWT token management
- [ ] Secure token storage
- [ ] Auto-login functionality
- [ ] Logout mechanism
- [ ] Token refresh logic

**Estimate**: 6 hours" \
  --label "frontend,authentication,api" || true

# Issue 4
gh issue create \
  --title "Setup navigation structure" \
  --body "## Task Description
Implement the app navigation structure using React Navigation.

### Navigation Components
- [ ] Bottom tab navigation
- [ ] Stack navigators for each tab
- [ ] Drawer navigation for settings
- [ ] Modal navigation
- [ ] Deep linking support

**Estimate**: 6 hours" \
  --label "frontend,navigation,architecture" || true

# Issue 5
gh issue create \
  --title "Create user profile screens" \
  --body "## Task Description
Implement user profile management screens.

### Screens
- [ ] Profile view screen
- [ ] Edit profile screen
- [ ] KYC verification screen
- [ ] Settings screen
- [ ] Trust score display

**Estimate**: 8 hours" \
  --label "frontend,ui" || true

# Issue 6
gh issue create \
  --title "Implement car listing screens" \
  --body "## Task Description
Create car listing and search functionality.

### Screens
- [ ] Car list view (grid/list toggle)
- [ ] Car detail view
- [ ] Search screen with filters
- [ ] Map view with car locations
- [ ] Car comparison screen

**Estimate**: 10 hours" \
  --label "frontend,ui" || true

# Issue 7
gh issue create \
  --title "Create car booking flow" \
  --body "## Task Description
Implement the complete car booking workflow.

### Screens
- [ ] Date/time selection
- [ ] Pickup/return location
- [ ] Booking summary
- [ ] Add-ons selection
- [ ] Booking confirmation

**Estimate**: 10 hours" \
  --label "frontend,ui" || true

# Issue 8
gh issue create \
  --title "Build messaging system" \
  --body "## Task Description
Implement in-app messaging between users.

### Features
- [ ] Chat UI with message bubbles
- [ ] Real-time messaging
- [ ] Push notifications
- [ ] Message status indicators
- [ ] Media sharing

**Estimate**: 12 hours" \
  --label "frontend,ui" || true

# Issue 9
gh issue create \
  --title "Integrate AI chatbot" \
  --body "## Task Description
Integrate the AI chatbot for customer support.

### Features
- [ ] Chatbot UI component
- [ ] API integration
- [ ] Multi-language support
- [ ] Context handling
- [ ] Quick replies

**Estimate**: 8 hours" \
  --label "frontend,api" || true

# Issue 10
gh issue create \
  --title "Create payment screens" \
  --body "## Task Description
Design and implement payment UI screens.

### Screens
- [ ] Payment method selection
- [ ] Credit/debit card form
- [ ] Mobile money input
- [ ] PayPal integration
- [ ] Payment confirmation

**Estimate**: 8 hours" \
  --label "frontend,payment,ui" || true

# Issue 11
gh issue create \
  --title "Implement Stripe payment flow" \
  --body "## Task Description
Integrate Stripe for card payments.

### Implementation
- [ ] Stripe SDK integration
- [ ] Card tokenization
- [ ] Payment intent creation
- [ ] 3D Secure handling
- [ ] Payment confirmation

**Estimate**: 10 hours" \
  --label "payment,api" || true

# Issue 12
gh issue create \
  --title "Implement M-Pesa payment flow" \
  --body "## Task Description
Integrate M-Pesa for mobile money payments.

### Features
- [ ] STK push implementation
- [ ] Phone number validation
- [ ] Payment status polling
- [ ] Callback handling
- [ ] Transaction verification

**Estimate**: 12 hours" \
  --label "payment,api" || true

# Issue 13
gh issue create \
  --title "Implement PayPal payment flow" \
  --body "## Task Description
Integrate PayPal for payments.

### Implementation
- [ ] PayPal SDK setup
- [ ] OAuth integration
- [ ] Payment processing
- [ ] Refund handling
- [ ] Subscription support

**Estimate**: 8 hours" \
  --label "payment,api" || true

# Issue 14
gh issue create \
  --title "Build transaction features" \
  --body "## Task Description
Implement transaction management features.

### Features
- [ ] Transaction history screen
- [ ] Receipt generation
- [ ] Refund request flow
- [ ] Payment analytics
- [ ] Export functionality

**Estimate**: 8 hours" \
  --label "frontend,payment,ui" || true

# Issue 15
gh issue create \
  --title "Implement comprehensive testing" \
  --body "## Task Description
Create comprehensive test suite for the app.

### Test Types
- [ ] Unit tests for utilities
- [ ] Component tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Payment flow tests

**Estimate**: 16 hours" \
  --label "frontend,priority:high" || true

# Issue 16
gh issue create \
  --title "Optimize app performance" \
  --body "## Task Description
Optimize app performance and reduce bundle size.

### Optimization Areas
- [ ] Image optimization
- [ ] Lazy loading implementation
- [ ] Cache management
- [ ] Bundle size reduction
- [ ] Memory leak fixes

**Estimate**: 8 hours" \
  --label "frontend" || true

# Issue 17
gh issue create \
  --title "Prepare for app stores" \
  --body "## Task Description
Prepare the app for App Store and Google Play submission.

### Tasks
- [ ] App store assets creation
- [ ] Release build configuration
- [ ] Code signing setup
- [ ] Store listings writing
- [ ] Beta testing setup

**Estimate**: 8 hours" \
  --label "frontend" || true

echo "✅ Done creating issues!"
echo ""
echo "📊 Summary:"
echo "   - Created 17 issues for frontend and payment development"
echo "   - Issues cover authentication, UI, payments, and deployment"
echo ""
echo "🎯 Next steps:"
echo "   1. Close Issue #1 as completed"
echo "   2. Start working on Issue #2: Authentication screens" 