// Story Rendering Utilities
const fs = require('fs').promises;
const path = require('path');
const pool = require('../config/database');
const StoryGenerationService = require('../services/story-generation.service');

// Single source of truth for the 2D storybook negative prompt used across all image generation paths
const STORYBOOK_NEGATIVE_PROMPT =
  "generic child, different face, different skin tone, changed hair type, changed hair color, older child, adult face, distorted face, extra fingers, bad anatomy, face mismatch, random character, real photo, photorealistic, realistic photo, DSLR photo, copied photo background, copied original clothing, copied shirt graphic, shirt text, logos, letters on clothing, misspelled text, watermark, selfie, close-up portrait, cropped head, floating head, split layout, collage, flat vector, anime, 3D Pixar, plastic doll face, pasted photo face, face pasted onto cartoon body, realistic face swap, blurry, washed out, pale colors, low contrast, muddy watercolor, gloomy lighting, horror mood, 3D render, semi-realistic, photorealistic render, CGI, hyperreal skin";

class StoryRenderer {
  /**
   * Load and parse story template
   */
  static async loadTemplate(theme, pageCount, storyLanguage = 'en') {
    try {
      // For now, try to load language-specific template if available, fall back to English
      const templatePath = storyLanguage !== 'en' 
        ? path.join(__dirname, `../../../story-templates/${theme}-template-${storyLanguage}.json`)
        : path.join(__dirname, `../../../story-templates/${theme}-template.json`);
      
      console.log('[TEMPLATE_LOAD] Attempting to load:', templatePath);
      let templateContent;
      try {
        templateContent = await fs.readFile(templatePath, 'utf-8');
      } catch (err) {
        // Fall back to English template if language-specific not found
        if (storyLanguage !== 'en') {
          console.log(`[TEMPLATE_LOAD] Language template not found for ${storyLanguage}, falling back to English`);
          const englishPath = path.join(__dirname, `../../../story-templates/${theme}-template.json`);
          templateContent = await fs.readFile(englishPath, 'utf-8');
        } else {
          throw err;
        }
      }
      
      const template = JSON.parse(templateContent);
      
      console.log(`[TEMPLATE_LOAD] Successfully loaded template for theme: ${theme}, language: ${storyLanguage}`);
      return template.templates[pageCount] || null;
    } catch (err) {
      console.error('[TEMPLATE_LOAD_ERROR] Failed to load template:', err.message);
      return null;
    }
  }

  /**
   * Replace placeholders in story text
   * Supports both {camelCase} and {{snake_case}} formats
   */
  static replacePlaceholders(text, childData) {
    let processedText = text;

    // Generate default values for missing data
    const defaults = {
      friendName: ['Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Riley', 'Casey', 'Sam'][Math.floor(Math.random() * 8)],
      petName: ['Buddy', 'Luna', 'Max', 'Bella', 'Charlie', 'Daisy', 'Rocky'][Math.floor(Math.random() * 7)],
      setting: ['the park', 'the forest', 'the beach', 'the mountains', 'the city', 'the garden'][Math.floor(Math.random() * 6)]
    };

    // Handle {camelCase} format (current templates)
    processedText = processedText.replace(/{childName}/g, childData.child_name || 'Child');
    processedText = processedText.replace(/{friendName}/g, defaults.friendName);
    processedText = processedText.replace(/{petName}/g, defaults.petName);
    processedText = processedText.replace(/{setting}/g, defaults.setting);

    // Handle {{snake_case}} format (legacy support)
    processedText = processedText.replace(/{{child_name}}/g, childData.child_name || 'Child');

    // Replace gender references
    if (childData.child_gender) {
      const pronoun = childData.child_gender === 'male' ? 'his' : 'her';
      const pronounCapitalized = childData.child_gender === 'male' ? 'He' : 'She';
      
      processedText = processedText.replace(/{{child_gender == 'male' \? 'his' : 'her'}}/g, pronoun);
      processedText = processedText.replace(/{{child_gender == 'male' \? 'he' : 'she'}}/g, 
        childData.child_gender === 'male' ? 'he' : 'she');
      
      // Handle gender pronouns in {camelCase} format
      processedText = processedText.replace(/{pronoun}/g, pronoun);
      processedText = processedText.replace(/{pronounCapitalized}/g, pronounCapitalized);
    }

    // Replace interests
    if (childData.child_interests) {
      const interests = childData.child_interests.split(',')[0].trim();
      processedText = processedText.replace(/{{interest}}/g, interests);
      processedText = processedText.replace(/{interest}/g, interests);
    }

    // Replace age
    if (childData.age) {
      processedText = processedText.replace(/{{age}}/g, childData.age);
      processedText = processedText.replace(/{age}/g, childData.age);
    }

    // Replace theme keyword
    if (childData.theme) {
      processedText = processedText.replace(/{{theme_keyword}}/g, childData.theme);
      processedText = processedText.replace(/{theme}/g, childData.theme);
    }

    return processedText;
  }

