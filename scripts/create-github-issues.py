#!/usr/bin/env python3
"""
Create GitHub issues for Frontend and Payment Development
"""

import json
import subprocess
import sys
from datetime import datetime, timedelta

# GitHub repository
REPO = "isaacbuz/GariPamoja"

# Milestones
milestones = [
    {
        "title": "Milestone 1: Frontend Foundation",
        "description": "Setup project foundation, authentication, navigation, and API integration",
        "due_date": (datetime.now() + timedelta(weeks=2)).strftime("%Y-%m-%d")
    },
    {
        "title": "Milestone 2: Core User Features",
        "description": "Implement user profiles, car listings, booking flow, and messaging",
        "due_date": (datetime.now() + timedelta(weeks=4)).strftime("%Y-%m-%d")
    },
    {
        "title": "Milestone 3: Payment System",
        "description": "Complete payment integration with Stripe, M-Pesa, and PayPal",
        "due_date": (datetime.now() + timedelta(weeks=6)).strftime("%Y-%m-%d")
    },
    {
        "title": "Milestone 4: Polish & Launch",
        "description": "Testing, optimization, and app store deployment",
        "due_date": (datetime.now() + timedelta(weeks=8)).strftime("%Y-%m-%d")
    }
]

# Issues
issues = [
    # Frontend Foundation
    {
        "title": "Setup React Native project with TypeScript",
        "body": """## Task Description
Setup the React Native project with TypeScript configuration for the GariPamoja mobile app.

### Subtasks
- [ ] Initialize React Native project with Expo
- [ ] Configure TypeScript
- [ ] Setup ESLint and Prettier
- [ ] Configure Jest for testing
- [ ] Setup project structure

### Technical Requirements
- React Native 0.72+
- Expo SDK 49
- TypeScript 5.0+
- Jest for testing

### Acceptance Criteria
- [ ] Project runs on iOS simulator
- [ ] Project runs on Android emulator
- [ ] TypeScript compilation works
- [ ] Linting and formatting configured
- [ ] Basic test suite runs successfully

**Estimate**: 4 hours""",
        "labels": ["frontend", "setup", "priority:high"],
        "milestone": 1
    },
    {
        "title": "Implement authentication screens",
        "body": """## Task Description
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

### Acceptance Criteria
- [ ] All screens are pixel-perfect
- [ ] Form validation works
- [ ] Keyboard handling is smooth
- [ ] Accessibility features implemented
- [ ] Screens work on both platforms

**Estimate**: 8 hours""",
        "labels": ["frontend", "authentication", "ui"],
        "milestone": 1
    },
    {
        "title": "Implement authentication logic",
        "body": """## Task Description
Implement the authentication business logic and API integration.

### Features
- [ ] JWT token management
- [ ] Secure token storage
- [ ] Auto-login functionality
- [ ] Logout mechanism
- [ ] Token refresh logic

### Technical Requirements
- Use React Native Keychain for secure storage
- Implement Redux slices for auth state
- Handle token expiration
- API error handling

### Acceptance Criteria
- [ ] Users can login successfully
- [ ] Tokens are stored securely
- [ ] Auto-login works after app restart
- [ ] Token refresh works seamlessly
- [ ] Logout clears all user data

**Estimate**: 6 hours""",
        "labels": ["frontend", "authentication", "api"],
        "milestone": 1
    },
    {
        "title": "Setup navigation structure",
        "body": """## Task Description
Implement the app navigation structure using React Navigation.

### Navigation Components
- [ ] Bottom tab navigation
- [ ] Stack navigators for each tab
- [ ] Drawer navigation for settings
- [ ] Modal navigation
- [ ] Deep linking support

### Screens Structure
```
- Auth Stack (unauthenticated)
  - Login
  - Register
  - Forgot Password
- Main Tabs (authenticated)
  - Home Stack
  - Search Stack
  - Bookings Stack
  - Messages Stack
  - Profile Stack
```

### Acceptance Criteria
- [ ] Navigation flows smoothly
- [ ] Deep linking works
- [ ] Navigation state persists
- [ ] Back button handling correct
- [ ] Gesture navigation works

**Estimate**: 6 hours""",
        "labels": ["frontend", "navigation", "architecture"],
        "milestone": 1
    },
    {
        "title": "Create user profile screens",
        "body": """## Task Description
Implement user profile management screens.

### Screens
- [ ] Profile view screen
- [ ] Edit profile screen
- [ ] KYC verification screen
- [ ] Settings screen
- [ ] Trust score display

### Features
- Profile photo upload
- Personal information editing
- Document upload for KYC
- Language preferences
- Notification settings

### Acceptance Criteria
- [ ] Profile data displays correctly
- [ ] Photo upload works
- [ ] Form validation implemented
- [ ] KYC document upload functional
- [ ] Settings save properly

**Estimate**: 8 hours""",
        "labels": ["frontend", "user-profile", "ui"],
        "milestone": 2
    },
    {
        "title": "Implement car listing screens",
        "body": """## Task Description
Create car listing and search functionality.

### Screens
- [ ] Car list view (grid/list toggle)
- [ ] Car detail view
- [ ] Search screen with filters
- [ ] Map view with car locations
- [ ] Car comparison screen

### Features
- Advanced search filters
- Sort options
- Favorite cars
- Share car listing
- Image gallery

### Acceptance Criteria
- [ ] List loads and scrolls smoothly
- [ ] Search returns relevant results
- [ ] Filters work correctly
- [ ] Map shows car locations
- [ ] Images load optimally

**Estimate**: 10 hours""",
        "labels": ["frontend", "car-listing", "ui"],
        "milestone": 2
    },
    {
        "title": "Create car booking flow",
        "body": """## Task Description
Implement the complete car booking workflow.

### Screens
- [ ] Date/time selection
- [ ] Pickup/return location
- [ ] Booking summary
- [ ] Add-ons selection
- [ ] Booking confirmation

### Features
- Calendar component
- Time slot selection
- Location picker
- Price calculation
- Booking management

### Acceptance Criteria
- [ ] Date selection works smoothly
- [ ] Price updates dynamically
- [ ] Location selection functional
- [ ] Booking creates successfully
- [ ] Confirmation shows details

**Estimate**: 10 hours""",
        "labels": ["frontend", "booking", "ui"],
        "milestone": 2
    },
    {
        "title": "Build messaging system",
        "body": """## Task Description
Implement in-app messaging between users.

### Features
- [ ] Chat UI with message bubbles
- [ ] Real-time messaging
- [ ] Push notifications
- [ ] Message status indicators
- [ ] Media sharing

### Technical Requirements
- WebSocket connection
- Message persistence
- Offline message queue
- Push notification integration
- Image/file uploads

### Acceptance Criteria
- [ ] Messages send/receive in real-time
- [ ] Chat history loads correctly
- [ ] Notifications work
- [ ] Offline messages queue
- [ ] Media uploads work

**Estimate**: 12 hours""",
        "labels": ["frontend", "messaging", "realtime"],
        "milestone": 2
    },
    {
        "title": "Integrate AI chatbot",
        "body": """## Task Description
Integrate the AI chatbot for customer support.

### Features
- [ ] Chatbot UI component
- [ ] API integration
- [ ] Multi-language support
- [ ] Context handling
- [ ] Quick replies

### UI Requirements
- Floating chatbot button
- Chat interface
- Typing indicators
- Suggested responses
- Language switcher

### Acceptance Criteria
- [ ] Chatbot responds correctly
- [ ] Language switching works
- [ ] Context maintained in conversation
- [ ] UI is intuitive
- [ ] Error handling implemented

**Estimate**: 8 hours""",
        "labels": ["frontend", "ai", "chatbot"],
        "milestone": 2
    },
    {
        "title": "Create payment screens",
        "body": """## Task Description
Design and implement payment UI screens.

### Screens
- [ ] Payment method selection
- [ ] Credit/debit card form
- [ ] Mobile money input
- [ ] PayPal integration
- [ ] Payment confirmation

### UI Components
- Payment method cards
- Secure card input
- CVV helper
- Amount display
- Success/failure screens

### Acceptance Criteria
- [ ] Payment UI is intuitive
- [ ] Card input is secure
- [ ] Validation works properly
- [ ] Loading states implemented
- [ ] Error messages clear

**Estimate**: 8 hours""",
        "labels": ["frontend", "payment", "ui"],
        "milestone": 3
    },
    {
        "title": "Implement Stripe payment flow",
        "body": """## Task Description
Integrate Stripe for card payments.

### Implementation
- [ ] Stripe SDK integration
- [ ] Card tokenization
- [ ] Payment intent creation
- [ ] 3D Secure handling
- [ ] Payment confirmation

### Technical Requirements
- PCI compliance
- Test mode implementation
- Error handling
- Webhook integration
- Receipt generation

### Acceptance Criteria
- [ ] Card payments process successfully
- [ ] 3D Secure works when required
- [ ] Errors handled gracefully
- [ ] Receipts generated
- [ ] Test cards work

**Estimate**: 10 hours""",
        "labels": ["payment", "stripe", "integration"],
        "milestone": 3
    },
    {
        "title": "Implement M-Pesa payment flow",
        "body": """## Task Description
Integrate M-Pesa for mobile money payments.

### Features
- [ ] STK push implementation
- [ ] Phone number validation
- [ ] Payment status polling
- [ ] Callback handling
- [ ] Transaction verification

### Technical Requirements
- Daraja API integration
- Secure credential storage
- Timeout handling
- Retry mechanism
- Transaction logging

### Acceptance Criteria
- [ ] STK push triggers correctly
- [ ] Payment status updates
- [ ] Callbacks processed
- [ ] Errors handled properly
- [ ] Transactions verified

**Estimate**: 12 hours""",
        "labels": ["payment", "mpesa", "integration"],
        "milestone": 3
    },
    {
        "title": "Implement PayPal payment flow",
        "body": """## Task Description
Integrate PayPal for payments.

### Implementation
- [ ] PayPal SDK setup
- [ ] OAuth integration
- [ ] Payment processing
- [ ] Refund handling
- [ ] Subscription support

### Features
- PayPal button
- In-app browser flow
- Payment confirmation
- Error handling
- Transaction history

### Acceptance Criteria
- [ ] PayPal login works
- [ ] Payments process successfully
- [ ] Refunds can be initiated
- [ ] Errors handled gracefully
- [ ] Transaction history accurate

**Estimate**: 8 hours""",
        "labels": ["payment", "paypal", "integration"],
        "milestone": 3
    },
    {
        "title": "Build transaction features",
        "body": """## Task Description
Implement transaction management features.

### Features
- [ ] Transaction history screen
- [ ] Receipt generation
- [ ] Refund request flow
- [ ] Payment analytics
- [ ] Export functionality

### UI Components
- Transaction list
- Transaction details
- Receipt view
- Refund form
- Analytics charts

### Acceptance Criteria
- [ ] History loads correctly
- [ ] Receipts generate properly
- [ ] Refunds can be requested
- [ ] Analytics display accurately
- [ ] Export works

**Estimate**: 8 hours""",
        "labels": ["frontend", "payment", "transactions"],
        "milestone": 3
    },
    {
        "title": "Implement comprehensive testing",
        "body": """## Task Description
Create comprehensive test suite for the app.

### Test Types
- [ ] Unit tests for utilities
- [ ] Component tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Payment flow tests

### Coverage Areas
- Authentication flows
- Booking process
- Payment integration
- API interactions
- Error scenarios

### Acceptance Criteria
- [ ] 80% code coverage
- [ ] All critical paths tested
- [ ] E2E tests pass
- [ ] Payment tests comprehensive
- [ ] CI integration working

**Estimate**: 16 hours""",
        "labels": ["testing", "quality", "priority:high"],
        "milestone": 4
    },
    {
        "title": "Optimize app performance",
        "body": """## Task Description
Optimize app performance and reduce bundle size.

### Optimization Areas
- [ ] Image optimization
- [ ] Lazy loading implementation
- [ ] Cache management
- [ ] Bundle size reduction
- [ ] Memory leak fixes

### Performance Targets
- App launch < 3 seconds
- List scroll at 60 FPS
- Bundle size < 40MB
- Memory usage < 200MB
- No memory leaks

### Acceptance Criteria
- [ ] Performance targets met
- [ ] No janky animations
- [ ] Images load quickly
- [ ] App feels responsive
- [ ] Memory usage optimal

**Estimate**: 8 hours""",
        "labels": ["frontend", "performance", "optimization"],
        "milestone": 4
    },
    {
        "title": "Prepare for app stores",
        "body": """## Task Description
Prepare the app for App Store and Google Play submission.

### Tasks
- [ ] App store assets creation
- [ ] Release build configuration
- [ ] Code signing setup
- [ ] Store listings writing
- [ ] Beta testing setup

### Deliverables
- App icons (all sizes)
- Screenshots (all devices)
- App preview videos
- Store descriptions
- Privacy policy

### Acceptance Criteria
- [ ] All assets created
- [ ] Builds generated successfully
- [ ] Store listings complete
- [ ] Beta testing working
- [ ] Compliance checked

**Estimate**: 8 hours""",
        "labels": ["deployment", "release", "app-store"],
        "milestone": 4
    }
]

