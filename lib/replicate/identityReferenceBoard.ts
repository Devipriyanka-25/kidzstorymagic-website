import sharp from "sharp";

const MAX_REFERENCE_IMAGES = 2;
const TILE_SIZE = 640;
const TILE_SUBJECT_SIZE = 520;
const TILE_GAP = 24;
const TILE_PADDING = 28;
const BOARD_BACKGROUND = { r: 247, g: 243, b: 236 };
const FACE_TILE_VARIANTS = [
  { kind: "tight-face", cropScalePortrait: 0.22, cropScaleLandscape: 0.24, topBias: 0.015, fadeLowerBody: false },
  { kind: "head-and-shoulders", cropScalePortrait: 0.3, cropScaleLandscape: 0.38, topBias: 0.02, fadeLowerBody: true },
  { kind: "upper-body-outfit", cropScalePortrait: 0.56, cropScaleLandscape: 0.78, topBias: 0.02, fadeLowerBody: false },
];

function buildLowerFadeMask(size: number): Buffer {
  return Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="white" stop-opacity="1"/>
          <stop offset="56%" stop-color="white" stop-opacity="1"/>
          <stop offset="78%" stop-color="white" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="white" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#fade)"/>
    </svg>`
  );
}

function isDataUrl(value: string): boolean {
  return /^data:image\//i.test(String(value || "").trim());
}

function parseDataUrlBuffer(value: string): Buffer {
  const [, payload = ""] = String(value || "").split(",");

  if (!payload) {
    throw new Error("The provided reference image data URL is invalid.");
  }

  return Buffer.from(payload, "base64");
}

async function fetchReferenceBuffer(referenceImage: string): Promise<Buffer> {
  if (isDataUrl(referenceImage)) {
    return parseDataUrlBuffer(referenceImage);
  }

  const response = await fetch(referenceImage, {
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch a child reference image (${response.status}).`
    );
  }

  return Buffer.from(await response.arrayBuffer());
}

function getFocusedCrop(
  width: number,
  height: number,
  variant = FACE_TILE_VARIANTS[0]
): { left: number; top: number; width: number; height: number } {
  if (height >= width) {
    const cropHeight = Math.min(
      height,
      Math.round(height * variant.cropScalePortrait)
    );
    const cropWidth = Math.min(width, Math.round(cropHeight * 0.82));
    const left = Math.max(0, Math.round((width - cropWidth) / 2));
    const top = Math.max(
      0,
      Math.min(height - cropHeight, Math.round(height * variant.topBias))
    );

    return {
      left,
      top,
      width: Math.max(1, cropWidth),
      height: Math.max(1, cropHeight),
    };
  }

  const cropHeight = Math.min(
    height,
    Math.round(height * variant.cropScaleLandscape)
  );
  const cropWidth = Math.min(width, Math.round(cropHeight * 0.8));
  const left = Math.max(0, Math.round((width - cropWidth) / 2));
  const top = Math.max(
    0,
    Math.min(height - cropHeight, Math.round(height * variant.topBias))
  );

  return {
    left,
    top,
    width: Math.max(1, cropWidth),
    height: Math.max(1, cropHeight),
  };
}

async function buildReferenceTile(
  referenceBuffer: Buffer,
  variant = FACE_TILE_VARIANTS[0]
): Promise<Buffer> {
  const normalized = sharp(referenceBuffer, { failOn: "none" }).rotate();
  const metadata = await normalized.metadata();
  const width = metadata.width || TILE_SIZE;
  const height = metadata.height || TILE_SIZE;
  const crop = getFocusedCrop(width, height, variant);
  const centeredPortrait = await normalized
    .extract(crop)
    .resize(TILE_SUBJECT_SIZE, TILE_SUBJECT_SIZE, {
      fit: "contain",
      background: { ...BOARD_BACKGROUND, alpha: 0 },
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();
  const maskedPortrait = variant.fadeLowerBody
    ? await sharp(centeredPortrait)
        .composite([
          {
            input: buildLowerFadeMask(TILE_SUBJECT_SIZE),
            blend: "dest-in",
          },
        ])
        .png()
        .toBuffer()
    : centeredPortrait;

  return sharp({
    create: {
      width: TILE_SIZE,
      height: TILE_SIZE,
      channels: 3,
      background: BOARD_BACKGROUND,
    },
  })
    .composite([
      {
        input: maskedPortrait,
        left: Math.round((TILE_SIZE - TILE_SUBJECT_SIZE) / 2),
        top: Math.round((TILE_SIZE - TILE_SUBJECT_SIZE) / 2),
      },
    ])
    .sharpen(0.5)
    .png()
    .toBuffer();
}

function getBoardBackground() {
  return {
    ...BOARD_BACKGROUND,
  };
}

function getBoardCanvas(tileCount: number) {
  const { columns, width, height } = getBoardDimensions(tileCount);

  return {
    board: sharp({
      create: {
        width,
        height,
        channels: 3,
        background: getBoardBackground(),
      },
    })
      .png(),
    columns,
  };
}

function getBoardDimensions(tileCount: number): {
  columns: number;
  rows: number;
  width: number;
  height: number;
} {
  const columns = tileCount === 1 ? 1 : 2;
  const rows = Math.ceil(tileCount / columns);
  const width =
    TILE_PADDING * 2 + columns * TILE_SIZE + Math.max(columns - 1, 0) * TILE_GAP;
  const height =
    TILE_PADDING * 2 + rows * TILE_SIZE + Math.max(rows - 1, 0) * TILE_GAP;

  return { columns, rows, width, height };
}

export async function buildIdentityReferenceBoard(
  referenceImages: string[]
): Promise<Buffer> {
  const normalizedImages = Array.from(
    new Set(
      (Array.isArray(referenceImages) ? referenceImages : [])
        .map((value) => String(value || "").trim())
        .filter(Boolean)
        .slice(0, MAX_REFERENCE_IMAGES)
    )
  );

  if (normalizedImages.length === 0) {
    throw new Error("At least one child reference image is required.");
  }

  const tiles: Buffer[] = [];

  for (const referenceImage of normalizedImages) {
    const referenceBuffer = await fetchReferenceBuffer(referenceImage);

    for (const variant of FACE_TILE_VARIANTS) {
      tiles.push(await buildReferenceTile(referenceBuffer, variant));
    }
  }

  if (tiles.length === 1) {
    return tiles[0];
  }

  const { board, columns } = getBoardCanvas(tiles.length);

  const composites = tiles.map((tile, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);

    return {
      input: tile,
      left: TILE_PADDING + column * (TILE_SIZE + TILE_GAP),
      top: TILE_PADDING + row * (TILE_SIZE + TILE_GAP),
    };
  });

  return board.composite(composites).png().toBuffer();
}
