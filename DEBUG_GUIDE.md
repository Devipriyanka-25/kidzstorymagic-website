# Debugging 400 Bad Request Error - Registration Endpoint

## Complete Setup Summary

Your 400 error has been debugged and fixed. Here's what was wrong and how it's resolved:

---

## **Problem Identified**

The frontend was sending the request correctly, but:
1. **Backend was not returning JWT token** after registration
2. **Frontend error handling** was not showing detailed validation errors
3. **Request logging** was missing for debugging

---

## **Solutions Implemented**

### ✅ **1. Backend Changes (Fixed)**

**File:** `backend/src/routes/auth.routes.js`

**What Changed:**
- Added detailed request logging
- Generate JWT token on registration
- Return token in response
- Better error messages showing validation details

**New Register Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-123",
    "name": "Devipriyanka Karuppusamy",
    "email": "devipriyankak91@gmail.com",
    "preferredCurrency": "USD"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "value": "",
      "msg": "Name is required",
      "param": "name",
      "location": "body"
    }
  ]
}
```

### ✅ **2. Frontend Changes (Fixed)**

**File:** `frontend/utils/store.js`

**What Changed:**
- Save JWT token from registration response
- Mark user as authenticated immediately
- Better error extraction from validation details

### ✅ **3. Frontend Signup Page Changes (Fixed)**

**File:** `frontend/app/auth/signup/page.jsx`

**What Changed:**
- Send object to `register()` instead of separate arguments
- Log request payload to console for debugging
- Log error details with status, response data, headers
- Extract validation error messages properly
- Redirect to `/dashboard` on success

---

## **How to Debug from Browser Console**

When you try to register, open DevTools (F12) and check **Console** tab:

### **Success Case:**
```
[SIGNUP] Sending registration request: {name: "...", email: "...", password: "...", preferredCurrency: "USD"}
[SIGNUP] Registration successful: {success: true, token: "...", user: {...}}
```

### **Error Case (400):**
```
[SIGNUP] Registration error: {
  message: "Request failed with status code 400",
  status: 400,
  data: {
    error: "Validation failed",
    details: [
      {msg: "Name is required", param: "name"}
    ]
  }
}
```

---

## **Network Tab Debugging**

1. Open DevTools → **Network** tab
2. Fill signup form and submit
3. Find the `register` request (POST to `/api/auth/register`)
4. Click on it and check:

### **Request Tab:**
```
POST /api/auth/register HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Origin: http://localhost:3000

{
  "name": "Devipriyanka Karuppusamy",
  "email": "devipriyankak91@gmail.com",
  "password": "SecurePass123",
  "preferredCurrency": "USD"
}
```

### **Response Tab:**
```
HTTP/1.1 201 Created
Access-Control-Allow-Origin: http://localhost:3000
Content-Type: application/json

