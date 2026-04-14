# How to Create PostgreSQL Database - Step by Step

## Prerequisites

✅ PostgreSQL installed
✅ pgAdmin 4 installed (came with PostgreSQL)
✅ PostgreSQL service running

---

## Step 1: Open pgAdmin

### Method 1: From Start Menu
1. Click **Windows Start button** (bottom left)
2. Type: `pgAdmin 4`
3. Click the pgAdmin 4 application
4. Browser opens automatically at: `http://localhost:5050`

### Method 2: Manually Open Browser
1. Open any browser (Chrome, Edge, Firefox)
2. Go to: `http://localhost:5050`
3. You should see pgAdmin login page

---

## Step 2: Login to pgAdmin

**First Time Only:**

1. pgAdmin asks you to set a **Master Password**
   - This is just for pgAdmin login (not PostgreSQL)
   - Example: `admin123`
   - Remember it for next login

2. Click **OK** and you're in pgAdmin dashboard

---

## Step 3: Connect to PostgreSQL Server

### In pgAdmin Dashboard:

1. **Left sidebar** → Expand **Servers**
   
2. If you see a server listed (e.g., "PostgreSQL 16"), click on it
   
3. If NO servers listed, create one:
   - Right-click **Servers** → **Register** → **Server**
   - **Name:** `Local` (or any name)
   - **Connection tab:**
     - **Host name:** `localhost`
     - **Port:** `5432`
     - **Username:** `postgres`
     - **Password:** (the password you set during PostgreSQL installation)
   - Click **Save**

4. You should now see your server connected ✅

---

## Step 4: Create Database

### In pgAdmin:

1. **Expand Servers** in left sidebar
2. **Expand your server** (e.g., "Local" or "PostgreSQL 16")
3. **Right-click on Databases** folder
4. Select: **Create** → **Database**

### In the Database Creation Dialog:

**General Tab:**
- **Name:** `kidz_story_magic`
- Leave other fields as default

**Definition Tab (optional):**
- **Owner:** `postgres`
- **Encoding:** `UTF8`
- Leave others default

**Click: CREATE**

---

## Step 5: Verify Database Created

### You should see:

In left sidebar under your server:
```
Servers
  └─ Local (or PostgreSQL 16)
      └─ Databases
          ├─ postgres (system)
          ├─ template0 (system)
          ├─ template1 (system)
          └─ kidz_story_magic ✅ (YOUR DATABASE)
```

If you see `kidz_story_magic`, you're on the right track! ✅

---

## Step 6: Create Tables Using Query Tool

### Open Query Tool:

1. **Left sidebar** → Expand **Databases**
2. **Right-click on `kidz_story_magic`**
3. Click: **Query Tool**

### A new window opens with SQL editor

---

## Step 7: Paste SQL Schema

### In the Query Tool window:

1. Copy this ENTIRE SQL (all of it):

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
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Verify tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

2. **Paste into Query Tool** (Ctrl+V)

3. You should see all SQL in the editor window

---

## Step 8: Execute SQL

### Click the **EXECUTE** button (or press Ctrl+Enter)

**The query will run** - takes 5-10 seconds

### Watch the **Messages** tab at bottom:

You should see:
```
CREATE TABLE / ALTER TABLE
0 rows

CREATE TABLE / ALTER TABLE
0 rows

CREATE TABLE / ALTER TABLE
0 rows

CREATE INDEX
0 rows

CREATE INDEX
0 rows

...
```

Then finally:
```
Query returned successfully: 3 rows
```

This shows the 3 tables were created! ✅

---

## Step 9: Verify Tables

### In Query Tool, run this:

```sql
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Expected result:

**Data Output tab shows:**
```
table_name    | table_schema | table_type
-----------------------------------------
payments      | public       | BASE TABLE
stories       | public       | BASE TABLE
users         | public       | BASE TABLE
```

All 3 tables shown = Success! ✅

---

## Step 10: Get Connection String

### For your backend .env:

1. **Top right of pgAdmin** → Click connection info button
2. Or manually construct:

```
postgresql://postgres:YOUR_PASSWORD@localhost:5432/kidz_story_magic
```

Replace:
- `YOUR_PASSWORD` = the PostgreSQL password you set during installation
- `localhost` = your computer
- `5432` = PostgreSQL port
- `kidz_story_magic` = your database name

---

## Step 11: Update Backend .env

### Edit file: `backend/.env`

Find this line:
```env
# DATABASE_URL=postgresql://postgres:your_password@db.host.supabase.co:5432/postgres
```

Uncomment and replace with your LOCAL connection:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/kidz_story_magic
```

Replace `your_password` with your actual PostgreSQL password.

---

## Step 12: Restart Backend

### In terminal:

```bash
cd backend
npm run dev
```

### You should see in console:

```
[DATABASE] Using connection URL (cloud database)
[DATABASE] Pool connection established
✓ Backend server running on port 5000
```

✅ Connected!

---

## Step 13: Test Database Connection

### In PowerShell terminal:

```bash
curl http://localhost:5000/api/health/db
```

### Expected response:

```json
{
  "status": "connected",
  "database": "kidz_story_magic",
  "host": "localhost",
  "port": 5432,
  "timestamp": "2026-04-09T18:00:00Z"
}
```

✅ Database connected!

---

## Step 14: Test Registration

### Start backend:
```bash
cd backend
npm run dev
```

### Start frontend (new terminal):
```bash
cd frontend
npm run dev
```

### Go to: http://localhost:3000/auth/signup

### Fill form:
- Full Name: Your name
- Email: your@email.com
- Password: MyPass123!
- Confirm: MyPass123!
- Check terms ✓

### Click: **Create Account**

### Expected result:
✅ Success! Redirects to dashboard
✅ User saved in database
✅ JWT token generated

---

## Troubleshooting

### pgAdmin Won't Open

**Solution:**
- Check PostgreSQL is running: `services.msc` → Look for `postgresql-x64-16`
- Manually go to: `http://localhost:5050`

### Can't Connect to Server

**Error:** "FATAL: Ident authentication failed"

**Solution:**
1. Check password is correct
2. Try connecting again with correct password
3. In pgAdmin right-click server → Properties → Connection
4. Check credentials

### Tables Already Exist

**Error:** "Relation already exists"

**Solution:**
- Safe to ignore (SQL has `IF NOT EXISTS`)
- Or delete and recreate:
  ```sql
  DROP TABLE IF EXISTS payments CASCADE;
  DROP TABLE IF EXISTS stories CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
  ```

### No Tables Show

**Error:** Can't see tables in left sidebar

**Solution:**
1. Right-click database → Refresh
2. Or click F5 to refresh pgAdmin

---

## Quick Checklist

- ✅ pgAdmin open
- ✅ Connected to PostgreSQL server
- ✅ Database `kidz_story_magic` created
- ✅ Query Tool opened for database
- ✅ SQL schema executed
- ✅ 3 tables visible (users, stories, payments)
- ✅ Connection string in backend `.env`
- ✅ Backend restarted
- ✅ Database health check passes
- ✅ Registration test successful

---

**You're done! Database is ready for your app!** 🚀
