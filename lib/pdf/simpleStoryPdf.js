import sharp from 'sharp';

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const PAGE_MARGIN = 64;
const BODY_FONT_SIZE = 12;
const BODY_LEADING = 16;
const MAX_BODY_LINES = 38;
const IMAGE_MAX_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
const IMAGE_MAX_HEIGHT = 330;

function escapePdfText(value = '') {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r?\n/g, ' ');
}

function normalizeText(value = '') {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function wrapText(value = '', maxChars = 78) {
  const words = normalizeText(value).split(' ').filter(Boolean);
  const lines = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [''];
}

function addTextBlock({ lines, x, y, fontSize = BODY_FONT_SIZE, leading = BODY_LEADING }) {
  const safeLines = lines.map((line) => `(${escapePdfText(line)}) Tj`).join('\nT*\n');

  return [
    'BT',
    `/F1 ${fontSize} Tf`,
    `${leading} TL`,
    `1 0 0 1 ${x} ${y} Tm`,
    safeLines,
    'ET',
  ].join('\n');
}

function buildImageCommand(image) {
  if (!image?.objectName || !image?.width || !image?.height) {
    return '';
  }

  const scale = Math.min(
    IMAGE_MAX_WIDTH / image.width,
    IMAGE_MAX_HEIGHT / image.height,
    1
  );
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);
  const x = Math.round((PAGE_WIDTH - width) / 2);
  const y = PAGE_HEIGHT - 190 - height;

  return `q\n${width} 0 0 ${height} ${x} ${y} cm\n/${image.objectName} Do\nQ`;
}

function buildPageContent({ heading, subheading = '', bodyLines = [], image = null }) {
  const imageCommand = buildImageCommand(image);
  const bodyLineLimit = imageCommand ? 13 : MAX_BODY_LINES;
  const textStartY = imageCommand
    ? Math.max(PAGE_MARGIN + MAX_BODY_LINES, PAGE_HEIGHT - 212 - Math.round(
        Math.min(IMAGE_MAX_HEIGHT, image.height || IMAGE_MAX_HEIGHT)
      ))
    : PAGE_HEIGHT - 196;
  const content = [
    addTextBlock({
      lines: wrapText(heading, 42).slice(0, 2),
      x: PAGE_MARGIN,
      y: PAGE_HEIGHT - 88,
      fontSize: 22,
      leading: 26,
    }),
  ];

  if (subheading) {
    content.push(
      addTextBlock({
        lines: wrapText(subheading, 70).slice(0, 2),
        x: PAGE_MARGIN,
        y: PAGE_HEIGHT - 148,
        fontSize: 11,
        leading: 14,
      })
    );
  }

  if (imageCommand) {
    content.push(imageCommand);
  }

  content.push(
    addTextBlock({
      lines: bodyLines.slice(0, bodyLineLimit),
      x: PAGE_MARGIN,
      y: textStartY,
      fontSize: BODY_FONT_SIZE,
      leading: BODY_LEADING,
    })
  );

  return content.join('\n');
}

function toPdfBuffer(value) {
  return Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8');
}

