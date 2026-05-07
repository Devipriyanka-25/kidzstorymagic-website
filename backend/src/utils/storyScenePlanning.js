const DEFAULT_SCENE_GUIDE = {
  setting:
    "a premium children's storybook world with layered foreground, midground, and background detail",
  interaction:
    "moving naturally through the story world and actively participating in the page action",
  palette:
    "warm magical storybook colors with emotional lighting",
};

const THEME_SCENE_GUIDES = {
  friends: {
    setting:
      "a playful friendship world with colorful paths, treehouse details, imaginative play spaces, and cheerful storybook depth",
    interaction:
      "laughing with companions, solving a playful challenge, or leading the group through the world",
    palette:
      "mint green, sunny yellow, berry pink, and bright sky tones",
  },
  family: {
    setting:
      "a cozy family story world with warm windows, loving home details, a welcoming path, and emotional warmth",
    interaction:
      "sharing a family moment, guiding loved ones, or discovering something meaningful together",
    palette:
      "peach, butter yellow, soft blue, and warm evening light",
  },
  adventure: {
    setting:
      "a sweeping adventure landscape with layered scenery, glowing paths, cinematic depth, and storybook discovery around every corner",
    interaction:
      "moving forward through the adventure, discovering the next clue, or leading companions deeper into the scene",
    palette:
      "sunrise gold, sky blue, warm coral, and luminous teal",
  },
  behavioural: {
    setting:
      "a gentle emotional-learning world with comforting details, calm gardens, friendly companions, and soft magical atmosphere",
    interaction:
      "helping, listening, sharing, or showing kindness inside the exact page action",
    palette:
      "soft coral, mint, lavender, and warm cream light",
  },
  fairytale: {
    setting:
      "an enchanted fairytale world with glowing castles, flower meadows, pastel clouds, and magical depth",
    interaction:
      "meeting a magical friend, following a glowing trail, or discovering a joyful surprise",
    palette:
      "blush pink, lavender, soft teal, and golden light",
  },
  jungle: {
    setting:
      "a lush storybook jungle with giant leaves, waterfalls, sunbeams, and layered tropical depth",
    interaction:
      "walking beside animal friends, exploring a glowing path, or discovering something magical in the environment",
    palette:
      "emerald green, leafy lime, warm sunlight, and bright tropical accents",
  },
  dinosaur: {
    setting:
      "a bright prehistoric valley with giant ferns, playful dinosaurs, dramatic distance, and cheerful cinematic scale",
    interaction:
      "running beside dinosaurs, guiding them through the world, or reacting to a story discovery with movement",
    palette:
      "volcanic orange, jungle green, sky turquoise, and sunny yellow",
  },
  garage: {
    setting:
      "a warm indoor storybook garage with toy cars, wooden beams, glowing windows, cozy corners, and cinematic workshop depth",
    interaction:
      "welcoming vehicle friends, helping in the garage, or exploring storybook mechanical treasures",
    palette:
      "honey gold, warm amber, soft brown, and midnight blue highlights",
  },
  learning: {
    setting:
      "a bright learning world with giant letters, counting toys, friendly shapes, rainbow paths, and layered classroom-storybook wonder",
    interaction:
      "pointing, counting, discovering, or celebrating a proud learning moment as part of the page action",
    palette:
      "rainbow brights, sky blue, sunshine yellow, mint green, and candy pink",
  },
  pirate: {
    setting:
      "a cinematic treasure-island world with a storybook ship, sparkling ocean, treasure clues, and adventurous depth",
    interaction:
      "steering the ship, discovering treasure, or leading the adventure toward the next clue",
    palette:
      "ocean blue, sunset orange, treasure gold, and driftwood brown",
  },
  superhero: {
    setting:
      "a heroic city story world with layered rooftops, glowing sky energy, motion, and uplifting cinematic action",
    interaction:
      "landing heroically, helping someone, or soaring through the action of the story beat",
    palette:
      "hero red, electric blue, bright yellow, and silver highlights",
  },
  space: {
    setting:
      "a magical space world with glowing planets, cosmic clouds, twinkling stars, and sweeping cinematic depth",
    interaction:
      "floating through the story, waving to a friendly creature, or exploring a sparkling space path",
    palette:
      "indigo, cyan, comet gold, and nebula pink",
  },
  underwater: {
    setting:
      "a vibrant underwater kingdom with coral arches, bubbles, sea creatures, shimmering beams, and layered ocean depth",
    interaction:
      "swimming through the story action, guiding sea friends, or discovering a magical underwater detail",
    palette:
      "aqua, coral pink, seafoam green, and pearl light",
  },
  wizard: {
    setting:
      "an enchanted wizard world with glowing spell books, candlelit towers, magical dust, and cinematic fantasy depth",
    interaction:
      "casting a gentle spell, opening a magical discovery, or moving through a wonder-filled room",
    palette:
      "amethyst, midnight blue, candle gold, and silver sparkle",
  },
  customizable: {
    setting:
      "a premium children's storybook world tailored to the custom theme with complete cinematic environment depth",
    interaction:
      "interacting naturally with the world in a full scene instead of posing for a portrait",
    palette:
      "bright magical storybook colors with emotional lighting",
  },
};

