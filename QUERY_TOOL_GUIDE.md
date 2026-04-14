# pgAdmin Query Tool - Complete Setup Guide

## What is pgAdmin?

pgAdmin is a web-based PostgreSQL management tool. It provides a Query Tool to run SQL commands directly on your database.

---

## Installation & Setup

### Option 1: pgAdmin Already Included (Supabase)

If using **Supabase**, pgAdmin is built-in:

1. Go to your Supabase project: https://supabase.com
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Paste SQL below
5. Click **Run**

### Option 2: Standalone pgAdmin

If you have PostgreSQL installed locally:

1. **Download pgAdmin**: https://www.pgadmin.org/download/
2. **Run installer** on Windows
3. **Set master password** (remember this!)
4. Opens automatically in browser at `localhost:5050`

---

## Using Query Tool - Step by Step

### For Supabase Users:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com
   - Click your project

2. **Go to SQL Editor**
   - Left sidebar → **SQL Editor**

3. **Create New Query**
   - Button at top: **"New Query"** or **"+ New"**

4. **Paste SQL Schema** (see below)

5. **Run Query**
   - Click **"RUN"** button (green play icon)
   - Or press **Ctrl + Enter**

6. **Verify Success**
   - Should see: `"Queries completed successfully"`
   - In left sidebar, expand **Database** → **Tables**
   - Should see: `users`, `stories`, `payments`

---

### For Local PostgreSQL with Standalone pgAdmin:

1. **Open pgAdmin**: http://localhost:5050

2. **Create Connection to Server**
   - Left sidebar → Right-click **Servers**
   - Select **Register** → **Server**
   - Name: `Local PostgreSQL`
   - Connection tab:
     - **Host name**: `localhost`
     - **Port**: `5432`
     - **Username**: `postgres`
     - **Password**: (your PostgreSQL password)
   - Click **Save**

3. **Create Database**
   - Expand **Servers** → **Local PostgreSQL** → **Databases**
   - Right-click **Databases** → **Create** → **Database**
   - Name: `kidz_story_magic`
   - Click **Save**

4. **Open Query Tool**
   - Right-click **kidz_story_magic** database
   - Select **Query Tool**
   - A new window opens with SQL editor

5. **Paste SQL Schema** (see below)

6. **Execute Query**
   - Click **Execute** button (play icon) or Ctrl + Enter
   - Watch for success message at bottom

---

## SQL Schema to Run

### Copy ALL of this SQL and paste into Query Tool:

```sql
-- ============================================
-- Create users table
-- ============================================
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

-- ============================================
-- Create stories table
-- ============================================
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

-- ============================================
-- Create payments table
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'pending',
  stripe_payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ============================================
-- Verify tables were created
-- ============================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

---

## Step-by-Step Execution

### Step 1: Copy the SQL

1. Highlight ALL the SQL code above (Ctrl+A after copying)
2. Copy it (Ctrl+C)

### Step 2: Paste into Query Tool

1. Click in the SQL editor area
2. Paste (Ctrl+V)
3. You should see all the SQL in the editor

### Step 3: Run the Query

**Supabase:**
- Click green **RUN** button at top

**pgAdmin:**
- Click play button **Execute** or press Ctrl+Enter

### Step 4: Watch for Success

**Success Message (Bottom of screen):**
```
Query: CREATE TABLE...
0 rows
```

Then multiple similar messages for each CREATE statement.

**Final Line (Important):**
```
table_name |
----------
payments   |
stories    |
users      |
```

This shows all 3 tables were created!

---

## Verify Tables in Query Tool

After creating tables, run this verification query:

```sql
-- Check all tables exist
\dt

-- Or use this query:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check users table structure
\d users

-- Check specific table:
SELECT * FROM users LIMIT 0;
```

---

## Troubleshooting in Query Tool

### Error: "Relation already exists"

**Cause:** Tables already created

**Fix:** Either:
- Delete tables first:
  ```sql
  DROP TABLE IF EXISTS payments CASCADE;
  DROP TABLE IF EXISTS stories CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
  ```
- Then run schema again

**Or:** Just ignore - schema has `IF NOT EXISTS`

### Error: "Syntax error"

**Cause:** Malformed SQL

**Fix:**
- Copy fresh SQL from this guide
- Check no characters are missing
- Try running one CREATE statement at a time

### Error: "Permission denied"

**Cause:** User doesn't have permission

**Fix:**
- pgAdmin: Use `postgres` user (superuser)
- Supabase: Automatic (you own database)

### No Output

**Cause:** Query may be running

**Fix:**
- Wait 30 seconds
- Look at the **Messages** tab at bottom
- Should see success status

---

## After Tables Are Created

### Test the Tables

Run this in Query Tool to verify data:

```sql
-- Insert test user
INSERT INTO users (name, email, password_hash, preferred_currency)
VALUES ('Test User', 'test@example.com', 'hashed_password_here', 'USD');

-- Check if inserted
SELECT * FROM users;

-- You should see one row with your test data
```

### Connect Backend

1. **Get connection string from SQL Editor**
   - Top right button shows connection details
   
2. **Update `backend/.env`:**
   ```env
   DATABASE_URL=postgresql://...
   ```

3. **Test connection:**
   ```bash
   curl http://localhost:5000/api/health/db
   ```

---

## Quick Reference - Query Tool Buttons

| Button | Action | Shortcut |
|--------|--------|----------|
| **▶️ Execute** | Run query | Ctrl+Enter |
| **⏹️ Stop** | Stop running query | Shift+Escape |
| **💾 Save** | Save query to file | Ctrl+S |
| **📋 Copy** | Copy selection | Ctrl+C |
| **🔍 Find** | Find text | Ctrl+F |
| **📝 New** | New query tab | +Button |

---

## Common Query Tool Tips

1. **Multiple Queries:**
   - Run one at a time
   - Or separate with semicolons: `CREATE TABLE...; CREATE INDEX...;`

2. **View Results:**
   - Click **Data Output** tab at bottom
   - Shows table data in grid format

3. **View Execution Log:**
   - Click **Messages** tab at bottom
   - Shows timing and execution info

4. **Save Queries:**
   - Click save button (💾)
   - Helpful for future use

5. **Comment Code:**
   - Use `--` for single line comments
   - Or `/* */` for multi-line

---

## Success Checklist

After running SQL in Query Tool:

- ✅ See success message at bottom
- ✅ Tables listed: `users`, `stories`, `payments`
- ✅ Can run `SELECT * FROM users;` with no errors
- ✅ Connection string working in backend `.env`
- ✅ Backend health check passes: `curl http://localhost:5000/api/health/db`

---

## Next Steps

1. ✅ Run SQL schema in Query Tool
2. ✅ Verify tables exist
3. ✅ Get connection string
4. ✅ Update `backend/.env` with DATABASE_URL
5. ✅ Restart backend
6. ✅ Test registration at http://localhost:3000/auth/signup

---

**Need help? Let me know which step you're on!**