function serializePdfObjects(objects) {
  const chunks = [Buffer.from('%PDF-1.4\n%Kidz Story Magic\n', 'utf8')];
  let byteLength = chunks[0].length;
  const offsets = [];

  objects.forEach((body, index) => {
    const header = Buffer.from(`${index + 1} 0 obj\n`, 'utf8');
    const bodyBuffer = toPdfBuffer(body);
    const footer = Buffer.from('\nendobj\n', 'utf8');

    offsets.push(byteLength);
    chunks.push(header, bodyBuffer, footer);
    byteLength += header.length + bodyBuffer.length + footer.length;
  });

  const xrefOffset = byteLength;
  let xref = `xref\n0 ${objects.length + 1}\n`;
  xref += '0000000000 65535 f \n';
  offsets.forEach((offset) => {
    xref += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  xref += `startxref\n${xrefOffset}\n%%EOF`;
  chunks.push(Buffer.from(xref, 'utf8'));

  return Buffer.concat(chunks);
}

function getPageText(page) {
  return (
    page?.text ||
    page?.page_text ||
    page?.content ||
    ''
  );
}

function getPageImageUrl(page) {
  return (
    page?.image_url ||
    page?.imageUrl ||
    page?.image ||
    page?.illustrationUrl ||
    page?.faceSwappedUrl ||
    ''
  );
}

export function sanitizePdfFilename(value = 'story') {
  const safe = normalizeText(value)
    .replace(/[^a-z0-9-_ ]/gi, '')
    .replace(/\s+/g, '_')
    .slice(0, 80);

  return safe || 'story';
}

function decodeDataImageUrl(url) {
  const match = String(url || '').match(/^data:image\/[^;]+;base64,(.+)$/i);
  return match ? Buffer.from(match[1], 'base64') : null;
}

async function readRemoteImageBuffer(url) {
  const dataImage = decodeDataImageUrl(url);
  if (dataImage) {
    return dataImage;
  }

  if (!/^https?:\/\//i.test(String(url || ''))) {
    return null;
  }

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Image fetch failed with ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function buildPdfImageAsset(url) {
  if (!url) {
    return null;
  }

  try {
    const sourceBuffer = await readRemoteImageBuffer(url);
    if (!sourceBuffer) {
      return null;
    }

    const { data, info } = await sharp(sourceBuffer)
      .rotate()
      .resize({
        width: 1000,
        height: 720,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 88 })
      .toBuffer({ resolveWithObject: true });

    return {
      data,
      width: info.width,
      height: info.height,
    };
  } catch (error) {
    console.warn('[PDF] Skipping illustration embed:', {
      imageUrl: url,
      error: error?.message || error,
    });
    return null;
  }
}

function buildImageObject(imageAsset) {
  return Buffer.concat([
    Buffer.from(
      [
        '<< /Type /XObject',
        '/Subtype /Image',
        `/Width ${imageAsset.width}`,
        `/Height ${imageAsset.height}`,
        '/ColorSpace /DeviceRGB',
        '/BitsPerComponent 8',
        '/Filter /DCTDecode',
        `/Length ${imageAsset.data.length}`,
        '>>',
        'stream',
        '',
      ].join('\n'),
      'utf8'
    ),
    imageAsset.data,
    Buffer.from('\nendstream', 'utf8'),
  ]);
}

export function buildStoryPdfBuffer({ story = {}, pages = [], pageImages = [] } = {}) {
  const title = story.title || `${story.child_name || story.childName || 'Child'}'s Story`;
  const childName = story.child_name || story.childName || 'Story Friend';
  const theme = story.theme || 'storybook';
  const objects = [];
  const pageObjectIds = [];

  objects[0] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[1] = '';
  objects[2] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

  const coverLines = [
    `A personalized storybook for ${childName}.`,
    `Theme: ${theme}`,
    '',
    'This paid PDF download is fully unlocked.',
  ];
  const allPagePayloads = [
    {
      heading: title,
      subheading: 'Kidz Story Magic',
      bodyLines: coverLines,
    },
    ...(Array.isArray(pages) ? pages : []).map((page, index) => {
      const pageNumber = page?.pageNumber || page?.page_number || index + 1;
      const heading = page?.title || page?.page_title || `Page ${pageNumber}`;
      const bodyLines = wrapText(getPageText(page), 78);
      const imageUrl = getPageImageUrl(page);

      if (imageUrl && !pageImages[index]) {
        bodyLines.push('', `Illustration: ${imageUrl}`);
      }

      return {
        heading,
        subheading: `Page ${pageNumber}`,
        bodyLines,
        imageAsset: pageImages[index] || null,
      };
    }),
  ];

  allPagePayloads.forEach((payload) => {
    let imageReference = null;

    if (payload.imageAsset) {
      const imageObjectId = objects.length + 1;
      const objectName = `Im${pageObjectIds.length + 1}`;
      objects.push(buildImageObject(payload.imageAsset));
      imageReference = {
        objectId: imageObjectId,
        objectName,
        width: payload.imageAsset.width,
        height: payload.imageAsset.height,
      };
    }

    const content = buildPageContent({
      ...payload,
      image: imageReference,
    });
    const contentObjectId = objects.length + 1;
    objects.push(`<< /Length ${Buffer.byteLength(content, 'utf8')} >>\nstream\n${content}\nendstream`);

    const pageObjectId = objects.length + 1;
    const xObjectResources = imageReference
      ? ` /XObject << /${imageReference.objectName} ${imageReference.objectId} 0 R >>`
      : '';
    objects.push(
      [
        '<< /Type /Page',
        '/Parent 2 0 R',
        `/MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}]`,
        `/Resources << /Font << /F1 3 0 R >>${xObjectResources} >>`,
        `/Contents ${contentObjectId} 0 R`,
        '>>',
      ].join('\n')
    );
    pageObjectIds.push(pageObjectId);
  });

  objects[1] = `<< /Type /Pages /Kids [${pageObjectIds
    .map((id) => `${id} 0 R`)
    .join(' ')}] /Count ${pageObjectIds.length} >>`;

  return serializePdfObjects(objects);
}

export async function buildStoryPdfBufferWithImages({ story = {}, pages = [] } = {}) {
  const pageImages = await Promise.all(
    (Array.isArray(pages) ? pages : []).map((page) =>
      buildPdfImageAsset(getPageImageUrl(page))
    )
  );

  return buildStoryPdfBuffer({ story, pages, pageImages });
}
