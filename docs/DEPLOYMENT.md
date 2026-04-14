# Deployment Guide - Kidz Story Magic

## Overview

This guide covers deploying Kidz Story Magic to production environments.

## Prerequisites

- Docker & Docker Compose installed
- PostgreSQL 13+ (or use Docker)
- Node.js 18+
- Stripe account with API keys
- AWS account (for S3 storage)
- SSL certificate (for HTTPS)

## Deployment Options

### 1. Docker Deployment

#### Build Docker Images

```bash
# Build backend image
cd backend
docker build -t kidz-story-api:latest .

# Build frontend image
cd ../frontend
docker build -t kidz-story-app:latest .
```

#### Using Docker Compose

```bash
# Navigate to project root
cd ..

# Set environment variables
export NODE_ENV=production
export STRIPE_SECRET_KEY=sk_live_...
export EXCHANGE_RATE_API_KEY=your_key

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 2. DigitalOcean App Platform

1. **Create App from Git**
   - Connect GitHub repository
   - Select branch `main` or `production`

2. **Configure Services**

```yaml
services:
  - name: backend
    github:
      repository: your-repo/kidz-story-magic
      branch: main
      directory: backend
    http_port: 5000
    environment_slug: node-20
    envs:
      - key: NODE_ENV
        value: production
      - key: DB_HOST
        scope: RUN_AND_BUILD_TIME
        value: ${db.hostname}

  - name: frontend
    github:
      repository: your-repo/kidz-story-magic
      branch: main
      directory: frontend
    http_port: 3000
    environment_slug: node-20

databases:
  - name: db
    engine: PG
    version: "15"
```

3. **Deploy**
   - Click "Deploy"
   - Monitor logs for errors

### 3. AWS Deployment

#### Using Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB
eb init -p node.js app-name

# Create environment
eb create production-env

# Deploy
eb deploy
```

#### Using ECS & RDS

1. **Create RDS PostgreSQL instance**
   - Multi-AZ enabled
   - Automated backups

2. **Create ECR repositories**
```bash
aws ecr create-repository --repository-name kidz-story-api
aws ecr create-repository --repository-name kidz-story-app
```

3. **Push Docker images**
```bash
# Authenticate with ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin [account-id].dkr.ecr.us-east-1.amazonaws.com

# Tag and push images
docker tag kidz-story-api:latest [account-id].dkr.ecr.us-east-1.amazonaws.com/kidz-story-api:latest
docker push [account-id].dkr.ecr.us-east-1.amazonaws.com/kidz-story-api:latest
```

4. **Create ECS cluster and services**
   - Use CloudFormation template or AWS Console
   - Configure load balancer
   - Set up auto-scaling

### 4. Vercel + Heroku

#### Frontend on Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

Environment variables in Vercel Dashboard:
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_STRIPE_KEY=pk_live_...
```

#### Backend on Heroku

```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set STRIPE_SECRET_KEY=sk_live_...

# Deploy
git push heroku main
```

## Production Configuration

### Environment Variables (.env.production)

```bash
# Application
NODE_ENV=production
PORT=5000
BASE_URL=https://api.yourdomain.com

# Database
DB_HOST=prod-database.aws.rds.amazonaws.com
DB_PORT=5432
DB_NAME=kidz_story_magic
DB_USER=postgres
DB_PASSWORD=${SECURE_DB_PASSWORD}

# JWT
JWT_SECRET=${SECURE_JWT_SECRET}
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_live_${STRIPE_KEY}
STRIPE_WEBHOOK_SECRET=whsec_${WEBHOOK_SECRET}

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=${AWS_KEY}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET}
AWS_S3_BUCKET=kidz-story-magic-prod

# Exchange Rate
EXCHANGE_RATE_API_KEY=${EXCHANGE_API_KEY}

# Email
EMAIL_USER=${EMAIL_USER}
EMAIL_PASSWORD=${EMAIL_PASSWORD}

# CORS
CORS_ORIGIN=https://yourdomain.com

# Logging
LOG_LEVEL=info
```

## SSL/TLS Setup

### Using Let's Encrypt with Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Auto-renewal with Certbot

```bash
certbot renew --quiet --no-self-upgrade
```

## Database Migration

### Running Migrations in Production

```bash
# Connect to production database
psql -h prod-database.aws.rds.amazonaws.com \
     -U postgres \
     -d kidz_story_magic \
     -f docs/database-schema.sql

# Or using psql CLI
psql postgresql://user:password@host:5432/dbname < schema.sql
```

## Backup Strategy

### PostgreSQL Backups

```bash
# Manual backup
pg_dump postgresql://user:pass@host:5432/db > backup.sql

# Automated daily backup
0 2 * * * pg_dump postgresql://user:pass@host:5432/db > /backups/db_$(date +\%Y\%m\%d).sql
```

### S3 Backups

```bash
# Backup uploads to S3
aws s3 sync ./uploads s3://kidz-story-magic-backups/uploads/ --sse AES256
```

## Monitoring

### CloudWatch Metrics

```javascript
// In backend code
const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch();

cloudwatch.putMetricData({
  Namespace: 'KidzStoryMagic',
  MetricData: [
    {
      MetricName: 'StoriesGenerated',
      Value: count,
      Unit: 'Count'
    }
  ]
}, callback);
```

### Health Checks

```bash
# Add health check endpoint
curl https://api.yourdomain.com/api/health
```

## Performance Optimization

### Caching Strategy

- CDN for static assets (CloudFront)
- Redis for session storage
- Database query caching

### Image Optimization

- Compress PDFs before storage
- Use WebP for preview images
- Lazy load story content

## Security Checklist

- [ ] Enable HTTPS/SSL
- [ ] Set secure JWT secret
- [ ] Enable CORS only for your domain
- [ ] Use environment variables for secrets
- [ ] Enable database encryption
- [ ] Set up WAF rules
- [ ] Enable API rate limiting
- [ ] Configure backup retention
- [ ] Set up monitoring alerts
- [ ] Regular security audits

## Rollback Procedure

### Docker Rollback

```bash
# List previous versions
docker images | grep kidz-story

# Rollback to previous version
docker-compose down
docker-compose pull
docker-compose up -d
```

### Git Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
psql -h host -U user -d dbname -c "SELECT 1"
```

### Memory Issues

```bash
# Increase Node.js heap
NODE_OPTIONS=--max-old-space-size=4096 npm start
```

### PDF Generation Fails

```bash
# Check Puppeteer/Chromium
npm list puppeteer
```

## Support

For deployment assistance, contact: deployment@kidzstorymagic.com

---

**Last Updated**: January 2024
