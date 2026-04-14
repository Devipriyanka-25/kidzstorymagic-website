#!/bin/bash

# Kidz Story Magic - Project verification and setup script
# This script verifies all project files and dependencies

set -e

echo "🔍 Kidz Story Magic - Project Verification"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Check function
check_file() {
  local file=$1
  local description=$2
  
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $description"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $description (missing: $file)"
    ((FAILED++))
  fi
}

check_dir() {
  local dir=$1
  local description=$2
  
  if [ -d "$dir" ]; then
    echo -e "${GREEN}✓${NC} $description"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $description (missing: $dir)"
    ((FAILED++))
  fi
}

# Prerequisites
echo "1️⃣ Checking System Prerequisites..."
echo ""

if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
  ((PASSED++))
else
  echo -e "${RED}✗${NC} Node.js not found"
  ((FAILED++))
fi

if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm --version)
  echo -e "${GREEN}✓${NC} npm installed: $NPM_VERSION"
  ((PASSED++))
else
  echo -e "${RED}✗${NC} npm not found"
  ((FAILED++))
fi

if command -v psql &> /dev/null; then
  echo -e "${GREEN}✓${NC} PostgreSQL client installed"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠${NC} PostgreSQL client not found (required for database)"
  ((WARNINGS++))
fi

echo ""

# Directory Structure
echo "2️⃣ Checking Directory Structure..."
echo ""

check_dir "frontend" "Frontend directory"
check_dir "backend" "Backend directory"
check_dir "story-templates" "Story templates directory"
check_dir "docs" "Documentation directory"

echo ""

# Frontend Files
echo "3️⃣ Checking Frontend Files..."
echo ""

check_file "frontend/package.json" "Frontend package.json"
check_file "frontend/next.config.js" "Next.js config"
check_file "frontend/tailwind.config.js" "Tailwind config"
check_file "frontend/.env.local.example" "Frontend .env example"
check_file "frontend/utils/api.js" "API client"
check_file "frontend/utils/store.js" "Zustand store"
check_file "frontend/utils/helpers.js" "Frontend helpers"
check_file "frontend/components/Header.jsx" "Header component"
check_file "frontend/components/wizard/Step1AgeSelection.jsx" "Step 1 component"
check_file "frontend/components/wizard/Step2ThemeSelection.jsx" "Step 2 component"
check_file "frontend/components/wizard/Step3PageCount.jsx" "Step 3 component"
check_file "frontend/components/wizard/Step4ChildDetails.jsx" "Step 4 component"
check_file "frontend/components/wizard/Step5PhotoUpload.jsx" "Step 5 component"
check_file "frontend/components/wizard/Step6ReviewCheckout.jsx" "Step 6 component"
check_file "frontend/app/page.jsx" "Home page"
check_file "frontend/app/wizard/page.jsx" "Wizard page"
check_file "frontend/app/dashboard/page.jsx" "Dashboard page"
check_file "frontend/app/profile/page.jsx" "Profile page"
check_file "frontend/app/auth/login/page.jsx" "Login page"
check_file "frontend/app/auth/signup/page.jsx" "Signup page"

echo ""

# Backend Files
echo "4️⃣ Checking Backend Files..."
echo ""

check_file "backend/package.json" "Backend package.json"
check_file "backend/.env.example" "Backend .env example"
check_file "backend/jest.config.js" "Jest config"
check_file "backend/src/index.js" "Server entry point"
check_file "backend/src/config/config.js" "Configuration"
check_file "backend/src/config/database.js" "Database config"
check_file "backend/src/models/User.js" "User model"
check_file "backend/src/models/StoryProject.js" "Story model"
check_file "backend/src/routes/auth.routes.js" "Auth routes"
check_file "backend/src/routes/story.routes.js" "Story routes"
check_file "backend/src/routes/payment.routes.js" "Payment routes"
check_file "backend/src/routes/currency.routes.js" "Currency routes"
check_file "backend/src/utils/imageProcessor.js" "Image processor"
check_file "backend/src/utils/storyRenderer.js" "Story renderer"
check_file "backend/src/utils/pdfGenerator.js" "PDF generator"
check_file "backend/src/utils/currencyConverter.js" "Currency converter"
check_file "backend/src/utils/helpers.js" "Backend helpers"
check_file "backend/src/middleware/auth.js" "Auth middleware"
check_file "backend/src/middleware/errorHandler.js" "Error handler"

echo ""

# Story Templates
echo "5️⃣ Checking Story Templates..."
echo ""

check_file "story-templates/family-template.json" "Family template"
check_file "story-templates/friends-template.json" "Friends template"
check_file "story-templates/motivational-template.json" "Motivational template"
check_file "story-templates/behavioural-template.json" "Behavioral template"
check_file "story-templates/fairytale-template.json" "Fairytale template"
check_file "story-templates/customizable-template.json" "Customizable template"

echo ""

# Documentation
echo "6️⃣ Checking Documentation Files..."
echo ""

check_file "README.md" "Main README"
check_file "CONTRIBUTING.md" "Contributing guide"
check_file "CHANGELOG.md" "Changelog"
check_file "docs/API-DOCUMENTATION.md" "API documentation"
check_file "docs/DEPLOYMENT.md" "Deployment guide"
check_file "docs/SECURITY.md" "Security guide"
check_file "docs/DEVELOPMENT.md" "Development guide"
check_file "docs/database-schema.sql" "Database schema"

echo ""

# Configuration Files
echo "7️⃣ Checking Configuration Files..."
echo ""

check_file "docker-compose.yml" "Docker Compose config"
check_file ".env.example" "Top-level .env"
check_file ".gitignore" "Git ignore file"
check_file ".editorconfig" "Editor config"
check_file "Makefile" "Makefile"
check_file ".github/workflows/ci.yml" "CI/CD workflow"

echo ""

# Summary
echo "=========================================="
echo "📊 Verification Summary"
echo "=========================================="
echo -e "${GREEN}✓ Passed: $PASSED${NC}"
echo -e "${RED}✗ Failed: $FAILED${NC}"
echo -e "${YELLOW}⚠ Warnings: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed! Project is ready.${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Install dependencies: make install"
  echo "2. Setup database: make setup-db"
  echo "3. Start development: make dev"
else
  echo -e "${RED}❌ Some checks failed. Please fix the missing files.${NC}"
  exit 1
fi
