/**
 * Generate Story Endpoint
 * POST /api/story/[projectId]/generate-story
 * Generates a story for a given project
 */

import { NextResponse } from 'next/server';
import { getTranslatedStory } from '../../../lib/storyTranslations.js';
import { getBookTheme } from '@/utils/themes';
import {
  getStoryProjectById,
  replaceStoryProjectPages,
  resolveAuthenticatedStoryUser,
  updateStoryProjectRecord,
} from '../../../shared/storyProjects.js';
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PREMIUM_SCENE_GUIDES = {
  'animal-adventure': {
    setting:
      'a bright sunrise adventure world with open skies, storybook mountains, golden grass, floating birds, and friendly safari-style animal companions',
    interaction:
      'exploring with a brave smile, pointing toward the next discovery, or walking beside a gentle animal friend as the clear hero',
    palette:
      'sunrise gold, clear sky blue, warm sand, leafy green, and soft coral accents',
  },
  'dino-quest': {
    setting:
      'a playful prehistoric valley with colorful dinosaurs, bright plants, soft clouds, glowing sunshine, and a wide cheerful landscape',
    interaction:
      'riding or standing beside a friendly dinosaur, waving with excitement, or leading dinosaur friends through a joyful adventure',
    palette:
      'vivid red, tropical green, sunny yellow, bright cyan, and warm orange',
  },
  'goodnight-garage': {
    setting:
      'a cozy toy garage attic with warm amber light, wooden rafters, playful little cars, soft window glow, and child-safe workshop wonder',
    interaction:
      'helping a toy car, pointing up at a skylight surprise, or proudly exploring the garage as the main character',
    palette:
      'golden amber, honey yellow, warm brown, soft blue, and creamy highlights',
  },
  'unicorn-magic': {
    setting:
      'a bright pastel cloud kingdom with rainbow light, sparkling flower clouds, a friendly white unicorn, and a glowing castle in the distance',
    interaction:
      'walking beside a unicorn, twirling with magical joy, or holding out a glowing hand as pastel sparkles float around the child',
    palette:
      'pearl white, blush pink, lavender, pastel rainbow, and sunrise gold',
  },
  customizable: {
    setting:
      'a premium magical story world with bright color, playful depth, and a full animated-movie environment built around the custom direction',
    interaction:
      'joyfully exploring the environment as the main story hero with clear movement and expressive body language',
    palette:
      'bright jewel tones, warm highlights, and child-friendly magical glow',
  },
  adventure: {
    setting:
      'a sweeping magical adventure landscape with storybook cliffs, glowing paths, floating lanterns, and playful creatures',
    interaction:
      'crossing a sparkling bridge, discovering a hidden treasure trail, or leading new animal friends through the scenery',
    palette:
      'sunrise gold, sky blue, warm coral, and luminous teal',
  },
  family: {
    setting:
      'a warm storybook neighborhood filled with glowing windows, a garden path, cozy home details, and loving family energy',
    interaction:
      'sharing a magical family moment, exploring a backyard wonder, or guiding loved ones through a joyful surprise',
    palette:
      'peach, butter yellow, soft blue, and warm evening light',
  },
  friends: {
    setting:
      'a playful friendship world with a treehouse, colorful park paths, bunting, balloons, and imaginative play spaces',
    interaction:
      'laughing with new friends, solving a playful challenge together, or leading a group through a whimsical game',
    palette:
      'mint green, berry pink, sunny yellow, and bright sky tones',
  },
  motivational: {
    setting:
      'an uplifting adventure world with a glowing trail, confident steps, shining mountains, and celebratory light',
    interaction:
      'bravely reaching a milestone, helping others over an obstacle, or standing proudly after a small heroic win',
    palette:
      'gold, sapphire, bright red accents, and hopeful light rays',
  },
  behavioural: {
    setting:
      'a gentle emotional-learning world with calm gardens, floating lights, friendly animals, and soothing magical details',
    interaction:
      'showing kindness, listening carefully, sharing, or helping a friend in a comforting scene',
    palette:
      'soft coral, mint, lavender, and warm cream light',
  },
  fantasy: {
    setting:
      'a bright fantasy kingdom with glowing clouds, pastel castles, rainbow skies, enchanted gardens, and friendly magical creatures',
    interaction:
      'walking beside a magical companion, opening a glowing castle gate, or discovering joyful sparks in the sky',
    palette:
      'lilac, rose gold, sunrise blue, and pearl white',
  },
  fairytale: {
    setting:
      'a classic fairytale world with sparkling castles, pastel clouds, soft flower meadows, and gentle magical creatures',
    interaction:
      'meeting a fairy companion, twirling in a glowing meadow, or following a trail of stardust',
    palette:
      'blush pink, lavender, soft teal, and golden light',
  },
  jungle: {
    setting:
      'a lush safari jungle with giant leaves, waterfalls, sunbeams, colorful birds, and friendly elephants',
    interaction:
      'walking with an elephant, exploring a waterfall path, or leading an animal adventure through the jungle',
    palette:
      'emerald green, leafy lime, warm sunlight, and bright tropical accents',
  },
  dinosaur: {
    setting:
      'a bright prehistoric world with huge ferns, volcano silhouettes, dramatic skies, and playful dinosaurs',
    interaction:
      'riding a smiling dinosaur, waving to flying dinos overhead, or running through a prehistoric valley',
    palette:
      'volcanic orange, jungle green, sky turquoise, and sunny yellow',
  },
  garage: {
    setting:
      'a warm indoor storybook garage with toy cars, wooden beams, skylight moon glow, cozy corners, and golden workshop lighting',
    interaction:
      'pointing to a glowing toy car, exploring workshop treasures, or guiding little vehicles through the garage',
    palette:
      'honey gold, warm amber, soft brown, and midnight blue highlights',
  },
  pirate: {
    setting:
      'a cinematic treasure-island world with a storybook ship, sparkling ocean, treasure maps, and golden sand',
    interaction:
      'finding treasure, steering a friendly pirate ship, or adventuring beside a playful parrot',
    palette:
      'ocean blue, sunset orange, treasure gold, and driftwood brown',
  },
  superhero: {
    setting:
      'a bold heroic cityscape with glowing towers, dramatic clouds, bright action lines, and celebratory energy',
    interaction:
      'landing in a heroic pose, rescuing a friend, or zooming above the city with joyful confidence',
    palette:
      'hero red, electric blue, bright yellow, and silver highlights',
  },
  space: {
    setting:
      'a magical outer-space world with glowing planets, cosmic clouds, twinkling stars, and friendly alien wonder',
    interaction:
      'floating near a rocket, waving to a friendly space creature, or exploring a sparkling moon path',
    palette:
      'indigo, cyan, comet gold, and nebula pink',
  },
  underwater: {
    setting:
      'a vibrant underwater kingdom with coral castles, bubbles, sea creatures, shimmering light beams, and flowing plants',
    interaction:
      'swimming beside dolphins, exploring coral arches, or guiding sea friends through a glowing reef',
    palette:
      'aqua, coral pink, seafoam green, and pearl light',
  },
  wizard: {
    setting:
      'an enchanted wizard world with glowing spell books, candlelit towers, magical dust, and floating lights',
    interaction:
      'casting a gentle spell, exploring a magical library, or discovering a glowing potion room',
    palette:
      'amethyst, midnight blue, candle gold, and silver sparkle',
  },
  celebration: {
    setting:
      'a premium celebration scene with floral details, soft event lighting, elegant decorations, joyful family energy, and a polished keepsake atmosphere',
    interaction:
      'welcoming loved ones, smiling beside a decorated table, or sharing a joyful family milestone moment as the clear hero of the page',
    palette:
      'rose pink, champagne gold, warm cream, coral, and radiant highlights',
  },
  birthday: {
    setting:
      'a vibrant birthday celebration with balloons, cake, confetti, party lights, colorful gifts, and a bright premium event backdrop',
    interaction:
      'making a wish, cutting the cake, opening a special gift, or leading a joyful birthday moment with playful confidence',
    palette:
      'confetti orange, sky blue, sunshine yellow, berry pink, and bright celebratory light',
  },
  gala: {
    setting:
      'an elegant gathering scene with floral arches, premium decor, glowing lanterns, and warm polished event ambiance',
    interaction:
      'welcoming guests, sharing a heartfelt smile, or standing proudly in the center of a meaningful celebration scene',
    palette:
      'deep teal, honey gold, ivory, berry rose, and luminous evening warmth',
  },
  tribute: {
    setting:
      'a heartfelt premium keepsake scene with rich backdrop color, glowing accents, elegant decor, and affectionate celebration energy',
    interaction:
      'sharing a loving smile, holding a meaningful keepsake, or standing confidently in a warm tribute-style spotlight moment',
    palette:
      'crimson, gold, blush, soft ivory, and glowing celebratory highlights',
  },
  'family-celebration': {
    setting:
      'a joyful family event scene with floral decor, celebration tables, string lights, a welcoming garden or hall backdrop, and keepsake-book warmth',
    interaction:
      'sharing a family milestone, smiling with pride, or leading a warm event moment surrounded by celebration details',
    palette:
      'rose pink, coral, butter gold, cream, and joyful light',
  },
  'birthday-bash': {
    setting:
      'a premium birthday party world with balloons, candles, gifts, confetti, bright stage decor, and a vivid party backdrop',
    interaction:
      'making a birthday wish, opening gifts, or enjoying a cheerful spotlight moment at the center of the party',
    palette:
      'orange, sky blue, candy pink, yellow, and vibrant celebratory glow',
  },
  'festive-gathering': {
    setting:
      'a polished family gathering or community celebration with bunting, lights, flowers, rich decor, and a bright welcoming event environment',
    interaction:
      'welcoming everyone, sharing a festive smile, or leading a meaningful gathering with warmth and grace',
    palette:
      'teal, marigold, cream, berry pink, and soft golden light',
  },
  'heartfelt-tribute': {
    setting:
      'a premium tribute scene with elegant backdrop color, decorative flourishes, warm spotlighting, and meaningful keepsake-book charm',
    interaction:
      'standing proudly, sharing a loving glance, or holding a symbolic gift in a heartfelt celebratory moment',
    palette:
      'crimson, rose, gold, ivory, and rich warm highlights',
  },
  customizable: {
    setting:
      "a premium children's storybook world tailored to the custom theme, with a complete cinematic environment and magical depth",
    interaction:
      'interacting naturally with the world in a full scene instead of posing for a portrait',
    palette:
      'bright, magical, high-contrast storybook colors',
  },
};

