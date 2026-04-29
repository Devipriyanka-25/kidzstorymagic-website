# 🚀 Kidz Story Magic — Feature Integration Guide

## Files You've Just Received

| File | Feature | Where to Put It |
|------|---------|----------------|
| `FreePreview.js` | Free 3-page sample | `frontend/components/FreePreview.js` |
| `StorySeries.js` | Story Series / Sequel | `frontend/components/StorySeries.js` |
| `GiftStory.js` | Gift a Story (UI) | `frontend/components/GiftStory.js` |
| `gift.js` (backend) | Gift email sending | `backend/routes/gift.js` |
| `MilestoneSelector.js` | Milestone Stories | `frontend/components/MilestoneSelector.js` |

---

## Feature 4: Free 3-Page Sample

### In your wizard review page (pages/wizard.js or review step):

```jsx
import FreePreview from '../components/FreePreview';

// Replace your current preview with:
<FreePreview
  pages={generatedStory.pages}   // your story pages array
  storyData={{
    childName: formData.childName,
    projectId: currentProjectId,
  }}
/>
```

### In your story generation API (pages/api/story/generate.js):
```js
// After generating the story, only return first 3 pages until paid
const isPaid = await checkPaymentStatus(projectId);
const pagesToReturn = isPaid ? allPages : allPages.slice(0, 3);
return res.json({ pages: pagesToReturn, totalPages: allPages.length });
```

---

## Feature 5: Story Series

### On your success page (pages/success.js) or dashboard:

```jsx
import StorySeries from '../components/StorySeries';

// After showing success message, add:
<StorySeries
  childName={story.childName}
  childAge={story.childAge}
  originalTheme={story.theme}
  storyNumber={childStoryCount}  // how many stories this child has
/>
```

### In your wizard (pages/wizard.js), pre-fill from URL params:
```js
// At the top of your wizard component:
const router = useRouter();
const { childName, childAge, theme, isSeries, chapterNumber } = router.query;

// Pre-fill your form state:
const [formData, setFormData] = useState({
  childName: childName || '',
  childAge: childAge || '',
  theme: theme || '',
  // ...rest of your fields
});
```

---

## Feature 6: Gift a Story

### Step 1 — Add to your checkout page (pages/checkout.js):

```jsx
import GiftStory from '../components/GiftStory';

// In your checkout component:
const [giftData, setGiftData] = useState(null);

// In your JSX, before the pay button:
<GiftStory onGiftDataChange={setGiftData} />

// When creating Stripe session, pass gift data:
const response = await fetch('/api/payment/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId,
    isGift: !!giftData,
    giftData,  // { recipientName, recipientEmail, giftMessage }
  }),
});
```

### Step 2 — Register the gift route in backend/app.js:

```js
// Add this line with your other routes:
app.use('/api/gift', require('./routes/gift'));
```

### Step 3 — Call gift send after payment success (backend/routes/payment.js):

```js
// Inside your webhook handler, after payment_intent.succeeded:
if (session.metadata.isGift === 'true') {
  const giftData = JSON.parse(session.metadata.giftData);
  await fetch(`${process.env.BASE_URL}/api/gift/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...giftData,
      senderName: session.metadata.buyerName,
      childName: session.metadata.childName,
      downloadUrl: generatedDownloadUrl,
    }),
  });
}
```

---

## Feature 8: Milestone Stories

### Step 1 — Add as first step in your wizard:

```jsx
import MilestoneSelector, { MILESTONES } from '../components/MilestoneSelector';

// In your wizard state:
const [selectedMilestone, setSelectedMilestone] = useState(null);

// In your wizard JSX (Step 1):
{currentStep === 0 && (
  <MilestoneSelector
    onSelect={setSelectedMilestone}
    selectedId={selectedMilestone?.id}
  />
)}
```

### Step 2 — Use milestone in your AI prompt (backend/routes/story.js):

```js
// In your story generation, add milestone context to your AI prompt:
const milestoneHint = req.body.milestonePromptHint || '';
const milstoneBadge = req.body.milestoneCoverBadge || '';

const prompt = `
  Create a personalized children's story for ${childName}, age ${age}.
  ${milestoneHint ? `The story is about ${milestoneHint}.` : ''}
  Theme: ${theme}
  ${milestoneBadge ? `Add a special "${milestoneBadge}" badge on the cover page.` : ''}
  Pages: ${pageCount}
  ...rest of your prompt
`;
```

### Step 3 — Send milestone data from frontend to backend:

```js
// When submitting wizard form:
body: JSON.stringify({
  childName,
  age,
  theme,
  pageCount,
  milestoneId: selectedMilestone?.id,
  milestonePromptHint: selectedMilestone?.promptHint,
  milestoneCoverBadge: selectedMilestone?.coverBadge,
})
```

---

## Quick Testing Checklist

- [ ] FreePreview: Generate a story → see 3 pages → blur/lock shows remaining pages
- [ ] FreePreview: "Unlock" button goes to checkout with projectId
- [ ] StorySeries: After purchase on success page, series widget shows
- [ ] StorySeries: Click theme → "Start Chapter 2" → wizard pre-filled with child details
- [ ] GiftStory: Toggle "This is a gift" → form appears → fills correctly
- [ ] GiftStory: After payment → recipient gets gift email with download link
- [ ] MilestoneSelector: Step 1 of wizard → select milestone → hint text updates
- [ ] MilestoneSelector: Story prompt includes milestone context

---

## Need Help?
Each file is self-contained and uses only React + Next.js router — no new packages needed!
The gift backend uses nodemailer which you likely already have.
