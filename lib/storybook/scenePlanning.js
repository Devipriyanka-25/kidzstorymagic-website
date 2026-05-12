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
  [/\bvalley\b/gi, "a wide golden valley"],
  [/\briver\b/gi, "a sparkling river crossing"],
  [/\btrail\b/gi, "a hidden safari trail"],
  [/\bgrass\b/gi, "tall storybook grasslands"],
  [/\bplains?\b/gi, "sunlit safari plains"],
  [/\breef\b/gi, "a glowing coral reef"],
  [/\btreetop(s)?\b/gi, "a lively treetop canopy"],
  [/\boutback\b/gi, "a warm outback clearing"],
  [/\bsavanna\b/gi, "a glowing savanna path"],
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
  [/\beagle\b/gi, "a soaring eagle"],
  [/\bbird(s)?\b/gi, "chirping birds"],
  [/\belephant\b/gi, "a friendly elephant"],
  [/\bzebra\b/gi, "a baby zebra"],
  [/\btiger cub\b/gi, "a tiger cub"],
  [/\btiger\b/gi, "a tiger cub"],
  [/\bturtle\b/gi, "a sea turtle"],
  [/\bseaweed\b/gi, "floating seaweed"],
  [/\bkoala\b/gi, "a cuddly koala"],
  [/\bmonkey(s)?\b/gi, "playful monkeys"],
  [/\bkangaroo(s)?\b/gi, "bouncing kangaroos"],
  [/\bpenguin\b/gi, "a little penguin chick"],
  [/\bsloth\b/gi, "a smiling sloth"],
  [/\bdinosaur(s)?\b/gi, "friendly dinosaurs"],
  [/\bwaterfall\b/gi, "a sparkling waterfall"],
  [/\briver\b/gi, "a sparkling river"],
  [/\btrail\b/gi, "a winding safari trail"],
  [/\bvalley\b/gi, "a wide golden valley"],
  [/\bleaves?\b/gi, "rustling leaves"],
  [/\banimal(s)?\b/gi, "friendly animal companions"],
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
    regex: /\b(meet|meets|meeting)\b/gi,
    action: "meeting a new story friend inside the page action",
    pose: "leaning toward the new character with open, curious body language",
  },
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
    regex: /\b(cross|crosses|crossing)\b/gi,
    action: "crossing the story world with clear purpose and movement",
    pose: "stepping carefully through the environment with balanced, forward motion",
  },
  {
    regex: /\b(guide|guides|guiding|lead|leads|leading)\b/gi,
    action: "guiding another character safely through the scene",
    pose: "moving forward with one arm gently leading the way and the body turned into the action",
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
    regex: /\b(listen|listens|listening)\b/gi,
    action: "listening closely to the hidden details of the story world",
    pose: "pausing with an attentive posture, lifted chin, and ears turned toward the scene",
  },
  {
    regex: /\b(carry|carries|carrying|hold|holds|holding|scoop|scoops|scooping)\b/gi,
    action: "carefully carrying or cradling the important story character",
    pose: "arms wrapped naturally around the rescued friend with steady, caring movement",
  },
  {
    regex: /\b(rescue|rescues|rescuing|save|saves|saving)\b/gi,
    action: "rescuing a vulnerable friend in the middle of the story beat",
    pose: "leaning into the action with protective, decisive body language",
  },
  {
    regex: /\b(pull|pulls|pulling)\b/gi,
    action: "pulling the key story object free with visible effort",
    pose: "hands engaged in the action with the body leaning backward for momentum",
  },
  {
    regex: /\b(show|shows|showing|teach|teaches|teaching)\b/gi,
    action: "showing another character how the story action works",
    pose: "demonstrating with expressive hands and confident body movement",
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
  [/\b(brave|bravely|courage|hero|heroic|determined)\b/gi, "brave and determined"],
  [/\b(cheer|cheerful|happy|joy|joyful|smile|smiling|laugh|laughing|adore)\b/gi, "cheerful and joyful"],
  [/\b(wonder|wondering|amaze|amazed|magical|sparkle|glow)\b/gi, "full of wonder"],
  [/\b(gentle|kind|help|helping|caring|love|loving)\b/gi, "gentle and caring"],
  [/\b(curious|discover|discovery|explore|exploring|listen|listening|learn|learning)\b/gi, "curious and engaged"],
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

const LOW_VALUE_STORY_BEAT_PATTERNS = [
  /\bfavorite things\b/i,
  /\bspecial note\b/i,
  /\bsparkled through the adventure\b/i,
  /\bmade with .* in mind\b/i,
  /\bthis special story celebrates\b/i,
];

const RECOGNIZABLE_FACE_VIEW_CLAUSE =
  "with the child's face turned toward the viewer in a clear frontal or three-quarter view";

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

function splitIntoStorySentences(value) {
  return String(value || "")
    .split(/[\n\r]+|(?<=[.!?])\s+/)
    .map((sentence) => cleanValue(sentence, 220))
    .filter(Boolean);
}

function countPatternMatches(source, patterns) {
  let score = 0;

  for (const pattern of patterns) {
    const regex = Array.isArray(pattern) ? pattern[0] : pattern.regex;
    if (regex.test(source)) {
      score += 1;
    }
    regex.lastIndex = 0;
  }

  return score;
}

function enforceRecognizableFaceView(value) {
  const cleaned = cleanValue(value, 220);

  if (!cleaned) {
    return RECOGNIZABLE_FACE_VIEW_CLAUSE;
  }

  if (/frontal|three-quarter|face turned toward the viewer|face visible to the viewer/i.test(cleaned)) {
    return cleaned;
  }

  return `${cleaned} ${RECOGNIZABLE_FACE_VIEW_CLAUSE}`;
}

function scoreStoryBeatSentence(sentence) {
  const normalizedSentence = cleanValue(sentence, 220);
  if (!normalizedSentence) {
    return Number.NEGATIVE_INFINITY;
  }

  let score = 0;
  score += countPatternMatches(normalizedSentence, ACTION_PATTERNS) * 4;
  score += countPatternMatches(normalizedSentence, OBJECT_PATTERNS) * 3;
  score += countPatternMatches(normalizedSentence, LOCATION_PATTERNS) * 2;
  score += countPatternMatches(normalizedSentence, EMOTION_PATTERNS) * 1;

  if (normalizedSentence.length >= 32) {
    score += 1;
  }

  for (const pattern of LOW_VALUE_STORY_BEAT_PATTERNS) {
    if (pattern.test(normalizedSentence)) {
      score -= 5;
    }
  }

  return score;
}

function extractPrimaryStoryBeat(pageContent, pageTitle) {
  const candidateSentences = splitIntoStorySentences(pageContent);

  if (candidateSentences.length === 0) {
    return cleanValue(pageTitle, 160);
  }

  let bestSentence = candidateSentences[candidateSentences.length - 1];
  let bestScore = Number.NEGATIVE_INFINITY;

  candidateSentences.forEach((sentence, index) => {
    const sentenceScore = scoreStoryBeatSentence(sentence) + index * 0.01;
    if (sentenceScore >= bestScore) {
      bestSentence = sentence;
      bestScore = sentenceScore;
    }
  });

  return cleanValue(bestSentence, 220);
}

function findActionAndPose(source, sceneGuide) {
  for (const pattern of ACTION_PATTERNS) {
    if (pattern.regex.test(source)) {
      pattern.regex.lastIndex = 0;
      return {
        action: pattern.action,
        characterPose: enforceRecognizableFaceView(pattern.pose),
      };
    }

    pattern.regex.lastIndex = 0;
  }

  return {
    action:
      cleanInteraction(sceneGuide?.interaction || "") ||
      "actively participating in the exact story beat",
    characterPose: enforceRecognizableFaceView(
      "a natural full-body story pose with movement that matches the page action"
    ),
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
  const directObjects = collectMatches(source, OBJECT_PATTERNS, 6);

  if (directObjects.length > 0) {
    return directObjects;
  }

  const sceneSetting = cleanValue(sceneGuide?.setting || "");
  const objects = collectMatches(sceneSetting, OBJECT_PATTERNS, 6);

  if (objects.length > 0) {
    return objects;
  }

  return ["storytelling environment details that support the exact page action"];
}

function findShotType(source, action) {
  if (/\b(run|running|race|racing|jump|jumping|leap|leaping|fly|flying|float|floating|sail|sailing|steer|steering|cross|crossing|guide|guiding|rescue|rescues|rescued)\b/i.test(source)) {
    return "wide action shot with visible world depth and motion";
  }

  if (/\b(hug|hugging|read|reading|calm|rest|bedtime|goodnight)\b/i.test(source)) {
    return "intimate medium-wide emotional story shot";
  }

  if (/\b(greet|greeting|welcome|welcoming|wave|waving|open|opening|point|pointing|help|helping|dance|dancing)\b/i.test(source)) {
    return "medium-wide cinematic storytelling shot";
  }

  if (/moving quickly|springing|guiding|moving through/i.test(action)) {
    return "wide cinematic story shot with dynamic motion";
  }

  return "wide storybook establishing shot";
}

function findCameraAngle(source, emotion, shotType) {
  if (/action shot|dynamic motion/i.test(shotType)) {
    return "slightly low or child-height cinematic angle that amplifies motion";
  }

  if (/emotional story shot/i.test(shotType) || /gentle|calm/i.test(emotion)) {
    return "gentle child-height cinematic angle with warm intimacy";
  }

  return "natural child-height cinematic angle with storybook depth";
}

function buildForegroundDetails(objects, storyMoment) {
  const anchors = objects
    .filter((value) => !/storytelling environment details/i.test(value))
    .slice(0, 2);

  if (anchors.length === 0) {
    return `foreground storytelling details that lead into ${cleanValue(
      storyMoment,
      90
    )}`;
  }

  return `foreground anchors like ${anchors.join(" and ")}`;
}

function buildBackgroundDetails(location, objects, sceneGuide, storyMoment) {
  const objectDetails = objects
    .filter((value) => !/storytelling environment details/i.test(value))
    .slice(2, 4);
  const supportingDetail = dedupe([
    cleanValue(location, 80),
    ...objectDetails,
    cleanValue(sceneGuide?.setting || location, 100),
  ])
    .filter(Boolean)
    .slice(0, 4)
    .join(", ");

  return `background depth with supporting world details such as ${
    supportingDetail || cleanValue(storyMoment, 100)
  }`;
}

function buildCompositionBrief(
  location,
  action,
  emotion,
  shotType,
  cameraAngle,
  foregroundDetails,
  backgroundDetails
) {
  return [
    `${shotType} anchored in ${location}`,
    `${cameraAngle}`,
    `${foregroundDetails}, clear midground action, and ${backgroundDetails}`,
    `the child naturally integrated while ${action}`,
    "the child's face readable to the viewer in a frontal or three-quarter view rather than from behind",
    `emotion reading as ${emotion}`,
    "leave a clean text-safe band at the top or bottom without shrinking the world",
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
  const primaryStoryBeat = extractPrimaryStoryBeat(pageContent, pageTitle);
  const storyMoment = sanitizeSource(primaryStoryBeat || pageContent, 340);
  const pageSpecificSource = sanitizeSource(
    [
      pageTitle,
      primaryStoryBeat,
      customPrompt,
      milestonePromptHint,
    ]
      .filter(Boolean)
      .join(". "),
    520
  );
  const contextualSource = sanitizeSource(
    [
      pageSpecificSource,
      theme,
      originalTheme,
      sceneGuide?.setting,
    ]
      .filter(Boolean)
      .join(". "),
    820
  );

  const extractionSource = pageSpecificSource || contextualSource;
  const location = findLocation(extractionSource, sceneGuide);
  const objects = findObjects(extractionSource, sceneGuide);
  const { action, characterPose } = findActionAndPose(extractionSource, sceneGuide);
  const emotion = findEmotion(extractionSource);
  const timeOfDay = findTimeOfDay(extractionSource, sceneGuide);
  const lightingStyle = findLighting(timeOfDay, emotion, sceneGuide);
  const cinematicMood = findMood(extractionSource, emotion);
  const environment = cleanValue(
    `${location}. ${sceneGuide?.setting || DEFAULT_SCENE_GUIDE.setting}`,
    220
  );
  const shotType = findShotType(extractionSource, action);
  const cameraAngle = findCameraAngle(extractionSource, emotion, shotType);
  const foregroundDetails = buildForegroundDetails(objects, storyMoment);
  const backgroundDetails = buildBackgroundDetails(
    location,
    objects,
    sceneGuide,
    storyMoment
  );
  const composition = buildCompositionBrief(
    location,
    action,
    emotion,
    shotType,
    cameraAngle,
    foregroundDetails,
    backgroundDetails
  );

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
    shotType,
    cameraAngle,
    foregroundDetails,
    backgroundDetails,
    composition,
    primaryStoryBeat: storyMoment,
  };
}

/**
 * SCENE-FIRST PROMPT STRUCTURE (Imagitime-style)
 * 
 * This is the NEW scene-first version that prioritizes:
 * 1. Cinematic environment composition
 * 2. Story narrative visualization
 * 3. Natural child integration
 * 4. Premium illustration quality
 * 
 * NOT just a portrait with background.
 */
function buildSceneFirstEnvironment(scene, sceneGuide) {
  return [
    `CINEMATIC ENVIRONMENT:`,
    `${scene.location}.`,
    `Exact story beat to illustrate: ${scene.storyMoment}.`,
    `Storytelling objects that must read clearly in-frame: ${scene.objects.slice(0, 4).join(", ")}.`,
    `Foreground and background world design: ${scene.foregroundDetails}; ${scene.backgroundDetails}.`,
    `${scene.lightingStyle}`,
    `${scene.cinematicMood} energy`,
  ]
    .filter(Boolean)
    .join(" ");
}

function buildSceneFirstCharacterIntegration(childName, scene, childNotes, childInterests) {
  const heroLabel = cleanValue(childName, 40);
  const childDetail = cleanValue(childNotes, 140);
  const interestAccents = cleanValue(childInterests, 100);

  return [
    `CHARACTER (naturally integrated, NOT centered portrait):`,
    `${heroLabel} is the hero of this story moment.`,
    `The child must read clearly as the page hero inside the full illustration, never as a tiny background extra.`,
    `${scene.action}`,
    `${scene.characterPose}`,
    `Expression reading as ${scene.emotion}.`,
    `Show the child's face to the viewer in a clear frontal or three-quarter view, never mainly from behind.`,
    `Keep the child at natural story scale inside the world as one of the primary storytelling anchors, never oversized as a face-first composition.`,
    `Preserve the child's recognizable signature outfit or a very close illustrated version of it rather than inventing a totally new costume.`,
    childDetail ? `Physical consistency: ${childDetail}` : "",
    interestAccents ? `Scene can include subtle accents of: ${interestAccents}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildSceneFirstComposition(scene) {
  return [
    `COMPOSITION & FRAMING:`,
    scene.composition,
    `Shot design: ${scene.shotType}.`,
    `Camera angle: ${scene.cameraAngle}.`,
    `Treat as a professional storybook page (like Pixar/Disney children's books).`,
    `The illustration fills most of the page with visual storytelling.`,
    `The child hero should be clearly visible and emotionally readable within the full scene, not minimized into the background.`,
    `Let the environment, action, and character share the storytelling load so the page never collapses into a portrait.`,
    `Leave clean space at top/bottom for text, but DON'T shrink the world or turn the page into a portrait.`,
    `Avoid: portrait only, centered character, empty background, flat cartoon, oversized face, studio-looking setup.`,
    `Achieve: movie-frame feeling, cinematic depth, emotional immersion.`,
  ].join(" ");
}

function buildSceneFirstStyle() {
  return [
    `ILLUSTRATION STYLE:`,
    `Premium children's storybook art (Pixar/Disney inspired).`,
    `Soft, painterly rendering with realistic proportions.`,
    `Painterly magical-realism texture with warm golden light and premium printed-picture-book polish.`,
    `Clearly illustrated picture-book finish with stylized shapes and visible painterly treatment, never documentary realism or live-action photo texture.`,
    `Rich color palette with volumetric glow and depth of field.`,
    `Warm emotional lighting that tells the story visually.`,
    `Expressive details and fine craftsmanship.`,
    `Magical atmosphere that makes children dream.`,
  ].join(" ");
}

function buildSceneFirstStoryContext(pageTitle, pageContent, theme, isSeries, chapterNumber) {
  const safeTheme = cleanValue(theme, 40);
  const safeChapter = chapterNumber || 2;

  return [
    `PAGE CONTEXT:`,
    `Title: "${cleanValue(pageTitle, 60)}"`,
    `Story moment: "${cleanValue(pageContent, 100)}"`,
    isSeries ? `Chapter ${safeChapter} of a ${safeTheme} series.` : `${safeTheme} theme.`,
    `This exact scene should be visually obvious from the illustration alone.`,
  ]
    .filter(Boolean)
    .join(" ");
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

  const customDetail = cleanValue(customPrompt, 120);
  const milestoneDetail = cleanValue(milestonePromptHint, 100);
  const coverBadgeDetail = cleanValue(milestoneCoverBadge, 60);

  // BUILD SCENE-FIRST PROMPT (NOT character-first)
  const sceneFirstPrompt = [
    "=== SCENE-FIRST STORY ILLUSTRATION ===",
    "",
    buildSceneFirstEnvironment(scene, sceneGuide),
    "",
    buildSceneFirstCharacterIntegration(childName, scene, childNotes, childInterests),
    "",
    buildSceneFirstComposition(scene),
    "",
    buildSceneFirstStyle(),
    "",
    buildSceneFirstStoryContext(pageTitle, pageContent, theme, isSeries, chapterNumber),
    "",
    milestoneDetail ? `MILESTONE: ${milestoneDetail}` : "",
    coverBadgeDetail ? `TONE: ${coverBadgeDetail} energy` : "",
    customDetail ? `CUSTOM: ${customDetail}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return sceneFirstPrompt;

  // LEGACY FALLBACK (for backward compatibility if needed)
  // Uncomment the old approach below if you need to switch back temporarily
  /*
  const childNoteDetail = cleanValue(childNotes, 160);
  const interestsDetail = cleanValue(childInterests, 120);
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
  */
}
