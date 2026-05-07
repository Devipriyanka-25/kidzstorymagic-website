const DEFAULT_SCENE_GUIDE = {
  setting:
    "a premium children's storybook world with layered foreground, midground, and background detail",
  interaction:
    "moving naturally through the story world and actively participating in the page action",
  palette:
    "warm magical storybook colors with emotional lighting",
};

const SAFE_WORD_REPLACEMENTS = [
  [/\bmoonlit\b/gi, "sunlit"],
  [/\bnighttime\b/gi, "early evening"],
  [/\bnight\b/gi, "storybook evening"],
  [/\bmisty\b/gi, "sparkly"],
  [/\bmist\b/gi, "sparkle"],
  [/\bfoggy\b/gi, "glowing"],
  [/\bfog\b/gi, "glow"],
  [/\beerie\b/gi, "magical"],
  [/\bcreepy\b/gi, "playful"],
  [/\bspooky\b/gi, "whimsical"],
  [/\bscary\b/gi, "gentle"],
  [/\bhaunted\b/gi, "enchanted"],
  [/\bhorror\b/gi, "storybook"],
  [/\bgloomy\b/gi, "heartwarming"],
  [/\bshadowy\b/gi, "glowing"],
];

const LOCATION_PATTERNS = [
  [/\bglass door(s)?\b/gi, "a big glass doorway at the story entrance"],
  [/\bgarage\b/gi, "a storybook garage entrance"],
  [/\bdoorway\b/gi, "a welcoming doorway"],
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
  [/\bmoon\b/gi, "an open sky view"],
  [/\bstars?\b/gi, "an open evening sky"],
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
  [/\bmoon\b/gi, "a glowing moon"],
  [/\bstars?\b/gi, "twinkling stars"],
  [/\brainbow\b/gi, "rainbow light"],
  [/\bcastle\b/gi, "a glowing castle"],
  [/\bflower(s)?\b/gi, "storybook flowers"],
  [/\bballoon(s)?\b/gi, "celebration balloons"],
  [/\bcake\b/gi, "a celebration cake"],
  [/\bconfetti\b/gi, "confetti"],
  [/\blantern(s)?\b/gi, "glowing lanterns"],
  [/\bbridge\b/gi, "a storybook bridge"],
  [/\bwindow(s)?\b/gi, "glowing windows"],
  [/\bcloud(s)?\b/gi, "soft storybook clouds"],
];

const ACTION_PATTERNS = [
  {
    regex: /\b(greet|greets|greeting|welcome|welcomes)\b/gi,
    action: "greeting the world of the story as the welcoming hero of the moment",
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
    pose: "seated or standing with focused posture and hands engaged with the object",
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
  [/\b(calm|peaceful|quiet|rest)\b/gi, "calm and comforted"],
];

const TIME_OF_DAY_PATTERNS = [
  [/\b(sunrise|dawn|morning)\b/gi, "sunrise morning"],
  [/\b(noon|midday|afternoon)\b/gi, "bright daytime"],
  [/\b(sunset|dusk|evening|golden hour)\b/gi, "golden sunset evening"],
  [/\b(star|stars|moon|night|bedtime|goodnight)\b/gi, "golden early evening"],
];

const MOOD_PATTERNS = [
  [/\b(celebrate|party|birthday|confetti|cake)\b/gi, "joyful celebratory movie-frame energy"],
  [/\b(brave|adventure|treasure|explore|journey)\b/gi, "cinematic adventure with forward momentum"],
  [/\b(kind|gentle|family|love|hug)\b/gi, "heartwarming emotional storytelling"],
  [/\b(magic|magical|sparkle|glow|enchanted)\b/gi, "immersive magical wonder"],
  [/\b(learn|school|alphabet|count)\b/gi, "playful discovery and learning wonder"],
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

  if (/\bmoon|goodnight|window glow|amber light\b/i.test(sceneSetting)) {
    return "golden early evening";
  }

  if (/\bsunrise\b/i.test(sceneSetting)) {
    return "sunrise morning";
  }

  return "storybook daytime";
}

function findLighting(timeOfDay, emotion, sceneGuide) {
  const palette = cleanValue(sceneGuide?.palette || DEFAULT_SCENE_GUIDE.palette, 140);

  if (/sunrise/i.test(timeOfDay)) {
    return `soft sunrise light with warm highlights, volumetric glow, and ${palette}`;
  }

  if (/sunset|evening/i.test(timeOfDay)) {
    return `warm sunset light spilling through the environment, cozy amber highlights, and ${palette}`;
  }

  return `bright cinematic daylight with painterly depth, gentle atmosphere, and ${palette}`;
}

function cleanInteraction(value) {
  return cleanValue(value, 200)
    .replace(/\bwith visible face\b/gi, "")
    .replace(/\bwith clear face visible\b/gi, "")
    .replace(/\bclear facial expression\b/gi, "expressive body language")
    .replace(/\bclear identity showing\b/gi, "natural movement")
    .replace(/\bface prominently framed\b/gi, "naturally integrated into the scene")
    .replace(/\bprominently positioned\b/gi, "naturally positioned")
    .replace(/\bmain identifiable character\b/gi, "main character")
    .replace(/\beasily identifiable\b/gi, "recognizable")
    .replace(/\beasily recognizable\b/gi, "recognizable")
    .replace(/\s{2,}/g, " ")
    .trim();
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
      cleanInteraction(sceneGuide?.interaction || "") ||
      "actively participating in the exact story beat",
    characterPose:
      "a natural full-body story pose with movement that matches the page action",
  };
}