const ILLUSTRATION_WORD_REPLACEMENTS = [
  [/\bmoonlit\b/gi, 'sunlit'],
  [/\bnighttime\b/gi, 'bright daytime'],
  [/\bnight\b/gi, 'sunny daytime'],
  [/\bmisty\b/gi, 'sparkly'],
  [/\bmist\b/gi, 'sparkle'],
  [/\bfoggy\b/gi, 'glowing'],
  [/\bfog\b/gi, 'glow'],
  [/\beerie\b/gi, 'magical'],
  [/\bcreepy\b/gi, 'playful'],
  [/\bspooky\b/gi, 'whimsical'],
  [/\bscary\b/gi, 'gentle'],
  [/\bhaunted\b/gi, 'enchanted'],
  [/\bhorror\b/gi, 'storybook'],
  [/\bgloomy\b/gi, 'joyful'],
  [/\bdark forest\b/gi, 'sparkling enchanted garden'],
  [/\bshadowy\b/gi, 'glowing'],
];

function normalizeThemeKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function resolveSceneGuide(theme, illustrationStyle) {
  const styleKey = normalizeThemeKey(illustrationStyle);
  const themeKey = normalizeThemeKey(theme);

  return (
    PREMIUM_SCENE_GUIDES[styleKey] ||
    PREMIUM_SCENE_GUIDES[themeKey] ||
    PREMIUM_SCENE_GUIDES.adventure
  );
}