const SAFE_WORD_REPLACEMENTS = [
  [/\bmoonlit\b/gi, "sunlit"],
  [/\bnighttime\b/gi, "early evening"],
  [/\bnight\b/gi, "storybook evening"],
  [/\bmisty\b/gi, "sparkly"],
  [/\bmist\b/gi, "sparkle"],
  [/\bfoggy\b/gi, "glowing"],
  [/\bcreepy\b/gi, "playful"],
  [/\bspooky\b/gi, "whimsical"],
  [/\bscary\b/gi, "gentle"],
  [/\bhaunted\b/gi, "enchanted"],
  [/\bhorror\b/gi, "storybook"],
  [/\bgloomy\b/gi, "heartwarming"],
];

const LOCATION_PATTERNS = [
  [/\bglass door(s)?\b/gi, "a big glass doorway"],
  [/\bgarage\b/gi, "a storybook garage"],
  [/\bforest\b/gi, "a magical forest path"],
  [/\bjungle\b/gi, "a glowing jungle clearing"],
  [/\bcave\b/gi, "a mysterious cave entrance"],
  [/\bwaterfall\b/gi, "a waterfall overlook"],
  [/\bcastle\b/gi, "an enchanted castle courtyard"],
  [/\bgarden\b/gi, "a blooming storybook garden"],
  [/\bclassroom\b/gi, "a playful learning space"],
  [/\bpark\b/gi, "a bright storybook park"],
  [/\bocean\b/gi, "a sparkling ocean scene"],
  [/\bship\b/gi, "the deck of a storybook ship"],
  [/\bbeach\b/gi, "a sunlit beach"],
  [/\bspace\b/gi, "a magical space scene"],
  [/\bhome\b/gi, "a cozy home setting"],
];

const OBJECT_PATTERNS = [
  [/\bglass door(s)?\b/gi, "giant glass doors"],
  [/\btruck(s)?\b/gi, "friendly trucks nearby"],
  [/\bcar(s)?\b/gi, "storybook cars"],
  [/\btoy car(s)?\b/gi, "playful toy cars"],
  [/\bowl\b/gi, "a wise owl"],
  [/\belephant\b/gi, "a friendly elephant"],
  [/\bdinosaur(s)?\b/gi, "friendly dinosaurs"],
  [/\bwaterfall\b/gi, "a sparkling waterfall"],
  [/\bcrystal(s)?\b/gi, "glowing crystals"],
  [/\btreasure\b/gi, "treasure details"],
  [/\bmap\b/gi, "a treasure map"],
  [/\bbook(s)?\b/gi, "magical books"],
  [/\brocket\b/gi, "a storybook rocket"],
  [/\bplanet(s)?\b/gi, "glowing planets"],
  [/\bstars?\b/gi, "twinkling stars"],
  [/\bflower(s)?\b/gi, "storybook flowers"],
  [/\bballoon(s)?\b/gi, "celebration balloons"],
  [/\bcake\b/gi, "a celebration cake"],
  [/\blantern(s)?\b/gi, "glowing lanterns"],
  [/\bbridge\b/gi, "a storybook bridge"],
  [/\bwindow(s)?\b/gi, "glowing windows"],
];

