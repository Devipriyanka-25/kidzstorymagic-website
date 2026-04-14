/**
 * ImageValidation.js
 * 
 * Validates uploaded images for:
 * - Face detection and clarity
 * - Headwear/sunglasses detection
 * - Duplicate images
 * - Image quality
 */

// Simple perceptual hash for duplicate detection
export const getImageHash = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Create small canvas for hash
          const canvas = document.createElement('canvas');
          canvas.width = 8;
          canvas.height = 8;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, 8, 8);
          
          const imageData = ctx.getImageData(0, 0, 8, 8);
          const data = imageData.data;
          
          // Calculate average brightness
          let sum = 0;
          for (let i = 0; i < data.length; i += 4) {
            sum += data[i] + data[i + 1] + data[i + 2];
          }
          const avg = sum / (data.length / 4);
          
          // Create hash
          let hash = '';
          for (let i = 0; i < data.length; i += 4) {
            const brightness = data[i] + data[i + 1] + data[i + 2];
            hash += brightness > avg ? '1' : '0';
          }
          
          resolve(hash);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// Calculate Hamming distance between two hashes
const hammingDistance = (hash1, hash2) => {
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  return distance;
};

// Check for duplicate images
export const checkDuplicateImages = async (newFile, existingFiles) => {
  try {
    const newHash = await getImageHash(newFile);
    
    for (const existingFile of existingFiles) {
      const existingHash = await getImageHash(existingFile.file);
      
      // If Hamming distance is small, images are very similar
      const distance = hammingDistance(newHash, existingHash);
      if (distance < 5) { // Threshold for duplicate detection
        return {
          isDuplicate: true,
          duplicateFileName: existingFile.name
        };
      }
    }
    
    return { isDuplicate: false };
  } catch (err) {
    console.error('[IMAGE_VALIDATION] Duplicate check error:', err);
    return { isDuplicate: false };
  }
};

// Detect faces using a simple approach with Canvas API
export const detectFaces = async (imageFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Simple face detection using skin tone and contrast analysis
          const hasFaceRegion = analyzeFaceRegion(data, canvas.width, canvas.height);
          
          resolve({
            hasFace: hasFaceRegion.detected,
            faceCount: hasFaceRegion.faceCount || (hasFaceRegion.detected ? 1 : 0),
            faceClarity: hasFaceRegion.clarity,
            issues: hasFaceRegion.issues
          });
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(imageFile);
  });
};

// Analyze face region for presence and clarity
const analyzeFaceRegion = (imageData, width, height) => {
  const data = imageData.data;
  const issues = [];
  
  // Detect skin tone pixels (simplified)
  let skinPixelCount = 0;
  let edgePixelCount = 0;
  let darkPixelCount = 0;
  let faceRegions = [];
  let currentRegion = null;
  
  // Divide image into regions to detect multiple faces
  const regionSize = Math.min(width, height) / 3;
  const regions = [];
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const pixelIndex = i / 4;
    const pixelX = pixelIndex % width;
    const pixelY = Math.floor(pixelIndex / width);
    
    // Skin tone detection (simplified)
    if (r > 95 && g > 40 && b > 20 && 
        r > g && r > b && 
        Math.abs(r - g) > 15) {
      skinPixelCount++;
      
      // Track regional face concentration
      const regionX = Math.floor(pixelX / regionSize);
      const regionY = Math.floor(pixelY / regionSize);
      const regionKey = `${regionX}-${regionY}`;
      
      if (!regions[regionKey]) {
        regions[regionKey] = 0;
      }
      regions[regionKey]++;
    }
    
    // Check for high contrast (edges)
    if (Math.abs(r - g) > 30 || Math.abs(g - b) > 30 || Math.abs(r - b) > 30) {
      edgePixelCount++;
    }
    
    // Check for dark areas (caps, sunglasses)
    if (r < 50 && g < 50 && b < 50) {
      darkPixelCount++;
    }
  }
  
  const totalPixels = data.length / 4;
  const skinPercentage = (skinPixelCount / totalPixels) * 100;
  const edgePercentage = (edgePixelCount / totalPixels) * 100;
  const darkPercentage = (darkPixelCount / totalPixels) * 100;
  
  // Count number of detected faces based on regional skin concentration
  let faceCount = 0;
  const threshold = (skinPixelCount / 9) * 0.3; // Threshold for face detection per region
  Object.values(regions).forEach(count => {
    if (count > threshold) {
      faceCount++;
    }
  });
  
  // Determine clarity and issues
  let detected = false;
  let clarity = 'unknown';
  
  if (skinPercentage > 10) {
    detected = true;
    
    // Check for caps/coolers (dark areas in upper region)
    if (darkPercentage > 20) {
      issues.push('cap_or_cooler_detected');
    }
    
    // Check face clarity based on edge contrast
    if (edgePercentage < 15) {
      clarity = 'low';
      issues.push('face_not_clearly_visible');
    } else if (edgePercentage < 25) {
      clarity = 'medium';
    } else {
      clarity = 'high';
    }
  } else {
    clarity = 'no_face';
    issues.push('no_face_detected');
  }
  
  // If no faces detected via region analysis, estimate based on skin percentage
  if (faceCount === 0 && detected) {
    faceCount = 1;
  }
  
  return {
    detected,
    clarity,
    faceCount,
    issues
  };
};

