/**
 * backend/src/services/story-generation.service.js
 * 
 * Purpose: AI-powered story generation from images
 * Features:
 * - Image analysis to understand content
 * - Intelligent image selection from uploaded set
 * - Story content generation with themes
 * - Page structure formatting
 */

const { v4: uuidv4 } = require('uuid');

const fetchApi = (...args) => fetch(...args);

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1';

/**
 * Analyze image content to determine suitability for story
 */
const analyzeImageContent = async (imageUrl, childName) => {
  try {
    if (!OPENAI_API_KEY) {
      console.warn('[AI-ANALYSIS] OpenAI API key not configured');
      return {
        description: 'Story illustration',
        topic: 'adventure',
        mood: 'magical',
        relevance: 0.8
      };
    }

    const response = await fetchApi(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision',
        messages: [{
          role: 'user',
          content: [{
            type: 'text',
            text: `Analyze this image for a children's story for ${childName}. 
                   Provide a brief description (1-2 sentences), identify topics/themes, 
                   mood/tone, and rate relevance for storytelling (0-1).
                   Format as JSON: {description, topic, mood, relevance}`
          }, {
            type: 'image_url',
            image_url: { url: imageUrl }
          }]
        }],
        max_tokens: 200
      })
    });

    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
      return JSON.parse(data.choices[0].message.content);
    }

    return { description: 'Story illustration', topic: 'adventure', mood: 'magical', relevance: 0.7 };
  } catch (error) {
    console.error('[AI-ANALYSIS] Error:', error.message);
    // Graceful fallback
    return {
      description: 'Story illustration',
      topic: 'adventure',
      mood: 'magical',
      relevance: 0.7
    };
  }
};

/**
 * Select best images from uploaded set for story
 */
const selectImagesForStory = async (images, childName, theme, count = 3) => {
  try {
    console.log(`[IMAGE-SELECT] Analyzing ${images.length} images for story`);

    // Analyze each image
    const analyzedImages = await Promise.all(
      images.map(async (img) => ({
        ...img,
        analysis: await analyzeImageContent(img.url, childName)
      }))
    );

    // Sort by relevance score
    const sortedImages = analyzedImages.sort(
      (a, b) => (b.analysis.relevance || 0) - (a.analysis.relevance || 0)
    );

    // Select top N images
    const selectedImages = sortedImages.slice(0, Math.min(count, sortedImages.length));

    console.log(`[IMAGE-SELECT] Selected ${selectedImages.length} images`);
    return selectedImages;
  } catch (error) {
    console.error('[IMAGE-SELECT] Error:', error);
    // Return first N images as fallback
    return images.slice(0, Math.min(count, images.length));
  }
};

/**
 * Generate story content using AI
 */
