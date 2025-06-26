#!/usr/bin/env python3
"""
Create GitHub issues for Remaining Frontend Development Tasks
"""

import json
import subprocess
import sys
from datetime import datetime, timedelta

# GitHub repository
REPO = "isaacbuz/GariPamoja"

# Remaining Issues
remaining_issues = [
    {
        "title": "Issue #8: User Profile and Settings",
        "body": """## 🎯 Issue #8: User Profile and Settings
**Priority**: High | **Estimated Time**: 3-4 days

### 📋 Description
Enhance user profile management with comprehensive settings, preferences, and account controls.

### 🎨 Components to Create
- [ ] Enhanced ProfileScreen with more user details
- [ ] SettingsScreen for app preferences
- [ ] EditProfileScreen for profile editing
- [ ] PrivacySettingsScreen for privacy controls
- [ ] NotificationSettingsScreen for notification preferences

### ⚙️ Features to Implement
- [ ] Profile photo upload and management
- [ ] User preferences and settings storage
- [ ] Privacy controls and data management
- [ ] Notification preferences
- [ ] Account security settings
- [ ] Language and region settings
- [ ] Theme preferences (light/dark mode)

### 🔧 Technical Requirements
- [ ] Image picker integration for profile photos
- [ ] AsyncStorage for user preferences
- [ ] Settings validation and persistence
- [ ] Profile update API integration
- [ ] Form validation and error handling
- [ ] Loading states and user feedback

### ✅ Acceptance Criteria
- [ ] Users can upload and manage profile photos
- [ ] All settings are properly saved and persisted
- [ ] Privacy controls work correctly
- [ ] Notification preferences are functional
- [ ] Theme switching works smoothly
- [ ] Form validation prevents invalid data
- [ ] Loading states provide good UX

### 📱 UI/UX Requirements
- Follow Material Design guidelines
- Responsive design for all screen sizes
- Smooth animations and transitions
- Accessibility features implemented
- Error states with helpful messages

### 🧪 Testing Requirements
- [ ] Unit tests for all components
- [ ] Integration tests for API calls
- [ ] E2E tests for critical user flows
- [ ] Accessibility testing

**Labels**: `frontend`, `user-profile`, `settings`, `priority:high`
**Milestone**: Core User Features""",
        "labels": ["frontend", "user-profile", "settings", "priority:high"],
        "milestone": "Core User Features"
    },
    {
        "title": "Issue #9: Reviews and Ratings",
        "body": """## 🎯 Issue #9: Reviews and Ratings
**Priority**: High | **Estimated Time**: 4-5 days

### 📋 Description
Implement a comprehensive review and rating system for cars and users to build trust and community.

### 🎨 Components to Create
- [ ] ReviewScreen for submitting reviews
- [ ] RatingComponent for star ratings
- [ ] ReviewList component for displaying reviews
- [ ] ReviewCard component for individual reviews
- [ ] RatingSummary component for aggregated ratings

### ⚙️ Features to Implement
- [ ] Star rating system (1-5 stars)
- [ ] Review submission with text and photos
- [ ] Review moderation and approval
- [ ] Review filtering and sorting
- [ ] Review helpfulness voting
- [ ] Review response from car owners
- [ ] Rating calculations and statistics

### 🔧 Technical Requirements
- [ ] Rating validation and submission
- [ ] Review moderation workflow
- [ ] Photo upload for reviews
- [ ] Review analytics and reporting
- [ ] Review search and filtering
- [ ] Rating aggregation algorithms

### ✅ Acceptance Criteria
- [ ] Users can submit reviews with ratings
- [ ] Photo upload works in reviews
- [ ] Review moderation system functions
- [ ] Rating calculations are accurate
- [ ] Review filtering and sorting work
- [ ] Review responses are functional
- [ ] Analytics provide useful insights

### 📱 UI/UX Requirements
- Intuitive star rating interface
- Smooth photo upload experience
- Clear review display and formatting
- Helpful review submission flow
- Responsive design for all devices

### 🧪 Testing Requirements
- [ ] Unit tests for rating components
- [ ] Integration tests for review submission
- [ ] E2E tests for review workflow
- [ ] Performance testing for large review lists

**Labels**: `frontend`, `reviews`, `ratings`, `priority:high`
**Milestone**: Core User Features""",
        "labels": ["frontend", "reviews", "ratings", "priority:high"],
        "milestone": "Core User Features"
    },
    {
        "title": "Issue #10: Chat and Messaging",
        "body": """## 🎯 Issue #10: Chat and Messaging
**Priority**: High | **Estimated Time**: 5-6 days

### 📋 Description
Implement real-time chat and messaging system for communication between car owners and renters.

### 🎨 Components to Create
- [ ] ChatScreen for real-time messaging
- [ ] ChatListScreen for chat conversations
- [ ] MessageComponent for individual messages
- [ ] ChatInput component for message input
- [ ] ChatHeader component with user info

### ⚙️ Features to Implement
- [ ] Real-time messaging using WebSocket
- [ ] Message history and persistence
- [ ] File and image sharing
- [ ] Message status (sent, delivered, read)
- [ ] Typing indicators
- [ ] Message search and filtering
- [ ] Push notifications for new messages
- [ ] Chat moderation and reporting

### 🔧 Technical Requirements
- [ ] WebSocket integration for real-time communication
- [ ] Message encryption and security
- [ ] File upload and sharing
- [ ] Push notification integration
- [ ] Message persistence and caching
- [ ] Message search functionality

### ✅ Acceptance Criteria
- [ ] Real-time messaging works smoothly
- [ ] Message history is preserved
- [ ] File sharing functions correctly
- [ ] Message status updates properly
- [ ] Push notifications work
- [ ] Search finds messages accurately
- [ ] Moderation tools are effective

### 📱 UI/UX Requirements
- Clean and intuitive chat interface
- Smooth message animations
- Clear message status indicators
- Easy file sharing interface
- Responsive design for all devices

### 🧪 Testing Requirements
- [ ] Unit tests for chat components
- [ ] Integration tests for WebSocket
- [ ] E2E tests for messaging flow
- [ ] Performance testing for large chat histories

**Labels**: `frontend`, `chat`, `messaging`, `priority:high`
**Milestone**: Core User Features""",
        "labels": ["frontend", "chat", "messaging", "priority:high"],
        "milestone": "Core User Features"
    },
    {
        "title": "Issue #11: Notifications",
        "body": """## 🎯 Issue #11: Notifications
**Priority**: Medium | **Estimated Time**: 3-4 days

### 📋 Description
Implement comprehensive notification system with push notifications and in-app notification center.

### 🎨 Components to Create
- [ ] NotificationScreen for notification center
- [ ] NotificationBadge component
- [ ] NotificationSettings component
- [ ] NotificationItem component

### ⚙️ Features to Implement
- [ ] Push notification setup and configuration
- [ ] In-app notification center
- [ ] Notification preferences and categories
- [ ] Notification history and management
- [ ] Notification actions and deep linking
- [ ] Silent notifications for background updates

### 🔧 Technical Requirements
- [ ] Push notification service integration
- [ ] Notification permission handling
- [ ] Background notification processing
- [ ] Notification analytics and tracking
- [ ] Notification categorization
- [ ] Deep linking from notifications

### ✅ Acceptance Criteria
- [ ] Push notifications are delivered
- [ ] In-app notification center works
- [ ] Notification preferences are respected
- [ ] Deep linking functions correctly
- [ ] Notification history is maintained
- [ ] Analytics provide useful data

### 📱 UI/UX Requirements
- Clear notification display
- Easy notification management
- Intuitive settings interface
- Smooth notification animations
- Accessibility features

### 🧪 Testing Requirements
- [ ] Unit tests for notification components
- [ ] Integration tests for push notifications
- [ ] E2E tests for notification flow
- [ ] Cross-platform testing

**Labels**: `frontend`, `notifications`, `priority:medium`
**Milestone**: Enhanced Features""",
        "labels": ["frontend", "notifications", "priority:medium"],
        "milestone": "Enhanced Features"
    },
    {
        "title": "Issue #12: Maps and Location",
        "body": """## 🎯 Issue #12: Maps and Location
**Priority**: Medium | **Estimated Time**: 4-5 days

### 📋 Description
Integrate maps and location services for car location display, navigation, and location-based features.

### 🎨 Components to Create
- [ ] MapScreen for car location display
- [ ] LocationPicker for address selection
- [ ] NavigationComponent for directions
- [ ] MapMarker component for car locations
- [ ] LocationSearch component

### ⚙️ Features to Implement
- [ ] Interactive map with car locations
- [ ] Address search and geocoding
- [ ] Navigation and directions
- [ ] Location-based car filtering
- [ ] Pickup/dropoff location selection
- [ ] Real-time location tracking
- [ ] Offline map support

### 🔧 Technical Requirements
- [ ] Map provider integration (Google Maps/Mapbox)
- [ ] Geolocation services
- [ ] Geocoding and reverse geocoding
- [ ] Offline map caching
- [ ] Location permission handling
- [ ] Navigation API integration

### ✅ Acceptance Criteria
- [ ] Maps display car locations correctly
- [ ] Address search works accurately
- [ ] Navigation provides correct directions
- [ ] Location filtering functions
- [ ] Offline maps work
- [ ] Permissions are handled properly

### 📱 UI/UX Requirements
- Smooth map interactions
- Clear location markers
- Intuitive search interface
- Responsive map controls
- Loading states for map operations

### 🧪 Testing Requirements
- [ ] Unit tests for map components
- [ ] Integration tests for location services
- [ ] E2E tests for navigation flow
- [ ] Performance testing for map rendering

**Labels**: `frontend`, `maps`, `location`, `priority:medium`
**Milestone**: Enhanced Features""",
        "labels": ["frontend", "maps", "location", "priority:medium"],
        "milestone": "Enhanced Features"
    },
    {
        "title": "Issue #13: Offline Support",
        "body": """## 🎯 Issue #13: Offline Support
**Priority**: Medium | **Estimated Time**: 4-5 days

### 📋 Description
Implement offline functionality and data synchronization for better user experience without internet.

### 🎨 Components to Create
- [ ] OfflineManager for data synchronization
- [ ] DataSync component for sync status
- [ ] OfflineIndicator component
- [ ] OfflineDataScreen for offline content

### ⚙️ Features to Implement
- [ ] Offline data storage and caching
- [ ] Data synchronization when online
- [ ] Offline booking creation and queuing
- [ ] Offline content browsing
- [ ] Sync status indicators
- [ ] Conflict resolution for offline changes

### 🔧 Technical Requirements
- [ ] AsyncStorage for offline data
- [ ] Background sync implementation
- [ ] Conflict detection and resolution
- [ ] Network status monitoring
- [ ] Data versioning and migration
- [ ] Queue management for offline actions

### ✅ Acceptance Criteria
- [ ] App works offline
- [ ] Data syncs when online
- [ ] Offline bookings are queued
- [ ] Conflicts are resolved properly
- [ ] Sync status is clear to users
- [ ] Performance is maintained

### 📱 UI/UX Requirements
- Clear offline indicators
- Smooth sync status updates
- Intuitive conflict resolution
- Responsive offline experience
- Helpful offline messaging

### 🧪 Testing Requirements
- [ ] Unit tests for offline components
- [ ] Integration tests for sync
- [ ] E2E tests for offline flow
- [ ] Network simulation testing

**Labels**: `frontend`, `offline`, `sync`, `priority:medium`
**Milestone**: Enhanced Features""",
        "labels": ["frontend", "offline", "sync", "priority:medium"],
        "milestone": "Enhanced Features"
    },
    {
        "title": "Issue #14: Advanced Search and Filters",
        "body": """## 🎯 Issue #14: Advanced Search and Filters
**Priority**: Low | **Estimated Time**: 3-4 days

### 📋 Description
Enhance search functionality with advanced filters, sorting, and search optimization.

### 🎨 Components to Create
- [ ] AdvancedSearchScreen with advanced filters
- [ ] FilterComponent for filter options
- [ ] SortComponent for sorting options
- [ ] SearchHistory component
- [ ] SavedSearches component

### ⚙️ Features to Implement
- [ ] Advanced filtering options (price, location, features, etc.)
- [ ] Search result sorting
- [ ] Search history and saved searches
- [ ] Filter presets and quick filters
- [ ] Search suggestions and autocomplete
- [ ] Filter analytics and optimization

### 🔧 Technical Requirements
- [ ] Advanced search API integration
- [ ] Filter state management
- [ ] Search optimization and caching
- [ ] Filter analytics tracking
- [ ] Search suggestion algorithms
- [ ] Filter persistence

### ✅ Acceptance Criteria
- [ ] Advanced filters work correctly
- [ ] Search sorting functions
- [ ] Search history is maintained
- [ ] Saved searches work
- [ ] Suggestions are helpful
- [ ] Performance is optimized

### 📱 UI/UX Requirements
- Intuitive filter interface
- Clear search results
- Easy filter management
- Responsive filter controls
- Smooth search animations

### 🧪 Testing Requirements
- [ ] Unit tests for search components
- [ ] Integration tests for search API
- [ ] E2E tests for search flow
- [ ] Performance testing for large results

**Labels**: `frontend`, `search`, `filters`, `priority:low`
**Milestone**: Polish & Launch""",
        "labels": ["frontend", "search", "filters", "priority:low"],
        "milestone": "Polish & Launch"
    },
    {
        "title": "Issue #15: Social Features",
        "body": """## 🎯 Issue #15: Social Features
**Priority**: Low | **Estimated Time**: 3-4 days

### 📋 Description
Add social features like sharing, referrals, and social login to increase user engagement.

### 🎨 Components to Create
- [ ] ShareComponent for social sharing
- [ ] ReferralScreen for referral system
- [ ] SocialLogin component
- [ ] SocialFeed component

### ⚙️ Features to Implement
- [ ] Social media sharing
- [ ] Referral system with rewards
- [ ] Social login integration
- [ ] User recommendations
- [ ] Social proof and testimonials
- [ ] Community features

### 🔧 Technical Requirements
- [ ] Social media SDK integration
- [ ] Referral tracking and analytics
- [ ] Social login providers
- [ ] Sharing API integration
- [ ] Referral reward system
- [ ] Social analytics

### ✅ Acceptance Criteria
- [ ] Social sharing works
- [ ] Referral system functions
- [ ] Social login integrates properly
- [ ] Recommendations are relevant
- [ ] Analytics provide insights
- [ ] Rewards are distributed correctly

### 📱 UI/UX Requirements
- Intuitive sharing interface
- Clear referral process
- Smooth social login flow
- Engaging social features
- Responsive social components

### 🧪 Testing Requirements
- [ ] Unit tests for social components
- [ ] Integration tests for social APIs
- [ ] E2E tests for social flow
- [ ] Cross-platform social testing

**Labels**: `frontend`, `social`, `sharing`, `priority:low`
**Milestone**: Polish & Launch""",
        "labels": ["frontend", "social", "sharing", "priority:low"],
        "milestone": "Polish & Launch"
    },
    {
        "title": "Issue #16: Analytics and Insights",
        "body": """## 🎯 Issue #16: Analytics and Insights
**Priority**: Low | **Estimated Time**: 2-3 days

### 📋 Description
Implement analytics and insights for user behavior tracking and business intelligence.

### 🎨 Components to Create
- [ ] AnalyticsScreen for user insights
- [ ] InsightsComponent for data visualization
- [ ] UsageStats component
- [ ] PerformanceMetrics component

### ⚙️ Features to Implement
- [ ] User behavior analytics
- [ ] Booking analytics and insights
- [ ] Performance metrics tracking
- [ ] Error tracking and reporting
- [ ] User engagement analytics
- [ ] Business intelligence dashboard

### 🔧 Technical Requirements
- [ ] Analytics service integration
- [ ] Event tracking and monitoring
- [ ] Data visualization libraries
- [ ] Performance monitoring tools
- [ ] Error reporting system
- [ ] Analytics dashboard

### ✅ Acceptance Criteria
- [ ] Analytics data is collected
- [ ] Insights are displayed correctly
- [ ] Performance metrics are tracked
- [ ] Errors are reported properly
- [ ] Dashboard provides useful insights
- [ ] Data is accurate and timely

### 📱 UI/UX Requirements
- Clear data visualization
- Intuitive dashboard interface
- Responsive analytics display
- Easy data exploration
- Professional reporting interface

### 🧪 Testing Requirements
- [ ] Unit tests for analytics components
- [ ] Integration tests for analytics services
- [ ] E2E tests for analytics flow
- [ ] Data accuracy testing

**Labels**: `frontend`, `analytics`, `insights`, `priority:low`
**Milestone**: Polish & Launch""",
        "labels": ["frontend", "analytics", "insights", "priority:low"],
        "milestone": "Polish & Launch"
    },
    {
        "title": "Issue #17: Testing and Optimization",
        "body": """## 🎯 Issue #17: Testing and Optimization
**Priority**: Medium | **Estimated Time**: 5-6 days

### 📋 Description
Comprehensive testing and performance optimization for production readiness.

### 🧪 Testing Requirements
- [ ] Unit tests for all components
- [ ] Integration tests for API calls
- [ ] E2E tests for user flows
- [ ] Performance testing
- [ ] Accessibility testing
- [ ] Cross-platform testing

### ⚡ Optimization Requirements
- [ ] Code splitting and lazy loading
- [ ] Bundle size optimization
- [ ] Performance optimization
- [ ] Memory leak detection
- [ ] Image optimization
- [ ] Caching strategies

### 🔧 Technical Requirements
- [ ] Jest testing framework setup
- [ ] React Native Testing Library
- [ ] Detox for E2E testing
- [ ] Performance monitoring tools
- [ ] Bundle analyzer integration
- [ ] Memory profiling tools

### ✅ Acceptance Criteria
- [ ] All components have unit tests
- [ ] Integration tests cover API flows
- [ ] E2E tests cover critical paths
- [ ] Performance meets targets
- [ ] Accessibility standards met
- [ ] Bundle size is optimized
- [ ] No memory leaks detected

### 📱 Quality Standards
- 90%+ test coverage
- Sub-3 second app launch time
- Smooth 60fps animations
- WCAG 2.1 AA accessibility
- Cross-platform compatibility
- Memory usage under 100MB

### 🧪 Testing Strategy
- [ ] Automated testing pipeline
- [ ] Continuous integration setup
- [ ] Performance regression testing
- [ ] Accessibility compliance testing
- [ ] Cross-device testing

**Labels**: `frontend`, `testing`, `optimization`, `priority:medium`
**Milestone**: Polish & Launch""",
        "labels": ["frontend", "testing", "optimization", "priority:medium"],
        "milestone": "Polish & Launch"
    }
]

