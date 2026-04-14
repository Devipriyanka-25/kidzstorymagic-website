# Development Guide

Welcome to the Kidz Story Magic development guide! This document will help you get started with local development.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Getting Started](#getting-started)
4. [Development Servers](#development-servers)
5. [Database](#database)
6. [Environment Variables](#environment-variables)
7. [Testing](#testing)
8. [Debugging](#debugging)
9. [Common Tasks](#common-tasks)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required
- **Node.js** 18.0.0 or higher
  - [Download Node.js](https://nodejs.org/)
  - Verify: `node --version`

- **npm** 9.0.0 or higher
  - Usually comes with Node.js
  - Verify: `npm --version`

- **PostgreSQL** 13 or higher
  - [Download PostgreSQL](https://www.postgresql.org/download/)
  - Verify: `psql --version`

### Optional
- **Docker** & **Docker Compose** (for containerized development)
- **Git** (for version control)
- **VS Code** with recommended extensions

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-python.python",
    "github.copilot",
    "ms-azuretools.vscode-docker",
    "bradlc.vscode-tailwindcss"
  ]
}
```

## Project Structure

```
kidz-story-magic/
├── frontend/                 # Next.js React application
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── utils/               # Utilities and helpers
│   ├── styles/              # Global styles
│   └── package.json
│
├── backend/                 # Express.js server
│   ├── src/
│   │   ├── index.js         # Server entry point
│   │   ├── config/          # Configuration
│   │   ├── routes/          # API routes
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Express middleware
│   │   └── utils/           # Utility functions
│   ├── scripts/             # Database scripts
│   └── package.json
│
├── story-templates/         # Story JSON templates
├── docs/                    # Documentation
├── docker-compose.yml       # Docker configuration
└── Makefile                 # Development commands
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/kidz-story-magic.git
cd kidz-story-magic
```

### 2. Install Dependencies

```bash
# Option 1: Using make
make install

# Option 2: Manual
cd frontend && npm install
cd ../backend && npm install
```

### 3. Setup Environment Variables

```bash
# Backend environment
cp backend/.env.example backend/.env.local

# Frontend environment
cp frontend/.env.local.example frontend/.env.local
```

Edit `.env.local` files with your local configuration:

**backend/.env.local:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kidz_story_magic
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_xxx
```

**frontend/.env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxx
```

### 4. Setup Database

```bash
# Option 1: Using make
make setup-db

# Option 2: Manual
psql -U postgres -f docs/database-schema.sql
```

### 5. Start Development

```bash
# Option 1: Using make (both servers)
make dev

# Option 2: Individual servers
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

### 6. Verify Installation

- Frontend: http://localhost:3000 (should show home page)
- Backend: http://localhost:5000/health (should return `{ "status": "ok" }`)

## Development Servers

### Frontend (Next.js)

```bash
cd frontend
npm run dev           # Start dev server with hot reload
npm run dev -- -p 4000  # Use custom port
npm run build         # Build for production
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
npm test              # Run tests
```

**Features:**
- Hot module replacement (HMR)
- TypeScript support ready
- Tailwind CSS
- Path aliases: `@/` → `frontend/`

### Backend (Express.js)

```bash
cd backend
npm run dev           # Start with nodemon (auto-restart)
npm start             # Start production server
npm test              # Run tests
npm run lint          # Run ESLint
npm run db:migrate    # Run migrations
npm run db:seed       # Seed database
```

**Features:**
- Auto-restart on file changes (nodemon)
- Environment variable support
- Database connection pooling
- Error logging

## Database

### Connection Details

**Default Connection String:**
```
postgresql://postgres:password@localhost:5432/kidz_story_magic
```

### Database Commands

```bash
# Connect to database
psql -U postgres -d kidz_story_magic

# Common SQL queries
\dt                   # List all tables
\d table_name         # Describe table
\l                    # List databases
\du                   # List users

# Backup database
pg_dump kidz_story_magic > backup.sql

# Restore database
psql -U postgres kidz_story_magic < backup.sql
```

### Database Tools

- **pgAdmin**: Web interface
  - URL: http://localhost:5050
  - Default login: admin@example.com / admin

- **DBeaver**: Desktop tool
  - [Download DBeaver](https://dbeaver.io/)

## Environment Variables

### Backend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `kidz_story_magic` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `password` |
| `JWT_SECRET` | JWT signing key | `your_secret_key` |
| `JWT_EXPIRY` | Token expiration | `7d` |
| `STRIPE_SECRET_KEY` | Stripe test key | `sk_test_xxx` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing key | `whsec_xxx` |

### Frontend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | Stripe public key | `pk_test_xxx` |

## Testing

### Run Tests

```bash
# All tests
make test

# Backend only
make test-backend

# Frontend only
make test-frontend

# Watch mode
cd backend && npm run test:watch
cd frontend && npm run test:watch

# Coverage report
npm test -- --coverage
```

### Test Structure

```
backend/
  src/
    utils/
      helpers.test.js     # Unit tests
    routes/
      __tests__/          # Integration tests
      auth.test.js

frontend/
  __tests__/              # Component tests
  utils/helpers.test.js   # Unit tests
```

### Writing Tests

**Example - Backend:**
```javascript
// backend/src/utils/helpers.test.js
describe('Helper functions', () => {
  it('should format currency correctly', () => {
    const result = formatPrice(19.99, 'USD');
    expect(result).toBe('$19.99 USD');
  });
});
```

**Example - Frontend:**
```javascript
// frontend/__tests__/StoryCard.test.js
import { render, screen } from '@testing-library/react';
import StoryCard from '@/components/StoryCard';

describe('StoryCard', () => {
  it('renders story title', () => {
    render(<StoryCard story={{ title: 'Test Story' }} />);
    expect(screen.getByText('Test Story')).toBeInTheDocument();
  });
});
```

## Debugging

### Browser DevTools

1. Open: http://localhost:3000
2. Press: `F12` or `Cmd+Option+I`
3. Use Console, Network, and React DevTools tabs

### Backend Debugging

**Using VS Code Debugger:**

1. Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Backend",
      "program": "${workspaceFolder}/backend/src/index.js",
      "restart": true,
      "cwd": "${workspaceFolder}/backend"
    }
  ]
}
```

2. Set breakpoints in code (red dot on line number)
3. Press `F5` to start debugging
4. Use Debug panel to step through code

### Logging

```javascript
// Backend logging
console.log('Regular log');
console.error('Error message');
console.warn('Warning');

// Frontend logging
console.log('Frontend log');
console.table(data); // Display as table
```

## Common Tasks

### Add a New API Endpoint

1. **Create route handler** in `backend/src/routes/`
2. **Add database query** in `backend/src/models/`
3. **Update API client** in `frontend/utils/api.js`
4. **Create frontend component** in `frontend/components/`
5. **Write tests** for backend and frontend
6. **Update documentation** in `docs/`

### Add a New Story Theme

1. **Create template** in `story-templates/theme-name.json`
2. **Add theme option** to step2 `wizard` component
3. **Update pricing** if different
4. **Add theme emoji** to helpers
5. **Test story generation** end-to-end

### Update Database Schema

1. **Backup current database**: `pg_dump ... > backup.sql`
2. **Create migration script** in `backend/scripts/`
3. **Test migration** locally
4. **Update schema doc** in `docs/`
5. **Document breaking changes** in `CHANGELOG.md`

### Deployment Preparation

```bash
# 1. Run full test suite
make test

# 2. Run linting
make lint

# 3. Build for production
make build

# 4. Check bundle size
cd frontend && npm run analyze

# 5. Security audit
npm audit

# 6. Final testing
# Manual testing in staging environment
```

## Troubleshooting

### PostgreSQL Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Create user if needed
createuser -d postgres
```

### Port Already in Use

```
Error: listen EADDRINUSE :::3000
```

**Solutions:**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
npm run dev -- -p 4000
```

### Module Not Found

```
Error: Cannot find module '@/utils/api'
```

**Solutions:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check path aliases in jsconfig.json or tsconfig.json
```

### Database Migration Issues

```bash
# Reset database
psql -U postgres -c "DROP DATABASE kidz_story_magic;"

# Recreate from schema
psql -U postgres -f docs/database-schema.sql

# Reseed data
npm run db:seed
```

### CORS Errors

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**
- Check CORS configuration in `backend/src/index.js`
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure development servers are running

### Stripe Test Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Enable "Test Mode"
3. Copy test keys (starts with `pk_test_` and `sk_test_`)
4. Add to `.env.local`

## Getting Help

- 📖 Read [API Documentation](./docs/API-DOCUMENTATION.md)
- 🐛 Check [GitHub Issues](https://github.com/yourrepo/issues)
- 💬 Join [GitHub Discussions](https://github.com/yourrepo/discussions)
- 📧 Email: dev@kidzstorymagic.com

## Quick Commands Reference

```bash
# Common development tasks
make help             # Show all available commands
make install          # Install dependencies
make dev              # Start both servers
make test             # Run all tests
make lint             # Run linting
make clean            # Clean build files
make docker-up        # Start Docker containers
make setup-db         # Setup database
```

Happy coding! 🚀