const generateStoryContent = async (childName, theme, selectedImages, regenerationCount = 0, storyLanguage = 'en') => {
  try {
    if (!OPENAI_API_KEY) {
      console.warn('[STORY-GEN] OpenAI API key not configured, using template');
      return generateTemplateStory(childName, theme, selectedImages, storyLanguage);
    }

    console.log('[STORY-GEN] Generating story with AI');

    // Create image descriptions for context
    const imageDescriptions = selectedImages
      .map((img, idx) => `Image ${idx + 1}: ${img.analysis?.description || img.name}`)
      .join('\n');

    // Language configuration
    const languageMap = {
      'ta': { name: 'Tamil', instruction: 'Write the entire story in Tamil script. Use simple Tamil words suitable for children.' },
      'hi': { name: 'Hindi', instruction: 'Write the entire story in Hindi script. Use simple Hindi words suitable for children.' },
      'te': { name: 'Telugu', instruction: 'Write the entire story in Telugu script. Use simple Telugu words suitable for children.' },
      'kn': { name: 'Kannada', instruction: 'Write the entire story in Kannada script. Use simple Kannada words suitable for children.' },
      'ml': { name: 'Malayalam', instruction: 'Write the entire story in Malayalam script. Use simple Malayalam words suitable for children.' },
      'en': { name: 'English', instruction: 'Write the story in English.' }
    };

    const langConfig = languageMap[storyLanguage] || languageMap['en'];
    const languageInstruction = langConfig.instruction;

    const prompt = `
Create a charming children's story for ${childName}.

Theme: ${theme}
Age Group: 4-8 years old
Number of Pages: 6-8
Language: ${langConfig.name}

${languageInstruction}

Use these images as inspiration:
${imageDescriptions}

Generate a story with:
1. Engaging, age-appropriate language
2. Clear beginning, middle, and end
3. A positive message or lesson
4. Fun character names
5. Interactive dialogue or questions

Format the response as a JSON object with:
{
  "title": "Story title", 
  "pages": [
    {
      "pageNumber": 1,
      "title": "optional page title",
      "content": "story text for this page",
      "imageIndex": 0 (which image to display)
    }
  ],
  "characters": ["list of characters"],
  "lesson": "moral or learning point"
}

${regenerationCount > 0 ? `This is regeneration attempt ${regenerationCount}. Create a different story outline but keep the same theme and characters.` : ''}
    `;

    const response = await fetchApi(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.8,
        max_tokens: 2000
      })
    });

    const data = await response.json();

    if (data.choices?.[0]?.message?.content) {
      const storyJSON = JSON.parse(data.choices[0].message.content);
      return storyJSON;
    }

    return generateTemplateStory(childName, theme, selectedImages, storyLanguage);
  } catch (error) {
    console.error('[STORY-GEN] Error:', error.message);
    // Return template story on error
    return generateTemplateStory(childName, theme, selectedImages, storyLanguage);
  }
};

/**
 * Generate template story when AI is unavailable
 */
/**
 * Generate template story when AI is unavailable
 */