def run_command(cmd):
    """Run a shell command and return the output"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error: {result.stderr}")
            return None
        return result.stdout.strip()
    except Exception as e:
        print(f"Error running command: {e}")
        return None

def create_milestone(milestone):
    """Create a milestone using GitHub CLI"""
    cmd = f'''gh api repos/{REPO}/milestones \
        -X POST \
        -f title="{milestone['title']}" \
        -f description="{milestone['description']}" \
        -f due_on="{milestone['due_date']}T23:59:59Z"'''
    
    result = run_command(cmd)
    if result:
        data = json.loads(result)
        print(f"✅ Created milestone: {milestone['title']} (#{data['number']})")
        return data['number']
    return None

def create_issue(issue, milestone_number):
    """Create an issue using GitHub CLI"""
    labels = ','.join(issue['labels'])
    
    # Escape the body for shell command
    body = issue['body'].replace('"', '\\"').replace('\n', '\\n')
    
    cmd = f'''gh issue create \
        --repo {REPO} \
        --title "{issue['title']}" \
        --body "{body}" \
        --label "{labels}" \
        --milestone {milestone_number}'''
    
    result = run_command(cmd)
    if result:
        # Extract issue number from output
        issue_number = result.split('/')[-1]
        print(f"✅ Created issue #{issue_number}: {issue['title']}")
        return issue_number
    return None

def main():
    print("🚀 Creating GitHub issues for Frontend & Payment Development\n")
    
    # Check if gh CLI is installed
    if not run_command("which gh"):
        print("❌ GitHub CLI (gh) is not installed. Please install it first:")
        print("   brew install gh")
        print("   gh auth login")
        sys.exit(1)
    
    # Create milestones
    print("📋 Creating milestones...")
    milestone_numbers = {}
    for i, milestone in enumerate(milestones, 1):
        number = create_milestone(milestone)
        if number:
            milestone_numbers[i] = number
    
    print("\n📝 Creating issues...")
    
    # Create issues
    created_issues = []
    for issue in issues:
        milestone_num = milestone_numbers.get(issue['milestone'])
        if milestone_num:
            issue_num = create_issue(issue, milestone_num)
            if issue_num:
                created_issues.append(issue_num)
    
    print(f"\n✅ Successfully created {len(created_issues)} issues!")
    print("\n📊 Summary:")
    print(f"   - Milestones created: {len(milestone_numbers)}")
    print(f"   - Issues created: {len(created_issues)}")
    print("\n🎯 Next steps:")
    print("   1. Review the created issues on GitHub")
    print("   2. Assign team members")
    print("   3. Start development!")

if __name__ == "__main__":
    main() 