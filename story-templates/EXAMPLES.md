# Story Template Examples

## How Placeholders Work

### Input Data
When creating a story, the wizard collects:
```javascript
{
  childName: "Emma",
  childGender: "female",
  childInterests: "art, music",
  ageGroup: "0-2",
  theme: "adventure",
  setting: "the enchanted forest",
  pageCount: 10
}
```

### Generated Story (with placeholders replaced)

---

## Example 1: ADVENTURE Template - Generated Output

### Story Title: The Great Adventure
**Theme:** Adventure | **Moral:** Every journey starts with a single brave step

#### Page 1: The Discovery
**Text:** Emma found an old treasure map in the enchanted forest! It showed the path to a magical place filled with wonder and excitement.

**Illustration Prompt:** Cartoon young child (Emma) with wide excited eyes holding an aged parchment map, sitting in the enchanted forest. Warm, bright colors. Style: child-friendly animation

---

#### Page 2: Preparing for the Quest
**Text:** Emma packed a magical backpack with snacks, water, and a compass. This adventure would be amazing!

**Illustration Prompt:** Emma packing colorful items into a backpack. Items floating around include: sandwich, water bottle, compass, torch. Warm daylight through a window. Style: whimsical children's book illustration

---

#### Page 3: The Enchanted Forest (Preview)
**Text:** The first stop was an enchanted forest. Tall trees sparkled with magical lights, and friendly creatures peeked out from behind bushes.

*(More pages continue with Emma's adventure...)*

---

## Example 2: FRIENDSHIP Template - Generated Output

### Story Title: Friends Forever
**Theme:** Friendship | **Moral:** True friendship is about caring and helping each other

#### Page 1: A New Friend
**Text:** Emma was playing in the park when she saw Zuri sitting alone. "Zuri, would you like to play with me?" asked Emma.

---

#### Page 2: Playing Together
**Text:** Zuri's face lit up with joy. They played games, laughed, and shared stories. What a wonderful day!

*(Continues with 8 more pages of friendship journey...)*

---

## Example 3: COURAGE Template - Generated Output

### Story Title: The Brave Heart
**Theme:** Courage | **Moral:** Courage isn't about not being scared—it's about doing the right thing anyway

#### Page 1: Scared of the Dark
**Text:** Emma was always a little scared of the dark. But tonight was different—Zuri needed help!

**Illustration Prompt:** Child (Emma) standing at the edge of darkness, looking nervous but determined. Behind her a lit room, ahead is mysterious darkness. Concerned but brave expression. Style: slightly dramatic, age-appropriate spooky

---

#### Page 2: The Problem
**Text:** Zuri's puppy had wandered into the dark woods near the park and they couldn't find it. "Emma, will you help me?" asked Zuri with tears in their eyes.

---

*(More pages showing Emma's courage journey...)*

---

## Example 4: KINDNESS Template - Generated Output

### Story Title: The Kindness Circle
**Theme:** Kindness | **Moral:** Small acts of kindness create big circles of happiness

#### Page 1: A Simple Act
**Text:** One sunny morning in the school playground, Emma noticed Zuri sitting alone. So Emma walked over and gave Zuri a bright smile and a wave.

---

#### Page 2: Spreading Smiles
**Text:** Zuri's whole face lit up! They were so happy to be noticed. Zuri thanked Emma and they played together all day.

---

*(Continues showing how Emma's kindness creates a chain reaction...)*

---

## Example 5: CREATIVITY Template - Generated Output

### Story Title: The Imagination Adventure
**Theme:** Creativity | **Moral:** Your imagination is limitless—let it take you anywhere

#### Page 1: A Rainy Day
**Text:** It was raining outside, and Emma couldn't play in the garden. But Emma wasn't sad—they had an idea. "Let's imagine!" said Emma.

---

#### Page 2: A Blank Canvas
**Text:** Emma grabbed paper, markers, and paints. "Zuri, help me! We can create anything we want!" Zuri jumped up excitedly.

---

*(More pages exploring Emma and Zuri's creative imagination...)*

---

## Placeholder Replacement Summary

| Original | Replaced With |
|---|---|
| {childName} | Emma |
| {friendName} | Zuri |
| {petName} | (optional - not used in all templates) |
| {setting} | the enchanted forest / the park / the school playground / the garden |
| {age} | (used in some templates for age-specific content) |
| {theme} | adventure / friendship / courage / kindness / creativity |

---

## Key Features of Generated Stories

### ✅ Personalization
- Child's actual name appears throughout
- Reflects selected theme
- Uses provided setting

### ✅ Consistency
- Same characters appear in all 10 pages
- Coherent narrative arc from start to finish
- Clear moral message

### ✅ Visual Guidance
- Each page has an illustration prompt
- Prompts include style suggestions
- Safe for AI art generation or human artists

### ✅ Age Appropriateness
- Content suitable for 3-8 year olds
- Vocabulary appropriate for reading aloud
- Positive, empowering messages

---

## From Templates to PDF

### Story Generation Flow
1. **Select Theme** → Template loaded from JSON
2. **Enter Child Data** → Placeholders identified
3. **Replace Placeholders** → Backend processes replacements
4. **Create Project** → Story saved to database
5. **Generate PDF** → Illustrations + text formatted
6. **Deliver to Parent** → Ready to print/download

---

## Customization Example

### Original Template Text
> "One sunny morning in {setting}, {childName} noticed {friendName} sitting alone."

### With User Input
- {setting} = "the school playground"
- {childName} = "Emma"
- {friendName} = "Zuri"

### Result
> "One sunny morning in the school playground, Emma noticed Zuri sitting alone."

---

## Notes for Developers

### Adding Placeholders
To add new placeholders:
1. Add to template JSON (e.g., `{schoolName}`, `{favoriteFood}`)
2. Update `StoryRenderer.replacePlaceholders()` method
3. Update frontend form to collect data
4. Update this guide with examples

### Extending Templates
To support more page counts:
```json
"templates": {
  "5": { "pageCount": 5, "pages": [...] },
  "10": { "pageCount": 10, "pages": [...] },
  "20": { "pageCount": 20, "pages": [...] }
}
```

### Database Queries
Get a generated story with all pages:
```sql
SELECT * FROM story_content 
WHERE project_id = 'uuid-here' 
ORDER BY page_number ASC;
```

---

## Real-World Usage

### Parent Journey
1. Parent signs up
2. Starts wizard, fills in child details
3. Selects "Adventure" theme
4. Engine generates story with child's name
5. Parents clicks "Preview Story"
6. Ready to checkout and print!

### Story Becomes Keepsake
Each story is:
- ✨ Personalized with child's name
- 📖 Beautifully illustrated
- 💾 Stored in account for future access
- 🎁 Perfect gift or keepsake
