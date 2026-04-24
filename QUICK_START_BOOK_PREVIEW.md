# 🚀 QUICK START: Book Preview Payment Protection

## 📋 FILES CREATED/MODIFIED

### **Backend API Routes (NEW)**
1. ✅ `/app/api/payment/story-status/[id]/route.js` - Payment verification
2. ✅ `/app/api/story/preview-with-payment/[id]/route.js` - Story preview with payment
3. ✅ `/app/api/payment/pdf/[id]/route.js` - Protected PDF download

### **Frontend Components (NEW)**
1. ✅ `/components/preview/WatermarkOverlay.jsx` - Watermark protection
2. ✅ `/components/preview/BlurLockOverlay.jsx` - Blur lock & CTA
3. ✅ `/app/story/preview/[id]/page.jsx` - Main preview page

### **Updated Files**
1. ✅ `/utils/api.js` - Added payment verification methods

---

## 🔍 ROOT CAUSE / MISSING PARTS

**Problem:** No payment protection for story previews; users could see full content without paying.

**Solution Implemented:**
- ✅ Backend payment status verification
- ✅ Frontend watermark + blur protection
- ✅ Conditional rendering based on payment status
- ✅ Protected PDF download endpoint
- ✅ Checkout CTA integration

---

## 🎯 HOW IT WORKS

### **UNPAID User Preview**
```
Visit: /story/preview/story_1
↓
Backend checks: Is story paid? → NO
↓
Frontend receives: isUnlocked=false
↓
Renders:
├─ Watermark overlay (semi-transparent "Kidz Story Magic Preview")
├─ Blur lock on bottom 40% (backdrop-filter: blur(8px))
├─ Lock badge with CTA button
├─ Message: "Unlock full story after checkout"
└─ Disabled download/print buttons

User clicks: "Continue to Checkout"
↓
Redirects to: /wizard?step=6&storyId=story_1
```

### **PAID User Preview**
```
Visit: /story/preview/paid_story_1
↓
Backend checks: Is story paid? → YES (in orders table)
↓
Frontend receives: isUnlocked=true
↓
Renders:
├─ NO watermark
├─ NO blur
├─ "✓ Unlocked" badge
├─ Active "Download PDF" button
└─ Active "Print Book" button

User clicks: "Download PDF"
↓
Backend verifies payment (again, for security)
↓
Returns PDF without watermark/blur
↓
Browser downloads: story_title.pdf
```

---

## 🧪 LOCAL TESTING STEPS

### **Step 1: Build Project**
```bash
cd "s:\Priya\Project\Kidz Story Magic"
npm run build
```
✅ Should show: "✓ Compiled successfully"

### **Step 2: Start Dev Server**
```bash
npm run dev
```
✅ Should listen on: http://localhost:3000

### **Step 3: Test Unpaid Preview**

**Test Case 1: Unpaid Story (Protected)**
```
1. Open: http://localhost:3000/story/preview/story_1
2. Verify UI shows:
   ✓ Watermark text diagonal across page
   ✓ Blur effect on bottom 40%
   ✓ Lock badge in center
   ✓ "Continue to Checkout" button
   ✗ No "Download PDF" button visible
3. Click "Continue to Checkout"
4. Should redirect to /wizard (or error if no auth)
```

**Browser Console Check:**
```javascript
// Should see:
[PREVIEW] Story loaded: {story: {...}, isUnlocked: false}
[PREVIEW_ERROR] if story not found
```

### **Step 4: Test Paid Preview**

**Test Case 2: Paid Story (Full Access)**
```
1. Open: http://localhost:3000/story/preview/paid_story_1
2. Verify UI shows:
   ✗ NO watermark
   ✗ NO blur
   ✓ "✓ Unlocked" badge
   ✓ "📥 Download PDF" button
   ✓ "🖨 Print" button
3. Click "📥 Download PDF"
4. Should trigger PDF download
5. Click "🖨 Print"
6. Should open print dialog
```

