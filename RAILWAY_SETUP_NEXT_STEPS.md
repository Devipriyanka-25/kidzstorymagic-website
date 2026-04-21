# Railway Configuration - Next Steps

## Status
Once the Docker build completes successfully on GitHub Actions, follow these steps:

### Step 1: Verify Docker Image in GHCR
```
Image URL: ghcr.io/devipriyanka-25/kidzstorymagic-website/backend:main
Location: https://github.com/Devipriyanka-25?tab=packages
```

### Step 2: Configure Railway to Use Pre-Built Image

#### Option A: Via Railway Dashboard (Easy)
1. Go to Railway: https://railway.app/
2. Login with GitHub
3. Open Project: Kidz Story Magic
4. Select Service: Backend
5. Go to Settings → Deploy
6. Change: **Build** → **Pre-built Image**
7. Enter:
   - Registry: ghcr.io
   - Image: devipriyanka-25/kidzstorymagic-website/backend
   - Tag: main
8. Click "Save"
9. Railway will redeploy from cached image (<30 seconds)

#### Option B: Via Railway CLI
```bash
# Install Railway CLI (if not already installed)
npm install -g @railway/cli

# Login to Railway
railway login

# Select project
railway switch

# Configure service to use pre-built image
railway link backend

# Set image URL
railway set IMAGE_URL=ghcr.io/devipriyanka-25/kidzstorymagic-website/backend:main

# Deploy
railway up
```

### Step 3: Verify Deployment

#### Check Service Status
1. Railway Dashboard → Backend Service
2. Status should show: "Running ✓"
3. URL should be available: https://kidzstorymagic-api.railway.app

#### Test API Endpoint
```bash
# Health check
curl https://kidzstorymagic-api.railway.app/health

# Expected response
{"status": "ok"}
```

#### Check Logs
```
Railway Dashboard → Backend → Logs
Look for: "Server running on port 5000"
```

### Step 4: Test Frontend Integration

1. Open Frontend: https://www.kidzstorymagic.org/auth/signup
2. Fill signup form
3. Submit
4. Should see success response (no "Network Error")
5. Check browser console (F12 → Console) for any CORS errors

### Step 5: Monitor Performance

#### Deployment Time
- Before (building from source): 11+ minutes (FAILED)
- After (pre-built image): <1 minute ✅

#### API Response Time
- Monitor in Railway logs
- Check CloudFlare analytics if using

## Troubleshooting

### Issue: Railway won't recognize image
**Solution**:
1. Verify image exists: `docker pull ghcr.io/devipriyanka-25/kidzstorymagic-website/backend:main`
2. Check GitHub Packages visibility
3. Ensure tag is exactly "main" (not "latest" or "master")

### Issue: Signup still shows Network Error
**Solution**:
1. Check CORS_ORIGIN environment variable
2. Verify frontend and backend URLs match configuration
3. Check browser console for exact error
4. Check Railway logs for error details

### Issue: Image is too large or takes time to pull
**Solution**:
- This is expected first time (~1-2 minutes)
- Subsequent pulls will be faster due to layer caching
- If >5 minutes, check Railway region and network

## Environment Variables Checklist

Verify these are set in Railway → Backend → Variables:

```
NODE_ENV                    = production
CORS_ORIGIN                 = https://www.kidzstorymagic.org,https://kidzstorymagic.org,http://localhost:3000
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = true

# Add any other required env vars from backend/.env.example
DATABASE_URL               = [your postgres URL]
OPENAI_API_KEY            = [your OpenAI key]
STRIPE_API_KEY            = [your Stripe key]
# ... etc
```

## Success Criteria

✅ All items should be checked:
- [ ] Docker build completed successfully
- [ ] Image pushed to ghcr.io
- [ ] Railway configured to use pre-built image
- [ ] Backend service status: Running
- [ ] API health check responds
- [ ] Frontend signup form works
- [ ] No Network Error in frontend
- [ ] No CORS errors in browser console

## Rollback Plan

If something goes wrong:

1. Switch back to source build:
   - Railway Dashboard → Backend → Settings → Deploy
   - Change "Pre-built Image" back to "Build"
   - Railway will rebuild from source (might timeout again)

2. Or revert to previous image tag:
   - Change tag from "main" to previous commit sha
   - Example: "sha-4d6087a" or "sha-12c3bcf"

## Performance Monitoring

### Track Deployment Times
```
Expected timeline with cached image:
- GitHub Actions push: instant
- Image pull: 20-30 seconds
- Container startup: 10-20 seconds
- API ready: <1 minute total
```

### Monitor API Performance
In Railway Logs:
```
Look for startup messages:
"Server running on port 5000"
"Connected to database"
"CORS enabled for: https://www.kidzstorymagic.org"
```

## Next Phase: Optimization

Once backend is running reliably:

1. **Monitor build times**: Track GitHub Actions builds
2. **Optimize dependencies**: Remove unused packages
3. **Setup CI/CD triggers**: Auto-deploy on version releases
4. **Implement rollback**: Keep previous images tagged
5. **Add security scanning**: Scan images for vulnerabilities

## Support Contacts

- **GitHub Issues**: https://github.com/Devipriyanka-25/kidzstorymagic-website/issues
- **Railway Support**: https://docs.railway.app/
- **Docker Docs**: https://docs.docker.com/
