/**
 * Convert Data URL (base64) to publicly accessible URL
 * Uses multiple fallback services for reliability
 */

/**
 * Convert a data URL to a real HTTP URL
 * Tries multiple services in order of reliability
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

    // Try services in order
    const services = [
      { name: 'transfer.sh', fn: () => uploadToTransferSh(buffer) },
      { name: 'file.io', fn: () => uploadToFileIo(buffer) },
      { name: 'temp-file', fn: () => uploadToTempFile(buffer) },
    ];

    let lastError;
    for (const service of services) {
      try {
        console.log(`[DATA_URL_CONVERTER] Trying ${service.name}...`);
        const url = await service.fn();
        console.log(`[DATA_URL_CONVERTER] ✓ Upload successful via ${service.name}`);
        return url;
      } catch (error) {
        console.warn(`[DATA_URL_CONVERTER] ${service.name} failed:`, error.message);
        lastError = error;
      }
    }

    throw lastError || new Error('All data URL conversion services failed');
  } catch (error) {
    console.error('[DATA_URL_CONVERTER] Error:', error.message);
    throw error;
  }
}

/**
 * Upload binary buffer to transfer.sh with timeout
 */
async function uploadToTransferSh(buffer) {
  try {
    const filename = `face-swap-${Date.now()}.png`;
    const uploadUrl = `https://transfer.sh/${filename}`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/png',
        'Max-Downloads': '50',
        'Max-Days': '1',
      },
      body: buffer,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text().catch(() => response.statusText);
      throw new Error(`transfer.sh ${response.status}: ${error}`);
    }

    const url = await response.text();
    const trimmedUrl = url.trim();
    
    if (!trimmedUrl.startsWith('http')) {
      throw new Error(`Invalid URL: ${trimmedUrl}`);
    }

    return trimmedUrl;
  } catch (error) {
    throw new Error(`transfer.sh error: ${error.message}`);
  }
}

/**
 * Upload to file.io (alternative service)
 */
async function uploadToFileIo(buffer) {
  try {
    const formData = new URLSearchParams();
    formData.append('file', buffer.toString('base64'));
    
    const response = await fetch('https://file.io/?expires=1h', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`file.io ${response.status}`);
    }

    const data = await response.json();
    if (!data.link) {
      throw new Error('No link in response');
    }

    return data.link;
  } catch (error) {
    throw new Error(`file.io error: ${error.message}`);
  }
}

/**
 * Upload to temp-file service (fallback)
 */
async function uploadToTempFile(buffer) {
  try {
    const response = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: buffer,
    });

    if (!response.ok) {
      throw new Error(`tmpfiles ${response.status}`);
    }

    const data = await response.json();
    if (!data.data?.file?.url?.short_url) {
      throw new Error('Invalid response format');
    }

    return data.data.file.url.short_url;
  } catch (error) {
    throw new Error(`tmpfiles error: ${error.message}`);
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