**Browser Console Check:**
```javascript
// Should see:
[PREVIEW] Story loaded: {story: {...}, isUnlocked: true}
[PDF_DOWNLOAD] Requesting PDF for story: paid_story_1
```

### **Step 5: Test PDF Download Protection**

**Test Case 3: PDF Download for Unpaid User**
```
1. Open: http://localhost:3000/story/preview/story_1
2. Look for "Download PDF" button
3. Button should be missing (not shown if unpaid)
4. Or show message: "Unlock to download"
```

**Test Case 4: PDF Download for Paid User**
```
1. Open: http://localhost:3000/story/preview/paid_story_1
2. Click "📥 Download PDF"
3. API request to /api/payment/pdf/paid_story_1
4. Backend verifies: 
   - JWT token present ✓
   - Payment status = paid ✓
5. Returns PDF blob
6. Browser downloads: paid_story_1.pdf
```

### **Step 6: Test Error Handling**

**Test Case 5: Story Not Found**
```
1. Open: http://localhost:3000/story/preview/nonexistent_story
2. Should show error page:
   ✓ "Failed to Load Preview" message
   ✓ "Try Again" button
   ✓ "Go to Dashboard" link
```

**Test Case 6: Missing Authentication**
```
1. Clear localStorage authToken
2. Try to download PDF via direct API call
3. Should return 401: "Unauthorized"
4. Frontend shows: "Authentication required"
```

---

## 📱 RESPONSIVE TESTING

### **Mobile (< 640px)**
```
1. Open DevTools (F12)
2. Toggle device toolbar
3. Select iPhone 12 (390px width)
4. Verify:
   ✓ Thumbnails appear as horizontal carousel
   ✓ Main page card visible (portrait aspect)
   ✓ Buttons stack vertically
   ✓ Watermark still visible
   ✓ Blur still works
```

### **Tablet (640-1024px)**
```
1. Select iPad view (768px width)
2. Verify:
   ✓ 2-column layout (thumbnails + page)
   ✓ Proper spacing
   ✓ All controls accessible
```

### **Desktop (> 1024px)**
```
1. Full browser window
2. Verify:
   ✓ 4-column grid (3 page columns + 1 sidebar)
   ✓ Thumbnail sidebar on left
   ✓ Large page preview on right
   ✓ Perfect shadows and spacing
```

---

## 🔐 SECURITY VERIFICATION

### **Check 1: Payment Status Verification**
```bash
# Unpaid story - should fail payment check
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/payment/story-status/story_1

# Response should have: "paymentStatus": "unpaid", "isUnlocked": false

# Paid story - should pass payment check
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/payment/story-status/paid_story_1

# Response should have: "paymentStatus": "paid", "isUnlocked": true
```

### **Check 2: PDF Download Protection**
```bash
# Try to download without auth
curl http://localhost:3000/api/payment/pdf/paid_story_1
# Should return 401: Unauthorized

# Try to download unpaid story (with auth)
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/payment/pdf/story_1
# Should return 403: Payment not verified

# Download paid story (with auth)
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/payment/pdf/paid_story_1
# Should return 200 + PDF blob
```

### **Check 3: JWT Token Validation**
```bash
# Invalid token
curl -H "Authorization: Bearer invalid.token.here" \
  http://localhost:3000/api/payment/story-status/story_1
# Should return 401: Invalid token

# Expired token (requires setting expiry in production)
curl -H "Authorization: Bearer <old_token>" \
  http://localhost:3000/api/payment/story-status/story_1
# Should return 401: Token expired
```

---

## 🎨 UI VERIFICATION CHECKLIST

### **Unpaid Preview UI**
- [ ] Watermark visible (semi-transparent, diagonal)
- [ ] Watermark repeats across entire page
- [ ] Watermark doesn't block readability
- [ ] Blur effect shows on bottom 40%
- [ ] Lock badge centered on blur
- [ ] Lock icon animates (pulse effect)
- [ ] "Continue to Checkout" button visible
- [ ] Benefits list shows below button
- [ ] Download/Print buttons hidden
- [ ] Progress bar updates with page navigation

