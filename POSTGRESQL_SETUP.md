# PostgreSQL Setup Guide for Windows

## Step 1: Download and Install PostgreSQL

### Option A: Using PostgreSQL Installer (Easiest)

1. **Download PostgreSQL**
   - Go to https://www.postgresql.org/download/windows/
   - Download PostgreSQL 15 or 16 (Latest stable version)

2. **Run the installer**
   - Double-click the `.exe` file
   - Follow the setup wizard:
     - **Installation Directory**: `C:\Program Files\PostgreSQL\16` (default is fine)
     - **Port**: Leave as `5432` (default)
     - **Superuser Password**: Set a password (e.g., `password` for dev)
     - **Locale**: Leave as default
   - Complete the installation

3. **Verify Installation**
   - PostgreSQL should now be running as a Windows service
   - Check Services: `Win + R` → `services.msc` → Look for "postgresql-x64-16"

### Option B: Using Chocolatey (If you have it)

```powershell
choco install postgresql
```

---

## Step 2: Create Database and User

### Method 1: Using pgAdmin (GUI - Easiest)

1. **Open pgAdmin**
   - Start menu → Search "pgAdmin 4"
   - Open it in your browser (usually http://localhost:5050)

2. **Connect to Local Server**
   - Right-click "Servers" → Create → Server
   - Name: `Local`
   - Connection tab:
     - Host: `localhost`
     - Port: `5432`
     - Username: `postgres`
     - Password: (the one you set during install)

3. **Create Database**
   - Right-click "Databases" → Create → Database
   - Name: `kidz_story_magic`
   - Owner: `postgres`
   - Click "Save"

4. **Connect to Database**
   - Expand "Databases" → `kidz_story_magic`
   - Right-click "Query Tool"
   - Paste the schema below

### Method 2: Using Command Line (PowerShell)

```powershell
# Open PostgreSQL command prompt
# Start menu → Search "SQL Shell" or "psql"

# Or use PowerShell:
$env:PGPASSWORD = "password"
psql -U postgres -h localhost

# In psql terminal, run:
CREATE DATABASE kidz_story_magic;
\c kidz_story_magic
```

---

## Step 3: Create Database Schema

Run this SQL in pgAdmin Query Tool or psql:

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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'pending',
  stripe_payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Verify tables created
\dt
```

---

## Step 4: Configure Backend Environment

### Edit `.env` file in backend directory

**File:** `backend/.env`

```env
# Server
NODE_ENV=development
PORT=5000
BASE_URL=http://localhost:5000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kidz_story_magic
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Other (optional)
LOG_LEVEL=info
```

**Replace values:**
- `DB_PASSWORD`: Use the password you set during PostgreSQL installation
- `JWT_SECRET`: Use a strong random string in production

---

## Step 5: Verify Database Connection

### Test from Backend Terminal

```bash
cd backend
npm run dev
```

Check backend terminal for message showing successful server start.

Then test the database connection endpoint:

```bash
# In PowerShell, open a new terminal and run:
curl http://localhost:5000/api/health/db
```

**Expected success response:**
```json
{
  "status": "connected",
  "database": "kidz_story_magic",
  "host": "localhost",
  "port": 5432,
  "timestamp": "2026-04-09T18:00:00.000Z"
}
```

**If connection fails:**
```json
{
  "status": "disconnected",
  "error": "Database connection failed",
  "details": "connect ECONNREFUSED 127.0.0.1:5432"
}
```

---

## Step 6: Troubleshooting

### PostgreSQL Service Not Running

1. **Check if service is running:**
   ```powershell
   Get-Service postgresql*
   # Should show Status: Running
   ```

2. **Start the service if stopped:**
   ```powershell
   Start-Service -Name "postgresql-x64-16"
   ```

3. **Or start from Services:**
   - Win + R → `services.msc`
   - Find "postgresql-x64-16"
   - Right-click → "Start"

### Connection Refused Error

```
connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**
1. Verify PostgreSQL is running: `Get-Service postgresql*`
2. Check port 5432 is correct: `netstat -ano | findstr :5432`
3. Verify `.env` file has correct credentials
4. Restart PostgreSQL service

### Authentication Failed

```
Ident authentication failed for user "postgres"
```

**Solutions:**
1. Check `.env` has correct password
2. Verify user exists: In pgAdmin, expand "Login/Group Roles" and check `postgres`
3. Reset password in pgAdmin:
   - Right-click `postgres` → Properties
   - Definition tab → Set password
   - Click "Save"

### Database Already Exists

If you see error creating database:

```sql
-- Drop and recreate
DROP DATABASE IF EXISTS kidz_story_magic;
CREATE DATABASE kidz_story_magic;
```

---

## Step 7: Quick Validation Checklist

- ✅ PostgreSQL service running (check Services)
- ✅ Database created: `kidz_story_magic`
- ✅ Backend `.env` configured with DB credentials
- ✅ Backend server running (`npm run dev`)
- ✅ Database health check passes: `curl http://localhost:5000/api/health/db`
- ✅ Tables created with schema above

---

## Step 8: Now Test Registration

1. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **In another terminal, start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Go to:** http://localhost:3000/auth/signup

4. **Fill form and click "Create Account"**

5. **Expected result:**
   - Success message
   - Token saved to localStorage
   - Redirects to `/dashboard`

---

## Common Commands

### Access Database via psql

```powershell
# Set password in environment
$env:PGPASSWORD = "password"

# Connect to database
psql -U postgres -h localhost -d kidz_story_magic

# Common commands in psql:
\dt                      # List all tables
\d users                 # Describe users table
SELECT * FROM users;     # Query users
\q                       # Quit
```

### Backup Database

```bash
pg_dump -U postgres kidz_story_magic > backup.sql
```

### Restore Database

```bash
psql -U postgres kidz_story_magic < backup.sql
```

---

## What's Next

Once registration works:

1. ✅ Test login flow
2. ✅ Test story creation
3. ✅ Test user profile
4. ✅ Implement payment flow
5. ✅ Deploy to production

---

**Still having issues?**

1. Check backend terminal logs for `[REGISTER]` messages
2. Verify `.env` values match your setup
3. Test database connection: `curl http://localhost:5000/api/health/db`
4. Check PostgreSQL is running in Services