  /**
   * Generate image prompt for a story page
   * Character appearance changes based on page content while maintaining consistency
   */
  static generateImagePrompt(pageNumber, storyText, childData, theme, customPrompt = null, storyLanguage = 'en') {
    const { child_name, child_gender } = childData;
    
    // Base art style for all images — 2D storybook illustration, not 3D / semi-realistic
    const baseStyle = "A premium 2D illustrated children's picture-book scene, hand-painted digital storybook style, expressive slightly enlarged eyes, warm smooth skin tones, painterly brushwork, rich saturated colors, clean outlines, glowing magical background";
    
    // Character traits based on gender
    const pronouns = child_gender === 'male' ? 'boy' : 'girl';
    const childDescription = child_gender === 'male' 
      ? `adorable young boy ${child_name} with bright curious eyes, rosy cheeks, warm expression`
      : `adorable young girl ${child_name} with big expressive eyes, rosy cheeks, warm smile`;
    
    // Page-specific character appearance based on story progression
    const getPageOutfitContext = (pageNum, storyTheme) => {
      const progression = {
        1: 'comfortable everyday clothes, standing confidently, hopeful expression',
        2: 'cozy adventure jacket, ready for journey, excited eyes',
        3: 'explorer outfit with adventure gear, determined expression, brave stance',
        4: 'learning outfit with focus, sitting or practicing, concentration',
        5: 'empowered with glowing aura, standing tall, confident smile',
        6: 'celebration clothes, happy expression, surrounded by friends or support',
        7: 'victorious pose, wearing success, triumphant smile, glowing',
        8: 'mentor outfit, helping others, kind expression, wisdom in eyes',
        9: 'reflective pose, thoughtful look, surrounded by memories or lessons',
        10: 'graduation or celebration outfit, bright future ahead, hopeful gaze',
        // For 20-page stories, add more variation
        11: 'new adventure beginning, fresh outfit, curious expression',
        12: 'growth appears in appearance, mature but still young, confident',
        13: 'teaching or helping pose, gentle expression, light around character',
        14: 'connecting with others, surrounded by supportive figures, warm glow',
        15: 'master or expert pose, skilled appearance, inspiring presence',
        16: 'dreaming new dreams outfit, looking forward, wonder in eyes',
        17: 'beacon of hope appearance, helping others find their way, radiant',
        18: 'unity symbolized, multiple characters or connections visible, harmony',
        19: 'spreading light and inspiration, uplifting presence, joy radiating',
        20: 'future ready appearance, grown with experiences, bright destiny ahead'
      };
      
      return progression[pageNum] || progression[10] || 'comfortable and confident, warm expression';
    };

    // If custom theme with custom prompt provided
    if (theme === 'customizable' && customPrompt) {
      const pageContext = getPageOutfitContext(pageNumber, theme);
      
      const storyElements = [
        `${baseStyle}. ${childDescription}, ${pageContext}, discovering ${customPrompt}. Adventure and wonder. Magical atmosphere with soft glowing elements.`,
        `${baseStyle}. ${childDescription}, ${pageContext}, exploring ${customPrompt}. Curiosity and excitement. Dreamlike magical quality throughout the scene.`,
        `${baseStyle}. ${childDescription}, ${pageContext}, encountering ${customPrompt}. Joy and amazement. Enchanted setting with soft glowing lighting.`,
        `${baseStyle}. ${childDescription}, ${pageContext}, journey through ${customPrompt}. Brave adventure. Magical creatures and sparkling elements present.`,
        `${baseStyle}. ${childDescription}, ${pageContext}, celebrating ${customPrompt}. Triumph and happiness. Vibrant colors with festive magical atmosphere.`,
      ];

      const selectedStory = storyElements[(pageNumber - 1) % storyElements.length];
      return selectedStory;
    }

    const pageContext = getPageOutfitContext(pageNumber, theme);
    
    // Theme-specific settings with character outfit changes
    const themeSettings = {
      'friends': `${baseStyle}. ${childDescription}, ${pageContext}, surrounded by friendly animal companions in a magical forest. Warm sunlight filtering through trees, pastel colors throughout the scene.`,
      'family': `${baseStyle}. ${childDescription}, ${pageContext}, with whimsical family members and loved ones. Warm cozy home setting, golden gentle lighting, heartwarming atmosphere.`,
      'adventure': `${baseStyle}. ${childDescription}, ${pageContext}, on an exciting jungle exploration. Lush green scenery with glowing plants, magical aura, soft adventurous lighting.`,
      'motivational': `${baseStyle}. ${childDescription}, ${pageContext}, showing courage and determination. Inspiring background with uplifting colors, light emanating from character's expression and presence.`,
      'behavioural': `${baseStyle}. ${childDescription}, ${pageContext}, learning important life lessons. Supportive environment with gentle colors, wisdom and understanding in the scene.`,
      'fairytale': `${baseStyle}. ${childDescription}, ${pageContext}, in an enchanted magical realm. Glowing flowers, sparkling magic particles, soft pastel and jewel-toned colors throughout.`,
      'space': `${baseStyle}. ${childDescription}, ${pageContext}, floating through cosmic space. Colorful planets and stars around, pastel nebula background, dreamy space exploration.`,
      'ocean': `${baseStyle}. ${childDescription}, ${pageContext}, as underwater explorer. Colorful coral reef, friendly fish, magical ocean glow, bubbles and light rays.`,
      'superhero': `${baseStyle}. ${childDescription}, ${pageContext}, with heroic cape and pose. Colorful cityscape background, action-packed but playful, superhero energy.`,
      'dinosaur': `${baseStyle}. ${childDescription}, ${pageContext}, playing with friendly prehistoric dinosaurs. Vibrant prehistoric landscape, magical prehistoric adventure feeling.`,
      'wizard': `${baseStyle}. ${childDescription}, ${pageContext}, as young wizard in magical academy. Spellbooks, glowing magical effects, mystical environment throughout.`,
      'pirate': `${baseStyle}. ${childDescription}, ${pageContext}, on treasure ship adventure. Ocean waves, treasure chest, adventure and discovery spirit.`,
      'princess': `${baseStyle}. ${childDescription}, ${pageContext}, in enchanted castle realm. Royal magical setting, glowing decorative details, dreamy atmosphere.`
    };

    return themeSettings[theme] || `${baseStyle}. ${childDescription}, ${pageContext}, in a magical ${theme} world with vibrant colors and dreamy ambiance.`;
  }

