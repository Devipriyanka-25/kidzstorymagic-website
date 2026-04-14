# Story Templates Guide

## Overview
These 5 reusable JSON story templates are designed for children ages 3-8. Each template includes:
- **Title & Theme**: Clear story identity
- **Moral**: The learning objective
- **10-Page Structure**: Each page includes text with placeholders and detailed illustration prompts
- **Dynamic Placeholders**: Personalize stories with child names, settings, and more

---

## 5 Story Templates

### 1. **ADVENTURE** - The Great Adventure
- **Theme**: Adventure & Exploration
- **Moral**: Every journey starts with a single brave step
- **Focus**: Quest-based adventure with new experiences
- **Placeholders Used**: {childName}, {friendName}, {petName}, {setting}
- **Ideal For**: Adventurous children; introducing confidence

### 2. **FRIENDSHIP** - Friends Forever
- **Theme**: Friendship & Support
- **Moral**: True friendship is about caring and helping each other
- **Focus**: Connection, loyalty, and mutual support
- **Placeholders Used**: {childName}, {friendName}, {petName}, {setting}
- **Ideal For**: Social development; handling emotions

### 3. **COURAGE** - The Brave Heart
- **Theme**: Courage & Overcoming Fear
- **Moral**: Courage isn't about not being scared—it's about doing the right thing anyway
- **Focus**: Facing fears; inner strength
- **Placeholders Used**: {childName}, {friendName}, {petName}, {setting}
- **Ideal For**: Children dealing with anxiety; building confidence

### 4. **KINDNESS** - The Kindness Circle
- **Theme**: Kindness & Compassion
- **Moral**: Small acts of kindness create big circles of happiness
- **Focus**: Ripple effects of compassion; community
- **Placeholders Used**: {childName}, {friendName}, {setting}
- **Ideal For**: Empathy development; community awareness

### 5. **CREATIVITY** - The Imagination Adventure
- **Theme**: Imagination & Creativity
- **Moral**: Your imagination is limitless—let it take you anywhere
- **Focus**: Imaginative play; creative thinking
- **Placeholders Used**: {childName}, {friendName}, {petName}, {setting}
- **Ideal For**: Encouraging creative expression; rainy day activities

---

## Template Structure

### JSON Format
```json
{
  "theme": "adventure",
  "title": "The Great Adventure",
  "ageRange": "3-8",
  "moral": "Every journey starts with a single brave step",
  "description": "Story description",
  "templates": {
    "10": {
      "pageCount": 10,
      "pages": [...]
    }
  }
}
```

### Page Structure
Each page contains:
- **pageNumber**: Sequential page number (1-10)
- **title**: Page heading
- **text**: Story text with {placeholders}
- **illustrationPrompt**: Detailed description for artists/AI illustrators

---

## Available Placeholders

| Placeholder | Example | Usage |
|---|---|---|
| **{childName}** | "Emma", "Liam" | Main character name |
| **{friendName}** | "Star", "Kai" | Secondary character name |
| **{petName}** | "Luna", "Milo" | Pet/animal companion |
| **{age}** | 5, 6, 7, 8 | Child's age (if needed) |
| **{setting}** | "park", "school", "garden" | Story location |
| **{theme}** | "adventure", "magic" | Story theme keyword |

---

## How to Use Placeholders

### 1. **Simple Replacement**
When generating a story, replace placeholders with actual values:
- `{childName}` → "Emma"
- `{friendName}` → "Zuri"
- `{petName}` → "Whiskers"
- `{setting}` → "the enchanted forest"

**Example Page Result:**
> "Emma discovered an old treasure map in the enchanted forest! It showed the path to a magical place filled with wonder and excitement."

### 2. **Consistent Replacement**
Use the same names throughout the entire story for continuity.

### 3. **Backend Implementation**
The `storyRenderer.js` utility handles placeholder replacement:
```javascript
StoryRenderer.replacePlaceholders(pageText, {
  child_name: 'Emma',
  child_gender: 'female',
  child_interests: 'reading, art',
  theme: 'adventure'
})
```

---

## Illustration Prompts

Each page includes a detailed illustration prompt specifying:
- **Scene components**: What should be shown
- **Characters**: Appearance and emotions
- **Setting details**: Environment and atmosphere
- **Style guide**: Child-safe illustration style
- **Technical notes**: No real face replication, age-appropriate content

### Example Illustration Prompt:
> "Cartoon young child with wide excited eyes holding an aged parchment map, sitting in {setting}. Warm, bright colors. Style: child-friendly animation"

---

## Implementation in Frontend

### Wizard Step 6 (Review & Checkout)
```javascript
const handleGenerateStory = async () => {
  // 1. Create project
  const createResponse = await storyAPI.createProject({
    age_group: formData.ageGroup,
    theme: formData.theme,      // e.g., "adventure"
    page_count: formData.pageCount, // e.g., 10
    child_name: formData.childName, // e.g., "Emma"
    child_gender: formData.childGender,
    child_interests: formData.childInterests,
    // ... more data
  });

  // 2. Generate story (backend handles placeholder replacement)
  const projectId = createResponse.data.project.id;
  const storyResponse = await storyAPI.generateStory(projectId);
  
  // 3. Display generated story with pages
  setStoryPreview(storyResponse.data.story);
};
```

---

## Backend Story Generation Flow

1. **Load Template**: `StoryRenderer.loadTemplate(theme, pageCount)`
   - Loads the theme's JSON template from `story-templates/`
   - Example: `fairytale-template.json`

2. **Replace Placeholders**: `StoryRenderer.replacePlaceholders(text, childData)`
   - Replaces all {placeholders} with actual values
   - Handles gender-specific pronouns if applicable

3. **Generate Pages**: Map each template page with replaced text
   - Returns array of page objects with page_text

4. **Save to Database**: `StoryRenderer.saveStoryContent(projectId, pages)`
   - Saves generated story to `story_content` table

---

## Customization Options

### Adding New Templates
Create a new JSON file following the same structure:
```bash
story-templates/[new-theme]-template.json
```

### Extending Placeholder Set
Add more placeholders to enhanced templates:
- `{grandparentName}` for family stories
- `{schoolName}` for school-related tales
- `{favoriteFood}` for food-themed adventures

### Page Count Variations
Currently using 10-page format. To support different lengths:
```json
"templates": {
  "5": { "pageCount": 5, "pages": [...] },
  "10": { "pageCount": 10, "pages": [...] },
  "15": { "pageCount": 15, "pages": [...] }
}
```

---

## Safety & Child-Friendly Content

All templates include:
✅ Age-appropriate content (3-8 years)
✅ Positive messages and morals
✅ Diverse characters and settings
✅ No scary/violent content
✅ Inclusive representation
✅ Illustration prompts specify: "child-safe", "no real faces", "animation style"

---

## Testing & Validation

### To test a template:
1. Login to the app
2. Go through the wizard (Steps 1-5)
3. On Step 6 (Review), click "Preview Story"
4. Select your desired theme
5. Verify:
   - ✅ Placeholders are correctly replaced
   - ✅ All 10 pages appear
   - ✅ Story flows logically
   - ✅ Illustration prompts are visible

---

## Files Location
- Templates: `story-templates/`
- Backend Renderer: `backend/src/utils/storyRenderer.js`
- Database Table: `story_content` (project_id, page_number, page_title, page_text)

---

## Future Enhancements
- [ ] AI-generated illustrations using DALL-E Integration
- [ ] Audio narration for stories
- [ ] Multi-language support
- [ ] Parent-customized timeline stories
- [ ] Story sharing & community features
- [ ] PDF export with illustrations
