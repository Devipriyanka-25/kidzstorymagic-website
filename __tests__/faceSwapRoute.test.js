/** @jest-environment node */

jest.mock('../app/api/lib/replicateService.js', () => ({
  faceSwapWithReplicate: jest.fn(),
}));

jest.mock('../app/api/lib/deepaiService.js', () => ({
  faceSwapWithDeepAI: jest.fn(),
}));

jest.mock('../app/api/lib/dataUrlToUrlConverter.js', () => ({
  convertDataUrlToHttpUrl: jest.fn(),
}));

const { faceSwapWithReplicate } = require('../app/api/lib/replicateService.js');
const { convertDataUrlToHttpUrl } = require('../app/api/lib/dataUrlToUrlConverter.js');
const { POST } = require('../app/api/photos/face-swap/route.js');

function createRequest(body, host = 'www.kidzstorymagic.org') {
  return {
    json: jest.fn().mockResolvedValue(body),
    headers: {
      get: jest.fn().mockReturnValue(host),
    },
  };
}

describe('/api/photos/face-swap route', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.DEEPAI_API_KEY;
    process.env.REPLICATE_API_TOKEN = 'test-token';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('passes data URLs directly to Replicate and keeps success payload shape', async () => {
    faceSwapWithReplicate.mockResolvedValue({
      resultUrl: 'https://cdn.example.com/swapped.png',
      predictionId: 'pred_123',
      processedAt: '2026-01-01T00:00:00.000Z',
      model: 'model:v1',
      provider: 'replicate',
    });

    const faceDataUrl = 'data:image/png;base64,ZmFrZQ==';
    const illustrationDataUrl = 'data:image/png;base64,aW1hZ2U=';

    const response = await POST(
      createRequest({
        faceImageUrl: faceDataUrl,
        illustrationImageUrl: illustrationDataUrl,
        pageNumber: 2,
        childName: 'Ava',
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(faceSwapWithReplicate).toHaveBeenCalledWith(
      faceDataUrl,
      illustrationDataUrl
    );
    expect(convertDataUrlToHttpUrl).not.toHaveBeenCalled();
    expect(payload.swappedUrl).toBe('https://cdn.example.com/swapped.png');
    expect(payload.result.swappedImageUrl).toBe(
      'https://cdn.example.com/swapped.png'
    );
  });

  it('returns 422 with fallback payload for unsupported non-public URL inputs', async () => {
    const illustrationImageUrl = 'https://cdn.example.com/illustration.png';
    const response = await POST(
      createRequest({
        faceImageUrl: 'blob:https://kidzstorymagic.org/1234',
        illustrationImageUrl,
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(422);
    expect(faceSwapWithReplicate).not.toHaveBeenCalled();
    expect(payload.error).toBe('Unsupported image input');
    expect(payload.swappedUrl).toBe(illustrationImageUrl);
    expect(payload.result.swappedImageUrl).toBe(illustrationImageUrl);
  });

  it('returns a controlled non-500 fallback response when providers fail', async () => {
    faceSwapWithReplicate.mockRejectedValue(new Error('Replicate failed'));
    const illustrationImageUrl = 'https://cdn.example.com/page.png';

    const response = await POST(
      createRequest({
        faceImageUrl: 'https://cdn.example.com/face.png',
        illustrationImageUrl,
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload.error).toBe('Face swap unavailable');
    expect(payload.swappedUrl).toBe(illustrationImageUrl);
    expect(payload.result.swappedImageUrl).toBe(illustrationImageUrl);
    expect(payload.providerErrors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          provider: 'replicate',
          error: expect.stringContaining('Replicate failed'),
        }),
      ])
    );
  });
});
