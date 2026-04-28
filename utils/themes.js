function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isEmbeddableReferenceImage(value) {
  const normalized = String(value || "").trim();
  return /^(blob:|data:image\/|https?:\/\/)/i.test(normalized);
}

function toSvgDataUrl(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const ILLUSTRATION_THEMES = {
  fantasy: {
    value: "fantasy",
    label: "Fantasy",
    description: "Cloud castles, glowing skies, and magical sparkle.",
    primary: "#8B5CF6",
    secondary: "#E9D5FF",
    light: "#F5F3FF",
    dark: "#4C1D95",
    gradient:
      "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 48%, #C084FC 100%)",
    borderColor: "#8B5CF6",
    shadowColor: "rgba(139, 92, 246, 0.28)",
    accentColor: "#F59E0B",
  },
  jungle: {
    value: "jungle",
    label: "Jungle",
    description: "Safari greens, giant leaves, and warm animal adventure.",
    primary: "#2E7D32",
    secondary: "#BBF7D0",
    light: "#ECFDF5",
    dark: "#14532D",
    gradient:
      "linear-gradient(135deg, #1F9D55 0%, #166534 52%, #6EE7B7 100%)",
    borderColor: "#1F9D55",
    shadowColor: "rgba(31, 157, 85, 0.28)",
    accentColor: "#F59E0B",
  },
  dinosaur: {
    value: "dinosaur",
    label: "Dinosaur",
    description: "Playful prehistoric adventure with bold color and motion.",
    primary: "#F97316",
    secondary: "#FED7AA",
    light: "#FFF7ED",
    dark: "#9A3412",
    gradient:
      "linear-gradient(135deg, #F97316 0%, #EA580C 50%, #FDBA74 100%)",
    borderColor: "#F97316",
    shadowColor: "rgba(249, 115, 22, 0.28)",
    accentColor: "#16A34A",
  },
  garage: {
    value: "garage",
    label: "Garage",
    description: "Warm indoor workshop lighting with playful toy-car wonder.",
    primary: "#C2410C",
    secondary: "#FCD34D",
    light: "#FFF7ED",
    dark: "#7C2D12",
    gradient:
      "linear-gradient(135deg, #B45309 0%, #C2410C 48%, #F59E0B 100%)",
    borderColor: "#C2410C",
    shadowColor: "rgba(194, 65, 12, 0.28)",
    accentColor: "#FDE68A",
  },
  fairytale: {
    value: "fairytale",
    label: "Fairytale",
    description: "Soft dreamlight, clouds, unicorns, and magical glow.",
    primary: "#EC4899",
    secondary: "#FBCFE8",
    light: "#FDF2F8",
    dark: "#9D174D",
    gradient:
      "linear-gradient(135deg, #EC4899 0%, #C084FC 48%, #F9A8D4 100%)",
    borderColor: "#EC4899",
    shadowColor: "rgba(236, 72, 153, 0.28)",
    accentColor: "#F59E0B",
  },
  space: {
    value: "space",
    label: "Space",
    description: "Cosmic skies, glowing planets, and adventurous depth.",
    primary: "#1D4ED8",
    secondary: "#BFDBFE",
    light: "#EFF6FF",
    dark: "#1E3A8A",
    gradient:
      "linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 48%, #60A5FA 100%)",
    borderColor: "#1D4ED8",
    shadowColor: "rgba(29, 78, 216, 0.28)",
    accentColor: "#FBBF24",
  },
  underwater: {
    value: "underwater",
    label: "Underwater",
    description: "Coral worlds, bubbles, and shimmering sea light.",
    primary: "#0F766E",
    secondary: "#99F6E4",
    light: "#ECFEFF",
    dark: "#134E4A",
    gradient:
      "linear-gradient(135deg, #0F766E 0%, #155E75 48%, #67E8F9 100%)",
    borderColor: "#0F766E",
    shadowColor: "rgba(15, 118, 110, 0.28)",
    accentColor: "#F59E0B",
  },
  pirate: {
    value: "pirate",
    label: "Pirate",
    description: "Treasure maps, warm sunsets, and ocean adventure.",
    primary: "#374151",
    secondary: "#FDE68A",
    light: "#FFFBEB",
    dark: "#111827",
    gradient:
      "linear-gradient(135deg, #374151 0%, #111827 45%, #F59E0B 100%)",
    borderColor: "#374151",
    shadowColor: "rgba(17, 24, 39, 0.28)",
    accentColor: "#FBBF24",
  },
  superhero: {
    value: "superhero",
    label: "Superhero",
    description: "Heroic color, glowing skylines, and cinematic action.",
    primary: "#DC2626",
    secondary: "#FECACA",
    light: "#FEF2F2",
    dark: "#991B1B",
    gradient:
      "linear-gradient(135deg, #DC2626 0%, #991B1B 45%, #FBBF24 100%)",
    borderColor: "#DC2626",
    shadowColor: "rgba(220, 38, 38, 0.28)",
    accentColor: "#FBBF24",
  },
  wizard: {
    value: "wizard",
    label: "Wizard",
    description: "Spellbooks, moonlit towers, and enchanted light.",
    primary: "#7C3AED",
    secondary: "#DDD6FE",
    light: "#F5F3FF",
    dark: "#4C1D95",
    gradient:
      "linear-gradient(135deg, #7C3AED 0%, #5B21B6 48%, #A78BFA 100%)",
    borderColor: "#7C3AED",
    shadowColor: "rgba(124, 58, 237, 0.28)",
    accentColor: "#FBBF24",
  },
};

const BOOK_THEME_MAP = {
  "animal-adventure": {
    value: "animal-adventure",
    label: "Animal Adventure",
    ageRange: "Ages: 2 to 5",
    ageRangeShort: "2 to 5",
    description: "Safari skies, soaring birds, and a brave explorer hero.",
    storyTheme: "adventure",
    illustrationTheme: "jungle",
    titleTemplate: (childName) => `${childName}'s Animal Adventure`,
    cardGradient: "linear-gradient(180deg, #8FD3FF 0%, #FDE68A 100%)",
    anchorPoint: "M548 242 C510 272, 464 316, 422 366",
    sceneMarkup: `
      <circle cx="130" cy="110" r="88" fill="#fff7ed" fill-opacity="0.48" />
      <path d="M0 370 C140 284, 246 304, 360 380 S570 470, 640 424 L640 540 L0 540 Z" fill="#94A3B8" fill-opacity="0.45" />
      <path d="M0 406 C168 320, 280 336, 396 412 S560 482, 640 448 L640 540 L0 540 Z" fill="#64748B" fill-opacity="0.38" />
      <path d="M18 470 C162 398, 282 396, 434 468 S570 516, 640 478 L640 540 L18 540 Z" fill="#CA8A04" fill-opacity="0.44" />
      <path d="M118 172 C180 112, 232 104, 294 156 C252 156, 232 170, 202 206 C170 220, 148 210, 118 172 Z" fill="#5B4636" />
      <path d="M160 192 C214 140, 250 134, 286 170" fill="none" stroke="#5B4636" stroke-width="6" stroke-linecap="round" />
      <circle cx="278" cy="316" r="34" fill="#F8D3B0" />
      <rect x="246" y="348" width="70" height="114" rx="26" fill="#7C4A22" />
      <rect x="236" y="360" width="92" height="70" rx="30" fill="#A16207" fill-opacity="0.28" />
      <rect x="254" y="350" width="56" height="30" rx="14" fill="#C08457" />
      <path d="M234 382 L186 420" stroke="#7C4A22" stroke-width="18" stroke-linecap="round" />
      <path d="M320 382 L360 336" stroke="#7C4A22" stroke-width="18" stroke-linecap="round" />
      <path d="M262 458 L232 518" stroke="#7C4A22" stroke-width="20" stroke-linecap="round" />
      <path d="M302 458 L346 512" stroke="#7C4A22" stroke-width="20" stroke-linecap="round" />
      <path d="M160 260 C126 248, 108 234, 92 208 C118 212, 138 206, 164 184 C198 176, 234 192, 252 224 C224 218, 198 224, 160 260 Z" fill="#4B5563" fill-opacity="0.74" />
      <path d="M430 362 C452 334, 492 334, 516 362 C530 394, 516 424, 490 442 C464 446, 442 438, 420 414 C404 390, 408 374, 430 362 Z" fill="#6B7280" fill-opacity="0.54" />
    `,
  },
  "dino-quest": {
    value: "dino-quest",
    label: "Dino Quest",
    ageRange: "Ages: 3 to 6",
    ageRangeShort: "3 to 6",
    description: "Bright dinosaur adventures with playful motion and wonder.",
    storyTheme: "adventure",
    illustrationTheme: "dinosaur",
    titleTemplate: (childName) => `${childName}'s Dino Quest`,
    cardGradient: "linear-gradient(180deg, #5FD0FF 0%, #FDE68A 100%)",
    anchorPoint: "M536 244 C502 274, 468 316, 422 356",
    sceneMarkup: `
      <circle cx="540" cy="84" r="64" fill="#FFF7ED" fill-opacity="0.4" />
      <path d="M0 392 C140 326, 252 326, 388 392 S562 458, 640 430 L640 540 L0 540 Z" fill="#86EFAC" fill-opacity="0.5" />
      <path d="M0 432 C170 368, 304 374, 430 426 S566 482, 640 456 L640 540 L0 540 Z" fill="#4ADE80" fill-opacity="0.5" />
      <path d="M304 210 C364 168, 444 182, 484 232 C508 268, 510 298, 492 332 C474 360, 442 376, 404 378 C370 374, 350 360, 334 338 C298 342, 270 334, 244 316 C230 282, 244 250, 304 210 Z" fill="#EF4444" />
      <circle cx="432" cy="250" r="10" fill="#111827" />
      <path d="M392 304 C418 318, 444 324, 468 320" stroke="#111827" stroke-width="6" stroke-linecap="round" />
      <path d="M474 242 L544 194" stroke="#EF4444" stroke-width="18" stroke-linecap="round" />
      <path d="M488 292 L556 302" stroke="#EF4444" stroke-width="18" stroke-linecap="round" />
      <path d="M276 320 L224 384" stroke="#EF4444" stroke-width="18" stroke-linecap="round" />
      <path d="M344 350 L312 442" stroke="#EF4444" stroke-width="18" stroke-linecap="round" />
      <circle cx="250" cy="314" r="28" fill="#F8D3B0" />
      <rect x="222" y="342" width="62" height="98" rx="30" fill="#7C3AED" />
      <path d="M214 368 L168 342" stroke="#7C3AED" stroke-width="18" stroke-linecap="round" />
      <path d="M290 366 L322 318" stroke="#7C3AED" stroke-width="18" stroke-linecap="round" />
      <path d="M238 432 L214 500" stroke="#7C3AED" stroke-width="18" stroke-linecap="round" />
      <path d="M266 432 L304 494" stroke="#7C3AED" stroke-width="18" stroke-linecap="round" />
      <circle cx="120" cy="176" r="24" fill="#FBBF24" />
      <circle cx="178" cy="146" r="18" fill="#34D399" />
      <circle cx="520" cy="176" r="18" fill="#F472B6" />
    `,
  },
  "goodnight-garage": {
    value: "goodnight-garage",
    label: "Goodnight Garage",
    ageRange: "Ages: 2 to 6",
    ageRangeShort: "2 to 6",
    description: "Warm indoor glow, toy cars, and cozy workshop magic.",
    storyTheme: "adventure",
    illustrationTheme: "garage",
    titleTemplate: (childName) => `${childName}'s Goodnight Garage`,
    cardGradient: "linear-gradient(180deg, #5A3B27 0%, #EAB308 100%)",
    anchorPoint: "M532 248 C498 286, 464 330, 420 370",
    sceneMarkup: `
      <rect x="0" y="0" width="640" height="540" fill="#7C3F1D" fill-opacity="0.18" />
      <rect x="34" y="62" width="126" height="182" rx="18" fill="#8B5A2B" fill-opacity="0.28" />
      <path d="M200 56 L386 56 L520 188" stroke="#A16207" stroke-width="20" stroke-linecap="round" />
      <path d="M334 56 L500 206" stroke="#92400E" stroke-width="16" stroke-linecap="round" />
      <circle cx="362" cy="110" r="16" fill="#FDE68A" fill-opacity="0.9" />
      <circle cx="418" cy="126" r="22" fill="#FDE68A" fill-opacity="0.7" />
      <rect x="356" y="46" width="120" height="98" rx="18" fill="#12344D" fill-opacity="0.74" />
      <path d="M0 420 L640 420 L640 540 L0 540 Z" fill="#B45309" fill-opacity="0.58" />
      <rect x="396" y="308" width="132" height="108" rx="26" fill="#FBBF24" />
      <rect x="430" y="340" width="42" height="36" rx="10" fill="#FFF7ED" fill-opacity="0.65" />
      <circle cx="430" cy="420" r="24" fill="#7C2D12" />
      <circle cx="506" cy="420" r="24" fill="#7C2D12" />
      <circle cx="286" cy="326" r="28" fill="#F8D3B0" />
      <rect x="258" y="352" width="66" height="104" rx="24" fill="#5B4636" />
      <path d="M250 376 L222 426" stroke="#5B4636" stroke-width="18" stroke-linecap="round" />
      <path d="M330 374 L364 334" stroke="#5B4636" stroke-width="18" stroke-linecap="round" />
      <path d="M276 452 L256 518" stroke="#5B4636" stroke-width="18" stroke-linecap="round" />
      <path d="M304 452 L334 516" stroke="#5B4636" stroke-width="18" stroke-linecap="round" />
      <circle cx="90" cy="142" r="20" fill="#FB923C" fill-opacity="0.55" />
      <circle cx="132" cy="184" r="12" fill="#FB923C" fill-opacity="0.55" />
    `,
  },
  "unicorn-magic": {
    value: "unicorn-magic",
    label: "Unicorn Magic",
    ageRange: "Ages: 2 to 6",
    ageRangeShort: "2 to 6",
    description: "Cloud kingdoms, rainbow light, and dreamlike unicorn wonder.",
    storyTheme: "fantasy",
    illustrationTheme: "fairytale",
    titleTemplate: (childName) => `${childName}'s Unicorn Magic`,
    cardGradient: "linear-gradient(180deg, #7C3AED 0%, #F9A8D4 100%)",
    anchorPoint: "M534 242 C500 274, 464 314, 422 356",
    sceneMarkup: `
      <circle cx="470" cy="84" r="62" fill="#FFF7ED" fill-opacity="0.38" />
      <path d="M78 162 C120 118, 186 120, 228 162 C242 196, 226 216, 198 220 L110 220 C82 214, 62 194, 78 162 Z" fill="#FFFFFF" fill-opacity="0.68" />
      <path d="M390 112 C436 72, 502 74, 556 122 C572 156, 558 176, 524 180 L426 180 C396 176, 374 148, 390 112 Z" fill="#FFFFFF" fill-opacity="0.52" />
      <path d="M0 378 C120 300, 238 310, 366 382 S552 450, 640 420 L640 540 L0 540 Z" fill="#F9A8D4" fill-opacity="0.34" />
      <path d="M0 414 C140 350, 286 360, 428 418 S564 476, 640 446 L640 540 L0 540 Z" fill="#DDD6FE" fill-opacity="0.48" />
      <path d="M168 258 C214 214, 280 214, 324 260 C366 302, 364 364, 328 394 C286 418, 220 414, 188 384 C152 350, 138 308, 168 258 Z" fill="#FFFFFF" fill-opacity="0.92" />
      <path d="M264 244 L290 196" stroke="#FDE68A" stroke-width="12" stroke-linecap="round" />
      <path d="M314 318 C356 298, 392 300, 426 322" stroke="#C084FC" stroke-width="10" stroke-linecap="round" />
      <circle cx="224" cy="296" r="8" fill="#111827" />
      <circle cx="278" cy="296" r="8" fill="#111827" />
      <circle cx="470" cy="300" r="28" fill="#F8D3B0" />
      <path d="M444 330 C454 300, 486 300, 496 330 L516 430 C480 454, 448 454, 424 424 Z" fill="#FFFFFF" />
      <path d="M452 430 L432 508" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" />
      <path d="M490 430 L520 506" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" />
      <path d="M446 352 L414 392" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" />
      <path d="M498 352 L538 334" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" />
      <path d="M388 226 C422 206, 452 208, 482 228 C448 240, 420 248, 388 226 Z" stroke="#F472B6" stroke-width="8" fill="none" stroke-linecap="round" />
    `,
  },
  customizable: {
    value: "customizable",
    label: "Custom Magic",
    ageRange: "Ages: 2 to 8",
    ageRangeShort: "2 to 8",
    description: "Design your own world with a custom scene direction.",
    storyTheme: "adventure",
    illustrationTheme: "fantasy",
    titleTemplate: (childName) => `${childName}'s Custom Magic`,
    cardGradient: "linear-gradient(180deg, #312E81 0%, #F472B6 100%)",
    anchorPoint: "M528 242 C494 276, 460 320, 416 360",
    sceneMarkup: `
      <circle cx="136" cy="98" r="84" fill="#FFFFFF" fill-opacity="0.18" />
      <circle cx="520" cy="96" r="68" fill="#FDE68A" fill-opacity="0.24" />
      <path d="M0 390 C136 308, 274 322, 404 392 S558 456, 640 430 L640 540 L0 540 Z" fill="#C084FC" fill-opacity="0.44" />
      <path d="M0 428 C150 358, 286 368, 436 430 S566 484, 640 456 L640 540 L0 540 Z" fill="#EC4899" fill-opacity="0.34" />
      <circle cx="316" cy="304" r="32" fill="#F8D3B0" />
      <rect x="286" y="336" width="72" height="114" rx="26" fill="#312E81" />
      <path d="M278 364 L232 408" stroke="#312E81" stroke-width="18" stroke-linecap="round" />
      <path d="M366 366 L412 336" stroke="#312E81" stroke-width="18" stroke-linecap="round" />
      <path d="M300 446 L274 514" stroke="#312E81" stroke-width="18" stroke-linecap="round" />
      <path d="M344 446 L382 512" stroke="#312E81" stroke-width="18" stroke-linecap="round" />
      <path d="M214 214 L230 174 L246 214 L286 226 L246 238 L230 278 L214 238 L172 226 Z" fill="#FDE68A" />
      <path d="M444 230 L456 198 L468 230 L500 240 L468 252 L456 284 L444 252 L412 240 Z" fill="#FDE68A" />
      <circle cx="134" cy="214" r="18" fill="#67E8F9" fill-opacity="0.66" />
    `,
  },
};

function buildReferenceBadge(referenceImage) {
  if (isEmbeddableReferenceImage(referenceImage)) {
    return `
      <circle cx="542" cy="88" r="42" fill="#ffffff" fill-opacity="0.96" />
      <circle cx="542" cy="88" r="45" fill="none" stroke="#ffffff" stroke-width="6" />
      <clipPath id="badgeClip">
        <circle cx="542" cy="88" r="39" />
      </clipPath>
      <image href="${escapeXml(referenceImage)}" x="503" y="49" width="78" height="78" preserveAspectRatio="xMidYMid slice" clip-path="url(#badgeClip)" />
    `;
  }

  return "";
}

function buildBookThemeSvg(theme, referenceImage) {
  const hasReferenceBadge = isEmbeddableReferenceImage(referenceImage);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 540" role="img" aria-label="${escapeXml(
      theme.label
    )}">
      <defs>
        <linearGradient id="bg" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${theme.cardGradient
            .match(/#([A-Fa-f0-9]{6})/g)?.[0] || "#60A5FA"}" />
          <stop offset="100%" stop-color="${theme.cardGradient
            .match(/#([A-Fa-f0-9]{6})/g)?.[1] || "#FDE68A"}" />
        </linearGradient>
      </defs>
      <rect width="640" height="540" fill="url(#bg)" />
      ${theme.sceneMarkup}
      ${buildReferenceBadge(referenceImage)}
      ${
        hasReferenceBadge
          ? `
      <path d="${theme.anchorPoint}" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" />
      <path d="M422 366 L438 356" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" />
      <path d="M422 366 L436 382" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" />`
          : ""
      }
    </svg>
  `;
}

export const STORY_THEMES = Object.values(BOOK_THEME_MAP);

const LEGACY_BOOK_THEME_ALIASES = {
  family: "goodnight-garage",
  friends: "animal-adventure",
  motivational: "dino-quest",
  behavioural: "goodnight-garage",
  fairytale: "unicorn-magic",
  fantasy: "unicorn-magic",
  adventure: "animal-adventure",
};

export function getBookTheme(themeValue) {
  const normalizedTheme = BOOK_THEME_MAP[themeValue]
    ? themeValue
    : LEGACY_BOOK_THEME_ALIASES[themeValue];

  return BOOK_THEME_MAP[normalizedTheme] || BOOK_THEME_MAP["animal-adventure"];
}

export function getBookThemeLabel(themeValue) {
  return getBookTheme(themeValue).label;
}

export function getBookThemeAgeRange(themeValue) {
  return getBookTheme(themeValue).ageRange;
}

export function getBookThemePreviewArt(themeValue, referenceImage = "") {
  return toSvgDataUrl(buildBookThemeSvg(getBookTheme(themeValue), referenceImage));
}

export function formatThemeLabel(themeValue) {
  return getBookTheme(themeValue).label;
}

export function getTheme(themeValue) {
  const bookTheme = BOOK_THEME_MAP[themeValue];
  const lookupKey = bookTheme?.illustrationTheme || themeValue;
  return ILLUSTRATION_THEMES[lookupKey] || ILLUSTRATION_THEMES.fantasy;
}

export function getAllThemes() {
  return Object.values(ILLUSTRATION_THEMES);
}

export const getThemeStyles = (theme) => ({
  container: {
    background: theme.light,
    borderColor: `${theme.borderColor}40`,
  },
  button: {
    background: theme.gradient,
    boxShadow: `0 8px 20px ${theme.shadowColor}`,
  },
  card: {
    borderColor: theme.borderColor,
    backgroundColor: `${theme.light}CC`,
  },
  text: {
    color: theme.primary,
  },
  accent: {
    color: theme.accentColor,
  },
});
