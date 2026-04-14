# API Documentation - Kidz Story Magic

## Base URL
```
http://localhost:5000/api
```

## Authentication

All endpoints except `/auth/register` and `/auth/login` require JWT authentication.

### Header Format
```
Authorization: Bearer {token}
```

---

## Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password",
  "preferredCurrency": "USD"
}
```

**Response (201)**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure_password"
}
```

**Response (200)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "preferred_currency": "USD"
  }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer {token}
```

**Response (200)**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "profile_picture_url": "https://...",
  "preferred_currency": "USD",
  "location": "New York",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Update Profile
```http
PUT /auth/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Jane Doe",
  "profilePictureUrl": "https://...",
  "preferredCurrency": "CAD",
  "location": "Toronto"
}
```

**Response (200)**
```json
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

## Story Management Endpoints

### Create Story Project
```http
POST /story/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Emma's Adventure",
  "age_group": "5-8",
  "theme": "family",
  "page_count": 20,
  "child_name": "Emma",
  "child_gender": "female",
  "child_interests": "drawing, reading",
  "child_notes": "Loves animals"
}
```

**Response (201)**
```json
{
  "message": "Story project created successfully",
  "project": {
    "id": 1,
    "user_id": 1,
    "title": "Emma's Adventure",
    "age_group": "5-8",
    "theme": "family",
    "page_count": 20,
    "child_name": "Emma",
    "status": "draft",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Get User's Projects
```http
GET /story?limit=10&offset=0
Authorization: Bearer {token}
```

**Response (200)**
```json
{
  "projects": [
    {
      "id": 1,
      "title": "Emma's Adventure",
      "theme": "family",
      "page_count": 20,
      "status": "draft",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "stats": {
    "total_projects": 5,
    "completed_projects": 2,
    "draft_projects": 3
  },
  "pagination": {
    "limit": 10,
    "offset": 0
  }
}
```

### Get Project Details
```http
GET /story/:projectId
Authorization: Bearer {token}
```

**Response (200)**
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Emma's Adventure",
  "age_group": "5-8",
  "theme": "family",
  "page_count": 20,
  "child_name": "Emma",
  "status": "draft",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Update Project
```http
PUT /story/:projectId
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Emma's Grand Adventure",
  "child_interests": "drawing, animals, music"
}
```

**Response (200)**
```json
{
  "message": "Project updated successfully",
  "project": { ... }
}
```

### Delete Project
```http
DELETE /story/:projectId
Authorization: Bearer {token}
```

**Response (200)**
```json
{
  "message": "Project deleted successfully"
}
```

### Upload Photo
```http
POST /story/:projectId/upload-photo
Authorization: Bearer {token}
Content-Type: multipart/form-data

[FormData with 'photo' field]
```

**Response (200)**
```json
{
  "message": "Photo uploaded successfully",
  "image": {
    "original_url": "/uploads/uuid.jpg",
    "blurred_url": "/uploads/blurred_uuid.jpg",
    "watermarked_url": "/uploads/watermarked_uuid.jpg"
  }
}
```

### Generate Story
```http
POST /story/:projectId/generate-story
Authorization: Bearer {token}
```

**Response (200)**
```json
{
  "message": "Story generated successfully",
  "story": [
    {
      "page_number": 1,
      "title": "A New Beginning",
      "page_text": "Emma discovered something magical about drawing...",
      "image_url": null
    },
    {
      "page_number": 2,
      "title": "Getting Involved",
      "page_text": "With curiosity burning bright, Emma decided..."
    }
  ]
}
```

### Get Story Content
```http
GET /story/:projectId/content
Authorization: Bearer {token}
```

**Response (200)**
```json
{
  "content": [
    {
      "id": 1,
      "project_id": 1,
      "page_number": 1,
      "page_title": "A New Beginning",
      "page_text": "...",
      "created_at": "2024-01-15T10:35:00Z"
    }
  ]
}
```

---

## Payment Endpoints

### Create Checkout Session
```http
POST /payment/checkout
Authorization: Bearer {token}
Content-Type: application/json

{
  "projectId": 1,
  "currency": "USD"
}
```

**Response (200)**
```json
{
  "sessionId": "cs_test_...",
  "orderId": 1,
  "amount": 14.99,
  "currency": "USD",
  "displayText": "USD 14.99"
}
```

### Confirm Payment
```http
POST /payment/confirm-payment
Content-Type: application/json

{
  "sessionId": "cs_test_..."
}
```

**Response (200)**
```json
{
  "message": "Payment confirmed",
  "order": {
    "id": 1,
    "projectId": 1,
    "status": "completed"
  }
}
```

### Get Order Details
```http
GET /payment/order/:orderId
Authorization: Bearer {token}
```

**Response (200)**
```json
{
  "id": 1,
  "user_id": 1,
  "project_id": 1,
  "amount": 14.99,
  "currency": "USD",
  "status": "completed",
  "created_at": "2024-01-15T10:40:00Z"
}
```

### Get User's Orders
```http
GET /payment/user/orders
Authorization: Bearer {token}
```

**Response (200)**
```json
{
  "orders": [
    {
      "id": 1,
      "project_id": 1,
      "child_name": "Emma",
      "theme": "family",
      "amount": 14.99,
      "currency": "USD",
      "status": "completed",
      "created_at": "2024-01-15T10:40:00Z"
    }
  ]
}
```

### Get PDF Download Link
```http
GET /payment/pdf/:projectId
Authorization: Bearer {token}
```

**Response (200)**
```json
{
  "pdf": {
    "id": 1,
    "project_id": 1,
    "pdf_url": "/pdfs/story_1_1234567890.pdf",
    "file_size": 2048576,
    "page_count": 21,
    "is_blurred": false,
    "has_watermark": false,
    "created_at": "2024-01-15T10:45:00Z"
  },
  "downloadUrl": "/pdfs/story_1_1234567890.pdf"
}
```

---

## Currency Endpoints

### Get Supported Currencies
```http
GET /currency/supported
```

**Response (200)**
```json
{
  "currencies": ["USD", "CAD", "GBP", "EUR", "AUD", "INR"]
}
```

### Get Exchange Rates
```http
GET /currency/rates?from=USD&to=CAD
```

**Response (200)**
```json
{
  "from": "USD",
  "to": "CAD",
  "rate": "1.3615"
}
```

**Get all rates from base:**
```http
GET /currency/rates?from=USD
```

**Response (200)**
```json
{
  "base": "USD",
  "rates": {
    "CAD": "1.3615",
    "GBP": "0.7923",
    "EUR": "0.9156",
    "AUD": "1.5487",
    "INR": "83.1205"
  }
}
```

### Convert Currency
```http
POST /currency/convert
Content-Type: application/json

{
  "amount": 9.99,
  "from": "USD",
  "to": "CAD"
}
```

**Response (200)**
```json
{
  "original": 9.99,
  "originalCurrency": "USD",
  "converted": 13.60,
  "currency": "CAD",
  "rate": "1.3615",
  "timestamp": "2024-01-15T10:50:00Z"
}
```

### Get Pricing in Currency
```http
POST /currency/pricing
Content-Type: application/json

{
  "currency": "EUR"
}
```

**Response (200)**
```json
{
  "pricing": {
    "price": 9.15,
    "currency": "EUR",
    "display": "EUR 9.15",
    "rate": "0.9156"
  },
  "displayMessage": "You are paying in EUR"
}
```

### Detect User Currency
```http
GET /currency/detect
```

**Response (200)**
```json
{
  "currency": "CAD",
  "message": "Detected currency: CAD"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Required fields: age_group, theme, page_count, child_name",
  "status": 400
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid token",
  "status": 401
}
```

### 404 Not Found
```json
{
  "error": "Project not found",
  "status": 404
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create story project",
  "status": 500
}
```

---

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Header**: `X-RateLimit-Remaining`

---

## Webhook

### Stripe Webhook Events
```http
POST /payment/webhook
Content-Type: application/json

{
  "type": "checkout.session. completed",
  "data": { ... }
}
```

Supported events:
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

---

## Code Examples

### JavaScript/Fetch
```javascript
const createStory = async () => {
  const response = await fetch('http://localhost:5000/api/story/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: "Sarah's Story",
      age_group: "5-8",
      theme: "family",
      page_count: 20,
      child_name: "Sarah",
      child_gender: "female"
    })
  });
  return response.json();
};
```

### cURL
```bash
curl -X POST http://localhost:5000/api/story/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sarahs Story",
    "age_group": "5-8",
    "theme": "family",
    "page_count": 20,
    "child_name": "Sarah",
    "child_gender": "female"
  }'
```

---

For more information, visit: https://kidzstorymagic.com/docs
