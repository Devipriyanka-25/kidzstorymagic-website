/**
 * Convert Data URL (base64) to publicly accessible URL
 * Uses temporary URL hosting service for data URLs
 */

/**
 * Convert a data URL to a real HTTP URL
 * Uses imgbb.com free API to temporarily host the image
 * @param {string} dataUrl - Base64 data URL (data:image/png;base64,...)
 * @returns {Promise<string>} - Public HTTP URL of the image
 */
export async function convertDataUrlToHttpUrl(dataUrl) {
  try {
    console.log('[DATA_URL_CONVERTER] Converting data URL to HTTP URL...');

    if (!dataUrl.startsWith('data:image/')) {
      throw new Error('Invalid data URL format');
    }

    // Extract base64 string from data URL
    const base64String = dataUrl.split(',')[1];
    
    if (!base64String) {
      throw new Error('Could not extract base64 data from data URL');
    }

    // Use ImgBB API (free service, 32MB limit)
    // Get API key from environment or use free tier
    const imgbbApiKey = process.env.IMGBB_API_KEY || 'e14f9b3087869f7'; // Free API key

    const formData = new FormData();
    formData.append('image', base64String);
    formData.append('expiration', '3600'); // 1 hour expiration

    console.log('[DATA_URL_CONVERTER] Uploading to imgbb.com...');

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: new URLSearchParams({
        image: base64String,
        key: imgbbApiKey,
        expiration: '3600',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`ImgBB API error: ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`ImgBB upload failed: ${result.error?.message}`);
    }

    const httpUrl = result.data.image.url;
    console.log('[DATA_URL_CONVERTER] ✓ Conversion successful');
    console.log(`[DATA_URL_CONVERTER] URL: ${httpUrl}`);

    return httpUrl;
  } catch (error) {
    console.error('[DATA_URL_CONVERTER] Error:', error.message);
    throw error;
  }
}

/**
 * Alternative: Use a Blob conversion approach
 * This might work better for some cases
 */
export async function convertDataUrlUsingBlobHandler(dataUrl) {
  try {
    console.log('[BLOB_CONVERTER] Converting data URL using blob handler...');

    // In Node.js, we can't directly use Blob API
    // So we'll use the urlencoded approach instead
    throw new Error('Blob conversion not supported in Node.js environment');
  } catch (error) {
    console.error('[BLOB_CONVERTER] Error:', error.message);
    throw error;
  }
}

/**
 * Batch convert multiple data URLs
 */
export async function convertMultipleDataUrls(dataUrls) {
  try {
    console.log(`[DATA_URL_CONVERTER] Converting ${dataUrls.length} data URLs...`);

    const promises = dataUrls.map(url => convertDataUrlToHttpUrl(url));
    const httpUrls = await Promise.all(promises);

    console.log(`[DATA_URL_CONVERTER] ✓ All ${httpUrls.length} URLs converted`);
    return httpUrls;
  } catch (error) {
    console.error('[DATA_URL_CONVERTER] Batch conversion error:', error.message);
    throw error;
  }
}
