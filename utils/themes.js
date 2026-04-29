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
  learning: {
    value: "learning",
    label: "Learning",
    description:
      "Rainbow classroom color, playful shapes, and bright early-learning energy.",
    primary: "#2563EB",
    secondary: "#BFDBFE",
    light: "#F0F9FF",
    dark: "#1E3A8A",
    gradient:
      "linear-gradient(135deg, #38BDF8 0%, #2563EB 35%, #F59E0B 68%, #F472B6 100%)",
    borderColor: "#2563EB",
    shadowColor: "rgba(37, 99, 235, 0.26)",
    accentColor: "#F59E0B",
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
  celebration: {
    value: "celebration",
    label: "Celebration",
    description: "Golden party light, elegant joy, and welcoming event energy.",
    primary: "#DB2777",
    secondary: "#FBCFE8",
    light: "#FFF1F7",
    dark: "#831843",
    gradient:
      "linear-gradient(135deg, #F472B6 0%, #DB2777 48%, #F59E0B 100%)",
    borderColor: "#DB2777",
    shadowColor: "rgba(219, 39, 119, 0.26)",
    accentColor: "#F59E0B",
  },
  birthday: {
    value: "birthday",
    label: "Birthday",
    description: "Confetti color, candles, and spotlight celebration magic.",
    primary: "#EA580C",
    secondary: "#FED7AA",
    light: "#FFF7ED",
    dark: "#9A3412",
    gradient:
      "linear-gradient(135deg, #F97316 0%, #EA580C 48%, #FACC15 100%)",
    borderColor: "#EA580C",
    shadowColor: "rgba(234, 88, 12, 0.26)",
    accentColor: "#EC4899",
  },
  gala: {
    value: "gala",
    label: "Gala",
    description: "Elegant lights, floral warmth, and polished keepsake glamour.",
    primary: "#7C2D12",
    secondary: "#FDE68A",
    light: "#FFF8E7",
    dark: "#4A1D0F",
    gradient:
      "linear-gradient(135deg, #7C2D12 0%, #B45309 52%, #FDE68A 100%)",
    borderColor: "#7C2D12",
    shadowColor: "rgba(124, 45, 18, 0.26)",
    accentColor: "#FBBF24",
  },
  tribute: {
    value: "tribute",
    label: "Tribute",
    description: "Heartfelt spotlight, rich color, and premium gift-book warmth.",
    primary: "#9F1239",
    secondary: "#FBCFE8",
    light: "#FFF1F2",
    dark: "#500724",
    gradient:
      "linear-gradient(135deg, #BE123C 0%, #9F1239 45%, #F59E0B 100%)",
    borderColor: "#9F1239",
    shadowColor: "rgba(159, 18, 57, 0.26)",
    accentColor: "#F59E0B",
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
  "alphabet-parade": {
    value: "alphabet-parade",
    label: "Alphabet Parade",
    ageRange: "Ages: 0 to 3",
    ageRangeShort: "0 to 3",
    description: "Cheerful letter friends, bright blocks, and a joyful ABC world.",
    storyTheme: "learning",
    illustrationTheme: "learning",
    titleTemplate: (childName) => `${childName}'s Alphabet Parade`,
    cardGradient: "linear-gradient(180deg, #7DD3FC 0%, #FDE68A 100%)",
    anchorPoint: "M528 244 C492 274, 454 316, 414 360",
    sceneMarkup: `
      <circle cx="502" cy="86" r="64" fill="#FFF7ED" fill-opacity="0.44" />
      <path d="M0 392 C128 314, 248 320, 388 394 S556 456, 640 428 L640 540 L0 540 Z" fill="#BFDBFE" fill-opacity="0.48" />
      <path d="M0 430 C148 360, 294 366, 444 432 S570 486, 640 456 L640 540 L0 540 Z" fill="#FDE68A" fill-opacity="0.44" />
      <rect x="84" y="250" width="96" height="96" rx="24" fill="#F472B6" />
      <rect x="198" y="220" width="96" height="96" rx="24" fill="#38BDF8" />
      <rect x="312" y="252" width="96" height="96" rx="24" fill="#34D399" />
      <text x="132" y="312" text-anchor="middle" font-size="54" font-weight="700" fill="#ffffff">A</text>
      <text x="246" y="282" text-anchor="middle" font-size="54" font-weight="700" fill="#ffffff">B</text>
      <text x="360" y="314" text-anchor="middle" font-size="54" font-weight="700" fill="#ffffff">C</text>
      <circle cx="474" cy="306" r="28" fill="#F8D3B0" />
      <rect x="446" y="336" width="64" height="108" rx="24" fill="#2563EB" />
      <path d="M438 360 L396 324" stroke="#2563EB" stroke-width="18" stroke-linecap="round" />
      <path d="M516 360 L552 326" stroke="#2563EB" stroke-width="18" stroke-linecap="round" />
      <path d="M462 442 L438 510" stroke="#2563EB" stroke-width="18" stroke-linecap="round" />
      <path d="M494 442 L526 508" stroke="#2563EB" stroke-width="18" stroke-linecap="round" />
    `,
  },
  "number-train": {
    value: "number-train",
    label: "Number Train",
    ageRange: "Ages: 0 to 3",
    ageRangeShort: "0 to 3",
    description: "Count along with a happy little train through a colorful world.",
    storyTheme: "learning",
    illustrationTheme: "learning",
    titleTemplate: (childName) => `${childName}'s Number Train`,
    cardGradient: "linear-gradient(180deg, #86EFAC 0%, #93C5FD 100%)",
    anchorPoint: "M530 246 C496 278, 458 320, 420 362",
    sceneMarkup: `
      <circle cx="126" cy="90" r="72" fill="#FFF7ED" fill-opacity="0.34" />
      <path d="M0 398 C134 326, 274 334, 410 400 S558 456, 640 430 L640 540 L0 540 Z" fill="#DBEAFE" fill-opacity="0.42" />
      <path d="M0 434 C154 366, 304 372, 446 434 S572 486, 640 458 L640 540 L0 540 Z" fill="#BBF7D0" fill-opacity="0.44" />
      <rect x="102" y="294" width="110" height="58" rx="18" fill="#F97316" />
      <rect x="220" y="294" width="110" height="58" rx="18" fill="#38BDF8" />
      <rect x="338" y="294" width="110" height="58" rx="18" fill="#A78BFA" />
      <circle cx="138" cy="360" r="18" fill="#374151" />
      <circle cx="188" cy="360" r="18" fill="#374151" />
      <circle cx="256" cy="360" r="18" fill="#374151" />
      <circle cx="306" cy="360" r="18" fill="#374151" />
      <circle cx="374" cy="360" r="18" fill="#374151" />
      <circle cx="424" cy="360" r="18" fill="#374151" />
      <text x="157" y="333" text-anchor="middle" font-size="34" font-weight="700" fill="#ffffff">1</text>
      <text x="275" y="333" text-anchor="middle" font-size="34" font-weight="700" fill="#ffffff">2</text>
      <text x="393" y="333" text-anchor="middle" font-size="34" font-weight="700" fill="#ffffff">3</text>
      <circle cx="518" cy="292" r="26" fill="#F8D3B0" />
      <rect x="492" y="320" width="58" height="98" rx="22" fill="#16A34A" />
      <path d="M486 344 L446 328" stroke="#16A34A" stroke-width="16" stroke-linecap="round" />
      <path d="M556 344 L586 320" stroke="#16A34A" stroke-width="16" stroke-linecap="round" />
      <path d="M506 414 L486 478" stroke="#16A34A" stroke-width="16" stroke-linecap="round" />
      <path d="M534 414 L562 476" stroke="#16A34A" stroke-width="16" stroke-linecap="round" />
    `,
  },
  "shape-garden": {
    value: "shape-garden",
    label: "Shape Garden",
    ageRange: "Ages: 0 to 3",
    ageRangeShort: "0 to 3",
    description: "Circles, stars, hearts, and triangles bloom in a friendly garden.",
    storyTheme: "learning",
    illustrationTheme: "learning",
    titleTemplate: (childName) => `${childName}'s Shape Garden`,
    cardGradient: "linear-gradient(180deg, #C4B5FD 0%, #86EFAC 100%)",
    anchorPoint: "M532 246 C500 280, 462 320, 424 362",
    sceneMarkup: `
      <circle cx="486" cy="88" r="64" fill="#FFF7ED" fill-opacity="0.38" />
      <path d="M0 394 C124 318, 260 326, 398 396 S556 458, 640 430 L640 540 L0 540 Z" fill="#DDD6FE" fill-opacity="0.44" />
      <path d="M0 432 C152 364, 298 370, 438 432 S568 486, 640 456 L640 540 L0 540 Z" fill="#86EFAC" fill-opacity="0.40" />
      <circle cx="144" cy="258" r="42" fill="#38BDF8" />
      <polygon points="282,214 320,286 244,286" fill="#F59E0B" />
      <rect x="370" y="218" width="86" height="86" rx="20" fill="#F472B6" />
      <path d="M206 168 L220 200 L254 202 L228 224 L236 258 L206 240 L176 258 L184 224 L158 202 L192 200 Z" fill="#FDE68A" />
      <circle cx="506" cy="306" r="28" fill="#F8D3B0" />
      <rect x="478" y="336" width="64" height="108" rx="24" fill="#7C3AED" />
      <path d="M472 360 L428 332" stroke="#7C3AED" stroke-width="18" stroke-linecap="round" />
      <path d="M550 360 L586 326" stroke="#7C3AED" stroke-width="18" stroke-linecap="round" />
      <path d="M492 442 L470 510" stroke="#7C3AED" stroke-width="18" stroke-linecap="round" />
      <path d="M524 442 L554 506" stroke="#7C3AED" stroke-width="18" stroke-linecap="round" />
    `,
  },
  "color-rainbow": {
    value: "color-rainbow",
    label: "Color Rainbow",
    ageRange: "Ages: 0 to 3",
    ageRangeShort: "0 to 3",
    description: "A bright rainbow journey through paint, balloons, and happy color play.",
    storyTheme: "learning",
    illustrationTheme: "learning",
    titleTemplate: (childName) => `${childName}'s Color Rainbow`,
    cardGradient: "linear-gradient(180deg, #FDE68A 0%, #F472B6 100%)",
    anchorPoint: "M532 246 C498 280, 462 320, 420 364",
    sceneMarkup: `
      <circle cx="132" cy="94" r="76" fill="#FFF7ED" fill-opacity="0.34" />
      <path d="M0 396 C132 322, 278 332, 412 398 S558 458, 640 430 L640 540 L0 540 Z" fill="#FDE68A" fill-opacity="0.38" />
      <path d="M0 434 C156 366, 304 372, 446 436 S572 488, 640 458 L640 540 L0 540 Z" fill="#BFDBFE" fill-opacity="0.44" />
      <path d="M110 250 C176 170, 252 170, 318 250" fill="none" stroke="#F97316" stroke-width="18" stroke-linecap="round" />
      <path d="M132 250 C190 188, 252 188, 310 250" fill="none" stroke="#FACC15" stroke-width="18" stroke-linecap="round" />
      <path d="M154 250 C206 204, 252 204, 300 250" fill="none" stroke="#34D399" stroke-width="18" stroke-linecap="round" />
      <path d="M176 250 C220 220, 252 220, 286 250" fill="none" stroke="#38BDF8" stroke-width="18" stroke-linecap="round" />
      <path d="M198 250 C232 234, 252 234, 274 250" fill="none" stroke="#A78BFA" stroke-width="18" stroke-linecap="round" />
      <circle cx="436" cy="210" r="24" fill="#F472B6" />
      <circle cx="486" cy="176" r="24" fill="#38BDF8" />
      <circle cx="534" cy="214" r="24" fill="#34D399" />
      <circle cx="490" cy="308" r="28" fill="#F8D3B0" />
      <rect x="462" y="338" width="64" height="108" rx="24" fill="#DB2777" />
      <path d="M456 362 L416 334" stroke="#DB2777" stroke-width="18" stroke-linecap="round" />
      <path d="M534 362 L572 330" stroke="#DB2777" stroke-width="18" stroke-linecap="round" />
      <path d="M476 444 L452 510" stroke="#DB2777" stroke-width="18" stroke-linecap="round" />
      <path d="M510 444 L538 508" stroke="#DB2777" stroke-width="18" stroke-linecap="round" />
    `,
  },
  "first-tooth-tale": {
    value: "first-tooth-tale",
    label: "First Tooth Tale",
    ageRange: "Ages: 0 to 3",
    ageRangeShort: "0 to 3",
    description: "A tiny tooth, a big smile, and a magical keepsake for a proud first.",
    storyTheme: "milestone",
    illustrationTheme: "celebration",
    titleTemplate: (childName) => `${childName}'s First Tooth Tale`,
    cardGradient: "linear-gradient(180deg, #BFDBFE 0%, #FBCFE8 100%)",
    anchorPoint: "M536 246 C502 282, 466 322, 426 364",
    sceneMarkup: `
      <circle cx="500" cy="88" r="64" fill="#FFF7ED" fill-opacity="0.34" />
      <path d="M0 390 C134 316, 280 328, 410 394 S558 456, 640 428 L640 540 L0 540 Z" fill="#DBEAFE" fill-opacity="0.44" />
      <path d="M0 428 C154 360, 304 368, 446 432 S570 486, 640 456 L640 540 L0 540 Z" fill="#FBCFE8" fill-opacity="0.38" />
      <circle cx="172" cy="200" r="48" fill="#FFFFFF" fill-opacity="0.94" />
      <path d="M148 188 C148 158, 196 158, 196 188 L196 214 C196 246, 180 270, 172 282 C164 270, 148 246, 148 214 Z" fill="#FFFFFF" />
      <circle cx="244" cy="178" r="18" fill="#FDE68A" />
      <circle cx="286" cy="206" r="14" fill="#38BDF8" />
      <circle cx="322" cy="176" r="16" fill="#F472B6" />
      <circle cx="492" cy="304" r="28" fill="#F8D3B0" />
      <rect x="464" y="334" width="64" height="108" rx="24" fill="#2563EB" />
      <path d="M456 360 L414 338" stroke="#2563EB" stroke-width="18" stroke-linecap="round" />
      <path d="M536 360 L572 330" stroke="#2563EB" stroke-width="18" stroke-linecap="round" />
      <path d="M478 442 L454 510" stroke="#2563EB" stroke-width="18" stroke-linecap="round" />
      <path d="M512 442 L542 508" stroke="#2563EB" stroke-width="18" stroke-linecap="round" />
    `,
  },
  "first-steps-cheer": {
    value: "first-steps-cheer",
    label: "First Steps Cheer",
    ageRange: "Ages: 0 to 3",
    ageRangeShort: "0 to 3",
    description: "Celebrate sitting up, standing tall, and those unforgettable first little steps.",
    storyTheme: "milestone",
    illustrationTheme: "celebration",
    titleTemplate: (childName) => `${childName}'s First Steps Cheer`,
    cardGradient: "linear-gradient(180deg, #FDE68A 0%, #86EFAC 100%)",
    anchorPoint: "M536 246 C502 280, 466 322, 424 364",
    sceneMarkup: `
      <circle cx="132" cy="92" r="74" fill="#FFF7ED" fill-opacity="0.32" />
      <path d="M0 394 C136 320, 278 330, 412 396 S558 458, 640 430 L640 540 L0 540 Z" fill="#FDE68A" fill-opacity="0.38" />
      <path d="M0 432 C156 364, 304 370, 446 434 S572 486, 640 458 L640 540 L0 540 Z" fill="#BBF7D0" fill-opacity="0.40" />
      <path d="M114 312 C156 294, 184 292, 218 304" stroke="#F59E0B" stroke-width="10" stroke-linecap="round" stroke-dasharray="10 14" />
      <path d="M226 308 C262 288, 294 286, 334 302" stroke="#38BDF8" stroke-width="10" stroke-linecap="round" stroke-dasharray="10 14" />
      <path d="M342 304 C380 286, 414 286, 454 300" stroke="#F472B6" stroke-width="10" stroke-linecap="round" stroke-dasharray="10 14" />
      <circle cx="490" cy="298" r="30" fill="#F8D3B0" />
      <rect x="460" y="330" width="68" height="110" rx="26" fill="#16A34A" />
      <path d="M454 356 L408 372" stroke="#16A34A" stroke-width="18" stroke-linecap="round" />
      <path d="M534 356 L570 332" stroke="#16A34A" stroke-width="18" stroke-linecap="round" />
      <path d="M476 438 L446 514" stroke="#16A34A" stroke-width="18" stroke-linecap="round" />
      <path d="M514 438 L548 510" stroke="#16A34A" stroke-width="18" stroke-linecap="round" />
      <circle cx="214" cy="246" r="16" fill="#F59E0B" />
      <circle cx="256" cy="218" r="14" fill="#38BDF8" />
      <circle cx="296" cy="246" r="16" fill="#F472B6" />
    `,
  },
  "first-words-wonder": {
    value: "first-words-wonder",
    label: "First Words Wonder",
    ageRange: "Ages: 0 to 3",
    ageRangeShort: "0 to 3",
    description: "A sweet keepsake for first sounds, first words, and joyful little voices.",
    storyTheme: "milestone",
    illustrationTheme: "learning",
    titleTemplate: (childName) => `${childName}'s First Words Wonder`,
    cardGradient: "linear-gradient(180deg, #C4B5FD 0%, #FBCFE8 100%)",
    anchorPoint: "M536 246 C502 280, 466 322, 424 364",
    sceneMarkup: `
      <circle cx="500" cy="90" r="66" fill="#FFF7ED" fill-opacity="0.34" />
      <path d="M0 392 C132 318, 278 330, 410 394 S556 456, 640 428 L640 540 L0 540 Z" fill="#DDD6FE" fill-opacity="0.44" />
      <path d="M0 430 C154 362, 304 370, 446 434 S572 486, 640 458 L640 540 L0 540 Z" fill="#FBCFE8" fill-opacity="0.38" />
      <path d="M168 180 C168 156, 204 156, 204 180 C204 194, 194 202, 186 212 C178 202, 168 194, 168 180 Z" fill="#FFFFFF" />
      <path d="M238 146 C238 122, 278 122, 278 146 C278 160, 268 170, 258 182 C248 170, 238 160, 238 146 Z" fill="#FFFFFF" />
      <path d="M310 182 C310 158, 350 158, 350 182 C350 196, 340 206, 330 218 C320 206, 310 196, 310 182 Z" fill="#FFFFFF" />
      <text x="186" y="192" text-anchor="middle" font-size="22" font-weight="700" fill="#2563EB">Hi</text>
      <text x="258" y="158" text-anchor="middle" font-size="20" font-weight="700" fill="#DB2777">Ma</text>
      <text x="330" y="194" text-anchor="middle" font-size="20" font-weight="700" fill="#16A34A">Da</text>
      <circle cx="490" cy="304" r="28" fill="#F8D3B0" />
      <rect x="462" y="334" width="64" height="108" rx="24" fill="#7C3AED" />
      <path d="M454 360 L414 334" stroke="#7C3AED" stroke-width="18" stroke-linecap="round" />
      <path d="M534 360 L570 332" stroke="#7C3AED" stroke-width="18" stroke-linecap="round" />
      <path d="M476 442 L452 510" stroke="#7C3AED" stroke-width="18" stroke-linecap="round" />
      <path d="M510 442 L540 508" stroke="#7C3AED" stroke-width="18" stroke-linecap="round" />
    `,
  },
  "milestone-magic": {
    value: "milestone-magic",
    label: "Milestone Magic",
    ageRange: "Ages: 3 to 6",
    ageRangeShort: "3 to 6",
    description: "A keepsake-style story for proud firsts, big feelings, and family milestones.",
    storyTheme: "celebration",
    illustrationTheme: "celebration",
    titleTemplate: (childName) => `${childName}'s Milestone Magic`,
    cardGradient: "linear-gradient(180deg, #FBCFE8 0%, #FDE68A 100%)",
    anchorPoint: "M536 246 C504 282, 468 322, 426 364",
    sceneMarkup: `
      <circle cx="500" cy="88" r="66" fill="#FFF7ED" fill-opacity="0.34" />
      <path d="M0 388 C136 314, 278 328, 408 392 S556 454, 640 428 L640 540 L0 540 Z" fill="#FBCFE8" fill-opacity="0.42" />
      <path d="M0 426 C154 356, 304 366, 444 430 S570 484, 640 454 L640 540 L0 540 Z" fill="#FDE68A" fill-opacity="0.40" />
      <path d="M96 142 L544 142" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-dasharray="12 12" opacity="0.82" />
      <circle cx="176" cy="188" r="18" fill="#38BDF8" />
      <circle cx="228" cy="168" r="18" fill="#F472B6" />
      <circle cx="280" cy="188" r="18" fill="#F59E0B" />
      <circle cx="332" cy="168" r="18" fill="#34D399" />
      <circle cx="246" cy="316" r="28" fill="#F8D3B0" />
      <rect x="218" y="344" width="64" height="108" rx="24" fill="#DB2777" />
      <path d="M210 370 L168 410" stroke="#DB2777" stroke-width="18" stroke-linecap="round" />
      <path d="M290 370 L334 338" stroke="#DB2777" stroke-width="18" stroke-linecap="round" />
      <path d="M236 446 L214 514" stroke="#DB2777" stroke-width="18" stroke-linecap="round" />
      <path d="M262 446 L294 512" stroke="#DB2777" stroke-width="18" stroke-linecap="round" />
      <rect x="378" y="304" width="112" height="88" rx="22" fill="#FFF7ED" fill-opacity="0.92" />
      <path d="M434 292 L454 324 L486 330 L462 350 L468 384 L434 368 L400 384 L406 350 L382 330 L414 324 Z" fill="#F59E0B" />
    `,
  },
  "brave-little-hero": {
    value: "brave-little-hero",
    label: "Brave Little Hero",
    ageRange: "Ages: 3 to 6",
    ageRangeShort: "3 to 6",
    description: "A confidence-building story about kindness, courage, and proud everyday wins.",
    storyTheme: "confidence",
    illustrationTheme: "superhero",
    titleTemplate: (childName) => `${childName}'s Brave Little Hero`,
    cardGradient: "linear-gradient(180deg, #60A5FA 0%, #FBBF24 100%)",
    anchorPoint: "M536 246 C502 280, 466 322, 424 364",
    sceneMarkup: `
      <circle cx="486" cy="86" r="64" fill="#FFF7ED" fill-opacity="0.32" />
      <path d="M0 392 C138 316, 280 330, 410 394 S556 456, 640 430 L640 540 L0 540 Z" fill="#BFDBFE" fill-opacity="0.42" />
      <path d="M0 430 C156 362, 304 370, 446 434 S572 486, 640 458 L640 540 L0 540 Z" fill="#FDE68A" fill-opacity="0.36" />
      <rect x="88" y="258" width="96" height="126" rx="18" fill="#93C5FD" fill-opacity="0.72" />
      <rect x="200" y="228" width="96" height="156" rx="18" fill="#60A5FA" fill-opacity="0.74" />
      <rect x="312" y="244" width="96" height="140" rx="18" fill="#3B82F6" fill-opacity="0.76" />
      <circle cx="486" cy="292" r="30" fill="#F8D3B0" />
      <rect x="456" y="324" width="68" height="112" rx="26" fill="#DC2626" />
      <path d="M452 352 L406 374" stroke="#DC2626" stroke-width="18" stroke-linecap="round" />
      <path d="M528 352 L564 330" stroke="#DC2626" stroke-width="18" stroke-linecap="round" />
      <path d="M474 434 L448 510" stroke="#DC2626" stroke-width="18" stroke-linecap="round" />
      <path d="M510 434 L544 506" stroke="#DC2626" stroke-width="18" stroke-linecap="round" />
      <path d="M524 338 L564 394 L540 402 L510 360 Z" fill="#FBBF24" />
      <path d="M474 324 L494 324" stroke="#ffffff" stroke-width="6" stroke-linecap="round" />
    `,
  },
  "family-celebration": {
    value: "family-celebration",
    label: "Family Celebration",
    ageRange: "Ages: 12+",
    ageRangeShort: "12+",
    description: "Garden parties, loving family moments, and keepsake celebration warmth.",
    storyTheme: "celebration",
    illustrationTheme: "celebration",
    titleTemplate: (childName) => `${childName}'s Family Celebration`,
    cardGradient: "linear-gradient(180deg, #F7C6E7 0%, #F59E0B 100%)",
    anchorPoint: "M536 244 C502 280, 466 320, 426 362",
    sceneMarkup: `
      <circle cx="114" cy="92" r="82" fill="#FFFFFF" fill-opacity="0.18" />
      <path d="M0 378 C132 306, 272 322, 404 390 S554 454, 640 426 L640 540 L0 540 Z" fill="#FBCFE8" fill-opacity="0.42" />
      <path d="M0 420 C154 350, 290 360, 434 426 S566 482, 640 452 L640 540 L0 540 Z" fill="#FDBA74" fill-opacity="0.44" />
      <path d="M72 134 L566 134" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-dasharray="12 12" opacity="0.86" />
      <path d="M112 134 L138 170 L164 134 L190 170 L216 134 L242 170 L268 134" fill="none" stroke="#F59E0B" stroke-width="8" stroke-linecap="round" />
      <path d="M316 134 L342 170 L368 134 L394 170 L420 134 L446 170 L472 134" fill="none" stroke="#EC4899" stroke-width="8" stroke-linecap="round" />
      <circle cx="212" cy="318" r="28" fill="#F8D3B0" />
      <rect x="184" y="346" width="64" height="108" rx="24" fill="#DB2777" />
      <path d="M176 372 L136 414" stroke="#DB2777" stroke-width="18" stroke-linecap="round" />
      <path d="M256 372 L302 336" stroke="#DB2777" stroke-width="18" stroke-linecap="round" />
      <path d="M204 448 L184 516" stroke="#DB2777" stroke-width="18" stroke-linecap="round" />
      <path d="M228 448 L260 514" stroke="#DB2777" stroke-width="18" stroke-linecap="round" />
      <circle cx="398" cy="292" r="24" fill="#FDE68A" />
      <rect x="360" y="316" width="78" height="80" rx="18" fill="#FFF7ED" fill-opacity="0.96" />
      <rect x="372" y="332" width="54" height="18" rx="8" fill="#F59E0B" fill-opacity="0.48" />
      <rect x="372" y="360" width="54" height="18" rx="8" fill="#EC4899" fill-opacity="0.42" />
      <circle cx="324" cy="226" r="12" fill="#F59E0B" />
      <circle cx="356" cy="202" r="10" fill="#F472B6" />
      <circle cx="394" cy="226" r="12" fill="#FB7185" />
      <circle cx="434" cy="202" r="10" fill="#F59E0B" />
    `,
  },
  "birthday-bash": {
    value: "birthday-bash",
    label: "Birthday Bash",
    ageRange: "Ages: 12+",
    ageRangeShort: "12+",
    description: "Cake, candles, balloons, and a joyful spotlight birthday story.",
    storyTheme: "birthday",
    illustrationTheme: "birthday",
    titleTemplate: (childName) => `${childName}'s Birthday Bash`,
    cardGradient: "linear-gradient(180deg, #7DD3FC 0%, #F97316 100%)",
    anchorPoint: "M536 246 C504 284, 468 324, 426 364",
    sceneMarkup: `
      <circle cx="500" cy="84" r="68" fill="#FFF7ED" fill-opacity="0.38" />
      <path d="M0 386 C138 314, 280 326, 410 392 S558 452, 640 426 L640 540 L0 540 Z" fill="#FDBA74" fill-opacity="0.42" />
      <path d="M0 426 C154 354, 304 362, 444 426 S572 482, 640 454 L640 540 L0 540 Z" fill="#FDE68A" fill-opacity="0.48" />
      <circle cx="148" cy="122" r="26" fill="#EC4899" />
      <circle cx="204" cy="160" r="22" fill="#F59E0B" />
      <circle cx="490" cy="148" r="28" fill="#38BDF8" />
      <circle cx="548" cy="114" r="22" fill="#A855F7" />
      <circle cx="248" cy="312" r="28" fill="#F8D3B0" />
      <rect x="220" y="340" width="64" height="106" rx="24" fill="#F97316" />
      <path d="M212 366 L166 408" stroke="#F97316" stroke-width="18" stroke-linecap="round" />
      <path d="M292 366 L338 332" stroke="#F97316" stroke-width="18" stroke-linecap="round" />
      <path d="M236 444 L212 514" stroke="#F97316" stroke-width="18" stroke-linecap="round" />
      <path d="M262 444 L296 512" stroke="#F97316" stroke-width="18" stroke-linecap="round" />
      <rect x="366" y="314" width="92" height="78" rx="18" fill="#FFF7ED" fill-opacity="0.96" />
      <rect x="380" y="332" width="64" height="18" rx="8" fill="#F9A8D4" />
      <rect x="376" y="354" width="72" height="16" rx="8" fill="#FDBA74" />
      <path d="M388 314 L388 284" stroke="#F59E0B" stroke-width="5" stroke-linecap="round" />
      <path d="M412 314 L412 280" stroke="#F59E0B" stroke-width="5" stroke-linecap="round" />
      <path d="M436 314 L436 284" stroke="#F59E0B" stroke-width="5" stroke-linecap="round" />
      <circle cx="388" cy="276" r="8" fill="#FDE68A" />
      <circle cx="412" cy="270" r="8" fill="#FDE68A" />
      <circle cx="436" cy="276" r="8" fill="#FDE68A" />
    `,
  },
  "festive-gathering": {
    value: "festive-gathering",
    label: "Festive Gathering",
    ageRange: "Ages: 12+",
    ageRangeShort: "12+",
    description: "Community joy, cultural togetherness, and bright event atmosphere.",
    storyTheme: "gathering",
    illustrationTheme: "gala",
    titleTemplate: (childName) => `${childName}'s Festive Gathering`,
    cardGradient: "linear-gradient(180deg, #2DD4BF 0%, #F59E0B 100%)",
    anchorPoint: "M534 246 C500 282, 466 322, 424 364",
    sceneMarkup: `
      <circle cx="132" cy="96" r="84" fill="#FFFFFF" fill-opacity="0.14" />
      <path d="M0 390 C142 314, 278 326, 402 390 S550 452, 640 424 L640 540 L0 540 Z" fill="#A7F3D0" fill-opacity="0.44" />
      <path d="M0 430 C154 356, 308 366, 444 432 S570 484, 640 454 L640 540 L0 540 Z" fill="#FCD34D" fill-opacity="0.42" />
      <path d="M70 148 L566 148" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-dasharray="10 14" opacity="0.86" />
      <path d="M110 148 L136 180 L162 148 L188 180 L214 148 L240 180 L266 148 L292 180 L318 148" fill="none" stroke="#14B8A6" stroke-width="8" stroke-linecap="round" />
      <path d="M352 148 L378 180 L404 148 L430 180 L456 148 L482 180 L508 148" fill="none" stroke="#F59E0B" stroke-width="8" stroke-linecap="round" />
      <circle cx="250" cy="316" r="28" fill="#F8D3B0" />
      <rect x="222" y="344" width="64" height="108" rx="24" fill="#0F766E" />
      <path d="M214 370 L170 408" stroke="#0F766E" stroke-width="18" stroke-linecap="round" />
      <path d="M294 368 L338 334" stroke="#0F766E" stroke-width="18" stroke-linecap="round" />
      <path d="M238 448 L214 514" stroke="#0F766E" stroke-width="18" stroke-linecap="round" />
      <path d="M264 448 L296 514" stroke="#0F766E" stroke-width="18" stroke-linecap="round" />
      <circle cx="414" cy="258" r="22" fill="#FDE68A" />
      <circle cx="470" cy="276" r="22" fill="#FB7185" />
      <circle cx="526" cy="258" r="22" fill="#38BDF8" />
      <rect x="400" y="322" width="146" height="18" rx="9" fill="#FFF7ED" fill-opacity="0.82" />
      <rect x="410" y="348" width="126" height="14" rx="7" fill="#FFF7ED" fill-opacity="0.68" />
    `,
  },
  "heartfelt-tribute": {
    value: "heartfelt-tribute",
    label: "Heartfelt Tribute",
    ageRange: "Ages: 12+",
    ageRangeShort: "12+",
    description: "A premium keepsake theme for love, gratitude, and meaningful memories.",
    storyTheme: "tribute",
    illustrationTheme: "tribute",
    titleTemplate: (childName) => `Why ${childName} Is So Loved`,
    cardGradient: "linear-gradient(180deg, #7F1D1D 0%, #F59E0B 100%)",
    anchorPoint: "M534 246 C500 284, 466 324, 424 362",
    sceneMarkup: `
      <rect x="0" y="0" width="640" height="540" fill="#7F1D1D" fill-opacity="0.16" />
      <circle cx="520" cy="86" r="62" fill="#FFFFFF" fill-opacity="0.12" />
      <path d="M0 390 C138 316, 280 326, 408 392 S556 452, 640 424 L640 540 L0 540 Z" fill="#FB7185" fill-opacity="0.24" />
      <path d="M0 428 C154 358, 306 368, 446 430 S572 484, 640 454 L640 540 L0 540 Z" fill="#F59E0B" fill-opacity="0.24" />
      <path d="M128 116 C148 82, 204 82, 224 118 C234 146, 222 168, 196 186 C170 168, 120 146, 128 116 Z" fill="#FDE68A" fill-opacity="0.84" />
      <path d="M166 118 C182 94, 220 94, 236 118 C244 138, 236 154, 214 168 C192 154, 158 138, 166 118 Z" fill="#FFF7ED" fill-opacity="0.92" />
      <circle cx="256" cy="318" r="28" fill="#F8D3B0" />
      <rect x="228" y="346" width="64" height="108" rx="24" fill="#9F1239" />
      <path d="M220 372 L176 412" stroke="#9F1239" stroke-width="18" stroke-linecap="round" />
      <path d="M300 372 L344 338" stroke="#9F1239" stroke-width="18" stroke-linecap="round" />
      <path d="M242 448 L220 514" stroke="#9F1239" stroke-width="18" stroke-linecap="round" />
      <path d="M268 448 L300 514" stroke="#9F1239" stroke-width="18" stroke-linecap="round" />
      <circle cx="420" cy="270" r="34" fill="#FFFFFF" fill-opacity="0.82" />
      <path d="M404 264 C412 250, 434 250, 442 264 C446 276, 440 286, 428 296 C416 286, 402 276, 404 264 Z" fill="#FB7185" />
      <rect x="380" y="326" width="104" height="54" rx="18" fill="#FFF7ED" fill-opacity="0.92" />
      <rect x="394" y="344" width="76" height="10" rx="5" fill="#F59E0B" fill-opacity="0.48" />
      <rect x="404" y="360" width="56" height="8" rx="4" fill="#FB7185" fill-opacity="0.4" />
    `,
  },
  "baby-shower": {
    value: "baby-shower",
    label: "Baby Shower",
    ageRange: "Ages: 12+",
    ageRangeShort: "12+",
    description: "Soft pastels, baby celebration, and joyful welcoming moments.",
    storyTheme: "celebration",
    illustrationTheme: "celebration",
    titleTemplate: (childName) => `${childName}'s Baby Shower Celebration`,
    cardGradient: "linear-gradient(180deg, #FDD7E6 0%, #BFDBFE 100%)",
    anchorPoint: "M536 244 C502 280, 466 320, 426 362",
    sceneMarkup: `
      <circle cx="120" cy="100" r="80" fill="#FFFFFF" fill-opacity="0.16" />
      <path d="M0 390 C140 314, 280 326, 410 392 S558 452, 640 426 L640 540 L0 540 Z" fill="#F8D3B0" fill-opacity="0.32" />
      <path d="M0 430 C154 356, 308 366, 444 432 S570 484, 640 454 L640 540 L0 540 Z" fill="#DBEAFE" fill-opacity="0.36" />
      <circle cx="162" cy="148" r="24" fill="#F9A8D4" />
      <circle cx="224" cy="130" r="20" fill="#BFDBFE" />
      <circle cx="476" cy="164" r="26" fill="#FDD7E6" />
      <circle cx="540" cy="126" r="22" fill="#F9A8D4" />
      <circle cx="212" cy="318" r="28" fill="#F8D3B0" />
      <rect x="184" y="346" width="64" height="108" rx="24" fill="#DB2777" />
      <path d="M176 372 L136 414" stroke="#DB2777" stroke-width="18" stroke-linecap="round" />
      <path d="M256 372 L302 336" stroke="#DB2777" stroke-width="18" stroke-linecap="round" />
      <path d="M204 448 L184 516" stroke="#DB2777" stroke-width="18" stroke-linecap="round" />
      <path d="M228 448 L260 514" stroke="#DB2777" stroke-width="18" stroke-linecap="round" />
      <rect x="360" y="310" width="100" height="84" rx="18" fill="#FFF7ED" fill-opacity="0.94" />
      <path d="M380 330 L396 308" stroke="#F9A8D4" stroke-width="6" stroke-linecap="round" />
      <path d="M420 330 L436 308" stroke="#BFDBFE" stroke-width="6" stroke-linecap="round" />
      <rect x="372" y="356" width="76" height="12" rx="6" fill="#FDD7E6" fill-opacity="0.64" />
    `,
  },
  "gender-reveal": {
    value: "gender-reveal",
    label: "Gender Reveal",
    ageRange: "Ages: 12+",
    ageRangeShort: "12+",
    description: "Pink and blue celebration, special reveal moment joy.",
    storyTheme: "celebration",
    illustrationTheme: "celebration",
    titleTemplate: (childName) => `${childName}'s Gender Reveal Party`,
    cardGradient: "linear-gradient(180deg, #F9A8D4 0%, #60A5FA 100%)",
    anchorPoint: "M536 246 C504 284, 468 324, 426 364",
    sceneMarkup: `
      <circle cx="500" cy="84" r="68" fill="#FFFFFF" fill-opacity="0.12" />
      <path d="M0 386 C138 314, 280 326, 410 392 S558 452, 640 426 L640 540 L0 540 Z" fill="#F9A8D4" fill-opacity="0.38" />
      <path d="M0 426 C154 354, 304 362, 444 426 S572 482, 640 454 L640 540 L0 540 Z" fill="#60A5FA" fill-opacity="0.38" />
      <circle cx="148" cy="122" r="26" fill="#F9A8D4" />
      <circle cx="204" cy="160" r="22" fill="#60A5FA" />
      <circle cx="490" cy="148" r="28" fill="#F9A8D4" />
      <circle cx="548" cy="114" r="22" fill="#60A5FA" />
      <path d="M72 134 L566 134" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-dasharray="12 12" opacity="0.82" />
      <circle cx="248" cy="312" r="28" fill="#F8D3B0" />
      <rect x="220" y="340" width="64" height="106" rx="24" fill="#3B82F6" />
      <path d="M212 366 L166 408" stroke="#3B82F6" stroke-width="18" stroke-linecap="round" />
      <path d="M292 366 L338 332" stroke="#3B82F6" stroke-width="18" stroke-linecap="round" />
      <path d="M236 444 L212 514" stroke="#3B82F6" stroke-width="18" stroke-linecap="round" />
      <path d="M262 444 L296 512" stroke="#3B82F6" stroke-width="18" stroke-linecap="round" />
      <circle cx="404" cy="270" r="22" fill="#F9A8D4" />
      <circle cx="456" cy="280" r="22" fill="#60A5FA" />
      <rect x="380" y="326" width="104" height="54" rx="18" fill="#FFF7ED" fill-opacity="0.92" />
      <rect x="394" y="344" width="76" height="10" rx="5" fill="#F9A8D4" fill-opacity="0.52" />
    `,
  },
  anniversary: {
    value: "anniversary",
    label: "Anniversary",
    ageRange: "Ages: 12+",
    ageRangeShort: "12+",
    description: "Romantic elegance, love stories, and timeless moments together.",
    storyTheme: "celebration",
    illustrationTheme: "tribute",
    titleTemplate: (childName) => `${childName}'s Anniversary Story`,
    cardGradient: "linear-gradient(180deg, #DC2626 0%, #F59E0B 100%)",
    anchorPoint: "M534 246 C500 282, 466 322, 424 362",
    sceneMarkup: `
      <rect x="0" y="0" width="640" height="540" fill="#DC2626" fill-opacity="0.08" />
      <circle cx="520" cy="86" r="62" fill="#FFFFFF" fill-opacity="0.08" />
      <path d="M0 390 C138 316, 280 326, 408 392 S556 452, 640 424 L640 540 L0 540 Z" fill="#FB7185" fill-opacity="0.22" />
      <path d="M0 428 C154 358, 306 368, 446 430 S572 484, 640 454 L640 540 L0 540 Z" fill="#F59E0B" fill-opacity="0.22" />
      <path d="M128 116 C148 82, 204 82, 224 118 C234 146, 222 168, 196 186 C170 168, 120 146, 128 116 Z" fill="#FB7185" fill-opacity="0.82" />
      <path d="M166 118 C182 94, 220 94, 236 118 C244 138, 236 154, 214 168 C192 154, 158 138, 166 118 Z" fill="#FECACA" fill-opacity="0.88" />
      <path d="M284 110 C298 88, 328 88, 342 108 C350 128, 340 146, 320 160 C300 146, 270 128, 284 110 Z" fill="#FB7185" fill-opacity="0.72" />
      <circle cx="256" cy="318" r="28" fill="#F8D3B0" />
      <rect x="228" y="346" width="64" height="108" rx="24" fill="#9F1239" />
      <path d="M220 372 L176 412" stroke="#9F1239" stroke-width="18" stroke-linecap="round" />
      <path d="M300 372 L344 338" stroke="#9F1239" stroke-width="18" stroke-linecap="round" />
      <path d="M242 448 L220 514" stroke="#9F1239" stroke-width="18" stroke-linecap="round" />
      <path d="M268 448 L300 514" stroke="#9F1239" stroke-width="18" stroke-linecap="round" />
      <circle cx="420" cy="270" r="34" fill="#FFFFFF" fill-opacity="0.78" />
      <path d="M404 264 C412 250, 434 250, 442 264 C446 276, 440 286, 428 296 C416 286, 402 276, 404 264 Z" fill="#FB7185" />
      <rect x="380" y="326" width="104" height="54" rx="18" fill="#FFF7ED" fill-opacity="0.88" />
      <rect x="394" y="344" width="76" height="10" rx="5" fill="#FB7185" fill-opacity="0.44" />
    `,
  },
  "valentine-day": {
    value: "valentine-day",
    label: "Valentine Day",
    ageRange: "Ages: 12+",
    ageRangeShort: "12+",
    description: "Hearts, love, affection, and heartfelt celebration.",
    storyTheme: "celebration",
    illustrationTheme: "tribute",
    titleTemplate: (childName) => `${childName}'s Valentine Celebration`,
    cardGradient: "linear-gradient(180deg, #EC4899 0%, #F472B6 100%)",
    anchorPoint: "M534 244 C502 280, 466 320, 426 362",
    sceneMarkup: `
      <circle cx="500" cy="84" r="68" fill="#FFF7ED" fill-opacity="0.28" />
      <path d="M0 386 C138 314, 280 326, 410 392 S558 452, 640 426 L640 540 L0 540 Z" fill="#FBCFE8" fill-opacity="0.48" />
      <path d="M0 426 C154 354, 304 362, 444 426 S572 482, 640 454 L640 540 L0 540 Z" fill="#F472B6" fill-opacity="0.42" />
      <path d="M128 116 C148 82, 204 82, 224 118 C234 146, 222 168, 196 186 C170 168, 120 146, 128 116 Z" fill="#FB7185" fill-opacity="0.88" />
      <path d="M166 118 C182 94, 220 94, 236 118 C244 138, 236 154, 214 168 C192 154, 158 138, 166 118 Z" fill="#FBCFE8" fill-opacity="0.94" />
      <path d="M284 110 C298 88, 328 88, 342 108 C350 128, 340 146, 320 160 C300 146, 270 128, 284 110 Z" fill="#FB7185" fill-opacity="0.76" />
      <circle cx="212" cy="318" r="28" fill="#F8D3B0" />
      <rect x="184" y="346" width="64" height="108" rx="24" fill="#DB2777" />
      <path d="M176 372 L136 414" stroke="#DB2777" stroke-width="18" stroke-linecap="round" />
      <path d="M256 372 L302 336" stroke="#DB2777" stroke-width="18" stroke-linecap="round" />
      <path d="M204 448 L184 516" stroke="#DB2777" stroke-width="18" stroke-linecap="round" />
      <path d="M228 448 L260 514" stroke="#DB2777" stroke-width="18" stroke-linecap="round" />
      <circle cx="404" cy="270" r="22" fill="#FB7185" />
      <circle cx="456" cy="280" r="22" fill="#F472B6" />
      <rect x="380" y="326" width="104" height="54" rx="18" fill="#FFF7ED" fill-opacity="0.92" />
      <rect x="394" y="344" width="76" height="10" rx="5" fill="#FB7185" fill-opacity="0.48" />
    `,
  },
  promotion: {
    value: "promotion",
    label: "Promotion",
    ageRange: "Ages: 12+",
    ageRangeShort: "12+",
    description: "Achievement, success, celebration, and milestone moments.",
    storyTheme: "celebration",
    illustrationTheme: "gala",
    titleTemplate: (childName) => `${childName}'s Achievement Celebration`,
    cardGradient: "linear-gradient(180deg, #2563EB 0%, #F59E0B 100%)",
    anchorPoint: "M536 246 C504 284, 468 324, 426 364",
    sceneMarkup: `
      <circle cx="132" cy="96" r="84" fill="#FFFFFF" fill-opacity="0.12" />
      <path d="M0 390 C142 314, 278 326, 402 390 S550 452, 640 424 L640 540 L0 540 Z" fill="#DBEAFE" fill-opacity="0.44" />
      <path d="M0 430 C154 356, 308 366, 444 432 S570 484, 640 454 L640 540 L0 540 Z" fill="#FCD34D" fill-opacity="0.42" />
      <path d="M70 148 L566 148" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-dasharray="10 14" opacity="0.82" />
      <path d="M110 148 L136 180 L162 148 L188 180 L214 148 L240 180 L266 148 L292 180 L318 148" fill="none" stroke="#2563EB" stroke-width="8" stroke-linecap="round" />
      <path d="M352 148 L378 180 L404 148 L430 180 L456 148 L482 180 L508 148" fill="none" stroke="#F59E0B" stroke-width="8" stroke-linecap="round" />
      <circle cx="250" cy="316" r="28" fill="#F8D3B0" />
      <rect x="222" y="344" width="64" height="108" rx="24" fill="#1E40AF" />
      <path d="M214 370 L170 408" stroke="#1E40AF" stroke-width="18" stroke-linecap="round" />
      <path d="M294 368 L338 334" stroke="#1E40AF" stroke-width="18" stroke-linecap="round" />
      <path d="M238 448 L214 514" stroke="#1E40AF" stroke-width="18" stroke-linecap="round" />
      <path d="M264 448 L296 514" stroke="#1E40AF" stroke-width="18" stroke-linecap="round" />
      <circle cx="414" cy="258" r="22" fill="#FCD34D" />
      <circle cx="470" cy="276" r="22" fill="#FBBF24" />
      <circle cx="526" cy="258" r="22" fill="#93C5FD" />
      <path d="M410 260 L450 260" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
      <path d="M430 240 L430 280" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
    `,
  },
  siblings: {
    value: "siblings",
    label: "Siblings",
    ageRange: "Ages: 12+",
    ageRangeShort: "12+",
    description: "Brother and sister bonding, family love, and togetherness.",
    storyTheme: "celebration",
    illustrationTheme: "celebration",
    titleTemplate: (childName) => `${childName} and the Sibling Bond`,
    cardGradient: "linear-gradient(180deg, #8B5CF6 0%, #10B981 100%)",
    anchorPoint: "M534 244 C502 280, 466 320, 426 362",
    sceneMarkup: `
      <circle cx="136" cy="98" r="84" fill="#FFFFFF" fill-opacity="0.14" />
      <path d="M0 390 C136 308, 274 322, 404 392 S558 456, 640 430 L640 540 L0 540 Z" fill="#D8B4FE" fill-opacity="0.42" />
      <path d="M0 428 C150 358, 286 368, 436 430 S566 484, 640 456 L640 540 L0 540 Z" fill="#A7F3D0" fill-opacity="0.38" />
      <circle cx="212" cy="314" r="26" fill="#F8D3B0" />
      <rect x="186" y="340" width="60" height="104" rx="22" fill="#8B5CF6" />
      <path d="M180 362 L144 396" stroke="#8B5CF6" stroke-width="16" stroke-linecap="round" />
      <path d="M258 362 L298 332" stroke="#8B5CF6" stroke-width="16" stroke-linecap="round" />
      <path d="M206 440 L190 504" stroke="#8B5CF6" stroke-width="16" stroke-linecap="round" />
      <path d="M228 440 L254 502" stroke="#8B5CF6" stroke-width="16" stroke-linecap="round" />
      <circle cx="380" cy="318" r="24" fill="#F8D3B0" />
      <rect x="356" y="342" width="56" height="100" rx="20" fill="#10B981" />
      <path d="M350 362 L320 390" stroke="#10B981" stroke-width="16" stroke-linecap="round" />
      <path d="M408 362 L442 338" stroke="#10B981" stroke-width="16" stroke-linecap="round" />
      <path d="M374 438 L356 500" stroke="#10B981" stroke-width="16" stroke-linecap="round" />
      <path d="M392 438 L418 498" stroke="#10B981" stroke-width="16" stroke-linecap="round" />
      <path d="M274 260 L328 260" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-dasharray="6 4" opacity="0.72" />
      <circle cx="270" cy="260" r="6" fill="#FBBF24" />
      <circle cx="332" cy="260" r="6" fill="#FBBF24" />
    `,
  },
  customizable: {
    value: "customizable",
    label: "Custom Magic",
    ageRange: "All ages",
    ageRangeShort: "All ages",
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

const ADULT_BOOK_THEME_VALUES = new Set([
  "family-celebration",
  "birthday-bash",
  "festive-gathering",
  "heartfelt-tribute",
  "baby-shower",
  "gender-reveal",
  "anniversary",
  "valentine-day",
  "promotion",
  "siblings",
]);

const LEGACY_BOOK_THEME_ALIASES = {
  family: "family-celebration",
  friends: "animal-adventure",
  motivational: "dino-quest",
  behavioural: "goodnight-garage",
  behavior: "brave-little-hero",
  behaviour: "brave-little-hero",
  confidence: "brave-little-hero",
  alphabet: "alphabet-parade",
  alphabets: "alphabet-parade",
  numbers: "number-train",
  number: "number-train",
  shapes: "shape-garden",
  shape: "shape-garden",
  colors: "color-rainbow",
  colours: "color-rainbow",
  color: "color-rainbow",
  colour: "color-rainbow",
  milestone: "milestone-magic",
  tooth: "first-tooth-tale",
  "first-tooth": "first-tooth-tale",
  steps: "first-steps-cheer",
  walk: "first-steps-cheer",
  "first-walk": "first-steps-cheer",
  speech: "first-words-wonder",
  words: "first-words-wonder",
  "first-speech": "first-words-wonder",
  fairytale: "unicorn-magic",
  fantasy: "unicorn-magic",
  adventure: "animal-adventure",
  birthday: "birthday-bash",
  congregation: "festive-gathering",
  celebration: "family-celebration",
  tribute: "heartfelt-tribute",
  babyshower: "baby-shower",
  genderreveal: "gender-reveal",
  valentines: "valentine-day",
};

export function getBookTheme(themeValue) {
  const normalizedTheme = BOOK_THEME_MAP[themeValue]
    ? themeValue
    : LEGACY_BOOK_THEME_ALIASES[themeValue];

  return BOOK_THEME_MAP[normalizedTheme] || BOOK_THEME_MAP["animal-adventure"];
}

export function getStoryThemesForAgeGroup(ageGroup) {
  const normalizedAgeGroup = normalizeThemeCategoryAgeGroup(ageGroup);
  const configuredThemeIds = getConfiguredThemeIdsForAgeGroup(normalizedAgeGroup);

  if (configuredThemeIds.length > 0) {
    return configuredThemeIds
      .map((themeId) => BOOK_THEME_MAP[themeId])
      .filter(Boolean);
  }

  const isAdultAudience = normalizedAgeGroup === "12+";

  return STORY_THEMES.filter((theme) =>
    isAdultAudience
      ? ADULT_BOOK_THEME_VALUES.has(theme.value) || theme.value === "customizable"
      : !ADULT_BOOK_THEME_VALUES.has(theme.value)
  );
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

// ============================================================================
// CATEGORIZED THEMES BY AGE GROUP
// ============================================================================

export const THEMED_CATEGORIES = {
  // Infants & Toddlers (0-2 years)
  infants: {
    ageGroup: "0-2 Years",
    ageRange: "Infants & Toddlers",
    icon: "👶",
    description: "Simple, colorful, and sensory-friendly themes",
    categories: {
      learning: {
        name: "Learning Basics",
        icon: "📚",
        description: "Alphabets, Numbers, and Basic Concepts",
        themes: [
          "animal-adventure", // Simple animals
        ],
      },
      sensory: {
        name: "Sensory & Colors",
        icon: "🎨",
        description: "Bright colors, shapes, and patterns",
        themes: [
          "goodnight-garage", // Warm, simple, comforting
        ],
      },
      bedtime: {
        name: "Bedtime Stories",
        icon: "🌙",
        description: "Calm, soothing, and cozy themes",
        themes: [
          "goodnight-garage",
        ],
      },
    },
  },

  // Young Children (2-5 years)
  toddlers: {
    ageGroup: "2-5 Years",
    ageRange: "Toddlers & Preschool",
    icon: "🧒",
    description: "Imaginative, colorful, and educational themes",
    categories: {
      adventure: {
        name: "Adventures",
        icon: "🗺️",
        description: "Exciting journeys and discoveries",
        themes: [
          "animal-adventure",
          "dino-quest",
          "goodnight-garage",
        ],
      },
      fantasy: {
        name: "Fairytales & Magic",
        icon: "✨",
        description: "Magical worlds, princes, and enchantment",
        themes: [
          "unicorn-magic",
        ],
      },
      educational: {
        name: "Learning Stories",
        icon: "🎓",
        description: "Letters, numbers, and life lessons",
        themes: [
          "animal-adventure",
          "dino-quest",
        ],
      },
      bedtime: {
        name: "Sleepy Time",
        icon: "😴",
        description: "Cozy and calming bedtime themes",
        themes: [
          "goodnight-garage",
        ],
      },
      emotions: {
        name: "Feelings & Growth",
        icon: "❤️",
        description: "Emotional learning and confidence",
        themes: [
          "animal-adventure",
        ],
      },
    },
  },

  // Children (6-11 years)
  children: {
    ageGroup: "6-11 Years",
    ageRange: "Elementary School",
    icon: "👧",
    description: "Action-packed and inspiring themes with deeper stories",
    categories: {
      adventure: {
        name: "Action & Adventure",
        icon: "⚔️",
        description: "Quest, heroes, and exciting journeys",
        themes: [
          "dino-quest",
          "animal-adventure",
        ],
      },
      fantasy: {
        name: "Fantasy & Magic",
        icon: "🧙",
        description: "Wizards, spells, and magical realms",
        themes: [
          "unicorn-magic",
        ],
      },
      exploration: {
        name: "Exploration",
        icon: "🚀",
        description: "Space, ocean, and new worlds",
        themes: [
          "dino-quest",
        ],
      },
      heroes: {
        name: "Heroes & Powers",
        icon: "🦸",
        description: "Superheroes and special abilities",
        themes: [
          "animal-adventure",
        ],
      },
      mystery: {
        name: "Mystery & Puzzle",
        icon: "🔍",
        description: "Solve puzzles and unlock secrets",
        themes: [
          "dino-quest",
        ],
      },
      humor: {
        name: "Funny Stories",
        icon: "😄",
        description: "Comedy and entertaining adventures",
        themes: [
          "dino-quest",
          "goodnight-garage",
        ],
      },
    },
  },

  // Teens & Adults (12+ years)
  teens: {
    ageGroup: "12+ Years",
    ageRange: "Teens & Adults",
    icon: "👨",
    description: "Sophisticated themes for mature storytelling",
    categories: {
      adventure: {
        name: "Epic Adventures",
        icon: "⚔️",
        description: "Grand quests and legendary journeys",
        themes: [
          "animal-adventure",
          "dino-quest",
        ],
      },
      fantasy: {
        name: "Fantasy Realms",
        icon: "🏰",
        description: "Magical kingdoms and epic fantasy",
        themes: [
          "unicorn-magic",
        ],
      },
      scifi: {
        name: "Sci-Fi & Future",
        icon: "🚀",
        description: "Space exploration and futuristic worlds",
        themes: [
          "dino-quest",
        ],
      },
      mystery: {
        name: "Mystery & Thriller",
        icon: "🔎",
        description: "Intriguing puzzles and suspense",
        themes: [
          "dino-quest",
        ],
      },
      celebration: {
        name: "Celebrations",
        icon: "🎉",
        description: "Special occasions and memorable moments",
        themes: [
          "family-celebration",
          "birthday-bash",
          "festive-gathering",
        ],
      },
      milestone: {
        name: "Milestone Stories",
        icon: "🎓",
        description: "Achievement and personal growth",
        themes: [
          "family-celebration",
        ],
      },
      tribute: {
        name: "Heartfelt Tributes",
        icon: "💝",
        description: "Love, family, and cherished memories",
        themes: [
          "heartfelt-tribute",
          "family-celebration",
        ],
      },
      special: {
        name: "Special Events",
        icon: "⭐",
        description: "Weddings, graduations, and special moments",
        themes: [
          "birthday-bash",
          "festive-gathering",
          "baby-shower",
        ],
      },
    },
  },
};

const AGE_GROUP_THEME_CATEGORIES = {
  "0-2": {
    ageGroup: "0-2 Years",
    ageRange: "Infants",
    icon: "👶",
    description:
      "Simple visual worlds for first words, colors, and soothing repetition.",
    categories: {
      colors_shapes: {
        name: "Colors & Shapes",
        icon: "🎨",
        description:
          "Bright, simple visual scenes that feel easy for infants to follow.",
        themes: ["shape-garden", "color-rainbow"],
      },
      letters_numbers: {
        name: "Alphabets & Numbers",
        icon: "🔠",
        description:
          "Early-learning themes built around letter play, counting, and cheerful repetition.",
        themes: ["alphabet-parade", "number-train"],
      },
      first_animals: {
        name: "First Animals",
        icon: "🐻",
        description:
          "Gentle animal-led books that work well for early recognition and naming.",
        themes: ["animal-adventure"],
      },
      milestones: {
        name: "Infant Milestones",
        icon: "🍼",
        description:
          "Keepsake themes for proud firsts like a first tooth, first walk, sitting up, and first speech.",
        themes: [
          "first-tooth-tale",
          "first-steps-cheer",
          "first-words-wonder",
        ],
      },
      calm_bedtime: {
        name: "Calm & Bedtime",
        icon: "🌙",
        description:
          "Warm, cozy story worlds for soothing routines and bedtime reading.",
        themes: ["goodnight-garage"],
      },
      custom: {
        name: "Build Your Own",
        icon: "✨",
        description:
          "Write your own simple direction if you want something more specific.",
        themes: ["customizable"],
      },
    },
  },
  "3-5": {
    ageGroup: "3-5 Years",
    ageRange: "Toddlers & Preschool",
    icon: "🧒",
    description:
      "Playful categories for fairytales, milestones, confidence, and animal fun.",
    categories: {
      fairytale_magic: {
        name: "Fairytale & Magic",
        icon: "🦄",
        description:
          "Sparkly, imaginative worlds that feel dreamy and magical.",
        themes: ["unicorn-magic"],
      },
      milestone_stories: {
        name: "Milestone Stories",
        icon: "🎉",
        description:
          "Pair these books with the milestone selector above for birthdays, first school days, and sibling moments.",
        themes: ["milestone-magic"],
      },
      confidence_behaviour: {
        name: "Confidence & Behaviour",
        icon: "💛",
        description:
          "Gentle stories that support bravery, listening, growth, and positive behaviour.",
        themes: ["brave-little-hero"],
      },
      animals_dinos: {
        name: "Animals & Dinos",
        icon: "🦖",
        description:
          "Friendly creature adventures with motion, excitement, and discovery.",
        themes: ["animal-adventure", "dino-quest"],
      },
      custom: {
        name: "Build Your Own",
        icon: "✨",
        description:
          "Describe a custom world if you want something outside the preset groups.",
        themes: ["customizable"],
      },
    },
  },
  "5-8": {
    ageGroup: "5-8 Years",
    ageRange: "Early Readers",
    icon: "🧭",
    description:
      "Adventure-led categories for kids who love action, humor, and magical quests.",
    categories: {
      adventure_quests: {
        name: "Adventure & Quests",
        icon: "🗺️",
        description:
          "Big journeys, discoveries, and brave little hero moments.",
        themes: ["animal-adventure", "dino-quest"],
      },
      fantasy_magic: {
        name: "Fantasy & Magic",
        icon: "🔮",
        description:
          "Whimsical stories with imagination, wonder, and enchanted settings.",
        themes: ["unicorn-magic"],
      },
      growth_confidence: {
        name: "Growth & Confidence",
        icon: "🌟",
        description:
          "Storylines that support courage, routines, and building self-belief.",
        themes: ["animal-adventure", "goodnight-garage"],
      },
      playful_fun: {
        name: "Playful & Funny",
        icon: "😄",
        description:
          "Lighter stories with humor, movement, and playful energy.",
        themes: ["dino-quest", "goodnight-garage"],
      },
      custom: {
        name: "Build Your Own",
        icon: "✨",
        description:
          "Open-ended worldbuilding for families who want a custom theme.",
        themes: ["customizable"],
      },
    },
  },
  "8-12": {
    ageGroup: "8-12 Years",
    ageRange: "Older Kids",
    icon: "🚀",
    description:
      "More aspirational categories for epic adventures, courage, and imagination.",
    categories: {
      epic_adventure: {
        name: "Epic Adventure",
        icon: "⚔️",
        description:
          "Bigger quests, stronger stakes, and action-forward storytelling.",
        themes: ["dino-quest", "animal-adventure"],
      },
      fantasy_worlds: {
        name: "Fantasy Worlds",
        icon: "🏰",
        description:
          "Magical lands, wonder, and imaginative journeys with heart.",
        themes: ["unicorn-magic"],
      },
      courage_growth: {
        name: "Courage & Growth",
        icon: "🔥",
        description:
          "Themes built around resilience, confidence, and personal growth.",
        themes: ["animal-adventure"],
      },
      discovery_mystery: {
        name: "Discovery & Mystery",
        icon: "🔍",
        description:
          "Curious, discovery-led stories that feel exploratory and adventurous.",
        themes: ["dino-quest"],
      },
      custom: {
        name: "Build Your Own",
        icon: "✨",
        description:
          "Use a custom concept if the child wants a very specific world.",
        themes: ["customizable"],
      },
    },
  },
  "12+": {
    ageGroup: "12+ Years",
    ageRange: "Teens & Adults",
    icon: "🎁",
    description:
      "Keepsake-quality categories for celebrations, milestones, and heartfelt gifts.",
    categories: {
      celebrations_gifts: {
        name: "Celebrations & Gifts",
        icon: "🎊",
        description:
          "Birthday, family, and gathering themes designed for polished gift books.",
        themes: ["family-celebration", "birthday-bash", "festive-gathering"],
      },
      milestones_achievements: {
        name: "Milestones & Achievements",
        icon: "🏆",
        description:
          "Achievement-led books for promotions, major events, and proud life moments.",
        themes: ["promotion", "baby-shower", "gender-reveal"],
      },
      love_tribute: {
        name: "Love & Tribute",
        icon: "💖",
        description:
          "Premium tribute stories for gratitude, romance, and meaningful relationships.",
        themes: ["heartfelt-tribute", "anniversary", "valentine-day"],
      },
      family_bonds: {
        name: "Family Bonds",
        icon: "🤝",
        description:
          "Warm family-centered books for siblings, togetherness, and shared memories.",
        themes: ["siblings", "family-celebration"],
      },
      custom: {
        name: "Build Your Own",
        icon: "✨",
        description:
          "Create a custom premium story direction when you want full control.",
        themes: ["customizable"],
      },
    },
  },
};

const LEGACY_THEME_CATEGORY_AGE_GROUP_MAP = {
  infants: "0-2",
  toddlers: "3-5",
  children: "5-8",
  preteens: "8-12",
  teens: "12+",
  adults: "12+",
  "2-5": "3-5",
  "6-11": "5-8",
};

export function normalizeThemeCategoryAgeGroup(ageGroup) {
  const normalizedAgeGroup = String(ageGroup || "").trim();

  if (AGE_GROUP_THEME_CATEGORIES[normalizedAgeGroup]) {
    return normalizedAgeGroup;
  }

  return LEGACY_THEME_CATEGORY_AGE_GROUP_MAP[normalizedAgeGroup] || "3-5";
}

function getConfiguredThemeIdsForAgeGroup(ageGroup) {
  const normalizedAgeGroup = normalizeThemeCategoryAgeGroup(ageGroup);
  const categories =
    AGE_GROUP_THEME_CATEGORIES[normalizedAgeGroup]?.categories || {};
  const orderedThemeIds = [];

  Object.values(categories).forEach((category) => {
    category.themes.forEach((themeId) => {
      if (!orderedThemeIds.includes(themeId)) {
        orderedThemeIds.push(themeId);
      }
    });
  });

  return orderedThemeIds;
}

/**
 * Get all categories for an age group
 * @param {string} ageGroup - Age group key such as 0-2, 3-5, 5-8, 8-12, or 12+
 * @returns {object} Categories with themes for that age group
 */
export function getCategoriesByAgeGroup(ageGroup) {
  const normalizedAgeGroup = normalizeThemeCategoryAgeGroup(ageGroup);
  const ageGroupData = AGE_GROUP_THEME_CATEGORIES[normalizedAgeGroup];
  return ageGroupData ? ageGroupData.categories : {};
}

/**
 * Get all themes for a specific category and age group
 * @param {string} ageGroup - Age group key
 * @param {string} categoryKey - Category key
 * @returns {object[]} Array of theme objects
 */
export function getThemesByCategory(ageGroup, categoryKey) {
  const categoryData = getCategoriesByAgeGroup(ageGroup)?.[categoryKey];
  if (!categoryData) return [];

  return categoryData.themes
    .map((themeId) => BOOK_THEME_MAP[themeId])
    .filter(Boolean);
}

/**
 * Get all age groups with their metadata
 * @returns {object} Age groups organized by group
 */
export function getAllAgeGroups() {
  return Object.entries(AGE_GROUP_THEME_CATEGORIES).map(([key, data]) => ({
    key,
    ageGroup: data.ageGroup,
    ageRange: data.ageRange,
    icon: data.icon,
    description: data.description,
    categoryCount: Object.keys(data.categories).length,
  }));
}

/**
 * Get recommended themes for an age group
 * @param {string} ageGroup - Age group key
 * @returns {object[]} Array of popular themes
 */
export function getRecommendedThemesForAgeGroup(ageGroup) {
  const categories = getCategoriesByAgeGroup(ageGroup);
  const themeSet = new Set();

  // Get first few themes from each category
  Object.values(categories).forEach((category) => {
    category.themes.slice(0, 2).forEach((theme) => themeSet.add(theme));
  });

  return Array.from(themeSet)
    .map((themeId) => BOOK_THEME_MAP[themeId])
    .filter(Boolean)
    .slice(0, 6);
}

/**
 * Get category info for a specific category
 * @param {string} ageGroup - Age group key
 * @param {string} categoryKey - Category key
 * @returns {object} Category information
 */
export function getCategoryInfo(ageGroup, categoryKey) {
  return getCategoriesByAgeGroup(ageGroup)?.[categoryKey] || null;
}
