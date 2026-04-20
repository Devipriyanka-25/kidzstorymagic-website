# 🔧 Railway API Gateway - Deployment Troubleshooting

## 📋 Your Current Setup Status

✅ **Backend Configuration**: Correct
- Entry point: `backend/src/index.js`
- Start command: `npm start`  
- Port: 5000 (via `process.env.PORT || 5000`)
- Health endpoints available

✅ **Dockerfile Created**: `backend/Dockerfile`
- Uses Node 20 slim image
- Proper build stages
- Health checks configured

⚠️ **Deployment Issue**: Not yet deployed or failing

---

## 🔍 Common Railway Deployment Issues & Fixes

### Issue 1: Build Failing - Missing Root Directory Setting

**Symptoms:**
- Build fails immediately
- Error: "Cannot find Dockerfile"

**Fix:**
1. Go to your Railway project settings
2. Find the service in the dashboard
3. Check if **Root Directory** is set correctly:
   - If deploying full monorepo: Leave blank (Railway will auto-detect)
   - If only backend: Set to `./backend`
4. Redeploy

**Commands to check in Railway:**
```bash
# View current configuration
railway config list

# Set root directory (if needed)
railway config set ROOT_DIRECTORY ./backend
```

---

### Issue 2: Port Not Being Detected

**Symptoms:**
- Build succeeds but service fails to start
- Error: "Address already in use"

**Fix:**
- Railway assigns a dynamic PORT - your app already handles this correctly ✅
- The backend reads `process.env.PORT` which Railway sets automatically
- No changes needed - this is already working

---

### Issue 3: Environment Variables Missing

**Symptoms:**
- Build succeeds, but app crashes on startup
- Error: "Cannot connect to database"
- Error: "STRIPE_SECRET_KEY is required"

**Check Required Variables:**
```
Essential (MUST have):
- DATABASE_URL or DB_HOST + DB_PORT + DB_NAME + DB_PASSWORD
- JWT_SECRET
- NODE_ENV=production

Recommended (for features):
- STRIPE_SECRET_KEY (for payments)
- OPENAI_API_KEY (for story generation)
- EMAIL_PASSWORD (for notifications)
```

**Fix:**
1. In Railway Dashboard, go to your service
2. Click "Variables" tab
3. Ensure all variables from `backend/.env` are added
4. **DO NOT** commit `.env` to Git - only add to Railway

---

### Issue 4: Database Connection Failing

**Symptoms:**
- App starts but crashes when querying DB
- Error: "ECONNREFUSED" or "Connection timeout"

**Fix:**
1. Verify DATABASE_URL format:
   ```
   postgresql://user:password@host:port/database
   ```

2. If using Supabase:
   - Get connection string from Supabase dashboard
   - Format: `postgresql://[user]:[password]@[host]:[port]/[database]`

3. If using Railway PostgreSQL plugin:
   - Railway auto-generates DATABASE_URL ✅
   - Just add the PostgreSQL plugin and it's ready

4. Test connection:
   ```bash
   # From Railway terminal
   railway run psql $DATABASE_URL -c "SELECT 1"
   ```

---

### Issue 5: CORS or Frontend Connection Failing

**Symptoms:**
- Frontend gets 404 or CORS errors
- API is running but unreachable from browser

**Fix:**
- Your backend already handles CORS correctly ✅
- Hardcoded whitelist includes:
  - `https://www.kidzstorymagic.org`
  - `https://kidzstorymagic.org`
  - `http://localhost:3000`

- Update frontend to use Railway API URL:
  - Frontend `.env.local`:
    ```
    NEXT_PUBLIC_API_URL=https://kidzstorymagic-api.railway.app/api
    ```

---

## 🚀 Step-by-Step Railway Deployment

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click "Start Project"
3. Sign in with GitHub

### Step 2: Connect Repository
```bash
# Option A: Using Railway CLI
npm install -g @railway/cli
railway login
cd /path/to/kidz-story-magic
railway init

# Option B: Using Railway Dashboard
# Click "Deploy from GitHub" → Select repository
```

### Step 3: Configure Service (In Railway Dashboard)

**If deploying full project:**
1. Go to your project settings
2. Leave **Root Directory** empty (auto-detect)
3. Verify Dockerfile found at `backend/Dockerfile`

**If deploying only backend:**
1. Set **Root Directory** to `./backend`
2. Set **Service Name** to `api`

### Step 4: Add Environment Variables

In Railway Dashboard, click "Variables" and add:

```
# Application
NODE_ENV=production
PORT=5000

# Database (example with Supabase)
DATABASE_URL=postgresql://postgres:[password]@db.xxxx.supabase.co:5432/postgres
JWT_SECRET=[your-jwt-secret]

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# OpenAI
OPENAI_API_KEY=sk_xxxxx

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@kidzstorymagic.com

# URLs
BASE_URL=https://kidzstorymagic-api.railway.app
FRONTEND_URL=https://www.kidzstorymagic.org
CORS_ORIGIN=https://www.kidzstorymagic.org,https://kidzstorymagic.org,http://localhost:3000
```

### Step 5: Deploy

**Using CLI:**
```bash
railway up
```

**Using Dashboard:**
1. Click "Deploy" button
2. Wait for build to complete
3. Watch logs to verify startup

### Step 6: Verify Deployment

Test these endpoints:

```bash
# Health check (should return 200)
curl https://kidzstorymagic-api.railway.app/api/health

# Database check (should show connection status)
curl https://kidzstorymagic-api.railway.app/api/health/db

# API docs
https://kidzstorymagic-api.railway.app/api/docs
```

---

## 📊 Railway Deployment Checklist

- [ ] Repository connected to Railway
- [ ] Root directory set correctly
- [ ] Dockerfile exists at `backend/Dockerfile`
- [ ] Environment variables added
- [ ] Database connection tested
- [ ] Build completes successfully
- [ ] Service shows "Running" status
- [ ] Health endpoint returns 200
- [ ] Database connection working
- [ ] Frontend can reach API
- [ ] No errors in logs

---

## 🔐 Environment Variables Quick Copy

Create a file `railway-env-template.txt` with these variables, then add values in Railway Dashboard:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=
JWT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
OPENAI_API_KEY=
EXCHANGE_RATE_API_KEY=
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=noreply@kidzstorymagic.com
BASE_URL=https://kidzstorymagic-api.railway.app
FRONTEND_URL=https://www.kidzstorymagic.org
CORS_ORIGIN=https://www.kidzstorymagic.org,https://kidzstorymagic.org
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=kidzstorymagic-uploads
```

---

## 🆘 Getting Help

**Check Railway Logs:**
```bash
railway logs
railway logs --tail
railway logs --builder  # For build-time errors
```

**Check Service Status:**
```bash
railway status
railway list services
```

**Restart Service:**
```bash
railway redeploy
```

**Debug Connection:**
```bash
railway run node -e "console.log(process.env.DATABASE_URL)"
railway run npm start
```

---

## 📞 Next Steps

1. **If deployment fails**: Share the build logs from Railway dashboard
2. **If database won't connect**: Verify DATABASE_URL format
3. **If API won't start**: Check all required environment variables are set
4. **If frontend can't reach API**: Update frontend NEXT_PUBLIC_API_URL

Tell me:
- [ ] What's the current deployment status?
- [ ] Any error messages in the build logs?
- [ ] Have you added the environment variables?
- [ ] Is the database connection string set?

