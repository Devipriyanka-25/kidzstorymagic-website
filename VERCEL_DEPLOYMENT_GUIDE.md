# Vercel Backend Deployment Guide

## Quick Start (3 steps)

### Step 1: Go to Vercel
1. Open https://vercel.com/import
2. Click "Import Git Repository"
3. Select "Devipriyanka-25/kidzstorymagic-website"

### Step 2: Configure Environment Variables
In the Vercel dashboard, add these **Environment Variables**:

```
DB_HOST=your_database_host
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
AZURE_VISION_KEY=your_azure_key
AZURE_VISION_ENDPOINT=https://your-region.cognitiveservices.azure.com/
STRIPE_SECRET_KEY=your_stripe_key
FRONTEND_URL=https://your-frontend-domain.com
```

### Step 3: Deploy
Click **Deploy** - Vercel will automatically build and deploy

---

## What Gets Deployed

✅ **Frontend** - Next.js app (main site)
✅ **API** - Serverless functions at `/api/*` endpoints  
✅ **Health Check** - `GET /api/health`

---

## ⚠️ Important Limitations

Vercel serverless functions have constraints:

| Feature | Railway | Vercel |
|---------|---------|--------|
| Timeout | ∞ (long-running) | 60 seconds max |
| Database | ✅ Always connected | ⚠️ Connection pooling needed |
| File uploads | ✅ Persistent storage | ❌ Temporary only |
| WebSockets | ✅ Supported | ❌ Not supported |
| Background jobs | ✅ Yes | ❌ No |

---

## Next Steps After Deployment

1. **Test health endpoint:**
   ```
   curl https://your-vercel-app.vercel.app/api/health
   ```

2. **Monitor logs:**
   - Go to your Vercel project dashboard
   - Click "Functions" tab to see logs

3. **If timeout issues occur:**
   - Optimize database queries
   - Use connection pooling (AWS RDS Proxy, etc.)
   - Consider keeping backend on Railway instead

---

## Alternative: Keep Backend on Railway (Recommended for this project)

If the backend has long-running tasks (image generation, PDF creation), Railway is better:

1. Fix the Railway Docker build (already optimized)
2. Deploy frontend to Vercel
3. Backend stays on Railway
4. Configure CORS between them

**This is likely your best solution** given the backend complexity.

---

## Which approach should you choose?

- **Vercel Only**: Fast deploy, but may timeout on heavy operations
- **Vercel Frontend + Railway Backend**: More reliable, slight latency

**Recommendation**: Deploy both to Vercel to get live quickly, then move backend to Railway if needed.