const generateTemplateStory = (childName, theme, selectedImages, storyLanguage = 'en') => {
  console.log('[STORY-GEN] Using template story', { storyLanguage });

  // English template themes (default fallback)
  const enThemes = {
    adventure: {
      title: `${childName}'s Amazing Adventure`,
      characters: ['Explorer ' + childName, 'Friendly Dragon', 'Wise Owl'],
      pages: [
        {
          pageNumber: 1,
          title: 'The Beginning',
          content: `Once upon a time, ${childName} discovered a magical world hidden beyond the mountains. With courage in their heart, our brave hero set out to explore this wonderful new place.`,
          imageIndex: 0
        },
        {
          pageNumber: 2,
          title: 'Making Friends',
          content: `Along the way, ${childName} met a friendly dragon and a wise old owl. They became the best of friends and decided to go on an adventure together!`,
          imageIndex: 1
        },
        {
          pageNumber: 3,
          title: 'The Challenge',
          content: `They faced many challenges, but ${childName}'s quick thinking and the help of their new friends helped them overcome every obstacle.`,
          imageIndex: 2
        },
        {
          pageNumber: 4,
          title: 'The Discovery',
          content: `Finally, they discovered a treasure of friendship and happiness that was more valuable than anything in the world!`,
          imageIndex: selectedImages.length > 3 ? 3 : 2
        },
        {
          pageNumber: 5,
          title: 'The End',
          content: `${childName} learned that with brave friends by your side, you can achieve anything. They returned home with wonderful memories and new best friends.`,
          imageIndex: selectedImages.length > 4 ? 4 : 2
        }
      ],
      lesson: 'Courage, friendship, and teamwork can overcome any challenge'
    },
    fairytale: {
      title: `${childName}'s Fairytale Quest`,
      characters: ['Princess/Prince ' + childName, 'Magic Sprite', 'Royal Guide'],
      pages: [
        {
          pageNumber: 1,
          title: 'An Enchanted Moment',
          content: `In a magical kingdom, ${childName} lived a quiet life until one special day when everything changed!`,
          imageIndex: 0
        },
        {
          pageNumber: 2,
          title: 'The Quest Begins',
          content: `A magical sprite appeared and revealed a hidden quest. ${childName}'s bravery was needed to save the realm!`,
          imageIndex: 1
        },
        {
          pageNumber: 3,
          title: 'Through Trials and Magic',
          content: `With determination and magic, ${childName} journeyed through enchanted forests and crystal caves.`,
          imageIndex: 2
        },
        {
          pageNumber: 4,
          title: 'True Strength',
          content: `${childName} discovered that the greatest magic was inside their own heart all along!`,
          imageIndex: selectedImages.length > 3 ? 3 : 2
        },
        {
          pageNumber: 5,
          title: 'Happily Ever After',
          content: `${childName} returned home as a hero, forever changed by their magical adventure.`,
          imageIndex: selectedImages.length > 4 ? 4 : 2
        }
      ],
      lesson: 'Inner strength and courage are the greatest magic of all'
    },
    friendship: {
      title: `${childName}'s Friendship Bond`,
      characters: [childName, 'Best Friend', 'Helpful Companion'],
      pages: [
        {
          pageNumber: 1,
          title: 'A Special Friend',
          content: `${childName} had someone very special - a friend who believed in them no matter what!`,
          imageIndex: 0
        },
        {
          pageNumber: 2,
          title: 'Sharing Adventures',
          content: `Together, they explored the world, laughed at silly jokes, and helped each other through tough times.`,
          imageIndex: 1
        },
        {
          pageNumber: 3,
          title: 'Teamwork',
          content: `When they worked together, there was nothing they couldn't do!`,
          imageIndex: 2
        },
        {
          pageNumber: 4,
          title: 'Forever Friends',
          content: `No matter what came their way, their friendship remained strong and true.`,
          imageIndex: selectedImages.length > 3 ? 3 : 2
        },
        {
          pageNumber: 5,
          title: 'The Lesson',
          content: `${childName} learned that real friendship is the greatest treasure in the world.`,
          imageIndex: selectedImages.length > 4 ? 4 : 2
        }
      ],
      lesson: 'True friendship lasts forever and makes life beautiful'
    }
  };

  // Tamil template themes
  const taThemes = {
    adventure: {
      title: `${childName} வின் அற்புத சாகசம்`,
      characters: ['ஆய்வாளர் ' + childName, 'நட்பான முத்தொடிப்பு', 'ஞானமுள்ள ஆந்தை'],
      pages: [
        {
          pageNumber: 1,
          title: 'தொடக்கம்',
          content: `ஒருநாள் ${childName} மலைகளுக்கு அப்பால் ஒரு மந்திர உலகத்தைக் கண்டுபிடித்தார். தைரியத்துடன், நம் வீரன் இந்த அதிசய இடத்தை ஆய்வு செய்ய தொடங்கினார்.`,
          imageIndex: 0
        },
        {
          pageNumber: 2,
          title: 'நண்பர்களை சந்திப்பது',
          content: `வழியில், ${childName} ஒரு நட்பான முத்தொடிப்பு மற்றும் ஞானமுள்ள ஆந்தையை சந்தித்தார். அவர்கள் சிறந்த நண்பர்களாக மாறி, ஒன்றாக சாகசம் செய்ய முடிவு செய்தனர்!`,
          imageIndex: 1
        },
        {
          pageNumber: 3,
          title: 'சவால்',
          content: `அவர்கள் பல சவால்களை எதிர்கொண்டனர், ஆனால் ${childName} வின் விரைவான சிந்தனை மற்றும் நண்பர்களின் உதவியால் அனைத்தையும் வெல்லலாம்.`,
          imageIndex: 2
        },
        {
          pageNumber: 4,
          title: 'கண்டுபிடிப்பு',
          content: `இறுதியாக, அவர்கள் நட்பு மற்றும் சந்தோஷத்தின் செல்வத்தைக் கண்டுபிடித்தார்கள், இது உலகில் மிக மূல்யமானது!`,
          imageIndex: selectedImages.length > 3 ? 3 : 2
        },
        {
          pageNumber: 5,
          title: 'முடிவு',
          content: `${childName} கற்றுக்கொண்டார் - தைரியசாலிக்கு நண்பர்கள் இருந்தால் எந்த கனவையும் நிறைவேற்ற முடியும். அவர் அற்புத நினைவுகளுடன் வீடு திரும்பினார்.`,
          imageIndex: selectedImages.length > 4 ? 4 : 2
        }
      ],
      lesson: 'தைரியம், நட்பு மற்றும் ஒன்றாக வேலை செய்வது எந்த சவালையும் வெல்லலாம்'
    },
    family: {
      title: `${childName} வின் குடும்ப வரலாறு`,
      characters: [childName, 'அம்மா', 'அப்பா', 'சகோதரி'],
      pages: [
        {
          pageNumber: 1,
          title: 'ஒரு சிறப்பான நாள்',
          content: `${childName} அழகான காலையில் எழுந்திருந்தார், எப்போதும் நிறைய சந்தோஷத்தை கொணர் ஒரு குடும்ப சாகசம் மற்றும் பெற்றோரின் உடன் வேலை செய்ய தயாரிருந்தார்!`,
          imageIndex: 0
        },
        {
          pageNumber: 2,
          title: 'ஒன்றாக திட்டமிடுவது',
          content: `${childName} வின் அம்மா சிரித்துவிட்டு, "இன்று பூங்காவுக்கு செல்லலாம்?" என்று கேட்டார். எல்லாருக்கு இது பிடிக்கவிருந்த குடும்ப சிறிய பயணம்!`,
          imageIndex: 1
        },
        {
          pageNumber: 3,
          title: 'சந்தோஷ நினைவுகள்',
          content: `பூங்காவில் மாறும் அவர்கள் விளையாடினார்கள், சிரித்தனர் மற்றும் ஒரு அலாதி சமயம் சேர்ந்து கழித்தனர்.`,
          imageIndex: 2
        },
        {
          pageNumber: 4,
          title: 'பிரிக்க முடியாத பந்தம்',
          content: `${childName} உணர்ந்தார் - குடும்பம் என்பது ஒரு பெரிய செல்வம் மற்றும் வாழ்க்கையை மகிழ்ச்சிகரமாக ஆக்குவது!`,
          imageIndex: selectedImages.length > 3 ? 3 : 2
        },
        {
          pageNumber: 5,
          title: 'குடும்ப அன்பு',
          content: `${childName} வீட்டுக்கு திரும்பி தன் குடும்பத்தைக் கட்டிப்பிடித்தார். "நீங்கள் என் முழு உலகம்" என்று சொன்னார்.`,
          imageIndex: selectedImages.length > 4 ? 4 : 2
        }
      ],
      lesson: 'குடும்ப அன்பு உலகில் மிக பெரிய மதிப்பு'
    }
  };

  // Select appropriate language themes
  const themes = storyLanguage === 'ta' ? taThemes : enThemes;
  return themes[theme] || themes.adventure;
};