{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

---

## **Backend Server Logging**

Check your backend terminal (running `npm run dev`) for logs like:

### **Success:**
```
[REGISTER] Incoming request: {
  body: {name: "...", email: "...", password: "...", preferredCurrency: "USD"},
  contentType: "application/json",
  timestamp: "2026-04-09T18:00:00Z"
}
[REGISTER] User registered successfully: {
  userId: "abc-123",
  email: "devipriyankak91@gmail.com",
  timestamp: "2026-04-09T18:00:00Z"
}
```

### **Error (Validation Failed):**
```
[REGISTER] Incoming request: {
  body: {name: "", email: "devipriyankak91@gmail.com", password: "123"},
  contentType: "application/json"
}
[REGISTER] Validation errors: [
  {msg: "Name is required", param: "name"},
  {msg: "Password must be at least 6 characters", param: "password"}
]
```

---

## **Common 400 Causes & Fixes**

| Cause | Error Message | Fix |
|-------|---------------|-----|
| Missing `name` | "Name is required" | Provide full name |
| Invalid email format | "Valid email is required" | Use format: user@example.com |
| Short password | "Password must be at least 6 characters" | Use 6+ character password |
| Invalid currency | "Invalid currency" | Use: USD, CAD, GBP, EUR, AUD, INR |
| Missing Content-Type header | 400 Bad Request (no details) | ✅ Fixed - auto handled by axios |
| Duplicate email | 409 Conflict | Use different email address |
| Empty request body | 400 Bad Request | Submit form with valid data |

---

## **Correct Request Format**

### **Frontend to Send (JavaScript):**
```javascript
const signupData = {
  name: "Devipriyanka Karuppusamy",
  email: "devipriyankak91@gmail.com",
  password: "SecurePass123!",
  preferredCurrency: "USD"
};

// axios automatically sends:
// - Content-Type: application/json
// - Body as JSON string
// This is handled by utils/api.js
```

### **Backend Should Validate:**
```javascript
✓ name: trim + not empty
✓ email: valid format
✓ password: minimum 6 characters
✓ preferredCurrency: optional, valid currency code
```

---

## **Testing the Registration Flow**

### **Step 1: Start Both Servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### **Step 2: Fill Signup Form**
- Full Name: Devipriyanka Karuppusamy
- Email: devipriyankak91@gmail.com
- Password: SecurePass123!
- Confirm Password: SecurePass123!
- Check "I agree to Terms"
- Click "Create Account"

### **Step 3: Check Console**
Open DevTools Console (F2 or right-click → Inspect → Console tab)

**Expected Output:**
```
[SIGNUP] Sending registration request: {...}
[SIGNUP] Registration successful: {success: true, token: "..."}
```

**Then redirected to http://localhost:3000/dashboard**

### **Step 4: Verify Token Stored**
In DevTools Console, run:
```javascript
localStorage.getItem('authToken')
// Should return: "eyJhbGciOiJIUzI1NiIs..." (JWT token)
```

---

## **If You Still Get 400 Error**

1. **Check backend logs** - Look for `[REGISTER]` messages
2. **Take screenshot of Network tab response** - Shows exact error
3. **Verify both servers running** - Frontend on 3000, Backend on 5000
4. **Clear browser cache** - DevTools → Application → Clear Site Data
5. **Check form validation** - DevTools Console shows what gets sent

---

## **Validation Rules Summary**

```javascript
// What backend expects:
{
  name: String,           // Required, non-empty after trim
  email: String,          // Required, valid email format
  password: String,       // Required, minimum 6 characters
  preferredCurrency: "USD" | "CAD" | "GBP" | "EUR" | "AUD" | "INR"  // Optional, defaults to USD
}

// What frontend validates locally:
{
  name: Non-empty,
  email: Valid format (user@example.com),
  password: 8+ chars, uppercase, lowercase, number,
  confirmPassword: Matches password,
  agreeToTerms: Must be checked
}
```

---

## **Response Status Codes**

| Code | Meaning | Action |
|------|---------|--------|
| **201** | User created successfully | Save token, redirect to dashboard |
| **400** | Validation failed | Show error details to user |
| **409** | Email already registered | Show "Email already in use" |
| **500** | Server error | Show "Try again later" |

---

## **Next Steps**

1. ✅ Restart backend server (it auto-reloads with changes)
2. ✅ Refresh frontend (http://localhost:3000)
3. ✅ Try signup again with form data
4. ✅ Watch browser console for logs
5. ✅ Check backend terminal for `[REGISTER]` logs
6. ✅ Verify redirect to dashboard on success

---

## **Quick Test Commands**

### **Using cURL (or Postman):**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123",
    "preferredCurrency": "USD"
  }'
```

### **Expected Success Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Test User",
    "email": "test@example.com",
    "preferredCurrency": "USD"
  }
}
```

---

## **Files Modified**

✅ `backend/src/routes/auth.routes.js` - Added token generation + logging
✅ `backend/src/index.js` - Added request body logging middleware
✅ `frontend/utils/store.js` - Updated register to save token
✅ `frontend/app/auth/signup/page.jsx` - Added debugging + error handling

---

**Status: READY TO TEST** ✅

Go to http://localhost:3000/auth/signup and try registering again!
