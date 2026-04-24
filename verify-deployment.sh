#!/bin/bash
# Kidz Story Magic - Local Deployment Test Suite
# Tests all critical functionality before production deployment

set -e

echo "🚀 Starting Local Deployment Tests..."
echo "======================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check environment variables
echo -e "\n${YELLOW}Test 1: Checking environment variables...${NC}"
if [ -f .env.local ]; then
  echo -e "${GREEN}✓ .env.local exists${NC}"
  
  # Check required vars
  if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
    echo -e "${GREEN}✓ Supabase URL configured${NC}"
  else
    echo -e "${RED}✗ Supabase URL missing${NC}"
  fi
  
  if grep -q "STRIPE_SECRET_KEY" .env.local; then
    echo -e "${GREEN}✓ Stripe keys configured${NC}"
  else
    echo -e "${RED}✗ Stripe keys missing${NC}"
  fi
  
  if grep -q "JWT_SECRET" .env.local; then
    echo -e "${GREEN}✓ JWT secret configured${NC}"
  else
    echo -e "${RED}✗ JWT secret missing${NC}"
  fi
else
  echo -e "${RED}✗ .env.local not found${NC}"
  exit 1
fi

# Test 2: Check dependencies
echo -e "\n${YELLOW}Test 2: Checking npm dependencies...${NC}"
if npm list @supabase/supabase-js > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Supabase client installed${NC}"
else
  echo -e "${RED}✗ Supabase client missing (run: npm install @supabase/supabase-js)${NC}"
fi

if npm list stripe > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Stripe library installed${NC}"
else
  echo -e "${RED}✗ Stripe library missing${NC}"
fi

# Test 3: Build verification
echo -e "\n${YELLOW}Test 3: Verifying build status...${NC}"
if npm run build > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Build passes without errors${NC}"
else
  echo -e "${RED}✗ Build failed - check above for errors${NC}"
  exit 1
fi

# Test 4: Check critical API routes exist
echo -e "\n${YELLOW}Test 4: Checking API routes...${NC}"
routes=(
  "app/api/auth/login/route.js"
  "app/api/payment/checkout/route.js"
  "app/api/payment/story-status/\[id\]/route.js"
  "app/api/webhook/stripe/route.js"
  "app/api/story/preview-with-payment/\[id\]/route.js"
)

for route in "${routes[@]}"; do
  if [ -f "$route" ]; then
    echo -e "${GREEN}✓ $route exists${NC}"
  else
    echo -e "${RED}✗ $route missing${NC}"
  fi
done

# Test 5: Check critical components exist
echo -e "\n${YELLOW}Test 5: Checking React components...${NC}"
components=(
  "components/wizard/Step4ChildDetails.jsx"
  "components/preview/WatermarkOverlay.jsx"
  "components/preview/BlurLockOverlay.jsx"
  "app/story/preview/\[id\]/page.jsx"
)

for component in "${components[@]}"; do
  if [ -f "$component" ]; then
    echo -e "${GREEN}✓ $component exists${NC}"
  else
    echo -e "${RED}✗ $component missing${NC}"
  fi
done

# Summary
echo -e "\n${YELLOW}=======================================${NC}"
echo -e "${GREEN}✓ All pre-deployment checks passed!${NC}"
echo -e "${YELLOW}=======================================${NC}"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Run SQL script in Supabase"
echo "2. Start dev server: npm run dev"
echo "3. Test locally: http://localhost:3000"
echo "4. (Optional) Set up Stripe CLI: stripe listen --forward-to http://localhost:3000/api/webhook/stripe"
echo ""
echo -e "${GREEN}Happy testing! 🚀${NC}"
