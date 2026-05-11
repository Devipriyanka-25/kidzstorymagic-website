# Auth Storage & Password Reset Configuration Fix

## Issues Identified

### 1. ❌ Persistent Auth Storage Not Configured
**Error Message:** "Persistent auth storage is not configured for this environment"  
**Affected Features:** Forgot password, password reset  
**Root Cause:** Missing Supabase credentials in production environment

### 2. ❌ Forgot Password Email Not Sending
**Affected Feature:** Password reset email notifications  
**Root Cause:** Missing Resend API key configuration

---

## Fix #1: Enable Persistent Auth Storage (SUPABASE)

### What Was Wrong
The production environment (`.env.production`) was missing Supabase database credentials:
- `NEXT_PUBLIC_SUPABASE_URL` ❌ Missing
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ❌ Missing  
- `SUPABASE_SERVICE_KEY` ❌ Missing

This caused `supabaseClient.js` to return `null`, which broke:
- User registration persistence
- Login with persistent storage
- Password reset token storage
- Forgot password functionality

### What Was Fixed
✅ Added Supabase credentials to `.env.production`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://wwninqezevmxlvtjhruo.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-supabase-anon-key>"
SUPABASE_SERVICE_KEY="<your-supabase-service-role-key>"
```

### How It Works Now
1. When user clicks "Forgot Password" → Backend checks `isPersistentAuthAvailable()`
2. With Supabase credentials present → Client is initialized → Check returns `true`
3. Backend can now find user by email → Generate reset token → Send email
4. User resets password → Token validated → Password updated in database

---

## Fix #2: Enable Password Reset Emails (RESEND)

### Prerequisite: Set Up Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Get your API key from: https://resend.com/api-keys
4. Verify a domain or use the testing domain

### Option A: Testing with Resend (Quick Setup)
For testing password reset emails:

1. **Add Resend API key to `.env.local` and `.env.production`:**
```env
RESEND_API_KEY="re_your_actual_api_key_here"
RESEND_FROM_EMAIL="Kidz Story Magic <onboarding@resend.dev>"
RESEND_REPLY_TO_EMAIL="support@kidzstorymagic.com"
```

2. **Using Resend sandbox domain:**
   - Emails will only send to your account email initially
   - Free testing for development

### Option B: Production with Custom Domain
For production email delivery:

1. Add your verified domain to Resend
2. Set up DNS records as instructed by Resend
3. Update environment variable:
```env
RESEND_API_KEY="re_your_actual_api_key_here"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
RESEND_REPLY_TO_EMAIL="support@yourdomain.com"
```

---

## Implementation Steps

### Step 1: Update Vercel Environment Variables
Since we've updated `.env.production`, you need to sync these to Vercel:

```bash
cd "s:\Priya\Project\Kidz Story Magic"

# Add Supabase credentials to Vercel (if not already set)
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste: https://wwninqezevmxlvtjhruo.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste: <your-supabase-anon-key>

vercel env add SUPABASE_SERVICE_KEY
# Paste: <your-supabase-service-role-key>

# Add Resend credentials (once you get the API key)
vercel env add RESEND_API_KEY
# Paste: re_your_actual_api_key_here

vercel env add RESEND_FROM_EMAIL
# Paste: Kidz Story Magic <onboarding@resend.dev>
```

### Step 2: Commit Changes
```bash
git add .env.production
git commit -m "Configure Supabase credentials for persistent auth storage in production"
git push origin main
```

### Step 3: Deploy
```bash
vercel deploy --prod
```

---

## Verification

### Test Persistent Auth Storage
1. Go to https://www.kidzstorymagic.org/auth/login
2. Try logging in with existing credentials
3. Should work without errors (uses Supabase database)

### Test Password Reset (After Adding RESEND_API_KEY)
1. Go to https://www.kidzstorymagic.org/auth/login
2. Click "Forgot Password"
3. Enter email address
4. Check email for reset link
5. Click link and set new password

---

## Technical Details

### Code Flow: Forgot Password → Email

**File:** `app/api/auth/forgot-password/route.js`

```javascript
// Line 1: Check if persistent auth is available
if (!isPersistentAuthAvailable()) {
  return NextResponse.json({
    error: 'Password reset is temporarily unavailable.',
    details: 'Persistent auth storage is not configured for this environment.',
  }, { status: 503 });
}

// Line 2: Check if email service is configured
if (!isAutomatedEmailConfigured()) {
  return NextResponse.json({
    error: 'Password reset email is not configured yet.',
    details: 'Add RESEND_API_KEY before sending password reset emails.',
  }, { status: 503 });
}

// Line 3: Find user by email in Supabase
const user = await findAuthUserByEmail(normalizedEmail);

// Line 4: Generate reset token
const resetToken = crypto.randomBytes(32).toString('hex');
const resetTokenHash = hashResetToken(resetToken);

// Line 5: Save token to database (Supabase)
await saveAuthUserResetToken({
  userId: user.id,
  resetTokenHash,
  resetTokenExpiry: new Date(Date.now() + RESET_TOKEN_WINDOW_MS),
});

// Line 6: Send email via Resend
const resetUrl = `${siteBaseUrl}/auth/reset-password?token=${resetToken}`;
await sendTransactionalEmail({
  to: user.email,
  subject: 'Reset your Kidz Story Magic password',
  html: buildForgotPasswordEmail({ recipientName: user.name, resetUrl }).html,
});
```

### Files Involved
| File | Purpose | Status |
|------|---------|--------|
| `app/api/shared/supabaseClient.js` | Initializes Supabase client | ✅ Needs credentials |
| `app/api/auth/forgot-password/route.js` | Handles password reset request | ✅ Needs Supabase + Resend |
| `app/api/auth/reset-password/route.js` | Validates token & updates password | ✅ Needs Supabase |
| `lib/email.js` | Sends emails via Resend API | ✅ Needs API key |
| `.env.production` | Production environment variables | ✅ FIXED (added Supabase) |

---

## FAQ

**Q: Why is Supabase configuration needed for forgot password?**  
A: The password reset token must be stored persistently in the database. Without Supabase, there's nowhere to save it.

**Q: Can I use a different email service instead of Resend?**  
A: Yes, modify `lib/email.js` to use SendGrid, Mailgun, or any provider. The current implementation uses Resend.

**Q: What happens if I don't set up Resend?**  
A: Users can still use "forgot password" with Supabase configured, but won't receive email notifications. The endpoint returns a 503 error with "Add RESEND_API_KEY before sending password reset emails."

**Q: Do I need to run migrations for Supabase?**  
A: No, the database schema is already set up with `reset_token_hash` and `reset_token_expiry` columns.

**Q: Can I test password reset locally?**  
A: Yes, add `RESEND_API_KEY` and `SUPABASE_SERVICE_KEY` to `.env.local`, then run `npm run dev`.

---

## Summary of Changes

✅ **Fixed in `.env.production`:**
- Added `NEXT_PUBLIC_SUPABASE_URL`
- Added `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
- Added `SUPABASE_SERVICE_KEY`

📋 **TODO - Next Steps:**
- [ ] Get RESEND_API_KEY from [resend.com](https://resend.com)
- [ ] Add RESEND_API_KEY to `.env.production` and Vercel dashboard
- [ ] Run `vercel deploy --prod` to redeploy with new variables
- [ ] Test password reset flow end-to-end
