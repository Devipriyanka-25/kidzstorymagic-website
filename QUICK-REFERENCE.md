# QUICK REFERENCE GUIDE

## 🚀 Starting the Project

### Option 1: Using Docker (Recommended)
```bash
cd /path/to/kidz-story-magic
docker-compose up -d
```
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Database: PostgreSQL on 5432

### Option 2: Manual Setup

**Terminal 1 - Backend:**
```bash
cd backend
npm install
cp .env.example .env  # Edit with your keys
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## 📁 Important Files

### Backend
- `src/index.js` - Server entry point
- `src/config/config.js` - Configuration
- `src/routes/` - API endpoints
- `src/models/` - Database models
- `src/utils/` - Utilities (image, PDF, currency)

### Frontend
- `utils/api.js` - API client
- `utils/store.js` - State management
- `components/wizard/` - Wizard steps
- `next.config.js` - Next.js config

### Configuration
- `backend/.env.example` - Backend config template
- `frontend/.env.local.example` - Frontend config template
- `docker-compose.yml` - Docker setup

## 🔑 Environment Variables

### Backend (Required)
```
DATABASE_URL=postgresql://user:pass@localhost/kidz_story_magic
JWT_SECRET=your-super-secret-key
STRIPE_SECRET_KEY=sk_test_...
EXCHANGE_RATE_API_KEY=your_key
```

### Frontend (Required)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_KEY=pk_test_...
```

## 🗄️ Database

### Initialize
```bash
# Using PostgreSQL CLI
psql -U postgres < docs/database-schema.sql

# Or
psql postgresql://user:pass@localhost/kidz_story_magic
\i docs/database-schema.sql
```

### Main Tables
- `users` - User accounts
- `story_projects` - Created stories
- `orders` - Paid orders
- `generated_pdfs` - Final PDFs
- `currency_rates` - Exchange rates cache

## 🛣️ API Quick Access

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Story
```bash
curl -X POST http://localhost:5000/api/story/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Story",
    "age_group": "5-8",
    "theme": "family",
    "page_count": 10,
    "child_name": "Emma",
    "child_gender": "female"
  }'
```

## 📦 NPM Commands

### Backend
```bash
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
npm test            # Run tests
npm run lint        # Lint code
npm run db:migrate  # Run database migrations
```

### Frontend
```bash
npm install         # Install dependencies
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Lint code
npm test           # Run tests
```

## 🎨 Story Themes

1. **family** - Family adventures
2. **friends** - Friendship stories
3. **motivational** - Inspirational stories
4. **behavioural** - Emotional learning
5. **fairytale** - Magical adventures
6. **customizable** - User-defined

Each has templates for 10, 20, 30 pages.

## 💳 Stripe Setup

1. Get API keys from https://stripe.com/
2. Add to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
3. Add to `frontend/.env.local`:
   ```
   NEXT_PUBLIC_STRIPE_KEY=pk_test_...
   ```

## 💱 Currency Setup

1. Get API key from https://exchangerate-api.com/
2. Add to backend `.env`:
   ```
   EXCHANGE_RATE_API_KEY=your_api_key
   ```
3. Supported currencies: USD, CAD, GBP, EUR, AUD, INR

## 🖼️ Image Processing

**Watermark**: Applied to preview versions only
**Blur**: Gaussian blur on face areas
**Final PDF**: High-resolution, no watermark, no blur

Files located in `backend/uploads/` and `backend/pdfs/`

## 📝 API Endpoints Summary

### Auth (4)
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `PUT /auth/me`

### Story (7)
- `POST /story/create`
- `GET /story`
- `GET /story/:id`
- `PUT /story/:id`
- `DELETE /story/:id`
- `POST /story/:id/upload-photo`
- `POST /story/:id/generate-story`

### Payment (5)
- `POST /payment/checkout`
- `POST /payment/confirm-payment`
- `GET /payment/order/:id`
- `GET /payment/user/orders`
- `GET /payment/pdf/:projectId`

### Currency (6)
- `GET /currency/supported`
- `GET /currency/rates`
- `POST /currency/convert`
- `POST /currency/pricing`
- `GET /currency/detect`
- `POST /currency/refresh-rates`

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Frontend (3000)
npx kill-port 3000

# Backend (5000)
npx kill-port 5000
```

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U postgres -d postgres

# Format: postgresql://username:password@host:port/database
```

### Image Upload Fails
- Check `backend/uploads/` directory exists
- Verify file size < 5MB
- Allowed types: JPEG, PNG, WebP

### PDF Generation Issues
- Verify Puppeteer installed: `npm list puppeteer`
- Check disk space for PDFs
- Verify `backend/pdfs/` directory exists

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `PROJECT-SUMMARY.md` | Complete deliverables |
| `docs/API-DOCUMENTATION.md` | API endpoints (22 with examples) |
| `docs/DEPLOYMENT.md` | Deployment guide |
| `docs/database-schema.sql` | Database structure |
| `setup.sh` | Automated setup script |

## 🚢 Deployment Quick Commands

### Docker Compose
```bash
# Start all services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild images
docker-compose up -d --build
```

### Environment for Production
```bash
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
DB_HOST=production-database-host
STRIPE_SECRET_KEY=sk_live_...
```

## 📞 Getting Help

1. Check `docs/API-DOCUMENTATION.md` for API details
2. Review `docs/DEPLOYMENT.md` for deployment issues
3. Check database schema in `docs/database-schema.sql`
4. Review component code in `frontend/components/`
5. Check route implementations in `backend/src/routes/`

## ✅ Pre-Deployment Checklist

- [ ] PostgreSQL installed and running
- [ ] Environment variables configured
- [ ] Stripe API keys obtained
- [ ] Exchange Rate API key obtained
- [ ] `.env` files created in both frontend and backend
- [ ] Dependencies installed (`npm install`)
- [ ] Database migrated (`psql < schema.sql`)
- [ ] Application tested locally
- [ ] Docker images built (if using Docker)
- [ ] SSL certificates ready (for production)

---

**Project Status**: ✅ Production-Ready
**Last Updated**: January 2024
