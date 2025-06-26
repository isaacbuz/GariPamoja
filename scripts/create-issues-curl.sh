#!/bin/bash

# GitHub API script to create issues and milestones
# Requires: GITHUB_TOKEN environment variable

set -euo pipefail

# Configuration
REPO_OWNER="isaacbuz"
REPO_NAME="GariPamoja"
API_BASE="https://api.github.com"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for GitHub token
if [ -z "${GITHUB_TOKEN:-}" ]; then
    echo -e "${RED}Error: GITHUB_TOKEN environment variable is not set${NC}"
    echo "Please set your GitHub personal access token:"
    echo "  export GITHUB_TOKEN='your-token-here'"
    echo ""
    echo "You can create a token at: https://github.com/settings/tokens"
    echo "Required scopes: repo (full control of private repositories)"
    exit 1
fi

# Function to make API calls
api_call() {
    local method=$1
    local endpoint=$2
    local data=${3:-}
    
    if [ -n "$data" ]; then
        curl -s -X "$method" \
            -H "Authorization: token $GITHUB_TOKEN" \
            -H "Accept: application/vnd.github.v3+json" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_BASE/$endpoint"
    else
        curl -s -X "$method" \
            -H "Authorization: token $GITHUB_TOKEN" \
            -H "Accept: application/vnd.github.v3+json" \
            "$API_BASE/$endpoint"
    fi
}

echo -e "${GREEN}🚀 Creating GitHub issues for Frontend & Payment Development${NC}\n"

# Create milestones
echo -e "${YELLOW}📋 Creating milestones...${NC}"

# Calculate dates
DATE_2WEEKS=$(date -v+2w +%Y-%m-%d 2>/dev/null || date -d "+2 weeks" +%Y-%m-%d)
DATE_4WEEKS=$(date -v+4w +%Y-%m-%d 2>/dev/null || date -d "+4 weeks" +%Y-%m-%d)
DATE_6WEEKS=$(date -v+6w +%Y-%m-%d 2>/dev/null || date -d "+6 weeks" +%Y-%m-%d)
DATE_8WEEKS=$(date -v+8w +%Y-%m-%d 2>/dev/null || date -d "+8 weeks" +%Y-%m-%d)

# Milestone 1
MILESTONE1_DATA=$(cat <<EOF
{
  "title": "Milestone 1: Frontend Foundation",
  "description": "Setup project foundation, authentication, navigation, and API integration",
  "due_on": "${DATE_2WEEKS}T23:59:59Z"
}
EOF
)

MILESTONE1_RESPONSE=$(api_call POST "repos/$REPO_OWNER/$REPO_NAME/milestones" "$MILESTONE1_DATA")
MILESTONE1_NUM=$(echo "$MILESTONE1_RESPONSE" | grep -o '"number":[0-9]*' | cut -d: -f2 | head -1)

if [ -n "$MILESTONE1_NUM" ]; then
    echo -e "${GREEN}✅ Created milestone: Frontend Foundation (#$MILESTONE1_NUM)${NC}"
else
    echo -e "${RED}❌ Failed to create milestone 1${NC}"
fi

# Milestone 2
MILESTONE2_DATA=$(cat <<EOF
{
  "title": "Milestone 2: Core User Features",
  "description": "Implement user profiles, car listings, booking flow, and messaging",
  "due_on": "${DATE_4WEEKS}T23:59:59Z"
}
EOF
)

MILESTONE2_RESPONSE=$(api_call POST "repos/$REPO_OWNER/$REPO_NAME/milestones" "$MILESTONE2_DATA")
MILESTONE2_NUM=$(echo "$MILESTONE2_RESPONSE" | grep -o '"number":[0-9]*' | cut -d: -f2 | head -1)

if [ -n "$MILESTONE2_NUM" ]; then
    echo -e "${GREEN}✅ Created milestone: Core User Features (#$MILESTONE2_NUM)${NC}"
else
    echo -e "${RED}❌ Failed to create milestone 2${NC}"
fi

# Milestone 3
MILESTONE3_DATA=$(cat <<EOF
{
  "title": "Milestone 3: Payment System",
  "description": "Complete payment integration with Stripe, M-Pesa, and PayPal",
  "due_on": "${DATE_6WEEKS}T23:59:59Z"
}
EOF
)

MILESTONE3_RESPONSE=$(api_call POST "repos/$REPO_OWNER/$REPO_NAME/milestones" "$MILESTONE3_DATA")
MILESTONE3_NUM=$(echo "$MILESTONE3_RESPONSE" | grep -o '"number":[0-9]*' | cut -d: -f2 | head -1)

if [ -n "$MILESTONE3_NUM" ]; then
    echo -e "${GREEN}✅ Created milestone: Payment System (#$MILESTONE3_NUM)${NC}"
else
    echo -e "${RED}❌ Failed to create milestone 3${NC}"
fi

