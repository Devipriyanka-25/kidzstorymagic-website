import sharp from "sharp";

const MAX_REFERENCE_IMAGES = 4;
const TILE_SIZE = 640;
const TILE_GAP = 24;
const TILE_PADDING = 28;

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
  height: number
): { left: number; top: number; width: number; height: number } {
  if (height >= width) {
    const cropWidth = Math.min(width, Math.round(height * 0.62));
    const cropHeight = Math.min(height, Math.round(cropWidth * 1.14));
    const left = Math.max(0, Math.round((width - cropWidth) / 2));
    const top = Math.max(
      0,
      Math.min(height - cropHeight, Math.round(height * 0.06))
    );

    return {
      left,
      top,
      width: Math.max(1, cropWidth),
      height: Math.max(1, cropHeight),
    };
  }

  const cropHeight = Math.min(height, Math.round(width * 0.8));
  const cropWidth = Math.min(width, Math.round(cropHeight * 0.92));
  const left = Math.max(0, Math.round((width - cropWidth) / 2));
  const top = Math.max(
    0,
    Math.min(height - cropHeight, Math.round(height * 0.05))
  );

  return {
    left,
    top,
    width: Math.max(1, cropWidth),
    height: Math.max(1, cropHeight),
  };
}

async function buildReferenceTile(referenceBuffer: Buffer): Promise<Buffer> {
  const normalized = sharp(referenceBuffer, { failOn: "none" }).rotate();
  const metadata = await normalized.metadata();
  const width = metadata.width || TILE_SIZE;
  const height = metadata.height || TILE_SIZE;
  const crop = getFocusedCrop(width, height);

  return normalized
    .extract(crop)
    .resize(TILE_SIZE, TILE_SIZE, {
      fit: "cover",
      position: sharp.strategy.attention,
    })
    .png()
    .toBuffer();
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

  const tiles = await Promise.all(
    normalizedImages.map(async (referenceImage) =>
      buildReferenceTile(await fetchReferenceBuffer(referenceImage))
    )
  );

  if (tiles.length === 1) {
    return tiles[0];
  }

  const { columns, width, height } = getBoardDimensions(tiles.length);
  const board = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 247, g: 243, b: 236 },
    },
  });

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
