# Kidz Story Magic

Kidz Story Magic is a full-stack storybook creator for personalized children's stories. The app includes a Next.js frontend, an Express API, PostgreSQL storage, Stripe checkout, image processing, PDF generation, and optional AI image/story providers.

## Project Structure

```text
.
├── backend/          # Express API, PostgreSQL models, Stripe, PDF/image services
├── frontend/         # Next.js App Router frontend
├── docs/             # Database schema and deployment docs
├── story-templates/  # Story template JSON files
├── docker-compose.yml
└── .env.example      # Root template for Docker Compose
```

## Prerequisites

- Node.js 18+
- PostgreSQL 13+
- npm
- Stripe account for production payments
- Optional: OpenAI, Stability, Replicate, Azure, AWS, or ExchangeRate API keys

## Local Setup

1. Create local env files.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

Fill in at least these backend values:

```text
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kidz_story_magic
DB_USER=postgres
DB_PASSWORD=<local database password>
JWT_SECRET=<32+ character random secret>
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

Generate a local JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. Install dependencies.

```bash
cd backend && npm install
cd ../frontend && npm install
```

3. Run database migrations.

```bash
cd backend
npm run db:migrate
```

4. Start both services.

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

The API runs at `http://localhost:5000`; the frontend runs at `http://localhost:3000`.

## Docker Compose

For local Docker runs, copy the root env template and fill in required values:

```bash
cp .env.example .env
docker compose up --build
```

`DB_PASSWORD` and `JWT_SECRET` are intentionally required by `docker-compose.yml`; fake default secrets are not supplied.

## Environment Variables

Backend secrets belong in `backend/.env` locally or in the backend hosting provider's secret manager. Frontend values prefixed with `NEXT_PUBLIC_` are exposed to browsers and must not contain secrets.

Required backend production variables:

```text
NODE_ENV=production
BASE_URL=https://api.example.com
FRONTEND_URL=https://app.example.com
CORS_ORIGIN=https://app.example.com
DATABASE_URL=<postgres connection string>
JWT_SECRET=<32+ character random secret>
STRIPE_SECRET_KEY=<set in secret manager>
STRIPE_PUBLISHABLE_KEY=<set in secret manager>
STRIPE_WEBHOOK_SECRET=<set in secret manager>
```

Required frontend production variables:

```text
NEXT_PUBLIC_API_URL=https://api.example.com/api
NEXT_PUBLIC_APP_URL=https://app.example.com
NEXT_PUBLIC_STRIPE_KEY=<Stripe publishable key>
```

Optional integrations are documented in [backend/.env.example](backend/.env.example).

## API Summary

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `POST /api/story/create`
- `POST /api/story/:projectId/upload-photo`
- `POST /api/story/:projectId/generate-story`
- `POST /api/payment/checkout`
- `GET /api/payment/verify/:sessionId`
- `POST /api/payment/webhook`
- `POST /api/currency/convert`
- `POST /api/currency/pricing`

## Production Deployment

1. Provision PostgreSQL and run migrations against production.

```bash
cd backend
NODE_ENV=production DATABASE_URL=<from secret manager> npm run db:migrate
```

2. Deploy the backend with `backend/` as the service root.

Required settings:

```text
Build command: npm install
Start command: npm start
Health check: /api/health
```

3. Deploy the frontend with `frontend/` as the service root.

Required settings:

```text
Build command: npm install && npm run build
Start command: npm start
```

4. Configure Stripe webhook delivery to:

```text
https://api.example.com/api/payment/webhook
```

Set the webhook signing secret in `STRIPE_WEBHOOK_SECRET`.

5. Confirm CORS and URLs:

```text
BASE_URL=https://api.example.com
FRONTEND_URL=https://app.example.com
CORS_ORIGIN=https://app.example.com
NEXT_PUBLIC_API_URL=https://api.example.com/api
NEXT_PUBLIC_APP_URL=https://app.example.com
```

## Deployment Checklist

- [ ] No real `.env`, `.env.local`, or production env files are committed.
- [ ] `backend/.env.example`, `frontend/.env.local.example`, and `.env.example` are up to date.
- [ ] Production backend has `NODE_ENV=production`.
- [ ] PostgreSQL is provisioned and migrations have run.
- [ ] `JWT_SECRET` is unique, private, and at least 32 characters.
- [ ] Stripe secret, publishable, and webhook keys are configured in the hosting provider.
- [ ] `CORS_ORIGIN` only includes deployed frontend origins.
- [ ] `BASE_URL`, `FRONTEND_URL`, and `NEXT_PUBLIC_API_URL` use HTTPS production URLs.
- [ ] Password reset email credentials are configured, or the flow is intentionally disabled before launch.
- [ ] Optional AI/storage provider keys are scoped only to environments that need them.
- [ ] `/api/health` and `/api/health/db` pass after deployment.
- [ ] Frontend login, story creation, checkout, and payment success flows are smoke-tested.

## Verification Commands

```bash
cd backend && npm test -- --runInBand
cd frontend && npm test -- --runInBand
cd frontend && npm run build
```

More deployment details are in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
