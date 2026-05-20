/**
 * Tests for lib/imageQuality.js
 */

// We mock global fetch so no real HTTP calls happen in tests
global.fetch = jest.fn();

import { checkImageQuality } from '@/lib/imageQuality';

const VALID_IMAGE_URL = 'https://cdn.example.com/story/page-1.png';
const SVG_DATA_URL = 'data:image/svg+xml,<svg></svg>';

function mockHeadOk({ contentType = 'image/png', contentLength = 50000 } = {}) {
  global.fetch.mockResolvedValue({
    ok: true,
    headers: {
      get: (key) => {
        if (key === 'content-type') return contentType;
        if (key === 'content-length') return String(contentLength);
        return null;
      },
    },
  });
}

function mockHeadFail() {
  global.fetch.mockResolvedValue({ ok: false });
}

beforeEach(() => {
  jest.clearAllMocks();
  // Default: no OPENAI_API_KEY so vision check is soft-skipped
  delete process.env.OPENAI_API_KEY;
});

describe('checkImageQuality', () => {
  it('passes for a valid accessible image', async () => {
    mockHeadOk();
    const result = await checkImageQuality(VALID_IMAGE_URL);
    expect(result.passed).toBe(true);
  });

  it('fails for a missing/undefined URL', async () => {
    const result = await checkImageQuality(undefined);
    expect(result.passed).toBe(false);
    expect(result.reason).toBe('missing_url');
  });

  it('fails for an empty string URL', async () => {
    const result = await checkImageQuality('');
    expect(result.passed).toBe(false);
    expect(result.reason).toBe('missing_url');
  });

  it('fails for an SVG data-URL placeholder', async () => {
    const result = await checkImageQuality(SVG_DATA_URL);
    expect(result.passed).toBe(false);
    expect(result.reason).toBe('svg_placeholder');
  });

  it('fails when the image URL is not accessible (404)', async () => {
    mockHeadFail();
    const result = await checkImageQuality(VALID_IMAGE_URL);
    expect(result.passed).toBe(false);
    expect(result.reason).toBe('not_accessible');
  });

  it('fails when the content-type is not an image', async () => {
    mockHeadOk({ contentType: 'text/html' });
    const result = await checkImageQuality(VALID_IMAGE_URL);
    expect(result.passed).toBe(false);
    expect(result.reason).toBe('wrong_content_type');
  });

  it('fails when image file is too small (below 5 KB)', async () => {
    // First HEAD call (accessible check) passes; second (size check) returns tiny file
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (key) =>
            key === 'content-type' ? 'image/png' : null,
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (key) => {
            if (key === 'content-type') return 'image/png';
            if (key === 'content-length') return '100'; // 100 bytes – too small
            return null;
          },
        },
      });

    const result = await checkImageQuality(VALID_IMAGE_URL);
    expect(result.passed).toBe(false);
    expect(result.reason).toBe('image_too_small');
  });

  it('soft-passes when fetch throws (network error)', async () => {
    // accessible check fails → not_accessible
    global.fetch.mockRejectedValue(new Error('network error'));
    const result = await checkImageQuality(VALID_IMAGE_URL);
    expect(result.passed).toBe(false);
    expect(result.reason).toBe('not_accessible');
  });

  it('includes page number in logs (opts.pageNumber)', async () => {
    mockHeadOk();
    // Spy on console.log to verify tag
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await checkImageQuality(VALID_IMAGE_URL, { pageNumber: 3 });
    const calls = logSpy.mock.calls.map((args) => args.join(' '));
    expect(calls.some((c) => c.includes('page=3'))).toBe(true);
    logSpy.mockRestore();
  });
});
