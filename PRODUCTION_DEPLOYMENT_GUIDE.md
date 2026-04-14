# Kidz Story Magic - Production Deployment Guide & README

## 🎯 Project Overview

**Kidz Story Magic** is an AI-powered personalized storybook generator for children. Users can:
- Create customized stories by selecting age, theme, and uploading photos
- Generate beautifully illustrated stories featuring their child
- Download stories as PDFs
- Create multiple drafts and resume later
- Access premium features through Stripe payments

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- PostgreSQL >= 12 (or cloud database)
- Stripe Account
- Git

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/kidz-story-magic.git
cd kidz-story-magic
```

#### 2. Backend Setup
```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env.local

# Create database
npm run db:migrate

# Seed sample data (optional)
npm run db:seed

# Start backend
npm run dev
# or for production
npm start
```

#### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Copy and configure environment variables
cp .env.local.example .env.local

# Start frontend
npm run dev
# or for production build
npm run build
npm start
```

#### 4. Access Application
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/api/docs

## 🏗️ Project Structure

```
kidz-story-magic/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # Database schemas
│   │   ├── routes/           # API endpoints
│   │   ├── middleware/       # Auth, validation
│   │   ├── services/         # Business logic
│   │   └── utils/            # Helpers
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── app/                  # Next.js app pages & layouts
│   ├── components/           # React components
│   ├── utils/                # Utilities & hooks
│   ├── public/               # Static assets
│   ├── package.json
│   └── .env.local.example
└── docs/
    ├── API.md                # API documentation
    ├── DEPLOYMENT.md         # Deployment guide
    └── SECURITY.md           # Security best practices
```

## 🔧 Configuration

### Backend Environment Variables
```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your_secret_key_here
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
CORS_ORIGIN=https://yourdomain.com
```

### Frontend Environment Variables
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_STRIPE_KEY=pk_live_xxx
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_WHATSAPP_NUMBER=1xxxxxxxxxx
```

## 📦 Deployment

### Vercel (Recommended for Frontend)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` directory as root
   - Add environment variables
   - Deploy!

### Railway, Render, or Heroku (for Backend)

1. **Push Code**
   ```bash
   git push origin main
   ```

2. **Create New Project**
   - Go to Railway.app, Render.com, or Heroku.com
   - Create new project from GitHub
   - Select the repository
   - Set environment variables
   - Configure build command: `npm install`
   - Configure start command: `npm start`
   - Deploy!

### Database Migration for Production

```bash
# Create database on cloud provider (Supabase, Railway, etc.)
# Configure DATABASE_URL in .env

# Run migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

## ✅ Testing & QA

### Run Tests
```bash
# Frontend unit tests
cd frontend
npm test

# Backend tests
cd ../backend
npm test

# With coverage
npm test -- --coverage
```

### Build Verification
```bash
# Frontend
cd frontend
npm run build
npm start

# Backend
cd ../backend
npm run dev
```

## 🔐 Security Checklist

- [ ] All sensitive keys in `.env.local` (never in code)
- [ ] HTTPS enabled in production
- [ ] CORS properly configured
- [ ] JWT secrets rotated regularly
- [ ] Database backups automated
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (using parameterized queries)
- [ ] XSS protection (React auto-escapes by default)
- [ ] CSRF tokens for state-changing operations

## 🆘 Troubleshooting

### Frontend Issues

**"Cannot find module" errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build fails**
- Check for console errors
- Verify all imports paths are correct
- Run `npm run lint` to check for syntax errors

**API requests fail**
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify backend is running
- Check browser console for CORS errors

### Backend Issues

**Database connection error**
- Verify `DATABASE_URL` or `DB_*` variables
- Ensure database is running and accessible
- Check database credentials

**Port already in use**
```bash
# Change PORT in .env
PORT=5001 npm run dev
```

## 📚 API Documentation

### Authentication
```
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me (requires token)
```

### Stories
```
POST /api/story/create
GET /api/story
GET /api/story/:id
PUT /api/story/:id
DELETE /api/story/:id
POST /api/story/:id/photos (upload images)
POST /api/story/:id/generate (generate story)
```

### Payment
```
POST /api/payment/checkout
GET /api/payment/success
POST /api/payment/webhook (Stripe webhook)
```

Full documentation: See `docs/API-DOCUMENTATION.md`

## 🐛 Error Handling

The application includes comprehensive error handling:
- **Global Error Boundary** catches React errors
- **API Error Handler** with retry logic
- **Validation Errors** with field-level feedback
- **Network Errors** with fallback UI
- **Loading States** with skeleton screens

## 🎨 UI Components

### Pre-built Components
- `ErrorBoundary` - Catches and displays component errors
- `LoadingSkeletons` - Loading placeholders
- `SupportModal` - Help and WhatsApp integration
- `PDFPreviewModal` - Story preview with watermark
- `ImageUploadComponent` - Drag-and-drop uploads
- `StoryPreviewComponent` - Story display

## 🚦 Available Scripts

### Frontend
```bash
npm run dev       # Start development server
npm run build     # Create production build
npm start         # Run production server
npm test          # Run tests
npm run lint      # Check code quality
```

### Backend
```bash
npm run dev       # Start with nodemon watch
npm start         # Run with Node
npm test          # Run tests
npm run lint      # Check code quality
npm run db:migrate # Run database migrations
npm run db:seed   # Seed database
```

## 📈 Performance Optimization

- Images are compressed automatically
- Code is split with dynamic imports
- Static assets cached with Vercel
- Database queries optimized with indexes
- API responses cached when appropriate
- Bundle size: ~150KB (gzipped)

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push branch: `git push origin feature/amazing-feature`
4. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see `LICENSE` file for details.

## 📞 Support

- **Email**: support@kidzstorymagic.com
- **WhatsApp**: +91-7385-983-456
- **Documentation**: [/docs](./docs)
- **Issues**: [GitHub Issues](https://github.com/yourusername/kidz-story-magic/issues)

## 🙏 Acknowledgments

- OpenAI for story generation
- Stripe for payments
- Vercel for hosting
- All contributors and users!

---

**Made with ❤️ for children worldwide**

Last Updated: April 2024
Version: 1.0.0
