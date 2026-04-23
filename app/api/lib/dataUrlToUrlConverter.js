/**
 * Convert Data URL (base64) to publicly accessible URL
 * Uses local file storage + public serving for maximum reliability
 */

import fs from 'fs';
import path from 'path';

// Use a simple approach that works with Next.js
const publicDir = path.join(process.cwd(), 'public/temp-faces');

// Ensure temp directory exists
try {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
} catch (err) {
  console.warn('[DATA_URL_CONVERTER] Could not create temp directory:', err.message);
}

/**
 * Convert a data URL to a real HTTP URL
 * Tries local file storage first, then fallback services
 * @param {string} dataUrl - Base64 data URL (data:image/png;base64,...)
 * @param {string} host - Request host for building absolute URL
 * @returns {Promise<string>} - Public HTTP URL of the image
 */
export async function convertDataUrlToHttpUrl(dataUrl, host = 'www.kidzstorymagic.org') {
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
      { name: 'local-file', fn: () => saveToLocalFile(buffer, host) },
      { name: 'transfer.sh', fn: () => uploadToTransferSh(buffer) },
      { name: 'file.io', fn: () => uploadToFileIo(buffer) },
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
 * Save image to local public directory
 */
async function saveToLocalFile(buffer, host) {
  try {
    const filename = `face-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;
    const filepath = path.join(publicDir, filename);
    
    // Write file
    fs.writeFileSync(filepath, buffer);
    console.log(`[LOCAL_FILE] Saved to ${filepath}`);
    
    // Return public URL
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const publicUrl = `${protocol}://${host}/temp-faces/${filename}`;
    return publicUrl;
  } catch (error) {
    throw new Error(`local-file error: ${error.message}`);
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
        'User-Agent': 'Kidz-Story-Magic/1.0',
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
 * Upload to file.io using multipart form data
 */
async function uploadToFileIo(buffer) {
  try {
    // Create a proper FormData with the binary buffer
    const boundary = `----WebKitFormBoundary${Math.random().toString(36).substr(2, 16)}`;
    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="image.png"\r\nContent-Type: image/png\r\n\r\n`),
      buffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);
    
    const response = await fetch('https://file.io/?expires=1h', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'User-Agent': 'Kidz-Story-Magic/1.0',
      },
      body: body,
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
 * Batch convert multiple data URLs
 */
export async function convertMultipleDataUrls(dataUrls, host = 'www.kidzstorymagic.org') {
  try {
    console.log(`[DATA_URL_CONVERTER] Converting ${dataUrls.length} data URLs...`);

    const promises = dataUrls.map(url => convertDataUrlToHttpUrl(url, host));
    const httpUrls = await Promise.all(promises);

    console.log(`[DATA_URL_CONVERTER] ✓ All ${httpUrls.length} URLs converted`);
    return httpUrls;
  } catch (error) {
    console.error('[DATA_URL_CONVERTER] Batch conversion error:', error.message);
    throw error;
  }
}