const ACTION_PATTERNS = [
  {
    regex: /\b(greet|greets|greeting|welcome|welcomes)\b/gi,
    action: "greeting the story world as the welcoming hero of the moment",
    pose: "raising one hand in a warm wave while leaning naturally into the scene",
  },
  {
    regex: /\bwave|waving\b/gi,
    action: "waving during the key story beat",
    pose: "one hand lifted in an expressive wave with lively body movement",
  },
  {
    regex: /\b(run|runs|running|race|racing)\b/gi,
    action: "moving quickly through the scene with clear momentum",
    pose: "mid-stride with energetic motion and a forward-moving body line",
  },
  {
    regex: /\b(jump|jumps|jumping|leap|leaps|leaping)\b/gi,
    action: "springing into the action of the page",
    pose: "captured mid-jump with expressive arms and legs",
  },
  {
    regex: /\b(point|points|pointing)\b/gi,
    action: "pointing toward the important story discovery",
    pose: "one arm extended toward the story object with a curious stance",
  },
  {
    regex: /\b(open|opens|opening)\b/gi,
    action: "opening or reaching toward the key story entrance",
    pose: "one hand reaching forward while the body turns into the scene",
  },
  {
    regex: /\b(walk|walks|walking|wander|wanders|wandering)\b/gi,
    action: "walking through the story world with purpose",
    pose: "a natural walking pose with one step forward and flowing motion",
  },
  {
    regex: /\b(help|helps|helping|share|shares|sharing)\b/gi,
    action: "helping inside the page action",
    pose: "leaning toward the other character or object with open, caring body language",
  },
  {
    regex: /\b(hug|hugs|hugging)\b/gi,
    action: "sharing a warm embrace that advances the emotional beat",
    pose: "arms wrapping naturally into the moment with close body connection",
  },
  {
    regex: /\b(read|reads|reading)\b/gi,
    action: "reading or discovering something important inside the scene",
    pose: "focused posture with hands engaged in the story object",
  },
  {
    regex: /\b(sail|sails|sailing|steer|steers|steering)\b/gi,
    action: "guiding the adventure forward",
    pose: "hands engaged with the vehicle or path while the body leans into motion",
  },
  {
    regex: /\b(fly|flies|flying|float|floats|floating)\b/gi,
    action: "moving through a magical sky or weightless world",
    pose: "open arms, lifted posture, and dynamic motion through space",
  },
  {
    regex: /\b(dance|dances|dancing|twirl|twirls|twirling)\b/gi,
    action: "celebrating through movement",
    pose: "a graceful twirl or dancing posture with flowing limbs",
  },
];

const EMOTION_PATTERNS = [
  [/\b(brave|courage|hero|heroic|determined)\b/gi, "brave and determined"],
  [/\b(cheer|cheerful|happy|joy|joyful|smile|smiling|laugh|laughing|adore)\b/gi, "cheerful and joyful"],
  [/\b(wonder|wondering|amaze|amazed|magical|sparkle|glow)\b/gi, "full of wonder"],
  [/\b(gentle|kind|help|helping|caring|love|loving)\b/gi, "gentle and caring"],
  [/\b(curious|discover|discovery|explore|exploring)\b/gi, "curious and engaged"],
  [/\b(proud|celebrate|celebration|victory|triumph)\b/gi, "proud and celebratory"],
];

