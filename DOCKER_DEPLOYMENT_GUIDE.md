# Docker Deployment Guide - Kidz Story Magic Backend

## Overview
This guide explains how the backend is deployed using Docker image caching to eliminate build timeouts.

## Architecture

### Problem Solved
- **Before**: Railway's 10-minute timeout limit
- **After**: <30-second deployments with pre-built cached Docker images

### Solution: Docker Image Caching
1. **Build Once** (~11 minutes): GitHub Actions builds Docker image with all npm dependencies
2. **Cache in Registry** (GHCR): Image stored in GitHub Container Registry
3. **Deploy Fast** (<30 seconds): Railway pulls pre-built image instantly

## GitHub Actions Workflow

**File**: `.github/workflows/build-and-push-docker.yml`

### Workflow Steps
```
1. Checkout code
2. Convert image name to lowercase (Docker requirement)
3. Setup Docker Buildx
4. Login to GitHub Container Registry (GHCR)
5. Extract metadata (tags: branch, semver, commit sha)
6. Build and push Docker image with cache layers
7. Image stored at: ghcr.io/devipriyanka-25/kidzstorymagic-website/backend:main
```

### Trigger Conditions
- Automatic: On push to `main` branch if backend or package files change
- Manual: Can trigger via `workflow_dispatch`

## Docker Images

### Production Image
**File**: `backend/Dockerfile.prod`

**Specifications**:
- **Base**: `node:20-alpine` (5MB vs 350MB+ Bookworm)
- **Optimizations**:
  - `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`
  - `NODE_OPTIONS=--max-old-space-size=512`
  - `npm ci --only=production` with aggressive flags
  - maxsockets=128 for parallel npm resolution
  - Network retry configuration

**Size**: ~400-500MB (optimized from 1+ GB)

### Image Locations
```
Development/Testing:
  docker build -t kidzstorymagic-backend:dev .
  
Production (GitHub Container Registry):
  ghcr.io/devipriyanka-25/kidzstorymagic-website/backend:main
  ghcr.io/devipriyanka-25/kidzstorymagic-website/backend:v1.0.0 (tagged releases)
  ghcr.io/devipriyanka-25/kidzstorymagic-website/backend:sha-a5b08db (commit-specific)
```

## Railway Deployment

### Current Status
- **Platform**: Railway.app
- **Backend Service ID**: 62b6db7e-11ef-4c14-8dec-c3bb555c74b7
- **Project ID**: bdfa22e7-4181-46f5-b3a9-4f92857fe882
- **Region**: asia-southeast1

### Configuration
**Environment Variables**:
```
NODE_ENV=production
CORS_ORIGIN=https://www.kidzstorymagic.org,https://kidzstorymagic.org,http://localhost:3000
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

### Using Pre-Built Image
Railway can be configured in two ways:

#### Option 1: Auto-Build from Source (Current - BROKEN)
- Railway builds from GitHub source code
- Takes 11m+ (exceeds 10m timeout)
- ❌ Fails every time

#### Option 2: Pull Pre-Built Image (RECOMMENDED)
1. In Railway Dashboard:
   - Service: Backend
   - Settings → Deploy
   - Change "Build from Source" → "Use Pre-built Image"
   - Registry: ghcr.io
   - Image: `devipriyanka-25/kidzstorymagic-website/backend`
   - Tag: `main` (or `latest`)

2. Authentication (if repository is private):
   - Add GHCR credentials to Railway
   - GitHub Token with `read:packages` permission

**Result**: Deployment takes <30 seconds instead of 11+ minutes

### Manual Image Pull
```bash
docker pull ghcr.io/devipriyanka-25/kidzstorymagic-website/backend:main
```

## Building Locally

### Build Docker Image
```bash
# Build with all optimizations
docker build -f backend/Dockerfile.prod -t kidzstorymagic-backend:latest .

# Build for local testing
docker build -f backend/Dockerfile -t kidzstorymagic-backend:dev backend/
```

### Run Container
```bash
# Production image
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e CORS_ORIGIN=http://localhost:3000 \
  ghcr.io/devipriyanka-25/kidzstorymagic-website/backend:main

# Local development
docker run -p 5000:5000 \
  -v $(pwd)/backend/src:/app/src \
  -e NODE_ENV=development \
  kidzstorymagic-backend:dev
```

### Health Check
```bash
# Check if API is running
curl http://localhost:5000/health

# Expected response
{"status": "ok"}
```

## Troubleshooting

### Issue: Docker build still times out
- **Cause**: npm dependencies might have grown
- **Solution**: 
  1. Check `backend/package.json` for unnecessary dependencies
  2. Move non-critical packages to devDependencies
  3. Consider using Alpine-based versions of heavy packages

### Issue: Image won't pull from GHCR
- **Cause**: Repository might be private/authentication issue
- **Solution**:
  1. Verify repository visibility on GitHub
  2. Create GitHub Token: https://github.com/settings/tokens
  3. Configure Railway with token

### Issue: API fails to start after deployment
- **Cause**: Environment variables not set
- **Solution**:
  1. Check Railway → Backend Service → Environment
  2. Verify all required env vars are present
  3. Check logs: Railway Dashboard → Service → Logs

## Performance Metrics

### Build Time Comparison
```
Before (Bookworm):
  - npm install: 10m+ (timeout)
  - Status: FAILED ❌

After (Alpine):
  - Base image pull: ~1m
  - npm ci: ~8-9 minutes
  - Docker build: ~1-2 minutes
  - Push to registry: ~1-2 minutes
  - Total: ~11-12 minutes (one-time)

Railway Deployment:
  - Image pull: <30 seconds ✅
  - Container start: ~10 seconds ✅
  - Total: <1 minute ✅
```

### Image Size
```
Original (Bookworm): 1.2 GB
Optimized (Alpine): 400-500 MB
Reduction: 65% smaller
```

## CI/CD Pipeline

### Automated Workflow
```
1. Developer pushes to main
   ↓
2. GitHub Actions triggered
   ↓
3. Docker image built with cache
   ↓
4. Image pushed to ghcr.io
   ↓
5. (Optional) Railway auto-updates service
   ↓
6. New version deployed in <30s
```

### Manual Trigger
```bash
# In GitHub Actions UI:
1. Go to "Build and Push Docker Image to GHCR"
2. Click "Run workflow"
3. Select branch: main
4. Click "Run workflow" button
```

## Security Considerations

### Image Registry
- **Public Registry**: ghcr.io (GitHub Container Registry)
- **Access Control**: GitHub permissions
- **Best Practice**: Use private registry for sensitive applications

### Container Security
- **Non-root User**: Nodejs user (UID 1001)
- **Health Check**: Implemented for orchestrators
- **Signal Handling**: SIGTERM graceful shutdown

### Secrets Management
- Use Railway environment variables for secrets
- Never commit `.env` files
- Use GitHub Actions secrets for build-time secrets

## Future Improvements

1. **Multi-stage Caching**: Cache npm layer separately
2. **Release Tags**: Tag images with version numbers (v1.0.0)
3. **Automated Cleanup**: Remove old images from registry
4. **Security Scanning**: Scan images for vulnerabilities
5. **Performance Monitoring**: Track deployment times
6. **Rollback Strategy**: Keep previous versions available

## References

- [GitHub Container Registry Docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Railway Documentation](https://docs.railway.app/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Alpine Linux for Docker](https://alpinelinux.org/)
