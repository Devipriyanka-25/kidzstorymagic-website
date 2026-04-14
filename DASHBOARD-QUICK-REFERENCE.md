# Dashboard Quick Reference - 5 Minute Guide

## 🎯 What's New?

Customer Dashboard allows users to view, manage, and create stories with draft support.

---

## 📂 Files Changed/Created

### New Files Created (3 Components + 1 API)
```
frontend/components/dashboard/DashboardSidebar.jsx    ← Navigation sidebar
frontend/components/dashboard/StoriesGrid.jsx         ← Published stories display
frontend/components/dashboard/DraftStories.jsx        ← Draft stories display
backend/src/routes/drafts.routes.js                   ← Draft API endpoints
```

### Modified Files (3 Files)
```
frontend/app/dashboard/page.jsx                       ← Main dashboard page
frontend/utils/api.js                                 ← Added draft API methods
backend/src/index.js                                  ← Registered draft routes
```

---

## 🚀 Quick Start (3 Steps)

### 1. Start Backend
```bash
cd backend
npm start
# ✅ Runs on port 5000
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
# ✅ Runs on port 3000
```

### 3. Open Dashboard
```
http://localhost:3000/dashboard
✅ You're in! (must be logged in)
```

---

## 🎨 UI Layout

```
┌─────────────────────────────────────────────┐
│ ☰ 📚 Kidz Story Magic                       │
├──────────────────┬──────────────────────────┤
│                  │  📚 My Stories           │
│  Sidebar         │  Welcome back, User!    │
│                  │                          │
│ 📚 All Stories   │  🔍 Search box...        │
│ ✨ Published     │  🎨 Theme filter        │
│ 📝 Drafts        │  ➕ Create Story        │
│                  │                          │
│ ✏️ Write Story   │  ┌─────┐ ┌─────┐       │
│ ⚙️ Settings      │  │Story│ │Story│       │
│                  │  └─────┘ └─────┘       │
│ 💬 Help          │                          │
│ 🚪 Logout        │  ┌─────┐               │
│                  │  │Story│  [Pagination]  │
└──────────────────┴──────────────────────────┘
```

---

## 📊 Data Flow

```
User Login
    ↓
[Dashboard Page]
    ├→ Fetch storyAPI.getProjects()     → Published stories
    ├→ Fetch storyAPI.getDraftStories() → Draft stories
    └→ Filter by theme/search
         ↓
    [Tab Navigation]
    ├→ All: Show both published & drafts
    ├→ Published: Show only completed
    └→ Drafts: Show only in-progress
         ↓
    [Story Cards]
    ├→ StoriesGrid (published)
    └→ DraftStories (drafts)
         ↓
    [User Actions]
    ├→ View/Download (published)
    ├→ Resume (drafts)
    ├→ Delete (either)
    └→ Create New
```

---

## 🔌 API Endpoints Reference

| Method | Path | Purpose | Response |
|--------|------|---------|----------|
| GET | `/api/drafts/user` | Get all user drafts | `{drafts: [...]}` |
| GET | `/api/drafts/:id` | Get specific draft | `{draft: {...}}` |
| POST | `/api/drafts` | Create new draft | `{draft: {...}}` |
| PUT | `/api/drafts/:id` | Save draft progress | `{draft: {...}}` |
| DELETE | `/api/drafts/:id` | Delete draft | `{message: "..."}` |
| POST | `/api/drafts/:id/publish` | Publish draft | `{story: {...}}` |

**All require**: `Authorization: Bearer {token}`

---

## 💻 Component Overview

### DashboardSidebar
- **Props**: `activeTab`, `setActiveTab`, `user`
- **Shows**: Navigation, user profile, quick actions
- **Mobile**: Hamburger menu that toggles

### StoriesGrid
- **Props**: `stories`, `onRefresh`
- **Shows**: Published story cards in grid
- **Actions**: View, Download, Edit, Delete

### DraftStories
- **Props**: `drafts`, `onContinue`, `onRefresh`
- **Shows**: Draft story cards with progress
- **Actions**: Resume, Delete

### Dashboard Page
- **Fetches**: Published stories + drafts
- **Shows**: Tab navigation + grid view
- **Handles**: Search, filter, tab switching

---

## 🔄 Usage Scenarios

### Scenario A: Create & Save Draft
```
User clicks "Create Story"
    ↓
Wizard opens (existing feature)
    ↓
User fills step 1, 2, 3
    ↓
User clicks "Save Draft"
    ↓
Backend: PUT /api/drafts/{id} with step=3
    ↓
Frontend: Shows "Draft saved!"
    ↓
Back to dashboard
    ↓
Draft shows with 50% progress (3/6 steps)
```

### Scenario B: Resume Draft
```
User sees draft card with progress
    ↓
User clicks "Resume" button
    ↓
Frontend: Navigates to /wizard?draftId={id}
    ↓
Wizard: Loads draft data from backend
    ↓
User continues from step 4
    ↓
Complete story
    ↓
Story published, moves to Published section
```

