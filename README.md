# Kidz Story Magic - AI Storybook Creator Platform

## 🎯 Project Overview

Kidz Story Magic is a cutting-edge AI-powered platform that enables parents and educators to create personalized, engaging storybooks for children. The platform combines artificial intelligence with a user-friendly 6-step wizard to generate custom stories, complete with automatic face blur and watermarking on preview, and high-quality PDF exports for paid downloads.

### Key Features

✨ **6-Step Wizard Creation Process**
- Step 1: Age Group Selection
- Step 2: Theme Selection (6 themes)
- Step 3: Page Count (10, 20, or 30 pages)
- Step 4: Child Details Input
- Step 5: Photo Upload with Processing
- Step 6: Preview & Checkout

📖 **Story Themes**
- **Family** - Heartwarming family adventures
- **Friends** - Making and maintaining friendships
- **Motivational** - Courage and perseverance stories
- **Behavioral** - Emotional learning and growth
- **Fairytale** - Magical fantasy adventures
- **Customizable** - User-defined story parameters

🎨 **Image Processing**
- Face detection and automatic blur
- Diagonal watermark on preview pages
- High-resolution processing for final PDFs
- Support for JPEG, PNG, WebP formats

💳 **Payment & Currency**
- Stripe integration for secure payments
- Real-time currency conversion (USD, CAD, GBP, EUR, AUD, INR)
- Dynamic pricing based on user location
- Amazon-style currency display

📱 **Responsive Design**
- Next.js with Tailwind CSS
- Mobile-first approach
- Optimized for all screen sizes

## 🏗️ Project Structure

```
kidz-story-magic/
├── frontend/                 # Next.js React application
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   │   └── wizard/         # 6-step wizard components
│   ├── utils/              # API clients and stores
│   ├── styles/             # Global styles
│   ├── public/             # Static assets
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── .env.local.example
│
├── backend/                 # Express.js REST API
│   ├── src/
│   │   ├── index.js        # Server entry point
│   │   ├── config/         # Configuration files
│   │   ├── routes/         # API endpoints
│   │   ├── models/         # Database models
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Helper utilities
│   ├── uploads/            # User uploads directory
│   ├── pdfs/               # Generated PDFs
│   ├── package.json
│   └── .env.example
│
├── story-templates/        # JSON story templates
│   ├── family-template.json
│   ├── friends-template.json
│   ├── motivational-template.json
│   ├── behavioural-template.json
│   ├── fairytale-template.json
│   └── customizable-template.json
│
├── docs/                   # Documentation
│   ├── database-schema.sql
│   ├── API-DOCUMENTATION.md
│   ├── DEPLOYMENT.md
│   └── SETUP.md
│
└── infrastructure/         # Deployment configs
    ├── docker-compose.yml
    └── .env.production
```

## 🗄️ Database Schema

### Key Tables

**Users**
- id, name, email, password_hash, profile_picture_url, preferred_currency, location, created_at, updated_at

**Story Projects**
- id, user_id, title, age_group, theme, page_count, child_name, child_gender, child_interests, child_notes, status, created_at

**Story Content**
- id, project_id, page_number, page_title, page_text, created_at

**Images**
- id, project_id, original_filename, original_url, blurred_url, watermarked_url, high_res_url, face_detected, processing_status

**Orders**
- id, user_id, project_id, amount, currency, status, stripe_payment_intent_id, created_at

**Generated PDFs**
- id, project_id, order_id, pdf_url, file_size, page_count, is_blurred, has_watermark, created_at

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Stripe Account
- AWS Account (for S3 and optional Rekognition)
- Exchange Rate API Key

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Initialize database**
```bash
npm run db:migrate
npm run db:seed
```

5. **Start development server**
```bash
npm run dev
```

Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.local.example .env.local
```

4. **Start development server**
```bash
npm run dev
```

Application runs on `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile

### Story Management
- `POST /api/story/create` - Create new project
- `GET /api/story` - List user's projects
- `GET /api/story/:projectId` - Get project details
- `PUT /api/story/:projectId` - Update project
- `DELETE /api/story/:projectId` - Delete project
- `POST /api/story/:projectId/upload-photo` - Upload photo
- `POST /api/story/:projectId/generate-story` - Generate story
- `GET /api/story/:projectId/content` - Get story content