function cleanPromptDetail(value, maxLength = 280) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function sanitizeIllustrationText(value, maxLength = 280) {
  let sanitized = cleanPromptDetail(value, maxLength);

  for (const [pattern, replacement] of ILLUSTRATION_WORD_REPLACEMENTS) {
    sanitized = sanitized.replace(pattern, replacement);
  }

  return sanitized;
}

function buildIllustrationPrompt({
  childName,
  theme,
  illustrationStyle,
  customPrompt,
  childInterests,
  childNotes,
  ageHint,
  pageTitle,
  pageContent,
}) {
  const sceneGuide = resolveSceneGuide(theme, illustrationStyle);
  const storyMoment = sanitizeIllustrationText(pageContent, 320);
  const safePageTitle = sanitizeIllustrationText(pageTitle, 120);
  const interestDetail = cleanPromptDetail(childInterests, 120);
  const noteDetail = cleanPromptDetail(childNotes, 120);
  const customSceneDetail = cleanPromptDetail(customPrompt, 180);
  const customSceneInstruction = customSceneDetail
    ? `Custom theme direction: ${customSceneDetail}.`
    : '';
  const interestInstruction = interestDetail
    ? `Include small visual touches inspired by these interests when appropriate: ${interestDetail}.`
    : '';
  const notesInstruction = noteDetail
    ? `Important child notes for character consistency: ${noteDetail}.`
    : '';

  return [
    `Create a full-scene premium personalized storybook illustration for ${childName}.`,
    'Use the uploaded child reference photos only as visual guidance, then recreate the child as a premium 3D animated cartoon character instead of showing any real photo.',
    "Preserve the child's recognizable identity closely: match the face structure, skin tone, hairline, hairstyle, eye shape and spacing, nose shape, smile shape, and overall age appearance while converting the child into a premium 3D cartoon hero.",
    'Render the child as a joyful full-body or three-quarter-body cartoon hero inside the world, not as a close-up portrait.',
    `Build a complete cinematic environment: ${sceneGuide.setting}.`,
    `The child should be actively interacting with the world by ${sceneGuide.interaction}.`,
    `Scene title: ${safePageTitle}.`,
    `Story moment to illustrate: ${storyMoment}.`,
    `Color direction: ${sceneGuide.palette}. Push toward extra vibrant, saturated, joyful storybook color with luminous highlights and playful contrast.`,
    `Mood: ${ageHint}.`,
    customSceneInstruction,
    interestInstruction,
    notesInstruction,
    'Lighting must be bright, warm, cheerful, and child-safe. Prefer sunny daylight, pastel sky glow, rainbow bounce light, or golden sunrise light over moody, gloomy, or dark scenes.',
    'Composition should feel like a premium vertical storybook cover or book-selection card with a full background, visible depth, and plenty of room for the environment to breathe around the child.',
    'Keep the same child character design, costume palette, facial proportions, and overall bright 3D style consistent across every page in the book by following the selected primary reference photo carefully.',
    'Make this feel like a polished animated feature film still for kids: colorful, magical, playful, emotionally warm, immediately welcoming, and rich with vibrant premium color.',
    'Absolutely avoid horror vibes, eerie woods, realistic skin pores, photo textures, blue-grey darkness, thriller mood, flat vector art, split layout, or a simple headshot.',
  ].join(' ');
}

