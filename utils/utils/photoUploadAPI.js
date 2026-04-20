// Photo Upload API Utilities
// High-level API functions for photo upload, processing, and management

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Create axios instance for photo uploads
const photoClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000 // 5 minutes for large file uploads
});

// Add auth token interceptor
photoClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Photo Upload API Functions
 */
export const photoUploadAPI = {
  /**
   * Upload and process photo
   * @param {string} projectId - Story project ID
   * @param {File} file - Image file to upload
   * @param {Function} onUploadProgress - Progress callback
   * @returns {Promise<Object>} Upload response with URLs and metadata
   */
  uploadPhoto: async (projectId, file, onUploadProgress = null) => {
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await photoClient.post(
        `/story/${projectId}/upload-photo`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          ...(onUploadProgress && {
            onUploadProgress: (progressEvent) => {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onUploadProgress(progress);
            }
          })
        }
      );

      console.log('[PHOTO_UPLOAD_API] Upload successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('[PHOTO_UPLOAD_API] Upload failed:', error.response?.data || error.message);
      throw {
        message: error.response?.data?.message || 'Photo upload failed',
        error: error.response?.data?.error || error.message,
        details: error.response?.data?.details
      };
    }
  },

  /**
   * Get photo preview with SAS URL
   * @param {string} projectId - Story project ID
   * @returns {Promise<Object>} Preview URL and metadata
   */
  getPhotoPreview: async (projectId) => {
    try {
      const response = await photoClient.get(`/story/${projectId}/photo-preview`);
      console.log('[PHOTO_UPLOAD_API] Preview retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('[PHOTO_UPLOAD_API] Preview retrieval failed:', error.response?.data || error.message);
      throw {
        message: error.response?.data?.message || 'Failed to retrieve preview',
        error: error.response?.data?.error || error.message
      };
    }
  },

  /**
   * Delete uploaded photo
   * @param {string} projectId - Story project ID
   * @returns {Promise<Object>} Deletion result
   */
  deletePhoto: async (projectId) => {
    try {
      const response = await photoClient.delete(`/story/${projectId}/photo`);
      console.log('[PHOTO_UPLOAD_API] Photo deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('[PHOTO_UPLOAD_API] Photo deletion failed:', error.response?.data || error.message);
      throw {
        message: error.response?.data?.message || 'Failed to delete photo',
        error: error.response?.data?.error || error.message
      };
    }
  }
};

/**
 * Photo Validation Utilities
 */
export const photoValidation = {
  /**
   * Validate file before upload
   * @param {File} file - File to validate
   * @returns {Object} Validation result { valid: boolean, error?: string }
   */
  validateFile: (file) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    if (!allowedMimes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload JPEG, PNG, or WebP image'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds 50MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      };
    }

    return { valid: true };
  },

  /**
   * Get file info
   * @param {File} file - File to analyze
   * @returns {Object} File information
   */
  getFileInfo: (file) => {
    return {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeInMB: (file.size / 1024 / 1024).toFixed(2),
      lastModified: new Date(file.lastModified).toLocaleString()
    };
  },

  /**
   * Get preview dataURL from file
   * @param {File} file - File to preview
   * @returns {Promise<string>} Data URL for preview
   */
  getPreviewUrl: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
};

/**
 * Progress Tracking Utilities
 */
export const photoUploadProgress = {
  /**
   * Format progress percentage
   * @param {number} progress - Progress percentage (0-100)
   * @returns {string} Formatted progress string
   */
  formatProgress: (progress) => {
    return `${Math.round(progress)}%`;
  },

  /**
   * Get progress status message
   * @param {number} progress - Progress percentage (0-100)
   * @returns {string} Status message
   */
  getStatusMessage: (progress) => {
    if (progress === 0) return 'Preparing upload...';
    if (progress < 30) return 'Uploading...';
    if (progress < 60) return 'Processing image...';
    if (progress < 90) return 'Detecting faces...';
    if (progress < 100) return 'Finalizing...';
    return 'Complete!';
  },

  /**
   * Estimate remaining time
   * @param {number} progress - Current progress (0-100)
   * @param {number} elapsedMs - Elapsed time in milliseconds
   * @returns {string} Estimated remaining time
   */
  estimateRemainingTime: (progress, elapsedMs) => {
    if (progress === 0) return 'calculating...';
    const totalMs = (elapsedMs / progress) * 100;
    const remainingMs = totalMs - elapsedMs;
    const seconds = Math.round(remainingMs / 1000);

    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.round(seconds / 60);
    return `${minutes}m`;
  }
};

export default photoUploadAPI;