/**
 * Update template story calls to pass language
 */
const generateStoryFromImages = async ({
  userId,
  projectId,
  childName,
  theme = 'adventure',
  images = [],
  regenerationCount = 0,
  storyLanguage = 'en'
}) => {
  try {
    console.log('[STORY-GENERATION] Starting story generation', {
      projectId,
      childName,
      theme,
      imageCount: images.length,
      regeneration: regenerationCount
    });

    // Step 1: Select best images from uploaded set
    const selectedImages = await selectImagesForStory(
      images,
      childName,
      theme,
      3 // Use 3 images in story
    );

    // Step 2: Generate story content
    const story = await generateStoryContent(
      childName,
      theme,
      selectedImages,
      regenerationCount,
      storyLanguage
    );

    // Step 3: Create story record with metadata
    const storyRecord = {
      id: uuidv4(),
      userId,
      projectId,
      title: story.title,
      theme,
      childName,
      characters: story.characters || [],
      lesson: story.lesson || '',
      pages: story.pages.map((page, idx) => ({
        id: uuidv4(),
        pageNumber: page.pageNumber || idx + 1,
        title: page.title || '',
        content: page.content,
        imageUrl: selectedImages[page.imageIndex]?.url || '',
        imageId: selectedImages[page.imageIndex]?.id || '',
        order: idx
      })),
      selectedImageIds: selectedImages.map(img => img.id),
      totalPages: story.pages.length,
      status: 'generated',
      regenerationCount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('[STORY-GENERATION] ✓ Story generated', {
      storyId: storyRecord.id,
      pageCount: storyRecord.totalPages,
      selectedImages: storyRecord.selectedImageIds.length
    });

    return storyRecord;
  } catch (error) {
    console.error('[STORY-GENERATION] Fatal error:', error);
    throw error;
  }
};

/**
 * Save story as draft in database
 */
const saveDraft = async ({
  userId,
  projectId,
  story,
  images = [],
  status = 'draft'
}) => {
  try {
    console.log('[DRAFT-SAVE] Saving draft', { projectId, status });
    
    const db = require('../config/database');

    // Update existing project or create if doesn't exist
    let updateQuery = `
      UPDATE story_projects 
      SET title = $1, 
          status = $2, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND user_id = $4
      RETURNING *;
    `;

    let result = await db.query(updateQuery, [
      story.title || 'Untitled Story',
      status,
      projectId,
      userId
    ]);

    // If no project exists, create one
    if (result.rows.length === 0) {
      console.log('[DRAFT-SAVE] Project not found, creating new one');
      
      const createQuery = `
        INSERT INTO story_projects (
          id, user_id, title, status, page_count, 
          theme, age_group, child_name, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *;
      `;

      result = await db.query(createQuery, [
        projectId,
        userId,
        story.title || 'Untitled Story',
        status,
        story.pages ? story.pages.length : 0,
        story.theme || 'adventure',
        'all',
        story.childName || 'Child'
      ]);
    }

    const project = result.rows[0];

    // Save story content pages
    if (story.pages && Array.isArray(story.pages)) {
      for (let i = 0; i < story.pages.length; i++) {
        const page = story.pages[i];
        
        const pageQuery = `
          INSERT INTO story_content (project_id, page_number, page_title, page_text)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (project_id, page_number) 
          DO UPDATE SET page_title = $3, page_text = $4, created_at = CURRENT_TIMESTAMP;
        `;

        await db.query(pageQuery, [
          projectId,
          i + 1,
          page.title || `Page ${i + 1}`,
          page.content || page.text || ''
        ]);
      }
    }

    // Save images metadata
    if (images && Array.isArray(images)) {
      for (const img of images) {
        const imageSql = `
          INSERT INTO images (project_id, original_filename, original_url, created_at)
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
          ON CONFLICT DO NOTHING;
        `;

        await db.query(imageSql, [
          projectId,
          img.name || img.originalName || 'image',
          img.url || img.preview || ''
        ]);
      }
    }

    console.log('[DRAFT-SAVE] ✓ Draft saved to database', { projectId, status });

    return {
      id: project.id,
      title: project.title,
      status: project.status,
      childName: project.child_name,
      theme: project.theme,
      ageGroup: project.age_group,
      pageCount: project.page_count,
      createdAt: project.created_at,
      updatedAt: project.updated_at
    };
  } catch (error) {
    console.error('[DRAFT-SAVE] Error:', error);
    throw new Error('Failed to save draft: ' + error.message);
  }
};

/**
 * Regenerate story with new image selection
 */
const regenerateStory = async ({
  userId,
  storyId,
  images,
  theme,
  childName
}) => {
  try {
    console.log('[STORY-REGEN] Regenerating story', { storyId });

    // Generate new story with same theme/child name
    const newStory = await generateStoryFromImages({
      userId,
      projectId: storyId,
      childName,
      theme,
      images,
      regenerationCount: 1
    });

    console.log('[STORY-REGEN] ✓ Story regenerated');
    return newStory;
  } catch (error) {
    console.error('[STORY-REGEN] Error:', error);
    throw new Error('Failed to regenerate story: ' + error.message);
  }
};

module.exports = {
  generateStoryFromImages,
  selectImagesForStory,
  generateStoryContent,
  generateTemplateStory,
  analyzeImageContent,
  saveDraft,
  regenerateStory
};
