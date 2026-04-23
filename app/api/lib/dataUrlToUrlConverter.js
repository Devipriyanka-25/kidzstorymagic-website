/**
 * Convert Data URL (base64) to publicly accessible URL
 * Uses free image hosting services
 */

/**
 * Convert a data URL to a real HTTP URL
 * Uses imgur or similar free service
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

    // Try multiple free services in order
    const services = [
      () => uploadToFreeService1(base64String),
      () => uploadToFreeService2(base64String),
      () => uploadToFreeService3(base64String),
    ];

    let lastError;
    for (const service of services) {
      try {
        const url = await service();
        console.log('[DATA_URL_CONVERTER] ✓ Conversion successful');
        console.log(`[DATA_URL_CONVERTER] URL: ${url}`);
        return url;
      } catch (error) {
        console.warn(`[DATA_URL_CONVERTER] Service failed:`, error.message);
        lastError = error;
        // Try next service
      }
    }

    // If all services fail, throw the last error
    throw lastError || new Error('All data URL conversion services failed');
  } catch (error) {
    console.error('[DATA_URL_CONVERTER] Error:', error.message);
    throw error;
  }
}

/**
 * Try uploading to postimage.cc (no authentication required)
 */
async function uploadToFreeService1(base64String) {
  try {
    console.log('[DATA_URL_CONVERTER] Trying postimage.cc...');
    
    // Convert base64 to Buffer
    const buffer = Buffer.from(base64String, 'base64');
    
    const formData = new URLSearchParams();
    formData.append('image', buffer.toString('base64'));
    
    const response = await fetch('https://postimages.org/api/1/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`postimage.cc error: ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.image?.url) {
      throw new Error('No URL in postimage.cc response');
    }

    return result.image.url;
  } catch (error) {
    throw new Error(`postimage.cc failed: ${error.message}`);
  }
}

/**
 * Try uploading to transfer.sh (no authentication, simple endpoint)
 */
async function uploadToFreeService2(base64String) {
  try {
    console.log('[DATA_URL_CONVERTER] Trying transfer.sh...');
    
    // Convert base64 to Buffer
    const buffer = Buffer.from(base64String, 'base64');
    
    const filename = `image-${Date.now()}.png`;
    
    const response = await fetch(`https://transfer.sh/${filename}`, {
      method: 'PUT',
      body: buffer,
      headers: {
        'Content-Type': 'image/png',
      },
    });

    if (!response.ok) {
      throw new Error(`transfer.sh error: ${response.statusText}`);
    }

    const url = await response.text();
    return url.trim();
  } catch (error) {
    throw new Error(`transfer.sh failed: ${error.message}`);
  }
}

/**
 * Try uploading to catbox.moe (no authentication, simple endpoint)
 */
async function uploadToFreeService3(base64String) {
  try {
    console.log('[DATA_URL_CONVERTER] Trying catbox.moe...');
    
    // Convert base64 to Buffer
    const buffer = Buffer.from(base64String, 'base64');
    
    const formDataToSend = new URLSearchParams();
    formDataToSend.append('reqtype', 'fileupload');
    formDataToSend.append('fileToUpload', buffer.toString('base64'));
    
    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formDataToSend,
    });

    if (!response.ok) {
      throw new Error(`catbox.moe error: ${response.statusText}`);
    }

    const url = await response.text();
    if (!url.startsWith('http')) {
      throw new Error('Invalid URL from catbox.moe');
    }

    return url.trim();
  } catch (error) {
    throw new Error(`catbox.moe failed: ${error.message}`);
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
