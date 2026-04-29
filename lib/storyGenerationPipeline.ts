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
  baseUrl?: string;
  projectId: string;
  childName: string;
  childAge: number;
  theme: string;
  childPhotoUrl?: string; // URL of uploaded child photo
  enableFaceSwap: boolean;
  pageCount: number;
  milestoneTitle?: string;
  milestonePromptHint?: string;
  milestoneCoverBadge?: string;
  isSeries?: boolean;
  chapterNumber?: number;
  originalTheme?: string;
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

function normalizeBaseUrl(baseUrl?: string): string {
  return String(baseUrl || '').trim().replace(/\/$/, '');
}

function getAppBaseUrl(explicitBaseUrl?: string): string {
  const requestBaseUrl = normalizeBaseUrl(explicitBaseUrl);
  if (requestBaseUrl) {
    return requestBaseUrl;
  }

  const configuredBaseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  const vercelUrl = normalizeBaseUrl(process.env.VERCEL_URL);
  if (vercelUrl) {
    return vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`;
  }

  return 'http://localhost:3000';
}

function buildApiUrl(path: string, explicitBaseUrl?: string): string {
  return `${getAppBaseUrl(explicitBaseUrl)}${
    path.startsWith('/') ? path : `/${path}`
  }`;
}

/**
 * Main Story Generation Pipeline
 * Orchestrates all steps from photo upload to final preview
 */
export async function generateStoryWithFaceSwap(
  request: StoryGenerationRequest
): Promise<GeneratedStory> {
  try {
    const appBaseUrl = getAppBaseUrl(request.baseUrl);

    console.log('[PIPELINE] Starting story generation with face swap...');
    console.log('[PIPELINE] Config:', {
      appBaseUrl,
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
        request.projectId,
        request.baseUrl
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
  const response = await fetch(buildApiUrl('/api/story/generate', request.baseUrl), {
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
      milestoneTitle: request.milestoneTitle,
      milestonePromptHint: request.milestonePromptHint,
      milestoneCoverBadge: request.milestoneCoverBadge,
      isSeries: request.isSeries,
      chapterNumber: request.chapterNumber,
      originalTheme: request.originalTheme,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[PIPELINE] Story generation failed:', {
      status: response.status,
      statusText: response.statusText,
      errorResponse: errorText.substring(0, 200),
    });
    throw new Error(`Failed to generate story structure: ${response.statusText} - ${errorText.substring(0, 100)}`);
  }

  try {
    return await response.json();
  } catch (parseError) {
    const text = await response.text();
    console.error('[PIPELINE] Failed to parse story response:', {
      error: parseError,
      responseText: text.substring(0, 200),
    });
    throw new Error(`Invalid JSON response from story generation: ${parseError.message}`);
  }
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

        const response = await fetch(
          buildApiUrl('/api/generate-story-page', request.baseUrl),
          {
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
          }
        );

        if (!response.ok) {
          console.warn(`[PIPELINE] Failed to generate illustration for page ${page.pageNumber}: ${response.statusText}`);
          return page;
        }

        try {
          const result = await response.json();
          return {
            ...page,
            illustrationUrl: result.imageUrl || result.result?.imageUrl,
          };
        } catch (parseError) {
          console.error(`[PIPELINE] Failed to parse illustration response for page ${page.pageNumber}:`, parseError);
          return page;
        }
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
  projectId: string,
  baseUrl?: string
): Promise<StoryPage[]> {
  // Check if DeepAI is configured - skip face swap if not
  const deepaiKey = process.env.DEEPAI_API_KEY;
  if (!deepaiKey) {
    console.warn('[PIPELINE] ⚠ DEEPAI_API_KEY not configured in environment, skipping face swap');
    console.log('[PIPELINE] To enable face swap, add DEEPAI_API_KEY to your environment variables');
    return pages;
  }

  const faceSwappedPages = await Promise.all(
    pages.map(async (page) => {
      try {
        // Skip pages without illustrations
        if (!page.illustrationUrl) {
          return page;
        }

        console.log(`[PIPELINE] Applying face swap to page ${page.pageNumber}...`);

        const response = await fetch(buildApiUrl('/api/photos/face-swap', baseUrl), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            faceImageUrl: childPhotoUrl,
            illustrationImageUrl: page.illustrationUrl,
            childName: page.title,
            pageNumber: page.pageNumber,
            storyId: projectId,
          }),
          }
        );

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
  projectId: string,
  baseUrl?: string
): Promise<{ status: string; progress: number; message?: string }> {
  const response = await fetch(
    buildApiUrl(`/api/story/${projectId}/status`, baseUrl)
  );
  if (!response.ok) {
    throw new Error('Failed to get story status');
  }
  return response.json();
}

/**
 * Cancel story generation
 */
export async function cancelStoryGeneration(
  projectId: string,
  baseUrl?: string
): Promise<void> {
  const response = await fetch(
    buildApiUrl(`/api/story/${projectId}/cancel`, baseUrl),
    {
      method: 'POST',
    }
  );
  if (!response.ok) {
    throw new Error('Failed to cancel story generation');
  }
}
