# Railway API Gateway Deployment Guide

## Quick Deployment Steps

### 1. Connect Your Repository to Railway

```bash
# Option A: Using Railway CLI
npm install -g @railway/cli
railway login
cd /path/to/kidz-story-magic
railway init

# Option B: Using Railway Dashboard
# 1. Go to https://railway.app
# 2. Click "Create Project"
# 3. Select "Deploy from GitHub"
# 4. Connect your GitHub account
# 5. Select kidzstorymagic-website repository
```

### 2. Configure Environment Variables on Railway

Go to your Railway project settings and add these environment variables:

**Database:**
- `DATABASE_URL` - Your Supabase PostgreSQL connection string
- `DB_HOST` - Database host
- `DB_PORT` - Database port (5432)
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password

**Application:**
- `NODE_ENV` - Set to `production`
- `PORT` - Set to `5000`
- `BASE_URL` - https://kidzstorymagic-api.railway.app
- `FRONTEND_URL` - https://www.kidzstorymagic.org
- `CORS_ORIGIN` - https://www.kidzstorymagic.org,https://kidzstorymagic.org,http://localhost:3000
- `JWT_SECRET` - Your JWT secret key (from backend/.env)

**Stripe:**
- `STRIPE_SECRET_KEY` - sk_test_... (from backend/.env)
- `STRIPE_PUBLISHABLE_KEY` - pk_test_... (from backend/.env)
- `STRIPE_WEBHOOK_SECRET` - Your webhook secret

**API Keys:**
- `OPENAI_API_KEY` - OpenAI API key for image generation
- `EXCHANGE_RATE_API_KEY` - Currency exchange API key
- `EMAIL_SERVICE` - Set to `gmail`
- `EMAIL_FROM` - noreply@kidzstorymagic.com
- `EMAIL_USER` - Your Gmail address
- `EMAIL_PASSWORD` - Your Gmail app password

**AWS/Cloud Storage:**
- `AWS_REGION` - us-east-1
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
- `AWS_S3_BUCKET` - kidzstorymagic-uploads

**Azure (if using):**
- `AZURE_OPENAI_API_KEY` - If using Azure OpenAI instead of OpenAI

### 3. Configure Database on Railway

**Option A: Use Supabase (Recommended)**
- Create project at https://supabase.com
- Copy the PostgreSQL connection string
- Add to Railway as `DATABASE_URL`

**Option B: Use Railway PostgreSQL Plugin**
1. In Railway Dashboard, click "Add Plugin"
2. Select "PostgreSQL"
3. Railway will auto-populate DB environment variables

### 4. Deploy

**Using Railway CLI:**
```bash
railway up
```

**Using Railway Dashboard:**
1. Ensure root directory is set to the project root (not /backend)
2. Or, if deploying only backend:
   - Set root directory to `/backend`
   - Ensure service name is `api`

### 5. Verify Deployment

Test your API gateway:

```bash
# Health check
curl https://kidzstorymagic-api.railway.app/api/health

# Database check
curl https://kidzstorymagic-api.railway.app/api/health/db

# API docs
https://kidzstorymagic-api.railway.app/api/docs
```

### 6. Monitor Deployment

```bash
# View logs
railway logs

# Check status
railway status

# View environment variables
railway variables
```

## Troubleshooting

### Build Failed
- Check the build logs: `railway logs --builder`
- Verify Dockerfile exists in backend/
- Ensure package.json has correct start script

### Connection Failed
- Verify DATABASE_URL environment variable is set
- Check database is accessible from Railway servers
- Verify CORS_ORIGIN includes Railway domain

### Port Issues
- Railway assigns a random PORT in production
- The app should use `process.env.PORT`
- Our backend already handles this (set to 5000)

### Environment Variables Not Loading
- Double-check variable names match exactly
- Ensure no extra spaces in values
- Restart the deployment after adding variables

## Production Checklist

- [ ] Database running and accessible
- [ ] All environment variables configured
- [ ] Dockerfile deployed and tested
- [ ] Health endpoints responding
- [ ] Database connection working
- [ ] Logs showing no errors
- [ ] Frontend can connect to backend
- [ ] Payment processing working
- [ ] Email notifications sending

## API Gateway Architecture

```
┌─────────────────────────────────────────┐
│   Frontend (Vercel)                     │
│   https://www.kidzstorymagic.org        │
└────────────────┬────────────────────────┘
                 │ HTTPS Requests
                 ▼
┌─────────────────────────────────────────┐
│   Railway API Gateway                   │
│   https://kidzstorymagic-api.railway.app│
│                                         │
│   ├─ /api/auth                         │
│   ├─ /api/story                        │
│   ├─ /api/drafts                       │
│   ├─ /api/payment                      │
│   ├─ /api/currency                     │
│   └─ /api/health                       │
└────────────────┬────────────────────────┘
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
    ┌────┐  ┌─────┐  ┌─────┐
    │ DB │  │ AWS │  │ API │
    └────┘  └─────┘  └─────┘
```

## Next Steps

1. Deploy backend API to Railway
2. Verify API gateway is running
3. Update frontend NEXT_PUBLIC_API_URL to point to Railway
4. Test end-to-end flow
5. Monitor logs for any issues

## Support

- Railway Docs: https://docs.railway.app
- Railway Community: https://discord.gg/railway
- Project Issues: Check GitHub issues for common problems