### Payments
- `POST /api/payment/checkout` - Create checkout session
- `POST /api/payment/confirm-payment` - Confirm payment
- `GET /api/payment/order/:orderId` - Get order details
- `GET /api/payment/user/orders` - Get user's orders
- `GET /api/payment/pdf/:projectId` - Get PDF download link
- `POST /api/payment/webhook` - Stripe webhook

### Currency Conversion
- `GET /api/currency/supported` - Get supported currencies
- `GET /api/currency/rates` - Get exchange rates
- `POST /api/currency/convert` - Convert amount
- `POST /api/currency/pricing` - Get pricing in currency
- `GET /api/currency/detect` - Detect user currency
- `POST /api/currency/refresh-rates` - Refresh rates

## 🎨 Story Templates

Each theme includes 3 templates: 10, 20, and 30-page versions with personalized placeholders:

```json
{
  "theme": "family",
  "age_range": "5-8",
  "templates": {
    "10": {
      "page_count": 10,
      "pages": [
        {
          "page_number": 1,
          "title": "...",
          "text": "{{child_name}} discovered... {{child_gender == 'male' ? 'his' : 'her'}} {{interest}}..."
        }
      ]
    }
  }
}
```

### Placeholder Variables
- `{{child_name}}` - Child's name
- `{{child_gender}}` - Gender (male/female)
- `{{interest}}` - Child's interests
- `{{age}}` - Child's age
- `{{theme_keyword}}` - Theme type

## 🖼️ Image Processing

### Watermark Feature
- Diagonal text watermark ("PREVIEW - WATERMARK")
- 30% opacity overlay
- Applied to all preview page images

### Blur Feature
- Gaussian blur (radius: 25)
- Face detection and specific blur
- Applied to preview versions only

### Final PDF
- High-resolution processing (95% quality)
- No watermark
- No blur
- Professional layout with CSS styling

## 💳 Pricing & Currency

### Base Pricing
- 10 pages: $9.99 USD
- 20 pages: $12.99 USD
- 30 pages: $14.99 USD

### Supported Currencies
- USD (US Dollar)
- CAD (Canadian Dollar)
- GBP (British Pound)
- EUR (Euro)
- AUD (Australian Dollar)
- INR (Indian Rupee)

### Dynamic Conversion
- Real-time rates from ExchangeRate API
- Cached for 24 hours
- Automatic user detection via IP geolocation

## 📦 PDF Generation

### Features
- A4 page format
- Professional cover page
- Page numbers
- Image integration
- Optimized for printing

### Technology
- Puppeteer for HTML to PDF conversion
- Responsive CSS styling
- Multi-page support

## 🔐 Security

- JWT authentication (7-day expiry)
- Password hashing with bcryptjs
- Stripe PCI compliance
- CORS protection
- Rate limiting (100 requests/15 min)
- Helmet security headers

## 📈 Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Environment Variables (Production)
```
NODE_ENV=production
DB_HOST=production_host
STRIPE_SECRET_KEY=sk_live_...
CORS_ORIGIN=https://yourdomain.com
```

### Database Migration
```bash
npm run db:migrate
```

## 🧪 Testing

### Backend
```bash
npm test
```

### Frontend
```bash
npm test -- --watch
```

## 📖 Documentation

- [API Documentation](./docs/API-DOCUMENTATION.md)
- [Database Schema](./docs/database-schema.sql)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Setup Instructions](./docs/SETUP.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙋 Support

For support, email support@kidzstorymagic.com or open an issue in the repository.

## 🎉 Future Enhancements

- [ ] AI story generation (ChatGPT integration)
- [ ] Text-to-speech for stories
- [ ] Social sharing features
- [ ] Parent dashboard with analytics
- [ ] Subscription plans
- [ ] Multiple language support
- [ ] Mobile app (React Native)
- [ ] AR story visualization

---

**Created with ❤️ for children's imagination**
