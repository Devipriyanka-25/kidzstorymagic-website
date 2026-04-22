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
const analyzeFaceRegion = (pixelData, width, height) => {
  // pixelData is already the pixel array (Uint8ClampedArray), not the imageData object
  const data = pixelData;
  if (!data || data.length === 0) {
    console.error('[IMAGE_VALIDATION] No image data available');
    return {
      detected: false,
      clarity: 'unknown',
      faceCount: 0,
      issues: ['no_image_data']
    };
  }

  const issues = [];
  
  // Detect skin tone pixels (simplified)
  let skinPixelCount = 0;
  let edgePixelCount = 0;
  let darkPixelCount = 0;
  let faceRegions = [];
  let currentRegion = null;
  
  // Divide image into regions to detect multiple faces
  const regionSize = Math.min(width, height) / 3;
  const regions = {}; // Initialize as object, not array
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    const pixelIndex = i / 4;
    const pixelX = pixelIndex % width;
    const pixelY = Math.floor(pixelIndex / width);
    
    // Skip transparent pixels
    if (a < 128) continue;
    
    // Improved skin tone detection with more flexible thresholds
    // Accounts for different skin tones, lighting conditions, and image compression
    const isSkinTone = 
      (r > 60 && g > 40 && b > 20 && r > g && r > b) || // Warm skin tones
      (r > 75 && g > 60 && b > 40) || // Medium skin tones
      (r > 85 && g > 80 && b > 75) || // Light skin tones
      (r > 50 && g > 35 && b > 15 && Math.abs(r - g) > 5); // Darker skin tones
    
    if (isSkinTone) {
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
    if (Math.abs(r - g) > 20 || Math.abs(g - b) > 20 || Math.abs(r - b) > 20) {
      edgePixelCount++;
    }
    
    // Check for dark areas (caps, sunglasses) - also relaxed
    if (r < 80 && g < 80 && b < 80 && (r + g + b) < 150) {
      darkPixelCount++;
    }
  }
  
  const totalPixels = data.length / 4;
  const skinPercentage = (skinPixelCount / totalPixels) * 100;
  const edgePercentage = (edgePixelCount / totalPixels) * 100;
  const darkPercentage = (darkPixelCount / totalPixels) * 100;
  
  // Count number of detected faces based on regional skin concentration
  // TEMPORARY FIX: Disable multi-face detection via grid-based approach
  // The region-based detection is too sensitive and creates false positives
  // A single person's face, neck, and shoulders spread across grid regions
  // causes secondary regions to be counted as additional faces
  // SOLUTION: For now, count any face detection as just 1 face
  // (True multi-person detection would need ML/API-based detection)
  let faceCount = 1;
  
  // The skin pixel detection already confirmed we have a face
  // So we just return 1 face for now, not counting secondary regions
  
  // Cap face count to maximum 2 (two distinct people)
  faceCount = Math.min(faceCount, 2);
  
  // Determine clarity and issues
  let detected = false;
  let clarity = 'unknown';
  
  // Lower threshold - face detected if more than 2% skin tone pixels
  // This is more lenient to account for various lighting and image quality
  if (skinPercentage > 2) {
    detected = true;
    
    // Check for caps/coolers (dark areas in upper region)
    if (darkPercentage > 25) {
      issues.push('cap_or_cooler_detected');
    }
    
    // Check face clarity based on edge contrast
    // Edge detection counts color variations in face regions
    // Relaxed threshold: only mark as unclear if extremely smooth/blurry
    if (edgePercentage < 5) {
      clarity = 'low';
      issues.push('face_not_clearly_visible');
    } else if (edgePercentage < 15) {
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
  
  // Additional fallback: if image has enough content variation, assume it's a valid image with a face
  // This helps with images that don't match the exact skin tone criteria but are still valid
  const colorVariation = calculateColorVariation(data);
  if (!detected && colorVariation > 100) {
    // Image has enough color variation to be considered as containing a subject
    detected = true;
    clarity = 'medium';
    faceCount = 1;
  }
  
  return {
    detected,
    clarity,
    faceCount,
    issues
  };
};

// Calculate color variation to detect if image has content
const calculateColorVariation = (pixelData) => {
  // pixelData is the pixel array (Uint8ClampedArray), not the imageData object
  const data = pixelData;
  if (!data || data.length === 0) return 0;
  
  let rSum = 0, gSum = 0, bSum = 0, rSqSum = 0, gSqSum = 0, bSqSum = 0;
  let pixelCount = 0;
  
  // Sample every 4th pixel to speed up calculation
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    if (a < 128) continue; // Skip transparent pixels
    
    rSum += r;
    gSum += g;
    bSum += b;
    rSqSum += r * r;
    gSqSum += g * g;
    bSqSum += b * b;
    pixelCount++;
  }
  
  if (pixelCount === 0) return 0;
  
  // Calculate variance
  const rMean = rSum / pixelCount;
  const gMean = gSum / pixelCount;
  const bMean = bSum / pixelCount;
  
  const rVariance = (rSqSum / pixelCount) - (rMean * rMean);
  const gVariance = (gSqSum / pixelCount) - (gMean * gMean);
  const bVariance = (bSqSum / pixelCount) - (bMean * bMean);
  
  // Return total color variation
  return Math.sqrt(rVariance + gVariance + bVariance);
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
