# Supabase Quick Setup (5 Minutes)

## Steps to Follow

### 1. Create Supabase Account (2 min)
- Go to: https://supabase.com
- Click "Start your project" (top right)
- Sign up with email or GitHub
- Follow onboarding

### 2. Create New Project (2 min)
- Give it a name: `kidz-story-magic`
- Set Database Password: `YourPassword123!`
- Choose your region (best if closest to you)
- Click "Create new project"
- Wait for initialization (~30-60 seconds)

### 3. Get Connection String (1 min)
Once project loads:
1. Click **Settings** (⚙️ at bottom)
2. Click **Database** (left sidebar)
3. Find "Connection String" section
4. Click on **CONNECTION POOLER** tab (important!)
5. Select **URI** 
6. Copy the full URL (looks like):
```
postgresql://postgres.[RANDOM]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### 4. Update Backend .env (30 seconds)

Edit file: `backend/.env`

Find this line:
```env
# DATABASE_URL=postgresql://postgres:your_password@db.host.supabase.co:5432/postgres
```

Uncomment it and replace with your actual Supabase URL:
```env
DATABASE_URL=postgresql://postgres.xyz:[YOUR_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Important:** Don't include the angle brackets. Your actual URL will have real values.

### 5. Create Database Tables (1 min)

In Supabase Dashboard:
1. Go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Paste this SQL:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile_picture_url VARCHAR(500),
  preferred_currency VARCHAR(10) DEFAULT 'USD',
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  genre VARCHAR(50),
  age_group VARCHAR(50),
  content TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'pending',
  stripe_payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_payments_user_id ON payments(user_id);
```

4. Click **RUN** (or Ctrl+Enter)
5. See "Success" message

### 6. Restart Backend

Stop backend (Ctrl+C in terminal) and restart:

```bash
cd backend
npm run dev
```

You should see in console:
```
[DATABASE] Using connection URL (cloud database)
[DATABASE] Pool connection established
```

### 7. Test Connection

Open a new terminal:

```bash
curl http://localhost:5000/api/health/db
```

**Expected response:**
```json
{
  "status": "connected",
  "database": "postgres",
  "host": "aws-0-us-east-1.pooler.supabase.com",
  "port": 6543,
  "timestamp": "2026-04-09T18:00:00Z"
}
```

### 8. Test Registration ✅

Open both servers:

**Terminal 1 - Backend:**
```bash
cd backend && npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend && npm run dev
```

**Then visit:**
- http://localhost:3000/auth/signup
- Fill form with your details
- Click "Create Account"
- Should succeed and redirect to dashboard!

---

## Troubleshooting

### "password authentication failed"
**Fix:** Check your DATABASE_URL password matches Supabase password

### "connect ETIMEDOUT"
**Fix:** 
- Verify URL is correct
- Check internet connection
- Use CONNECTION POOLER URL (not Direct connection)

### "Duplicate key value"
**Fix:** Email already registered - use different email in signup

### "Relations don't exist"
**Fix:** Make sure SQL ran successfully (check no errors)

---

## Success Checklist

- ✅ Supabase project created
- ✅ Connection string copied to backend/.env
- ✅ Tables created in SQL editor
- ✅ Backend restarted
- ✅ `curl http://localhost:5000/api/health/db` returns connected
- ✅ Frontend running
- ✅ Registration form submits successfully

---

**You're all set! Start building! 🚀**