### **Paid Preview UI**
- [ ] NO watermark visible
- [ ] NO blur effect
- [ ] "✓ Unlocked" badge shows (top right)
- [ ] "📥 Download PDF" button visible & active
- [ ] "🖨 Print" button visible & active
- [ ] Download button shows progress (25%, 75%, 100%)
- [ ] Print button opens system print dialog
- [ ] Progress bar at 100% on any page

### **Navigation UI**
- [ ] Page thumbnails show all pages
- [ ] Current page highlighted with ring
- [ ] Previous button disabled on first page
- [ ] Next button disabled on last page
- [ ] Clicking page jumps to it
- [ ] Arrow keys work (← →)
- [ ] Page counter updates

### **Error States**
- [ ] Error message centered & readable
- [ ] "Try Again" button works
- [ ] "Go to Dashboard" link works
- [ ] Loading spinner shows while fetching

---

## 🔧 DEBUGGING CONSOLE LOGS

### **Enable Debug Logs**
```javascript
// In browser console
localStorage.setItem('DEBUG', 'true');
location.reload();
```

### **Watch for These Logs**
```
✓ [PREVIEW] Story loaded: {...}
✓ [PREVIEW] Getting story preview: story_1
✓ [PDF_DOWNLOAD] Requesting PDF...
✓ [PAYMENT_STATUS] Checking payment...
✗ [PREVIEW_ERROR] Failed to load story
✗ [PDF_DOWNLOAD_ERROR] Download failed
✗ [PAYMENT_STATUS_ERROR] Payment check failed
```

---

## 📊 MOCK DATA FOR TESTING

### **Paid Stories (Full Access)**
- `paid_story_1`
- `mock_paid_story_1`
- `mock_paid_story_2`
- Any story ID starting with `paid_`

### **Unpaid Stories (Protected)**
- `story_1` - Default test story
- Any other story ID

### **Example API Calls**

**Fetch Unpaid Story:**
```bash
curl http://localhost:3000/api/story/preview-with-payment/story_1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Fetch Paid Story:**
```bash
curl http://localhost:3000/api/story/preview-with-payment/paid_story_1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## ✅ FINAL VERIFICATION

After testing, verify:

- [ ] ✅ **Watermark works** - Semi-transparent, repeating diagonal text
- [ ] ✅ **Blur lock works** - Bottom portion blurred with lock badge
- [ ] ✅ **Checkout CTA works** - Button redirects to wizard
- [ ] ✅ **Paid preview unlocks** - Watermark/blur removed for paid stories
- [ ] ✅ **PDF download works** - Only after payment, with clean PDF
- [ ] ✅ **Responsive design** - Mobile, tablet, desktop all work
- [ ] ✅ **Error handling** - Graceful errors for invalid stories/auth
- [ ] ✅ **Navigation** - Page prev/next works, thumbnails click works
- [ ] ✅ **Security** - APIs check JWT and payment status

---

## 🚀 DEPLOYMENT

### **Production Checklist**
```bash
# 1. Build
npm run build  # ✅ Should pass

# 2. Test
npm run test   # Run test suite if available

# 3. Update .env for production
# Set real database connection
# Set real Stripe API keys
# Set real JWT secret

# 4. Deploy
vercel deploy  # Or your deployment tool
```

### **Post-Deployment Verification**
```
1. Visit production URL
2. Test unpaid preview: /story/preview/story_1
3. Verify watermark & blur
4. Test paid preview: /story/preview/paid_story_1
5. Verify unlock & download
6. Monitor error logs
7. Check API performance
```

---

**Status:** ✅ **READY FOR TESTING**
**Next:** Integration with Stripe webhooks for real payment records