def run_command(cmd):
    """Run a shell command and return the output"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.stdout.strip(), result.stderr.strip(), result.returncode
    except Exception as e:
        return "", str(e), 1

def create_milestone(milestone_title):
    """Create a milestone and return its number"""
    milestone_data = {
        "title": milestone_title,
        "description": f"Milestone for {milestone_title}",
        "state": "open"
    }
    
    cmd = f'gh api repos/{REPO}/milestones --method POST --field title="{milestone_title}" --field description="Milestone for {milestone_title}" --field state="open"'
    stdout, stderr, returncode = run_command(cmd)
    
    if returncode == 0:
        try:
            milestone = json.loads(stdout)
            return milestone["number"]
        except:
            return None
    else:
        print(f"Error creating milestone: {stderr}")
        return None

def get_milestone_number(milestone_title):
    """Get milestone number by title"""
    cmd = f'gh api repos/{REPO}/milestones --method GET'
    stdout, stderr, returncode = run_command(cmd)
    
    if returncode == 0:
        try:
            milestones = json.loads(stdout)
            for milestone in milestones:
                if milestone["title"] == milestone_title:
                    return milestone["number"]
        except:
            pass
    
    # Create milestone if it doesn't exist
    return create_milestone(milestone_title)

def create_issue(issue, milestone_number):
    """Create a GitHub issue"""
    labels_str = ",".join(issue["labels"])
    
    cmd = f'''gh api repos/{REPO}/issues --method POST --field title="{issue["title"]}" --field body="{issue["body"]}" --field labels='[{labels_str}]' --field milestone="{milestone_number}"'''
    
    stdout, stderr, returncode = run_command(cmd)
    
    if returncode == 0:
        try:
            created_issue = json.loads(stdout)
            print(f"✅ Created issue: {created_issue['title']} (#{created_issue['number']})")
            return created_issue["number"]
        except:
            print(f"❌ Error parsing response for issue: {issue['title']}")
            return None
    else:
        print(f"❌ Error creating issue '{issue['title']}': {stderr}")
        return None

def main():
    """Main function to create all remaining issues"""
    print("🚀 Creating GitHub issues for remaining frontend development tasks...")
    print(f"📁 Repository: {REPO}")
    print("=" * 60)
    
    # Check if gh CLI is installed
    stdout, stderr, returncode = run_command("gh --version")
    if returncode != 0:
        print("❌ GitHub CLI (gh) is not installed. Please install it first.")
        print("📖 Installation guide: https://cli.github.com/")
        return
    
    # Check if authenticated
    stdout, stderr, returncode = run_command("gh auth status")
    if returncode != 0:
        print("❌ Not authenticated with GitHub CLI. Please run 'gh auth login' first.")
        return
    
    created_count = 0
    total_count = len(remaining_issues)
    
    for issue in remaining_issues:
        print(f"\n📝 Creating issue: {issue['title']}")
        
        # Get or create milestone
        milestone_number = get_milestone_number(issue["milestone"])
        if milestone_number is None:
            print(f"⚠️  Skipping issue due to milestone error: {issue['title']}")
            continue
        
        # Create issue
        issue_number = create_issue(issue, milestone_number)
        if issue_number:
            created_count += 1
        
        print("-" * 40)
    
    print(f"\n🎉 Summary:")
    print(f"✅ Successfully created: {created_count}/{total_count} issues")
    print(f"📊 Progress: 7/17 issues completed (41.18%)")
    print(f"📋 Remaining: {total_count} issues")
    
    if created_count > 0:
        print(f"\n🔗 View issues at: https://github.com/{REPO}/issues")
        print(f"📅 Next recommended: Issue #8 (User Profile and Settings)")

if __name__ == "__main__":
    main() 