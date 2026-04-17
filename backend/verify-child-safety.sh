#!/bin/bash
# 🔒 Child Safety Verification Test Script
# Verifies all COPPA compliance fixes

echo "=========================================="
echo "🔒 CHILD SAFETY VERIFICATION TEST SUITE"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Configuration
API_BASE="http://localhost:3001"
TEST_AUTH_TOKEN="test-bearer-token"

# ============================================
# Helper Functions
# ============================================

print_test() {
    echo -e "\n${YELLOW}📋 Test: $1${NC}"
}

print_pass() {
    echo -e "${GREEN}✓ PASS: $1${NC}"
    ((TESTS_PASSED++))
}

print_fail() {
    echo -e "${RED}✗ FAIL: $1${NC}"
    ((TESTS_FAILED++))
}

# ============================================
# TEST 1: Parental Consent Enforcement
# ============================================

echo -e "${YELLOW}\n=== TEST 1: Parental Consent Enforcement ===${NC}"

print_test "Reject story creation for under-13 WITHOUT consent"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/story/create" \
  -H "Authorization: Bearer $TEST_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "theme":"adventure",
    "page_count":10,
    "child_name":"TestChild",
    "childAge":8
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "403" ]; then
    print_pass "Under-13 without consent rejected with 403"
else
    print_fail "Expected 403, got $HTTP_CODE"
fi

print_test "Accept story creation for under-13 WITH consent"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/story/create" \
  -H "Authorization: Bearer $TEST_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "theme":"adventure",
    "page_count":10,
    "child_name":"TestChild",
    "childAge":8,
    "parentEmail":"parent@example.com",
    "parentConsent":true
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "201" ]; then
    print_pass "Under-13 with consent accepted with 201"
    PROJECT_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')
else
    print_fail "Expected 201, got $HTTP_CODE"
fi

print_test "Accept story creation for age 13+ WITHOUT parent email"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/story/create" \
  -H "Authorization: Bearer $TEST_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "theme":"adventure",
    "page_count":10,
    "child_name":"Teenager",
    "childAge":14
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "201" ]; then
    print_pass "Age 13+ without parent email accepted"
else
    print_fail "Expected 201, got $HTTP_CODE"
fi

# ============================================
# TEST 2: Photo Deletion After Payment
# ============================================

echo -e "${YELLOW}\n=== TEST 2: Photo Deletion After Payment ===${NC}"

print_test "Payment confirmation should delete photos"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/payment/confirm-payment" \
  -H "Authorization: Bearer $TEST_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\":\"test-session-123\",
    \"projectId\":\"$PROJECT_ID\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    print_pass "Payment confirmation returned 200"
    
    # Check if _security.photosDeleted is true
    if echo "$BODY" | grep -q '"photosDeleted":true'; then
        print_pass "Photos marked as deleted in response"
    else
        print_fail "Photos not marked as deleted"
    fi
else
    print_fail "Expected 200, got $HTTP_CODE"
fi

# ============================================
# TEST 3: Child Data Deletion
# ============================================

echo -e "${YELLOW}\n=== TEST 3: Child Data Deletion ===${NC}"

print_test "Story generation should schedule data deletion"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/story/generate-from-images" \
  -H "Authorization: Bearer $TEST_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"projectId\":\"$PROJECT_ID\",
    \"childAge\":8,
    \"parentConsent\":true
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    print_pass "Story generation returned 200"
    
    if echo "$BODY" | grep -q '"dataDeletionScheduled":true'; then
        print_pass "Data deletion scheduled"
    else
        print_fail "Data deletion not scheduled"
    fi
else
    print_fail "Expected 200, got $HTTP_CODE"
fi

# ============================================
# TEST 4: Audit Trail
# ============================================

echo -e "${YELLOW}\n=== TEST 4: Audit Trail Logging ===${NC}"

print_test "Check audit log for safety events"
# This would query the database directly
echo -e "${YELLOW}→ Manually verify: SELECT * FROM child_safety_audit_log;${NC}"

# ============================================
# TEST 5: Middleware Verification
# ============================================

echo -e "${YELLOW}\n=== TEST 5: Middleware Verification ===${NC}"

print_test "Verify validateChildSafety middleware on main routes"
echo -e "${YELLOW}→ Checking: backend/src/routes/story-generation.routes.js${NC}"
if grep -q "validateChildSafety" backend/src/routes/story-generation.routes.js; then
    print_pass "validateChildSafety middleware applied"
else
    print_fail "validateChildSafety middleware NOT found"
fi

echo -e "${YELLOW}→ Checking: backend/src/routes/story.routes.js${NC}"
if grep -q "validateChildSafety" backend/src/routes/story.routes.js; then
    print_pass "validateChildSafety middleware applied"
else
    print_fail "validateChildSafety middleware NOT found"
fi

# ============================================
# TEST 6: Error Handling
# ============================================

echo -e "${YELLOW}\n=== TEST 6: Error Handling ===${NC}"

print_test "Handle missing childAge"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/story/create" \
  -H "Authorization: Bearer $TEST_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "theme":"adventure",
    "page_count":10,
    "child_name":"NoAge"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "403" ]; then
    print_pass "Missing childAge returns error ($HTTP_CODE)"
else
    print_fail "Expected 400 or 403, got $HTTP_CODE"
fi

# ============================================
# Summary
# ============================================

echo -e "${YELLOW}\n=========================================="
echo "🔒 TEST SUMMARY"
echo "==========================================${NC}"
echo -e "${GREEN}✓ Passed: $TESTS_PASSED${NC}"
echo -e "${RED}✗ Failed: $TESTS_FAILED${NC}"

TOTAL=$((TESTS_PASSED + TESTS_FAILED))

if [ "$TESTS_FAILED" -eq 0 ]; then
    echo -e "\n${GREEN}✅ ALL TESTS PASSED!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ SOME TESTS FAILED${NC}"
    exit 1
fi
