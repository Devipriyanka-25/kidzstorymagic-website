# Deployment Guide

This guide covers the minimum production deployment path for Kidz Story Magic.

## Services

- `backend/`: Express API on port `5000`
- `frontend/`: Next.js app on port `3000`
- PostgreSQL database
- Optional object storage and AI providers

## Required Production Environment

Store real values in your hosting provider's secret manager. Do not commit production env files.

Backend:

```text
NODE_ENV=production
PORT=5000
BASE_URL=https://api.example.com
FRONTEND_URL=https://app.example.com
CORS_ORIGIN=https://app.example.com
DATABASE_URL=<postgres connection string>
JWT_SECRET=<32+ character random secret>
STRIPE_SECRET_KEY=<Stripe secret key>
STRIPE_PUBLISHABLE_KEY=<Stripe publishable key>
STRIPE_WEBHOOK_SECRET=<Stripe webhook signing secret>
EMAIL_SERVICE=gmail
EMAIL_FROM=noreply@example.com
EMAIL_USER=<mailbox user>
EMAIL_PASSWORD=<mailbox app password>
```

Frontend:

```text
NEXT_PUBLIC_API_URL=https://api.example.com/api
NEXT_PUBLIC_APP_URL=https://app.example.com
NEXT_PUBLIC_STRIPE_KEY=<Stripe publishable key>
NEXT_PUBLIC_DEBUG_MODE=false
```

Optional backend variables are listed in [../backend/.env.example](../backend/.env.example).

## Database

Run migrations after provisioning Postgres and before opening the app to users:

```bash
cd backend
NODE_ENV=production DATABASE_URL=<from secret manager> npm run db:migrate
```

The backend supports either `DATABASE_URL` or individual `DB_*` values. Prefer `DATABASE_URL` for hosted databases.

## Backend Deployment

Use `backend/` as the service root.

```text
Install command: npm install
Build command: npm run build
Start command: npm start
Health check: /api/health
```

Production startup validates required env vars and exits if secrets are missing, too weak, or still placeholder values.

## Frontend Deployment

Use `frontend/` as the service root.

```text
Install command: npm install
Build command: npm run build
Start command: npm start
```

Only expose `NEXT_PUBLIC_*` values that are safe for browsers.

## Docker Compose

For local container validation:

```bash
cp .env.example .env
docker compose up --build
```

Fill `DB_PASSWORD` and `JWT_SECRET` before running. Compose intentionally does not provide fake secret defaults.

## Stripe Webhook

Configure the Stripe webhook URL to:

```text
https://api.example.com/api/payment/webhook
```

Set the resulting webhook signing secret as `STRIPE_WEBHOOK_SECRET`.

## Smoke Test

After deployment:

```bash
curl https://api.example.com/api/health
curl https://api.example.com/api/health/db
```

Then verify in the browser:

- Sign up
- Log in
- Request password reset
- Create a story project
- Upload a photo
- Generate story preview
- Start checkout
- Return to the success page

## Rollback

Use your platform's previous deployment or image rollback. After rollback, confirm:

- API health is green
- Frontend points at the rolled-back compatible API
- Database migrations are backward compatible with the deployed code

## Final Checklist

- [ ] Production secrets are set in the deployment platform, not committed files.
- [ ] `DATABASE_URL` or all required `DB_*` values are configured.
- [ ] `JWT_SECRET` is unique and at least 32 characters.
- [ ] `BASE_URL`, `FRONTEND_URL`, `CORS_ORIGIN`, and `NEXT_PUBLIC_API_URL` use production HTTPS URLs.
- [ ] Stripe keys and webhook secret are configured for the same Stripe mode.
- [ ] Database migrations have run.
- [ ] `/api/health` and `/api/health/db` pass.
- [ ] Auth, password reset, story generation, checkout, and success-page flows pass smoke testing.
