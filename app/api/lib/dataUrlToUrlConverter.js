/**
 * Convert Data URL (base64) to publicly accessible URL
 * Uses simple HTTP PUT/POST to transfer.sh
 */

/**
 * Convert a data URL to a real HTTP URL
 * Uses transfer.sh with direct binary upload (most reliable)
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

    // Convert base64 to Buffer (binary data)
    let buffer;
    try {
      buffer = Buffer.from(base64String, 'base64');
    } catch (error) {
      throw new Error(`Failed to convert base64 to buffer: ${error.message}`);
    }

    console.log(`[DATA_URL_CONVERTER] Buffer size: ${buffer.length} bytes`);

    // Use transfer.sh - simple file upload service (supports PUT with binary)
    return await uploadToTransferSh(buffer);
  } catch (error) {
    console.error('[DATA_URL_CONVERTER] Error:', error.message);
    throw error;
  }
}

/**
 * Upload binary buffer to transfer.sh
 * This is the most reliable service for binary uploads
 */
async function uploadToTransferSh(buffer) {
  try {
    console.log('[DATA_URL_CONVERTER] Uploading to transfer.sh...');
    
    const filename = `face-swap-${Date.now()}.png`;
    const uploadUrl = `https://transfer.sh/${filename}`;
    
    // Use PUT method with binary data
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/png',
        'Max-Downloads': '50', // Allow multiple downloads
        'Max-Days': '1', // Keep for 1 day
      },
      body: buffer,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`transfer.sh error ${response.status}: ${error || response.statusText}`);
    }

    const url = await response.text();
    const trimmedUrl = url.trim();
    
    if (!trimmedUrl.startsWith('http')) {
      throw new Error(`Invalid URL from transfer.sh: ${trimmedUrl}`);
    }

    console.log('[DATA_URL_CONVERTER] ✓ Upload successful');
    console.log(`[DATA_URL_CONVERTER] URL: ${trimmedUrl}`);

    return trimmedUrl;
  } catch (error) {
    console.error('[DATA_URL_CONVERTER] transfer.sh failed:', error.message);
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
