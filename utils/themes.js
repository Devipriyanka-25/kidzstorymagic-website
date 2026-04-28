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
  const isAdultAudience = String(ageGroup || "").trim() === "12+";

  return STORY_THEMES.filter((theme) => {
    if (theme.value === "customizable") {
      return true;
    }

    if (isAdultAudience) {
      return ADULT_BOOK_THEME_VALUES.has(theme.value);
    }

    return !ADULT_BOOK_THEME_VALUES.has(theme.value);
  });
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
