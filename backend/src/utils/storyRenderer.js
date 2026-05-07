// Story Rendering Utilities
const fs = require('fs').promises;
const path = require('path');
const pool = require('../config/database');
const StoryGenerationService = require('../services/story-generation.service');
const {
  buildBackendStorybookPrompt,
  buildStorySceneBrief,
} = require('./storyScenePlanning');

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
   * Build a scene-first, cinematic story illustration prompt.
   */
  static generateImagePrompt(
    pageNumber,
    storyText,
    childData,
    theme,
    customPrompt = null,
    storyLanguage = 'en',
    pageTitle = ''
  ) {
    return buildBackendStorybookPrompt({
      childName: childData.child_name,
      childGender: childData.child_gender,
      pageNumber,
      pageTitle,
      storyText,
      theme,
      customPrompt,
      childInterests: childData.child_interests,
      childNotes: childData.child_notes,
      ageHint: `${childData.age_group || childData.age || 'young child'} storybook tone in ${
        storyLanguage || 'en'
      }`,
    });
  }

  static generateIllustrationSceneBrief(pageNumber, storyText, childData, theme, customPrompt = null, pageTitle = '') {
    return buildStorySceneBrief({
      childName: childData.child_name,
      pageTitle,
      pageContent: storyText,
      customPrompt,
      childInterests: childData.child_interests,
      childNotes: childData.child_notes,
      theme,
    });
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
            illustrationPrompt: this.generateIllustrationSceneBrief(
              page.pageNumber || index + 1,
              page.content || '',
              projectData,
              theme,
              customPrompt,
              page.title || ''
            ),
            imagePrompt: this.generateImagePrompt(
              page.pageNumber || index + 1,
              page.content || '',
              projectData,
              theme,
              customPrompt,
              storyLanguage,
              page.title || ''
            )
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
          illustrationPrompt:
            processedIllustrationPrompt ||
            this.generateIllustrationSceneBrief(
              page.page_number || index + 1,
              processedText,
              projectData,
              theme,
              customPrompt,
              page.title || ''
            ),
          imagePrompt: this.generateImagePrompt(
            page.page_number || index + 1,
            processedText,
            projectData,
            theme,
            customPrompt,
            storyLanguage,
            page.title || ''
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

module.exports = StoryRenderer;