export async function POST(request, { params }) {
  try {
    const projectId = params.projectId;

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    console.log('[GENERATE_STORY] Auth header:', authHeader ? 'Present' : 'Missing');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[GENERATE_STORY] Missing or invalid auth header format');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('[GENERATE_STORY] Token length:', token.length);
    const jwtSecret = process.env.JWT_SECRET || 'kidz-story-magic-jwt-secret-key-2024-production-secure-random-12345';

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
      console.log('[GENERATE_STORY] Token verified successfully');
    } catch (err) {
      console.log('[GENERATE_STORY] Token verification failed:', err.message);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const authUser = await resolveAuthenticatedStoryUser(decoded);
    if (!authUser?.id) {
      return NextResponse.json(
        { error: 'Authenticated user could not be resolved.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('[GENERATE_STORY] Generating story for project:', projectId, 'by user:', decoded.id || decoded.email);
    console.log('[GENERATE_STORY] Request body:', body);

    // Extract story parameters
    const {
      childName,
      childGender,
      ageGroup,
      theme,
      pageCount,
      storyLanguage = 'en',
    } = body;

    const existingProject = await getStoryProjectById(authUser.id, projectId);
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Story project not found' },
        { status: 404 }
      );
    }

    console.log('[GENERATE_STORY] Story language:', storyLanguage);

    // Validate required fields
    if (!childName || !ageGroup || !theme) {
      return NextResponse.json(
        { error: 'Missing required fields: childName, ageGroup, theme' },
        { status: 400 }
      );
    }

    const selectedBookTheme = getBookTheme(theme);

    // Get translated story content based on language
    console.log('[GENERATE_STORY] Getting translated story for:', { language: storyLanguage, theme, childName });

    // Map theme names if needed (for compatibility)
    const themeMap = {
      'animal-adventure': 'animal-adventure',
      'dino-quest': 'dino-quest',
      'goodnight-garage': 'goodnight-garage',
      'unicorn-magic': 'unicorn-magic',
      'family-celebration': 'celebration',
      'birthday-bash': 'birthday',
      'festive-gathering': 'gathering',
      'heartfelt-tribute': 'tribute',
      family: 'celebration',
      friends: 'animal-adventure',
      motivational: 'dino-quest',
      behavioural: 'goodnight-garage',
      adventure: 'adventure',
      fantasy: 'fantasy',
      fairytale: 'fantasy',
      customizable: 'adventure',
    };

    const mappedTheme =
      themeMap[theme] || selectedBookTheme.storyTheme || 'adventure';
    const translatedStory = getTranslatedStory(storyLanguage, mappedTheme, childName);
    const storyTitle =
      typeof selectedBookTheme.titleTemplate === 'function'
        ? selectedBookTheme.titleTemplate(childName)
        : translatedStory.title;
    const pageThemeTitle = selectedBookTheme.label || translatedStory.title;

    const selectedTheme = {
      title: storyTitle,
      displayTitle: pageThemeTitle,
      storyArcs: translatedStory.arcs,
    };

    const ageGroupHint = {
      '0-2': 'very simple and gentle',
      '3-5': 'fun, colorful, and easy to follow',
      '5-8': 'exciting with good lessons',
      '8-12': 'adventurous and thought-provoking',
      '12+': 'celebratory, heartfelt, polished, and emotionally meaningful',
    };

    const storyArcs = selectedTheme.storyArcs || [];
    const totalPages = Math.max(Number(pageCount) || 20, 3);
    const storyPages = Math.max(totalPages - 2, 1);
    const ageHint = ageGroupHint[ageGroup] || 'engaging and meaningful';
    const pagesArray = [
      {
        pageNumber: 1,
        pageType: 'cover',
        title: storyTitle,
        content: '',
        text: '',
        illustrationPrompt: null,
        illustrationUrl: null,
        image: null,
        htmlContent: '',
      },
    ];

    const arcsPerPage = Math.max(Math.ceil(storyArcs.length / storyPages), 1);

    for (let i = 0; i < storyPages; i++) {
      const arcStart = i * arcsPerPage;
      const arcEnd = Math.min((i + 1) * arcsPerPage, storyArcs.length);
      const pageArcs = storyArcs.slice(arcStart, arcEnd);
      const pageContent = pageArcs.join(' ') || `${childName}'s story continues...`;
      const pageTitle = `${pageThemeTitle} - Page ${i + 1}`;

      pagesArray.push({
        pageNumber: i + 2,
        pageType: 'story',
        title: pageTitle,
        content: pageContent,
        text: pageContent,
        illustrationPrompt: buildIllustrationPrompt({
          childName,
          theme: selectedBookTheme.value || theme,
          illustrationStyle:
            existingProject.illustration_style || existingProject.illustrationStyle,
          customPrompt:
            body.customPrompt || existingProject.custom_illustration_prompt || null,
          childInterests:
            existingProject.child_interests || existingProject.childInterests,
          childNotes: existingProject.child_notes || existingProject.childNotes,
          ageHint,
          pageTitle,
          pageContent,
        }),
        illustrationUrl: null,
        image: null,
        htmlContent: `
          <div style="padding: 20px; font-family: 'Comic Sans MS', cursive; line-height: 1.8;">
            <h3 style="color: #667eea; margin-bottom: 15px;">Page ${i + 1}: ${selectedTheme.title}</h3>
            <h4 style="color: #0f172a; margin-bottom: 12px;">${pageThemeTitle}</h4>
            <p style="color: #333; font-size: 16px;">${pageContent}</p>
            <p style="color: #666; font-size: 14px; margin-top: 16px;">
              Illustration will be generated with Replicate using the child's reference photo.
            </p>
          </div>
        `,
      });
    }

    pagesArray.push({
      pageNumber: totalPages,
      pageType: 'end',
      title: 'The End',
      content: `${childName} closes the book with a happy heart and a mind full of magical memories.`,
      text: `${childName} closes the book with a happy heart and a mind full of magical memories.`,
      illustrationPrompt: null,
      illustrationUrl: null,
      image: null,
      htmlContent: '',
    });

    const generatedStory = {
      id: projectId,
      title: storyTitle,
      childName: childName,
      childGender: childGender,
      ageGroup: ageGroup,
      theme: theme,
      pageCount: totalPages,
      pages: pagesArray,
      status: 'draft',
      content: `
        <h2>${storyTitle}</h2>
        <p>Once upon a time, there was a special child named ${childName}. This is a special story created just for them.</p>
        <p>In this wonderful journey, ${childName} experiences amazing things and learns valuable lessons.
        Every page brings new excitement, new friends, and new discoveries.</p>
        <p>${childName} shows remarkable courage, kindness, and determination throughout this tale.
        From the beginning to the end, this story celebrates what makes ${childName} unique and special.</p>
        <p>With beautiful illustrations and heartwarming moments, this story is designed to inspire,
        entertain, and create lasting memories for ${childName}.</p>
      `,
      htmlContent: `
        <div style="font-family: 'Comic Sans MS', cursive; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
          <h1 style="color: white; text-align: center; font-size: 48px; margin-bottom: 30px;">${storyTitle}</h1>
          <div style="background: white; border-radius: 20px; padding: 40px; max-width: 800px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <h2 style="color: #667eea; font-size: 28px;">Chapter 1: The Beginning</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.8;">
              Once upon a time, in a magical place, there lived an amazing child named ${childName}.
              ${childName} had a special gift - the ability to see wonder in the world around them.
            </p>
            <p style="color: #333; font-size: 16px; line-height: 1.8;">
              One day, something extraordinary happened. A magical adventure was about to begin,
              and ${childName} was chosen to be the hero of this incredible story.
            </p>
            <h2 style="color: #667eea; font-size: 28px; margin-top: 30px;">The Adventure Unfolds</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.8;">
              ${childName}'s journey was filled with magic and wonder. With each new challenge,
              ${childName} discovered inner strength and made wonderful discoveries.
            </p>
            <p style="color: #333; font-size: 16px; line-height: 1.8;">
              Friends were made, lessons were learned, and ${childName} proved to be brave, kind, and wise beyond measure.
            </p>
            <h2 style="color: #667eea; font-size: 28px; margin-top: 30px; text-align: center;">The Happy Ending</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.8; text-align: center;">
              And so, ${childName}'s story came to a wonderful conclusion. The world was forever changed by their kindness and courage.
            </p>
            <p style="color: #667eea; font-size: 18px; font-weight: bold; text-align: center; margin-top: 20px;">
              The End
            </p>
          </div>
        </div>
      `,
      illustrations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      previewUrl: `/api/story/preview/${projectId}`,
      downloadUrls: {
        pdf: `/api/story/${projectId}/download/pdf`,
        epub: `/api/story/${projectId}/download/epub`,
      },
    };

    const updatedProject = await updateStoryProjectRecord(authUser.id, projectId, {
      title: generatedStory.title,
      age_group: ageGroup,
      theme,
      illustration_style:
        existingProject.illustration_style || existingProject.illustrationStyle,
      custom_illustration_prompt:
        body.customPrompt || existingProject.custom_illustration_prompt || null,
      page_count: totalPages,
      child_name: childName,
      child_gender: childGender,
      child_interests:
        existingProject.child_interests || existingProject.childInterests || null,
      child_notes:
        existingProject.child_notes || existingProject.childNotes || null,
      status: 'draft',
      current_step: 6,
      preview_url: null,
    });

    const persistedPages = await replaceStoryProjectPages(projectId, pagesArray);

    const persistedStory = {
      ...generatedStory,
      ...updatedProject,
      pages: persistedPages,
      content: persistedPages
        .map((page) => page.page_text || page.text || '')
        .filter(Boolean)
        .join('\n\n'),
    };

    console.log('[GENERATE_STORY] Story generated successfully:', projectId);

    return NextResponse.json(
      {
        success: true,
        message: 'Story generated successfully',
        story: persistedStory,
        projectId: projectId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GENERATE_STORY] Error:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to generate story',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
