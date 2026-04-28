/**
 * Story Generation Pipeline with Face Swap Integration
 * 
 * Pipeline Flow:
 * 1. Child photo uploaded → Stored in user session
 * 2. Generate cartoon scene with Stable Diffusion → Creates initial illustration
 * 3. Run face swap → Embeds child's face onto cartoon character
 * 4. Compose final image with story text → Adds narrative elements
 * 5. Show in preview → Display personalized result
 */

export interface StoryGenerationRequest {
  projectId: string;
  childName: string;
  childAge: number;
  theme: string;
  childPhotoUrl?: string; // URL of uploaded child photo
  enableFaceSwap: boolean;
  pageCount: number;
}

export interface StoryPage {
  pageNumber: number;
  title: string;
  content: string;
  illustrationPrompt: string;
  illustrationUrl?: string;
  faceSwappedUrl?: string; // After face swap processing
  pageType: string;
}

export interface GeneratedStory {
  id: string;
  projectId: string;
  childName: string;
  title: string;
  pages: StoryPage[];
  status: 'draft' | 'ready' | 'failed';
  createdAt: string;
}

/**
 * Main Story Generation Pipeline
 * Orchestrates all steps from photo upload to final preview
 */
export async function generateStoryWithFaceSwap(
  request: StoryGenerationRequest
): Promise<GeneratedStory> {
  try {
    console.log('[PIPELINE] Starting story generation with face swap...');
    console.log('[PIPELINE] Config:', {
      childName: request.childName,
      theme: request.theme,
      enableFaceSwap: request.enableFaceSwap,
      hasPhotoUrl: !!request.childPhotoUrl,
    });

    // Step 1: Generate story structure and prompts
    const story = await generateStoryStructure(request);
    console.log(`[PIPELINE] ✓ Story structure generated with ${story.pages.length} pages`);

    // Step 2: Generate illustrations for each page
    const illustratedPages = await generateIllustrations(story.pages, request);
    console.log('[PIPELINE] ✓ All illustrations generated');

    // Step 3: Apply face swap if enabled
    if (request.enableFaceSwap && request.childPhotoUrl) {
      const faceSwappedPages = await applyFaceSwapToPages(
        illustratedPages,
        request.childPhotoUrl,
        request.projectId
      );
      story.pages = faceSwappedPages;
      console.log('[PIPELINE] ✓ Face swap applied to all pages');
    }

    // Step 4: Compose final images (add text overlays if needed)
    const composedPages = await composePageImages(story.pages, request);
    story.pages = composedPages;
    console.log('[PIPELINE] ✓ Final compositions created');

    story.status = 'ready';
    console.log('[PIPELINE] ✅ Story generation complete!');

    return story;
  } catch (error) {
    console.error('[PIPELINE] ❌ Story generation failed:', error);
    throw error;
  }
}

/**
 * Step 1: Generate story structure and text
 */
async function generateStoryStructure(
  request: StoryGenerationRequest
): Promise<GeneratedStory> {
  // Call your existing story generation endpoint with internal call header
  const response = await fetch('/api/story/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Call': 'true', // Mark as internal call to skip auth
    },
    body: JSON.stringify({
      projectId: request.projectId,
      childName: request.childName,
      childAge: request.childAge,
      theme: request.theme,
      pageCount: request.pageCount,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate story structure: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Step 2: Generate illustrations for all story pages
 */
async function generateIllustrations(
  pages: StoryPage[],
  request: StoryGenerationRequest
): Promise<StoryPage[]> {
  const illustratedPages = await Promise.all(
    pages.map(async (page) => {
      try {
        // Skip pages without content (cover, end, etc.)
        if (!page.illustrationPrompt) {
          return page;
        }

        console.log(`[PIPELINE] Generating illustration for page ${page.pageNumber}...`);

        const response = await fetch('/api/generate-story-page', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: page.illustrationPrompt,
            childName: request.childName,
            theme: request.theme,
            pageNumber: page.pageNumber,
            projectId: request.projectId,
            subjectImage: request.childPhotoUrl, // Pass child photo as reference
          }),
        });

        if (!response.ok) {
          console.warn(`[PIPELINE] Failed to generate illustration for page ${page.pageNumber}`);
          return page;
        }

        const result = await response.json();
        return {
          ...page,
          illustrationUrl: result.imageUrl || result.result?.imageUrl,
        };
      } catch (error) {
        console.error(`[PIPELINE] Error generating page ${page.pageNumber}:`, error);
        return page;
      }
    })
  );

  return illustratedPages;
}

/**
 * Step 3: Apply face swap to illustrated pages
 * Replaces cartoon character's face with child's face features
 */
async function applyFaceSwapToPages(
  pages: StoryPage[],
  childPhotoUrl: string,
  projectId: string
): Promise<StoryPage[]> {
  const faceSwappedPages = await Promise.all(
    pages.map(async (page) => {
      try {
        // Skip pages without illustrations
        if (!page.illustrationUrl) {
          return page;
        }

        console.log(`[PIPELINE] Applying face swap to page ${page.pageNumber}...`);

        const response = await fetch('/api/photos/face-swap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            faceImageUrl: childPhotoUrl,
            illustrationImageUrl: page.illustrationUrl,
            childName: page.title,
            pageNumber: page.pageNumber,
            storyId: projectId,
          }),
        });

        if (!response.ok) {
          console.warn(`[PIPELINE] Face swap failed for page ${page.pageNumber}, using original`);
          return page;
        }

        const result = await response.json();
        return {
          ...page,
          faceSwappedUrl: result.swappedUrl || result.result?.swappedImageUrl,
          // Use face-swapped image as primary
          illustrationUrl: result.swappedUrl || result.result?.swappedImageUrl || page.illustrationUrl,
        };
      } catch (error) {
        console.error(`[PIPELINE] Error applying face swap to page ${page.pageNumber}:`, error);
        return page;
      }
    })
  );

  return faceSwappedPages;
}

/**
 * Step 4: Compose final images with text overlays
 * Adds story text and formatting to illustrations
 */
async function composePageImages(
  pages: StoryPage[],
  request: StoryGenerationRequest
): Promise<StoryPage[]> {
  // For now, return pages as-is
  // In the future, you could add text overlays, page numbers, etc.
  return pages;
}

/**
 * Batch process multiple stories with face swap
 */
export async function generateMultipleStoriesWithFaceSwap(
  requests: StoryGenerationRequest[]
): Promise<GeneratedStory[]> {
  const stories = await Promise.all(
    requests.map((req) => generateStoryWithFaceSwap(req))
  );
  return stories;
}

/**
 * Get status of ongoing story generation
 */
export async function getStoryGenerationStatus(
  projectId: string
): Promise<{ status: string; progress: number; message?: string }> {
  const response = await fetch(`/api/story/${projectId}/status`);
  if (!response.ok) {
    throw new Error('Failed to get story status');
  }
  return response.json();
}

/**
 * Cancel story generation
 */
export async function cancelStoryGeneration(projectId: string): Promise<void> {
  const response = await fetch(`/api/story/${projectId}/cancel`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to cancel story generation');
  }
}
