/**
 * ImageUploadComponent.jsx (Enhanced with Compression and Validation)
 * 
 * Purpose: Multi-image upload with drag-drop, validation, and conditional compression
 * Features:
 * - Drag and drop support
 * - Multiple file selection
 * - Real-time validation
 * - Face detection and clarity check
 * - Cap/cooler detection
 * - Duplicate image detection
 * - File size checking (5MB threshold)
 * - Conditional compression for large files
 * - Preview thumbnails with file size info
 * - Remove individual images
 * - Clear all functionality
 * - Compression level selection (Medium/High)
 * - Original vs compressed size comparison
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { validateImage } from '@/utils/ImageValidation';

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes, k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Compress image using canvas with improved error handling
const compressImage = async (file, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = event.target.result;
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                throw new Error('Canvas context not available');
              }
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              canvas.toBlob(
                (blob) => {
                  if (blob && blob.size > 0) {
                    blob.name = file.name;
                    resolve(blob);
                  } else {
                    reject(new Error('Blob creation failed'));
                  }
                },
                'image/jpeg',
                quality
              );
            } catch (err) {
              reject(new Error(`Canvas operation failed: ${err.message}`));
            }
          };
          img.onerror = () => reject(new Error('Image loading failed'));
        } catch (err) {
          reject(new Error(`Image setup failed: ${err.message}`));
        }
      };
      reader.onerror = () => reject(new Error('File reading failed'));
    } catch (err) {
      reject(new Error(`Compression setup failed: ${err.message}`));
    }
  });
};

export default function ImageUploadComponent({ onImagesSelected, maxImages = 10 }) {
  const MIN_IMAGES = 2;
  const SIZE_LIMIT = 5 * 1024 * 1024; // 5MB
  const fileInputRef = useRef(null);
  
  // State management
  const [images, setImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [compressionEnabled, setCompressionEnabled] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState('medium'); // 'medium' or 'high'
  const [compressing, setCompressing] = useState(false);
  const [largeFilesCount, setLargeFilesCount] = useState(0);

  // Quality levels for compression
  const qualityLevels = {
    medium: 0.7, // 70% quality
    high: 0.4    // 40% quality
  };

  /**
   * Handle drag events for drag-and-drop upload
   */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  /**
   * Handle drop event for drag-and-drop upload
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = [...e.dataTransfer.files];
    processFiles(files);
  };

  /**
   * Handle file selection from input
   */
  const handleFileSelect = (e) => {
    const files = [...e.target.files];
    processFiles(files);
  };

  /**
   * Process and validate selected files
   */
  const processFiles = async (files) => {
    setError('');
    setLoading(true);

    try {
      // Filter only image files
      const imageFiles = files.filter(file => 
        file.type.startsWith('image/')
      );

      if (imageFiles.length === 0) {
        setError('Please select only image files');
        setLoading(false);
        return;
      }

      // Check total number of images doesn't exceed max
      if (images.length + imageFiles.length > maxImages) {
        setError(`Maximum ${maxImages} images allowed`);
        setLoading(false);
        return;
      }

      // Validate each image
      setError('');
      const validatedImages = [];
      let validationErrors = [];

      for (const file of imageFiles) {
        // Validate image
        const validation = await validateImage(file, images.map(img => ({ file: img.file, name: img.name })));
        
        if (!validation.isValid) {
          // Collect all errors for this image
          const errorMessages = validation.errors.map(err => err.message).join('\n');
          validationErrors.push(`📸 ${file.name}:\n${errorMessages}`);
        } else {
          validatedImages.push(file);
        }
      }

      // If there are validation errors, show them
      if (validationErrors.length > 0) {
        setError(`Some images were rejected:\n\n${validationErrors.join('\n\n')}\n\nPlease upload different images.`);
        setLoading(false);
        return;
      }

      // Convert validated files to objects with metadata
      const newImages = await Promise.all(
        validatedImages.map(file => 
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              const isLarge = file.size > SIZE_LIMIT;
              resolve({
                id: Math.random().toString(36).substr(2, 9),
                file: file,
                preview: event.target.result,
                name: file.name,
                size: file.size,
                sizeFormatted: formatFileSize(file.size),
                isLarge: isLarge,
                compressed: null,
                compressedSize: null,
                compressedSizeFormatted: null,
              });
            };
            reader.readAsDataURL(file);
          })
        )
      );

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);

      // Show success message
      setSuccess(`✅ ${newImages.length} image(s) added successfully!`);
      setTimeout(() => setSuccess(''), 3000);

      // Count large files
      const largeCount = updatedImages.filter(img => img.isLarge).length;
      setLargeFilesCount(largeCount);

      // Call parent callback
      if (onImagesSelected) {
        onImagesSelected(updatedImages);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError('Error processing images. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle compression toggle change
   */
  const handleCompressionToggle = async (checked) => {
    setCompressionEnabled(checked);

    if (checked && largeFilesCount > 0) {
      // Start compression for large files
      await compressLargeImages();
    } else {
      // Clear compressed versions
      const updatedImages = images.map(img => ({
        ...img,
        compressed: null,
        compressedSize: null,
        compressedSizeFormatted: null,
      }));
      setImages(updatedImages);
    }
  };

  /**
   * Compress all large images
   */
  const compressLargeImages = async () => {
    setCompressing(true);
    setError('');

    try {
      const updatedImages = await Promise.all(
        images.map(async (image) => {
          if (image.isLarge) {
            try {
              const quality = qualityLevels[compressionLevel];
              const compressedBlob = await compressImage(image.file, quality);
              const compressedReader = new FileReader();
              
              return new Promise((resolve) => {
                compressedReader.onload = (event) => {
                  resolve({
                    ...image,
                    compressed: event.target.result,
                    compressedSize: compressedBlob.size,
                    compressedSizeFormatted: formatFileSize(compressedBlob.size),
                  });
                };
                compressedReader.readAsDataURL(compressedBlob);
              });
            } catch (err) {
              console.warn(`[COMPRESSION] Warning for ${image.name}: ${err.message}. Using original file.`, err);
              // Return image without compression as fallback - don't fail the whole process
              return image;
            }
          }
          return image;
        })
      );

      setImages(updatedImages);
      if (onImagesSelected) {
        onImagesSelected(updatedImages);
      }
    } catch (err) {
      setError('Compression failed. Please try again.');
      console.error(err);
      setCompressionEnabled(false);
    } finally {
      setCompressing(false);
    }
  };

  /**
   * Remove a single image from the upload
   */
  const removeImage = (id) => {
    const updatedImages = images.filter(img => img.id !== id);
    setImages(updatedImages);
    
    // Update large files count
    const largeCount = updatedImages.filter(img => img.isLarge).length;
    setLargeFilesCount(largeCount);

    // Reset compression if no large files left
    if (largeCount === 0) {
      setCompressionEnabled(false);
    }
    
    if (onImagesSelected) {
      onImagesSelected(updatedImages);
    }
  };

  /**
   * Clear all uploaded images
   */
  const clearAllImages = () => {
    setImages([]);
    setError('');
    setLargeFilesCount(0);
    setCompressionEnabled(false);
    if (onImagesSelected) {
      onImagesSelected([]);
    }
  };

  // Calculate progress percentage
  const progressPercentage = Math.min((images.length / MIN_IMAGES) * 100, 100);
  const isMinimumMet = images.length >= MIN_IMAGES;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📸 Upload Story Images
        </h2>
        <p className="text-gray-600">
          Upload <span className="font-semibold text-blue-600">2-5 images</span> to generate your story
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Images uploaded: <span className="text-blue-600">{images.length}/{maxImages}</span>
          </span>
          <span className="text-sm font-medium text-gray-700">
            {isMinimumMet ? (
              <span className="text-green-600">✅ Ready to generate story</span>
            ) : (
              <span className="text-orange-600">Need {MIN_IMAGES - images.length} more</span>
            )}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              isMinimumMet ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
          <p className="text-green-900 text-sm font-semibold">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
          <p className="text-red-900 text-sm font-semibold mb-3">❌ Image Validation Issues:</p>
          <div className="text-red-800 text-sm whitespace-pre-wrap font-medium">
            {error}
          </div>
          <p className="text-red-700 text-xs mt-3 italic">
            💡 Tip: Ensure faces are clearly visible without caps/sunglasses and images are not duplicates.
          </p>
        </div>
      )}

      {/* Large Files Warning */}
      {largeFilesCount > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm font-medium mb-3">
            ⚠️ {largeFilesCount} image(s) larger than 5MB detected. Compression is recommended.
          </p>
          
          {/* Compression Controls */}
          <div className="space-y-3">
            {/* Compression Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="compression-toggle"
                checked={compressionEnabled}
                onChange={(e) => handleCompressionToggle(e.target.checked)}
                disabled={compressing}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="compression-toggle" className="text-sm font-medium text-gray-900 cursor-pointer">
                🗜️ Enable Image Compression
              </label>
            </div>

            {/* Compression Level Selector */}
            {compressionEnabled && (
              <div className="ml-7 space-y-2">
                <p className="text-xs font-medium text-gray-700 mb-2">Compression Level:</p>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="compression-level"
                      value="medium"
                      checked={compressionLevel === 'medium'}
                      onChange={(e) => setCompressionLevel(e.target.value)}
                      disabled={compressing}
                      className="w-3 h-3"
                    />
                    <span className="text-sm text-gray-700">Medium (70% quality)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="compression-level"
                      value="high"
                      checked={compressionLevel === 'high'}
                      onChange={(e) => setCompressionLevel(e.target.value)}
                      disabled={compressing}
                      className="w-3 h-3"
                    />
                    <span className="text-sm text-gray-700">High (40% quality)</span>
                  </label>
                </div>
              </div>
            )}

            {/* Compressing Status */}
            {compressing && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin">⏳</div>
                  <p className="text-sm text-blue-800">Compressing images...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`mb-6 p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={loading || compressing}
        />
        
        <div onClick={() => fileInputRef.current?.click()}>
          <div className="text-4xl mb-2">📁</div>
          <p className="text-lg font-semibold text-gray-900 mb-1">
            Drag images here or click to select
          </p>
          <p className="text-sm text-gray-600">
            Supported formats: JPG, PNG, WebP (Max 5 images)
          </p>
          {loading && (
            <p className="text-sm text-blue-600 mt-2 animate-pulse">
              Processing images...
            </p>
          )}
        </div>
      </div>

      {/* Image Thumbnails Grid */}
      {images.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Your Images ({images.length})
            </h3>
            {images.length > 0 && (
              <button
                onClick={clearAllImages}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="relative group rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                {/* Image Thumbnail */}
                <div className="relative w-full h-32 bg-gray-200">
                  <img
                    src={compressionEnabled && image.compressed ? image.compressed : image.preview}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Image Number Badge */}
                  <div className="absolute top-1 left-1 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>

                  {/* Large File Badge */}
                  {image.isLarge && (
                    <div className="absolute top-1 right-1 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      Large
                    </div>
                  )}
                </div>

                {/* Image Info */}
                <div className="p-2 bg-white border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {image.name}
                  </p>
                  
                  {/* File Size Info */}
                  <div className="mt-1 space-y-1">
                    <p className="text-xs text-gray-500">
                      📦 {image.sizeFormatted}
                    </p>
                    
                    {/* Compression Info */}
                    {compressionEnabled && image.compressed && (
                      <div>
                        <p className="text-xs text-green-600 font-medium">
                          ✓ {image.compressedSizeFormatted}
                        </p>
                        <p className="text-xs text-gray-500">
                          Saved: {Math.round((1 - image.compressedSize / image.size) * 100)}%
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          💡 <strong>Tip:</strong> Upload images that tell a story or represent characters. The AI will use these to generate a personalized story for your child.
        </p>
      </div>

      {/* Ready Indicator */}
      {isMinimumMet && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm font-medium">
            ✅ You've uploaded {images.length} images. Ready to generate story!
          </p>
        </div>
      )}
    </div>
  );
}
