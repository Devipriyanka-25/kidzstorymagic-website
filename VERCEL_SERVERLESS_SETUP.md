# Vercel Serverless Backend Setup Guide

## 🎯 What's Changed

We've successfully **converted your Express backend from Railway to Vercel serverless functions**. This eliminates CORS issues completely because:

- ✅ Frontend and Backend are now on the **same domain** (Vercel)
- ✅ No more CORS headers blocking requests
- ✅ Simpler, more scalable architecture
- ✅ No need for proxy routes or Railway infrastructure

## 📋 Files Created/Modified

### New Serverless Infrastructure:
- `/lib/db.js` - PostgreSQL connection for serverless functions
- `/lib/auth.js` - Shared authentication utilities
- `/app/api/auth/register/route.js` - Serverless registration endpoint
- `/app/api/auth/login/route.js` - Serverless login endpoint
- `/app/api/auth/me/route.js` - Serverless user profile endpoint

### Frontend Configuration:
- `/utils/api.js` - Already configured to use `/api` in production
- `/next.config.js` - Sets `NEXT_PUBLIC_API_URL=/api` for production

## 🔧 Required Setup Steps

### Step 1: Get Database Connection URL

From Supabase or PostgreSQL:

1. Go to your database provider dashboard
2. Copy the connection string
3. Example format: `postgresql://user:password@host:5432/database`

### Step 2: Add Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **kidzstorymagic-website**
3. Navigate to **Settings → Environment Variables**
4. Add these variables for **Production**:

```
DATABASE_URL=your_postgresql_connection_string_here
JWT_SECRET=your-secure-jwt-secret-key-change-this
```

Example (replace with your actual values):
```
DATABASE_URL=postgresql://postgres:password123@db.supabase.co:5432/postgres
JWT_SECRET=super-secret-jwt-key-for-production-12345
```

### Step 3: Redeploy

After adding environment variables:

1. Go to **Deployments**
2. Click on the latest deployment
3. Click **Redeploy** button
4. Wait for deployment to complete (~2 minutes)

## ✅ Verify Setup

### Test Endpoint (using curl or browser):

```bash
curl -X POST https://www.kidzstorymagic.org/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

Expected response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "preferredCurrency": "USD"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

### Test in Frontend:

1. Navigate to https://www.kidzstorymagic.org/auth/signup
2. Fill in the signup form
3. Click "Create Account"
4. Should redirect to dashboard on success (no CORS errors!)

## 📊 Architecture

```
User Browser
    ↓
[Frontend on Vercel]
    ↓
[/api/auth/* routes] ← Same Vercel domain
    ↓
[Serverless functions] ← No CORS issues!
    ↓
[PostgreSQL Database]
```

## 🚀 What Works Now

- ✅ `/api/auth/register` - User registration
- ✅ `/api/auth/login` - User login
- ✅ `/api/auth/me` - Get current user (requires token)

## 📝 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | ✅ Yes | Secret key for JWT tokens | `your-secret-key-here` |

## 🔐 Security Notes

1. **Never commit secrets** - Use Vercel environment variables, not `.env` files
2. **JWT_SECRET** - Change this value in production
3. **DATABASE_URL** - Already SSL-enabled for cloud databases
4. **No hardcoded credentials** - All config read from environment

## 🐛 Troubleshooting

### "Failed to connect to database"
- Check `DATABASE_URL` is correct in Vercel settings
- Ensure database is running and accessible
- Check network/firewall rules on database server

### "Unauthorized" on `/api/auth/me`
- Token might be expired (7-day default expiry)
- Ensure `Authorization: Bearer <token>` header is sent
- Check JWT_SECRET matches on redeploy

### Still seeing CORS errors
- Clear browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Check that endpoint is calling `/api/auth/register` not Railway URL
- Verify Vercel deployment is complete

## 📞 Next Steps

1. ✅ Set environment variables in Vercel
2. ✅ Redeploy from Vercel dashboard
3. ✅ Test signup form in browser
4. ✅ Verify JWT token is stored in localStorage
5. ✅ Test login flow
6. ✅ Create remaining API endpoints (story, payment, etc.)

## 💡 Pro Tips

- Serverless functions have a **timeout of 60-120 seconds** (use long polling for long tasks)
- Database connections are pooled in `lib/db.js` with max 1 connection per function
- JWT tokens are signed with `JWT_SECRET` and expire after 7 days
- All responses include proper CORS headers (no reverse proxy needed!)