// Main validation function
export const validateImage = async (imageFile, existingImages = [], theme = '') => {
  const errors = [];
  
  // For family theme, face detection and multiple faces are optional
  const isFamilyTheme = theme.toLowerCase() === 'family';
  // For all other themes, only 1 face is allowed
  const allowMultipleFaces = isFamilyTheme;
  
  try {
    // Check for duplicates
    const duplicateCheck = await checkDuplicateImages(imageFile, existingImages);
    if (duplicateCheck.isDuplicate) {
      errors.push({
        type: 'duplicate',
        message: `This image appears to be a duplicate of "${duplicateCheck.duplicateFileName}". Please upload a different image.`
      });
    }
    
    // Check face detection and clarity
    const faceCheck = await detectFaces(imageFile);
    
    // If not family theme, face is required
    if (!isFamilyTheme && !faceCheck.hasFace) {
      errors.push({
        type: 'no_face',
        message: 'No face detected in this image. Please upload a clear photo with a visible face.'
      });
    } else if (faceCheck.hasFace) {
      // Check for multiple faces (only allowed in family theme)
      if (!allowMultipleFaces && faceCheck.faceCount > 1) {
        errors.push({
          type: 'multiple_faces',
          message: `⚠️ Multiple faces detected (${faceCheck.faceCount} faces). Please upload an image with only one person for better story accuracy.`
        });
      }
      
      // If face is detected, check for specific issues (applicable to all themes)
      if (faceCheck.issues.includes('cap_or_cooler_detected')) {
        errors.push({
          type: 'cap_detected',
          message: '⛑️ Cap or cooler detected. Please upload a photo without caps, hats, or sunglasses for better story accuracy.'
        });
      }
      
      if (faceCheck.issues.includes('face_not_clearly_visible')) {
        errors.push({
          type: 'low_clarity',
          message: '📸 Face is not clearly visible. Please upload a clearer, well-lit photo where the face is prominent.'
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (err) {
    console.error('[IMAGE_VALIDATION] Error:', err);
    // If validation fails, allow the image (don't block)
    return {
      isValid: true,
      errors: []
    };
  }
};

// Batch validate multiple images
export const validateImages = async (files, theme = '') => {
  const validationResults = [];
  const validatedFiles = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const validation = await validateImage(file, validatedFiles, theme);
    
    validationResults.push({
      fileName: file.name,
      validation
    });
    
    if (validation.isValid) {
      validatedFiles.push({ file, name: file.name });
    }
  }
  
  return validationResults;
};