### Scenario C: Search Stories
```
User types "Emma" in search
    ↓
Frontend: Filters locally in real-time
    ↓
Shows only stories with child_name containing "Emma"
    ↓
User selects theme filter "Fantasy"
    ↓
Shows only Emma's Fantasy stories
```

---

## 🛠️ Common Tasks

### Check if Backend Routes are Registered
```bash
# Try fetching drafts (without token should return 401)
curl http://localhost:5000/api/drafts/user
# ✅ Should get 401 (not 404)
# ❌ If 404, routes not registered
```

### Get User's Draft Stories
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:5000/api/drafts/user
```

### Update Draft Progress
```bash
curl -X PUT \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"currentStep": 3, "title": "New Title"}' \
  http://localhost:5000/api/drafts/{draftId}
```

### Delete Draft
```bash
curl -X DELETE \
  -H "Authorization: Bearer {token}" \
  http://localhost:5000/api/drafts/{draftId}
```

---

## 🎨 Styling Notes

### Colors Used
- **Sidebar**: Gradient blue-900 to purple-900
- **Buttons**: Gradient blue-500 to blue-600 (default), green-500 to emerald-600 (action)
- **Backgrounds**: Light gradient from blue-50 to pink-50
- **Cards**: White with shadows, hover animations
- **Badges**: Green (published), Yellow (draft, pulsing)

### Responsive Breakpoints
- **Desktop (lg)**: 3-column grid, fixed sidebar
- **Tablet (md)**: 2-column grid, sidebar toggleable
- **Mobile (sm)**: 1-column grid, hamburger menu

---

## ✅ Testing Checklist

Quick validation after deployment:

- [ ] Backend health check: `curl http://localhost:5000/api/health`
- [ ] Dashboard loads: `http://localhost:3000/dashboard`
- [ ] Auth required: Not logged in → redirects to login
- [ ] Sidebar renders correctly
- [ ] Tabs switch (All/Published/Drafts)
- [ ] Search filters in real-time
- [ ] Theme filter works
- [ ] Story cards show metadata
- [ ] "Create Story" button works
- [ ] "Resume" button on draft redirects to wizard
- [ ] "Delete" button works with confirmation
- [ ] Mobile hamburger menu works
- [ ] No console errors

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "No drafts showing" | Check user has stories with `status='draft'` in DB |
| Dashboard returns 401 | Not logged in - go to login page first |
| Cards show no content | Check theme colors in `frontend/utils/themes.js` |
| "Cannot find module" errors | Run `npm install` in backend/frontend |
| API returns 404 | Draft routes not registered in backend/src/index.js |
| Drafts not updating | Check PUT endpoint, verify request body format |
| Sidebar not showing | Check responsive CSS, hamburger menu on mobile |

---

## 📈 Database Columns Used

```sql
-- story_projects table columns for dashboard:
- id (UUID)                          -- Unique ID
- user_id (UUID)                     -- Owner
- child_name (VARCHAR)               -- Child's name
- theme (VARCHAR)                    -- Story theme
- illustration_style (VARCHAR)       -- NEW: 8-theme system
- page_count (INTEGER)               -- Total pages
- status (VARCHAR)                   -- 'draft' or 'published'
- current_step (INTEGER)             -- Progress step (1-6)
- title (VARCHAR)                    -- Story title
- created_at (TIMESTAMP)             -- Created date
- updated_at (TIMESTAMP)             -- Last edited
- preview_url (VARCHAR)              -- Image URL

-- story_content table:
- id (UUID)
- project_id (UUID) -- Links to story_projects
- page_number (INTEGER)
- page_text (TEXT)
- page_illustration_prompt (TEXT)
```

---

## 🔐 Security Summary

✅ **What's Protected**
- All endpoints require JWT token
- User can only see their own stories
- Ownership verified before any operation
- SQL injection prevented with parameterized queries

✅ **HTTP Status Codes**
- 200: Success
- 201: Created (POST)
- 400: Bad request (validation)
- 401: Unauthorized (no token)
- 403: Forbidden (not owner)
- 404: Not found
- 500: Server error

---

## 📞 Quick Links

- **Dashboard Page**: [frontend/app/dashboard/page.jsx](./frontend/app/dashboard/page.jsx)
- **Sidebar Component**: [frontend/components/dashboard/DashboardSidebar.jsx](./frontend/components/dashboard/DashboardSidebar.jsx)
- **Stories Grid**: [frontend/components/dashboard/StoriesGrid.jsx](./frontend/components/dashboard/StoriesGrid.jsx)
- **Draft Stories**: [frontend/components/dashboard/DraftStories.jsx](./frontend/components/dashboard/DraftStories.jsx)
- **Draft API Routes**: [backend/src/routes/drafts.routes.js](./backend/src/routes/drafts.routes.js)
- **API Client**: [frontend/utils/api.js](./frontend/utils/api.js)

---

**Quick Ref Version**: 1.0.0 | **Last Updated**: 2024-01-15
