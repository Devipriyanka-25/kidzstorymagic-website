# PostgreSQL Installation - Windows Categories to Select

## Download PostgreSQL

1. Go to: https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Download **PostgreSQL 15** or **PostgreSQL 16** (Latest)

---

## Installation Categories - What to Select

When you run the installer, you'll see different sections. Here's what to choose for EACH:

---

## 1️⃣ Installation Directory

**Category:** Setup Location

**Choose:**
- `C:\Program Files\PostgreSQL\16` (default is fine)
- Or any location you prefer

**Just click:** NEXT ➜

---

## 2️⃣ Select Components

**Category:** What to Install (IMPORTANT!)

**SELECT these:**
- ✅ **PostgreSQL Server** (REQUIRED - the database)
- ✅ **pgAdmin 4** (IMPORTANT - has Query Tool GUI)
- ✅ **Stack Builder** (optional - for future tools)
- ❌ **Command Line Tools** (optional)

**Action:** Check both PostgreSQL Server and pgAdmin 4

**Then click:** NEXT ➜

---

## 3️⃣ Data Directory

**Category:** Where Database Files Will Be Stored

**Choose:**
- Default: `C:\Program Files\PostgreSQL\16\data`
- Or your preferred location

**Action:** Leave as default

**Then click:** NEXT ➜

---

## 4️⃣ Database Superuser Password

**Category:** Security (VERY IMPORTANT!)

**What is it:** Master password to access PostgreSQL

**Enter:**
- **Username:** `postgres` (already filled)
- **Password:** `password` (for development/testing)
  - OR use: `YourPassword123!`
  - Make it something you remember

- **Confirm password:** Type same password again

**⚠️ IMPORTANT:** Remember this password! You'll need it later

**Then click:** NEXT ➜

---

## 5️⃣ Port

**Category:** Network Port

**Choose:**
- Port: `5432` (default - don't change!)
- Locale: Default (your language)

**Action:** Leave as default

**Then click:** NEXT ➜

---

## 6️⃣ Pre Installation Summary

**Category:** Review Before Installing

**This shows:**
- Installation path
- Selected components
- Port number
- Everything you chose

**Action:** Review, then click **NEXT ➜**

---

## 7️⃣ Installation Progress

**Category:** Installing (Just wait...)

**This shows:**
- Progress bar
- Files being copied
- Takes ~3-5 minutes

**Action:** Let it finish (don't close or interrupt)

---

## 8️⃣ Stack Builder Configuration

**Category:** Additional Tools (Optional)

**You may see:**
- "Launch Stack Builder?" popup
- Lists additional tools you can download

**Action:**
- ✅ Click **FINISH** to complete installation
- OR click **Next** if you want additional tools
- For now, just click **FINISH**

---

## 9️⃣ Verify Installation Success

**After installation completes:**

1. **Check Services (Windows)**
   - Press `Win + R`
   - Type: `services.msc`
   - Press Enter
   - Look for: `postgresql-x64-16`
   - Status should show: **Running** ✅

2. **Or use PowerShell:**
   ```powershell
   Get-Service postgresql*
   # Should show: Status = Running
   ```

---

## ✅ Installation Complete!

After these 9 categories are selected:

**PostgreSQL is running** ✅
**pgAdmin is ready** ✅
**Port 5432 is open** ✅

---

## Next Steps After Installation

### 1. Open pgAdmin

1. Start menu → Search `pgAdmin 4`
2. Click to open
3. Opens in browser: `http://localhost:5050`
4. Creates a login (accept defaults)

### 2. Connect to Server

In pgAdmin (Web interface):

1. Left sidebar → **Servers** → Right-click
2. **Register** → **Server**
3. Fill in:
   - Name: `Local`
   - Connection tab:
     - Hostname: `localhost`
     - Port: `5432`
     - Username: `postgres`
     - Password: (the password you entered during install)
   - Click **Save**

### 3. Create Database

1. Expand **Servers** → **Local** → **Databases**
2. Right-click **Databases** → **Create** → **Database**
3. Fill in:
   - Name: `kidz_story_magic`
   - Owner: `postgres`
   - Click **Save**

### 4. Create Tables

1. Right-click **kidz_story_magic** database
2. Click **Query Tool**
3. Paste the SQL schema from the guide
4. Click **Execute**

---

## Common Installation Issues

### "PostgreSQL service not found"

**Solution:**
- Reinstall PostgreSQL
- Make sure you selected "PostgreSQL Server" component
- Check Services: `services.msc`

### "pgAdmin won't open"

**Solution:**
- Launch manually: Start menu → pgAdmin 4
- Or go to: `http://localhost:5050`
- Check if PostgreSQL is running in Services

### "Can't connect to localhost:5432"

**Solution:**
- Check PostgreSQL service is **Running** in Services
- Port 5432 is correct (don't change it)
- Use `postgres` / your password to connect

### "Port 5432 already in use"

**Solution:**
- Check if PostgreSQL is running
- Find what's using port 5432:
  ```powershell
  netstat -ano | findstr :5432
  ```
- Kill that process or use different port

---

## Summary - Categories Checklist

| Category | Your Choice | Notes |
|----------|------------|-------|
| Installation Directory | Default or chosen path | Usually `C:\Program Files\PostgreSQL\16` |
| Components | ✅ PostgreSQL Server, ✅ pgAdmin 4 | Must select both |
| Data Directory | Default | Usually `C:\Program Files\PostgreSQL\16\data` |
| Superuser Password | `password` or your choice | **Remember this!** |
| Port | `5432` | Don't change |
| Locale | Default | Your system language |
| Pre-Installation Summary | Review & Continue | Just confirm |
| Installation Progress | Wait | Don't interrupt |
| Stack Builder | Finish | Optional |

---

## Quick Reference - Password You Enter

During installation, you set:
- **Username:** `postgres`
- **Password:** `your_password_here`

**You'll need this later for:**
- pgAdmin login
- Backend `.env` file:
  ```env
  DB_USER=postgres
  DB_PASSWORD=your_password_here
  ```

---

**Ready to install? Download from:** https://www.postgresql.org/download/windows/

**After installation completes, let me know and we'll set up the database tables!** 🚀