  /**
   * Generate complete story with AI support for language preservation
   * Tries AI generation first (which supports language), falls back to templates
   */
  static async generateStory(projectData, theme, customPrompt = null, storyLanguage = 'en') {
    try {
      console.log(`[GENERATE_STORY] Starting story generation for language: ${storyLanguage}`);
      
      // Try AI generation first (supports language)
      try {
        console.log(`[GENERATE_STORY] Attempting AI generation with language: ${storyLanguage}`);
        
        // AI service generates story with language support
        // No need to fetch images - AI generates content based on child name, theme, and language
        const selectedImages = [];

        // Call AI service with language support
        const aiStory = await StoryGenerationService.generateStoryContent(
          projectData.child_name,
          theme,
          selectedImages,
          0,
          storyLanguage // Pass language to AI service
        );

        console.log(`[GENERATE_STORY] AI generation successful with language: ${storyLanguage}`);
        
        // Convert AI story format to standard page format
        if (aiStory && aiStory.pages && Array.isArray(aiStory.pages)) {
          const generatedPages = aiStory.pages.map((page, index) => ({
            page_number: page.pageNumber || index + 1,
            title: page.title || '',
            page_text: page.content || '',
            illustrationPrompt: page.imagePrompt || '',
            imagePrompt: `Illustration for: ${page.content?.substring(0, 100)}...`
          }));

          console.log(`[GENERATE_STORY] Converted ${generatedPages.length} AI-generated pages`);
          return generatedPages;
        }
      } catch (aiError) {
        console.warn(`[GENERATE_STORY] AI generation failed, falling back to templates:`, aiError.message);
      }

      // Fallback to template-based generation
      console.log(`[GENERATE_STORY] Using template fallback for language: ${storyLanguage}`);
      const pageCount = String(projectData.page_count);
      const template = await this.loadTemplate(theme, pageCount, storyLanguage);

      if (!template) {
        throw new Error(`Template not found for theme: ${theme}, pages: ${pageCount}, language: ${storyLanguage}`);
      }

      const generatedPages = template.pages.map((page, index) => {
        const childData = {
          child_name: projectData.child_name,
          child_gender: projectData.child_gender,
          child_interests: projectData.child_interests,
          theme: theme,
          storyLanguage: storyLanguage
        };

        const processedText = this.replacePlaceholders(page.text, childData);
        
        // Also process illustration prompt if it has placeholders
        const processedIllustrationPrompt = page.illustrationPrompt 
          ? this.replacePlaceholders(page.illustrationPrompt, childData)
          : '';

        return {
          ...page,
          page_text: processedText,
          illustrationPrompt: processedIllustrationPrompt,
          imagePrompt: this.generateImagePrompt(
            page.page_number || index + 1,
            processedText,
            projectData,
            theme,
            customPrompt,
            storyLanguage
          )
        };
      });

      console.log(`[GENERATE_STORY] Generated ${generatedPages.length} template-based pages with language: ${storyLanguage}`);
      return generatedPages;
    } catch (err) {
      console.error('[GENERATE_STORY_ERROR]', err.message);
      throw err;
    }
  }

  /**
   * Save generated story to database
   */
  static async saveStoryContent(projectId, pages) {
    try {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        for (const page of pages) {
          await client.query(
            `INSERT INTO story_content (project_id, page_number, page_title, page_text)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (project_id, page_number) 
             DO UPDATE SET page_title = EXCLUDED.page_title, page_text = EXCLUDED.page_text`,
            [projectId, page.page_number, page.title, page.page_text]
          );
        }

        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Failed to save story content:', err);
      throw err;
    }
  }

  /**
   * Retrieve story content from database
   */
  static async getStoryContent(projectId) {
    try {
      const result = await pool.query(
        `SELECT * FROM story_content 
         WHERE project_id = $1 
         ORDER BY page_number ASC`,
        [projectId]
      );

      return result.rows;
    } catch (err) {
      console.error('Failed to retrieve story content:', err);
      throw err;
    }
  }
}

// Attach the negative prompt as a static property so callers can access it
// via `StoryRenderer.STORYBOOK_NEGATIVE_PROMPT` or destructuring require.
StoryRenderer.STORYBOOK_NEGATIVE_PROMPT = STORYBOOK_NEGATIVE_PROMPT;

module.exports = StoryRenderer;