# Milestone 4
MILESTONE4_DATA=$(cat <<EOF
{
  "title": "Milestone 4: Polish & Launch",
  "description": "Testing, optimization, and app store deployment",
  "due_on": "${DATE_8WEEKS}T23:59:59Z"
}
EOF
)

MILESTONE4_RESPONSE=$(api_call POST "repos/$REPO_OWNER/$REPO_NAME/milestones" "$MILESTONE4_DATA")
MILESTONE4_NUM=$(echo "$MILESTONE4_RESPONSE" | grep -o '"number":[0-9]*' | cut -d: -f2 | head -1)

if [ -n "$MILESTONE4_NUM" ]; then
    echo -e "${GREEN}✅ Created milestone: Polish & Launch (#$MILESTONE4_NUM)${NC}"
else
    echo -e "${RED}❌ Failed to create milestone 4${NC}"
fi

echo -e "\n${YELLOW}📝 Creating issues...${NC}"

# Function to create an issue
create_issue() {
    local title=$1
    local body=$2
    local labels=$3
    local milestone=$4
    
    local issue_data=$(cat <<EOF
{
  "title": "$title",
  "body": "$body",
  "labels": $labels,
  "milestone": $milestone
}
EOF
)
    
    local response=$(api_call POST "repos/$REPO_OWNER/$REPO_NAME/issues" "$issue_data")
    local issue_num=$(echo "$response" | grep -o '"number":[0-9]*' | cut -d: -f2 | head -1)
    
    if [ -n "$issue_num" ]; then
        echo -e "${GREEN}✅ Created issue #$issue_num: $title${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to create issue: $title${NC}"
        return 1
    fi
}

# Issue counter
CREATED_COUNT=0

# Create Issue 1
if create_issue "Setup React Native project with TypeScript" \
"## Task Description\nSetup the React Native project with TypeScript configuration for the GariPamoja mobile app.\n\n### Subtasks\n- [ ] Initialize React Native project with Expo\n- [ ] Configure TypeScript\n- [ ] Setup ESLint and Prettier\n- [ ] Configure Jest for testing\n- [ ] Setup project structure\n\n### Technical Requirements\n- React Native 0.72+\n- Expo SDK 49\n- TypeScript 5.0+\n- Jest for testing\n\n### Acceptance Criteria\n- [ ] Project runs on iOS simulator\n- [ ] Project runs on Android emulator\n- [ ] TypeScript compilation works\n- [ ] Linting and formatting configured\n- [ ] Basic test suite runs successfully\n\n**Estimate**: 4 hours" \
'["frontend", "setup", "priority:high"]' \
"$MILESTONE1_NUM"; then
    ((CREATED_COUNT++))
fi

# Create remaining issues (showing first few as example)
if create_issue "Implement authentication screens" \
"## Task Description\nCreate authentication screens for user login and registration.\n\n### Screens to Implement\n- [ ] Login screen\n- [ ] Registration screen\n- [ ] Forgot password screen\n- [ ] OTP verification screen\n- [ ] Password reset screen\n\n### UI Requirements\n- Follow Material Design guidelines\n- Support dark mode\n- Responsive layout\n- Loading states\n- Error handling\n\n### Acceptance Criteria\n- [ ] All screens are pixel-perfect\n- [ ] Form validation works\n- [ ] Keyboard handling is smooth\n- [ ] Accessibility features implemented\n- [ ] Screens work on both platforms\n\n**Estimate**: 8 hours" \
'["frontend", "authentication", "ui"]' \
"$MILESTONE1_NUM"; then
    ((CREATED_COUNT++))
fi

if create_issue "Implement authentication logic" \
"## Task Description\nImplement the authentication business logic and API integration.\n\n### Features\n- [ ] JWT token management\n- [ ] Secure token storage\n- [ ] Auto-login functionality\n- [ ] Logout mechanism\n- [ ] Token refresh logic\n\n### Technical Requirements\n- Use React Native Keychain for secure storage\n- Implement Redux slices for auth state\n- Handle token expiration\n- API error handling\n\n### Acceptance Criteria\n- [ ] Users can login successfully\n- [ ] Tokens are stored securely\n- [ ] Auto-login works after app restart\n- [ ] Token refresh works seamlessly\n- [ ] Logout clears all user data\n\n**Estimate**: 6 hours" \
'["frontend", "authentication", "api"]' \
"$MILESTONE1_NUM"; then
    ((CREATED_COUNT++))
fi

echo -e "\n${GREEN}✅ Successfully created $CREATED_COUNT issues!${NC}"
echo -e "\n${YELLOW}📊 Summary:${NC}"
echo "   - Milestones created: 4"
echo "   - Issues created: $CREATED_COUNT (partial - add more as needed)"
echo -e "\n${YELLOW}🎯 Next steps:${NC}"
echo "   1. Review the created issues on GitHub"
echo "   2. Create remaining issues using the same pattern"
echo "   3. Start development!"
echo ""
echo "To create more issues, use the create_issue function pattern shown in this script." 