function findMood(source, emotion) {
  for (const [regex, mood] of MOOD_PATTERNS) {
    if (regex.test(source)) {
      regex.lastIndex = 0;
      return mood;
    }

    regex.lastIndex = 0;
  }

  if (/cheerful|joyful/i.test(emotion)) {
    return "warm, welcoming cinematic storytelling";
  }

  if (/brave/i.test(emotion)) {
    return "uplifting adventure cinema for children";
  }

  if (/wonder/i.test(emotion)) {
    return "immersive magical movie-frame wonder";
  }

  return "premium storybook cinema with emotional warmth";
}

function findLocation(source, sceneGuide) {
  const directMatch = collectMatches(source, LOCATION_PATTERNS, 1)[0];
  if (directMatch) {
    return directMatch;
  }

  const prepositionMatch = source.match(
    /\b(?:at|in|inside|into|through|near|beside|outside|under|over|across)\s+([a-z][^,.!?;:]{3,60})/i
  );

  if (prepositionMatch?.[1]) {
    return cleanValue(prepositionMatch[1], 80);
  }

  return cleanValue(sceneGuide?.setting || DEFAULT_SCENE_GUIDE.setting, 120);
}

function findObjects(source, sceneGuide) {
  const sceneSetting = cleanValue(sceneGuide?.setting || "");
  const objects = collectMatches(`${source} ${sceneSetting}`, OBJECT_PATTERNS, 6);

  if (objects.length > 0) {
    return objects;
  }

  return ["storytelling environment details that support the exact page action"];
}

function buildCompositionBrief(location, action, emotion) {
  return [
    `wide cinematic composition anchored in ${location}`,
    "clear foreground, midground, and background depth",
    `the child naturally integrated while ${action}`,
    `emotion reading as ${emotion}`,
    "leave clean breathing room for printed story text without shrinking the world",
    "never a centered portrait or sticker-like character",
  ].join(", ");
}

export function extractStorySceneDetails({
  pageTitle = "",
  pageContent = "",
  customPrompt = "",
  milestonePromptHint = "",
  theme = "",
  originalTheme = "",
  sceneGuide = DEFAULT_SCENE_GUIDE,
}) {
  const safePageTitle = sanitizeSource(pageTitle, 120);
  const storyMoment = sanitizeSource(pageContent, 340);
  const analysisSource = sanitizeSource(
    [
      pageTitle,
      pageContent,
      customPrompt,
      milestonePromptHint,
      theme,
      originalTheme,
      sceneGuide?.setting,
      sceneGuide?.interaction,
    ]
      .filter(Boolean)
      .join(". "),
    900
  );

  const location = findLocation(analysisSource, sceneGuide);
  const objects = findObjects(analysisSource, sceneGuide);
  const { action, characterPose } = findActionAndPose(analysisSource, sceneGuide);
  const emotion = findEmotion(analysisSource);
  const timeOfDay = findTimeOfDay(analysisSource, sceneGuide);
  const lightingStyle = findLighting(timeOfDay, emotion, sceneGuide);
  const cinematicMood = findMood(analysisSource, emotion);
  const environment = cleanValue(sceneGuide?.setting || DEFAULT_SCENE_GUIDE.setting, 180);
  const composition = buildCompositionBrief(location, action, emotion);

  return {
    pageMoment: safePageTitle || "Story page",
    storyMoment: storyMoment || "A premium storybook scene",
    environment,
    location,
    objects,
    emotion,
    timeOfDay,
    action,
    characterPose,
    cinematicMood,
    lightingStyle,
    composition,
  };
}

export function buildStorySceneBrief({
  childName = "",
  childInterests = "",
  childNotes = "",
  ageHint = "",
  pageTitle = "",
  pageContent = "",
  customPrompt = "",
  milestonePromptHint = "",
  milestoneCoverBadge = "",
  isSeries = false,
  chapterNumber = null,
  originalTheme = "",
  theme = "",
  sceneGuide = DEFAULT_SCENE_GUIDE,
}) {
  const scene = extractStorySceneDetails({
    pageTitle,
    pageContent,
    customPrompt,
    milestonePromptHint,
    theme,
    originalTheme,
    sceneGuide,
  });

  const childNoteDetail = cleanValue(childNotes, 160);
  const interestsDetail = cleanValue(childInterests, 120);
  const customDetail = cleanValue(customPrompt, 160);
  const milestoneDetail = cleanValue(milestonePromptHint, 140);
  const coverBadgeDetail = cleanValue(milestoneCoverBadge, 80);
  const ageDetail = cleanValue(ageHint, 120);
  const heroLabel = cleanValue(childName, 60);

  return [
    `Movie-frame story scene for page "${scene.pageMoment}".`,
    heroLabel ? `Hero child: ${heroLabel}.` : "",
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
    ageDetail ? `Reading-age tone: ${ageDetail}.` : "",
    milestoneDetail
      ? `Milestone emphasis: naturally weave in ${milestoneDetail}.`
      : "",
    coverBadgeDetail
      ? `Optional hero-page badge feeling: subtle keepsake energy inspired by "${coverBadgeDetail}".`
      : "",
    customDetail ? `Custom world detail: ${customDetail}.` : "",
    interestsDetail
      ? `Optional scene accents inspired by the child's interests: ${interestsDetail}.`
      : "",
    childNoteDetail
      ? `Character consistency notes: ${childNoteDetail}.`
      : "",
    isSeries
      ? `Series continuity: chapter ${chapterNumber || 2} of an ongoing ${cleanValue(
          originalTheme || theme,
          60
        )} adventure; keep the same hero identity while making the scene feel fresh.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}