const TIME_OF_DAY_PATTERNS = [
  [/\b(sunrise|dawn|morning)\b/gi, "sunrise morning"],
  [/\b(noon|midday|afternoon)\b/gi, "bright daytime"],
  [/\b(sunset|dusk|evening|golden hour)\b/gi, "golden sunset evening"],
  [/\b(star|stars|moon|night|bedtime|goodnight)\b/gi, "golden early evening"],
];

function cleanValue(value, maxLength = 280) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function sanitizeSource(value, maxLength = 360) {
  let sanitized = cleanValue(value, maxLength);

  for (const [pattern, replacement] of SAFE_WORD_REPLACEMENTS) {
    sanitized = sanitized.replace(pattern, replacement);
  }

  return sanitized;
}

function dedupe(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function collectMatches(source, patterns, limit = 4) {
  const matches = [];

  for (const [regex, label] of patterns) {
    if (regex.test(source)) {
      matches.push(label);
    }

    regex.lastIndex = 0;
  }

  return dedupe(matches).slice(0, limit);
}

function resolveSceneGuide(theme, customPrompt = null) {
  const themeKey = String(theme || "").trim().toLowerCase();

  if (themeKey === "customizable" && customPrompt) {
    return {
      setting: `a premium children's storybook world inspired by ${cleanValue(customPrompt, 120)}`,
      interaction:
        "interacting naturally with the world in a full story scene instead of posing for a portrait",
      palette: "bright magical storybook colors with emotional lighting",
    };
  }

  return THEME_SCENE_GUIDES[themeKey] || THEME_SCENE_GUIDES.adventure || DEFAULT_SCENE_GUIDE;
}

function findEmotion(source) {
  for (const [regex, emotion] of EMOTION_PATTERNS) {
    if (regex.test(source)) {
      regex.lastIndex = 0;
      return emotion;
    }

    regex.lastIndex = 0;
  }

  return "emotionally connected and story-aware";
}

function findTimeOfDay(source, sceneGuide) {
  for (const [regex, timeOfDay] of TIME_OF_DAY_PATTERNS) {
    if (regex.test(source)) {
      regex.lastIndex = 0;
      return timeOfDay;
    }

    regex.lastIndex = 0;
  }

  const sceneSetting = cleanValue(sceneGuide?.setting || "");

  if (/\bwindow glow|amber|moon\b/i.test(sceneSetting)) {
    return "golden early evening";
  }

  return "storybook daytime";
}

function findLighting(timeOfDay, sceneGuide) {
  const palette = cleanValue(sceneGuide?.palette || DEFAULT_SCENE_GUIDE.palette, 140);

  if (/sunrise/i.test(timeOfDay)) {
    return `soft sunrise light with warm highlights, volumetric glow, and ${palette}`;
  }

  if (/sunset|evening/i.test(timeOfDay)) {
    return `warm sunset or early-evening light with glowing highlights, painterly atmosphere, and ${palette}`;
  }

  return `bright cinematic daylight with painterly depth, emotional warmth, and ${palette}`;
}

function findActionAndPose(source, sceneGuide) {
  for (const pattern of ACTION_PATTERNS) {
    if (pattern.regex.test(source)) {
      pattern.regex.lastIndex = 0;
      return {
        action: pattern.action,
        characterPose: pattern.pose,
      };
    }

    pattern.regex.lastIndex = 0;
  }

  return {
    action:
      cleanValue(sceneGuide?.interaction || "", 180) ||
      "actively participating in the exact story beat",
    characterPose:
      "a natural full-body story pose with movement that matches the page action",
  };
}

function findLocation(source, sceneGuide) {
  const directMatch = collectMatches(source, LOCATION_PATTERNS, 1)[0];
  if (directMatch) {
    return directMatch;
  }

  const prepositionMatch = source.match(
    /\b(?:at|in|inside|into|through|near|beside|outside|under|over|across)\s+([a-z][^,.!?;:]{3,60})/i
  );

  if (prepositionMatch && prepositionMatch[1]) {
    return cleanValue(prepositionMatch[1], 80);
  }

  return cleanValue(sceneGuide?.setting || DEFAULT_SCENE_GUIDE.setting, 120);
}

function findObjects(source, sceneGuide) {
  const objects = collectMatches(
    `${source} ${cleanValue(sceneGuide?.setting || "", 180)}`,
    OBJECT_PATTERNS,
    6
  );

  return objects.length > 0
    ? objects
    : ["storytelling environment details that support the exact page action"];
}

function findCinematicMood(source, emotion) {
  if (/\bcelebrate|party|birthday|confetti|cake\b/i.test(source)) {
    return "joyful celebratory movie-frame energy";
  }

  if (/\bbrave|adventure|treasure|explore|journey\b/i.test(source)) {
    return "cinematic adventure with forward momentum";
  }

  if (/\bkind|gentle|family|love|hug\b/i.test(source)) {
    return "heartwarming emotional storytelling";
  }

  if (/wonder/i.test(emotion)) {
    return "immersive magical movie-frame wonder";
  }

  return "premium storybook cinema with emotional warmth";
}

function buildCompositionBrief(location, action, emotion) {
  return [
    `wide cinematic composition anchored in ${location}`,
    "clear foreground, midground, and background depth",
    `the child naturally integrated while ${action}`,
    `emotion reading as ${emotion}`,
    "leave clean space for printed story text without shrinking the world",
    "never a centered portrait or sticker-like character",
  ].join(", ");
}

function buildPageOutfitDirection(pageNumber) {
  const progression = {
    1: "a simple premium storybook outfit that introduces the hero clearly",
    2: "a cozy adventure-ready variation from the same wardrobe family",
    3: "a confident exploration outfit from the same wardrobe family",
    4: "a focused story-action outfit from the same wardrobe family",
    5: "a celebratory or empowered variation from the same wardrobe family",
    6: "a warm, emotionally rich variation from the same wardrobe family",
  };

  return progression[pageNumber] || "a consistent premium storybook outfit from the same wardrobe family";
}

function extractStorySceneDetails({
  pageTitle = "",
  pageContent = "",
  customPrompt = "",
  theme = "",
  sceneGuide = DEFAULT_SCENE_GUIDE,
}) {
  const analysisSource = sanitizeSource(
    [pageTitle, pageContent, customPrompt, theme, sceneGuide.setting, sceneGuide.interaction]
      .filter(Boolean)
      .join(". "),
    900
  );

  const emotion = findEmotion(analysisSource);
  const timeOfDay = findTimeOfDay(analysisSource, sceneGuide);
  const { action, characterPose } = findActionAndPose(analysisSource, sceneGuide);
  const location = findLocation(analysisSource, sceneGuide);
  const objects = findObjects(analysisSource, sceneGuide);

  return {
    pageMoment: cleanValue(pageTitle, 120) || "Story page",
    storyMoment: cleanValue(pageContent, 320) || "A premium children's storybook scene",
    environment: cleanValue(sceneGuide.setting || DEFAULT_SCENE_GUIDE.setting, 180),
    location,
    objects,
    emotion,
    timeOfDay,
    action,
    characterPose,
    cinematicMood: findCinematicMood(analysisSource, emotion),
    lightingStyle: findLighting(timeOfDay, sceneGuide),
    composition: buildCompositionBrief(location, action, emotion),
  };
}

function buildStorySceneBrief({
  childName = "",
  pageTitle = "",
  pageContent = "",
  customPrompt = "",
  childInterests = "",
  childNotes = "",
  sceneGuide = DEFAULT_SCENE_GUIDE,
  theme = "",
}) {
  const scene = extractStorySceneDetails({
    pageTitle,
    pageContent,
    customPrompt,
    theme,
    sceneGuide,
  });

  const interestDetail = cleanValue(childInterests, 120);
  const noteDetail = cleanValue(childNotes, 120);
  const customDetail = cleanValue(customPrompt, 140);

  return [
    `Movie-frame story scene for page "${scene.pageMoment}".`,
    childName ? `Hero child: ${childName}.` : "",
    `Exact story beat: ${scene.storyMoment}.`,
    `Environment: ${scene.environment}.`,
    `Location: ${scene.location}.`,
    `Story objects that must be visible: ${scene.objects.join(", ")}.`,
    `Action: ${scene.action}.`,
    `Character pose: ${scene.characterPose}.`,
    `Emotion: ${scene.emotion}.`,
    `Time of day: ${scene.timeOfDay}.`,
    `Lighting: ${scene.lightingStyle}.`,
    `Cinematic mood: ${scene.cinematicMood}.`,
    `Composition: ${scene.composition}.`,
    interestDetail
      ? `Optional visual touches inspired by the child's interests: ${interestDetail}.`
      : "",
    noteDetail ? `Character consistency notes: ${noteDetail}.` : "",
    customDetail ? `Custom world detail: ${customDetail}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildBackendStorybookPrompt({
  childName = "",
  childGender = "",
  pageNumber = 1,
  pageTitle = "",
  storyText = "",
  theme = "",
  customPrompt = "",
  childInterests = "",
  childNotes = "",
  ageHint = "",
}) {
  const sceneGuide = resolveSceneGuide(theme, customPrompt);
  const sceneBrief = buildStorySceneBrief({
    childName,
    pageTitle,
    pageContent: storyText,
    customPrompt,
    childInterests,
    childNotes,
    sceneGuide,
    theme,
  });
  const childDescriptor =
    String(childGender || "").toLowerCase() === "male"
      ? `a young child hero boy based on ${childName || "the child"}`
      : String(childGender || "").toLowerCase() === "female"
      ? `a young child hero girl based on ${childName || "the child"}`
      : `a young child hero based on ${childName || "the child"}`;
  const outfitDirection = buildPageOutfitDirection(Number(pageNumber) || 1);
  const ageDetail = cleanValue(ageHint, 120);

  return [
    "PRIMARY GOAL: create a story-driven illustration that feels like a movie frame from the page, not a portrait with a random background.",
    "STYLE: premium children's book illustration, Pixar/Disney-inspired warmth, soft painterly rendering, cinematic storytelling, warm emotional lighting, volumetric glow, depth of field, detailed environments, expressive eyes, realistic child proportions, and magical atmosphere.",
    "SCENE-FIRST: build the entire scene first so the environment, objects, action, and emotional atmosphere tell the story even without the text.",
    `HERO: show ${childDescriptor} naturally inside the scene.`,
    `OUTFIT: use ${outfitDirection}; redesign clothing for storybook use, with no readable text or logos.`,
    "COMPOSITION: use a dynamic angle, strong scene depth, and clean breathing room for printed story text. Avoid centered portrait-only framing, empty backgrounds, sticker look, flat cartoon style, passport pose, or face-dominant composition.",
    "CHARACTER CONSISTENCY: keep the same hairstyle, age appearance, skin tone, and general character identity across pages while changing pose, camera angle, body movement, and expression to match the exact page action.",
    "SCENE BLUEPRINT:",
    sceneBrief,
    ageDetail ? `READING TONE: ${ageDetail}.` : "",
    "NEGATIVE DIRECTION: avoid portrait only, plain background, random pose, generic AI child, empty background, centered character, low-detail environment, cheap cartoon style, photo avatar, or disconnected scenery.",
  ]
    .filter(Boolean)
    .join(" ");
}

module.exports = {
  buildBackendStorybookPrompt,
  buildStorySceneBrief,
  extractStorySceneDetails,
  resolveSceneGuide,
};
