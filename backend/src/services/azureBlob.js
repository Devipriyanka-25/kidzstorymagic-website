// Azure Blob Storage Service
// Handles upload, storage, and URL generation with local fallback

const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

class AzureBlobService {
  constructor() {
    // Initialize Azure Blob Storage client
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    
    this.useLocalStorage = !connectionString;
    this.blobServiceClient = null;
    this.containerName = process.env.AZURE_STORAGE_CONTAINER || 'story-images';

    if (!this.useLocalStorage) {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      console.log('[AZURE_BLOB] Service initialized for cloud container:', this.containerName);
    } else {
      // Initialize local storage fallback
      this.localStoragePath = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(this.localStoragePath)) {
        fs.mkdirSync(this.localStoragePath, { recursive: true });
      }
      console.log('[AZURE_BLOB] Using local storage fallback at:', this.localStoragePath);
    }
  }

  /**
   * Ensure container exists
   * @returns {Promise<void>}
   */
  async ensureContainer() {
    if (this.useLocalStorage) {
      // Create project-specific folder
      const projectFolder = path.join(this.localStoragePath, 'projects');
      if (!fs.existsSync(projectFolder)) {
        fs.mkdirSync(projectFolder, { recursive: true });
      }
      console.log('[AZURE_BLOB] Local storage ready');
      return;
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      
      try {
        await containerClient.getProperties();
        console.log(`[AZURE_BLOB] Container "${this.containerName}" exists`);
      } catch (error) {
        if (error.code === 'ContainerNotFound') {
          console.log(`[AZURE_BLOB] Creating container "${this.containerName}"`);
          await containerClient.create({ access: 'blob' });
          console.log(`[AZURE_BLOB] Container created successfully`);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('[AZURE_BLOB_ERROR] Container ensure failed:', error);
      throw error;
    }
  }

  /**
   * Upload image buffer to Azure Blob Storage
   * @param {Buffer} imageBuffer - Image data
   * @param {String} fileName - Filename (optional - generates UUID if not provided)
   * @param {Object} metadata - Custom metadata
   * @returns {Promise<String>} Blob URL
   */
  async uploadBlob(imageBuffer, fileName = null, metadata = {}) {
    try {
      const blobName = fileName || `${uuidv4()}.jpg`;
      
      console.log(`[AZURE_BLOB] Uploading blob: ${blobName}`);

      if (this.useLocalStorage) {
        // Local storage fallback
        const uploadDir = path.join(this.localStoragePath, path.dirname(blobName));
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(this.localStoragePath, blobName);
        fs.writeFileSync(filePath, imageBuffer);

        // Return local file URL (can be served by static middleware)
        const localUrl = `/uploads/${blobName.replace(/\\/g, '/')}`;
        console.log(`[AZURE_BLOB] Local upload successful: ${localUrl}`);
        return localUrl;
      }

      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Upload blob with metadata
      await blockBlobClient.upload(imageBuffer, imageBuffer.length, {
        metadata: {
          uploadTime: new Date().toISOString(),
          ...metadata
        },
        blobHTTPHeaders: {
          blobContentType: 'image/jpeg',
          cacheControl: 'public, max-age=31536000' // 1 year cache
        }
      });

      const url = blockBlobClient.url;
      console.log(`[AZURE_BLOB] Upload successful: ${url}`);

      return url;
    } catch (error) {
      console.error('[AZURE_BLOB_ERROR] Upload failed:', error);
      throw error;
    }
  }

  /**
   * Upload multiple processed images
   * @param {Object} images - {original, blurred, watermarked} image buffers
   * @param {String} projectId - Project ID for organization
   * @param {Object} metadata - Custom metadata
   * @returns {Promise<Object>} URLs for all images
   */
  async uploadProcessedImages(images, projectId, metadata = {}) {
    try {
      console.log(`[AZURE_BLOB] Uploading processed images for project: ${projectId}`);

      const timestamp = Date.now();
      const folderPath = `projects/${projectId}/${timestamp}`;

      const uploads = [];

      // Upload original if provided
      if (images.original) {
        uploads.push(
          this.uploadBlob(images.original, `${folderPath}/original.jpg`, {
            type: 'original',
            projectId,
            ...metadata
          }).then(url => ({ original: url }))
        );
      }

      // Upload blurred preview
      if (images.blurred) {
        uploads.push(
          this.uploadBlob(images.blurred, `${folderPath}/blurred.jpg`, {
            type: 'blurred',
            projectId,
            ...metadata
          }).then(url => ({ blurred: url }))
        );
      }

      // Upload watermarked preview
      if (images.watermarked) {
        uploads.push(
          this.uploadBlob(images.watermarked, `${folderPath}/watermarked.jpg`, {
            type: 'watermarked',
            projectId,
            ...metadata
          }).then(url => ({ watermarked: url }))
        );
      }

      const results = await Promise.all(uploads);
      const urls = Object.assign({}, ...results);

      console.log('[AZURE_BLOB] All images uploaded successfully');
      return urls;
    } catch (error) {
      console.error('[AZURE_BLOB_ERROR] Batch upload failed:', error);
      throw error;
    }
  }

  /**
   * Delete blob from storage
   * @param {String} blobName - Name/path of blob to delete
   * @returns {Promise<void>}
   */
  async deleteBlob(blobName) {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.delete();
      console.log(`[AZURE_BLOB] Blob deleted: ${blobName}`);
    } catch (error) {
      console.error('[AZURE_BLOB_ERROR] Delete failed:', error);
      throw error;
    }
  }

  /**
   * Download blob as buffer
   * @param {String} blobName - Name/path of blob
   * @returns {Promise<Buffer>} Blob data
   */
  async downloadBlob(blobName) {
    try {
      console.log(`[AZURE_BLOB] Downloading blob: ${blobName}`);

      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      const downloadBlockBlobResponse = await blockBlobClient.download(0);
      const downloaded = await this.streamToBuffer(downloadBlockBlobResponse.readableStreamBody);

      console.log(`[AZURE_BLOB] Blob downloaded: ${blobName}`);
      return downloaded;
    } catch (error) {
      console.error('[AZURE_BLOB_ERROR] Download failed:', error);
      throw error;
    }
  }

  /**
   * Get blob properties/metadata
   * @param {String} blobName - Name/path of blob
   * @returns {Promise<Object>} Blob properties
   */
  async getBlobProperties(blobName) {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      const properties = await blockBlobClient.getProperties();
      console.log(`[AZURE_BLOB] Retrieved properties for: ${blobName}`);

      return {
        size: properties.contentLength,
        contentType: properties.contentType,
        metadata: properties.metadata,
        createdTime: properties.createdOn,
        modifiedTime: properties.lastModified
      };
    } catch (error) {
      console.error('[AZURE_BLOB_ERROR] Get properties failed:', error);
      throw error;
    }
  }

  /**
   * List blobs in container or folder
   * @param {String} prefix - Folder prefix (optional)
   * @returns {Promise<Array>} List of blobs
   */
  async listBlobs(prefix = '') {
    try {
      console.log(`[AZURE_BLOB] Listing blobs with prefix: ${prefix}`);

      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobs = [];

      for await (const blob of containerClient.listBlobsFlat({ prefix })) {
        blobs.push({
          name: blob.name,
          size: blob.properties.contentLength,
          type: blob.properties.contentType,
          metadata: blob.metadata,
          createdTime: blob.properties.createdOn
        });
      }

      console.log(`[AZURE_BLOB] Found ${blobs.length} blobs`);
      return blobs;
    } catch (error) {
      console.error('[AZURE_BLOB_ERROR] List blobs failed:', error);
      throw error;
    }
  }

  /**
   * Generate SAS URL for temporary access
   * @param {String} blobName - Name/path of blob
   * @param {Number} expiryMinutes - Minutes until URL expires (default: 60)
   * @returns {Promise<String>} SAS URL
   */
  async generateSasUrl(blobName, expiryMinutes = 60) {
    try {
      if (this.useLocalStorage) {
        // For local storage, return the local URL directly
        // The backend serves static files from /uploads folder
        const localUrl = `/uploads/${blobName.replace(/\\/g, '/')}`;
        console.log(`[AZURE_BLOB] Generated local URL for ${blobName}`);
        return localUrl;
      }

      const {
        generateBlobSASQueryParameters,
        StorageSharedKeyCredential,
        BlobSASPermissions
      } = require('@azure/storage-blob');

      const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
      const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

      if (!accountName || !accountKey) {
        throw new Error('Azure Storage credentials not configured for SAS generation');
      }

      const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

      const expiresOn = new Date();
      expiresOn.setMinutes(expiresOn.getMinutes() + expiryMinutes);

      const sasQueryParameters = generateBlobSASQueryParameters(
        {
          containerName: this.containerName,
          blobName: blobName,
          permissions: BlobSASPermissions.parse('racwd'),
          expiresOn
        },
        sharedKeyCredential
      );

      const sasUrl = `${this.blobServiceClient.getContainerClient(this.containerName).getBlockBlobClient(blobName).url}?${sasQueryParameters}`;

      console.log(`[AZURE_BLOB] Generated SAS URL for ${blobName}, expires in ${expiryMinutes} minutes`);
      return sasUrl;
    } catch (error) {
      console.error('[AZURE_BLOB_ERROR] SAS URL generation failed:', error);
      throw error;
    }
  }

  /**
   * Convert stream to buffer
   * @param {Stream} readableStream - Input stream
   * @returns {Promise<Buffer>} Buffer data
   */
  async streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on('data', data => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data));
      });
      readableStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      readableStream.on('error', reject);
    });
  }
}

// Create singleton instance
let azureBlobInstance = null;

const getAzureBlobService = () => {
  if (!azureBlobInstance) {
    azureBlobInstance = new AzureBlobService();
  }
  return azureBlobInstance;
};

module.exports = { AzureBlobService, getAzureBlobService };
