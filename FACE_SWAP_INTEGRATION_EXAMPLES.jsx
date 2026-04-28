/**
 * Face Swap Integration for Step 6 (Review & Checkout)
 * Quick integration guide with code examples
 */

/**
 * Example 1: Basic Integration in Step6ReviewCheckout
 */

// Add to your Step6ReviewCheckout component:

import { useState } from 'react';

export function useStoryGenerationWithFaceSwap() {
  const [story, setStory] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const generateStory = async (formData, childPhotoUrl) => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);

    try {
      setProgress(10); // Initializing...

      // Call new integrated endpoint
      const response = await fetch('/api/story/generate-with-faceswap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          projectId: formData.projectId,
          childName: formData.childName,
          childAge: formData.childAge,
          theme: formData.theme,
          childPhotoUrl: childPhotoUrl, // ⭐ Pass uploaded photo
          enableFaceSwap: formData.enableFaceSwap !== false, // Default: enabled
          pageCount: formData.pageCount || 12,
          userId: formData.userId,
        }),
      });

      setProgress(30); // Story structure generated...

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate story');
      }

      const data = await response.json();

      setProgress(70); // Processing illustrations...

      // Face swap happens in background during generation
      // Once received, all pages have illustrationUrl and faceSwappedUrl

      setProgress(100); // Complete!

      setStory(data.story);
      return data.story;
    } catch (err) {
      console.error('[STORY_GEN] Error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    story,
    isGenerating,
    progress,
    error,
    generateStory,
  };
}

/**
 * Example 2: Update Step6ReviewCheckout Component
 */

export default function Step6ReviewCheckout({
  formData,
  uploadedPhotoUrl,
  onCheckout,
}) {
  const { story, isGenerating, progress, error, generateStory } =
    useStoryGenerationWithFaceSwap();

  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const handlePreviewStory = async () => {
    try {
      await generateStory(formData, uploadedPhotoUrl);
    } catch (err) {
      console.error('Failed to generate story:', err);
      // Show error toast
    }
  };

  if (!story) {
    return (
      <div className="review-section">
        <div className="preview-header">
          <h2>📖 Review Your Story</h2>
          <p>See what your personalized story with face swap looks like!</p>
        </div>

        <div className="story-info">
          <div className="info-grid">
            <div>
              <label>Child</label>
              <p>{formData.childName}, Age {formData.childAge}</p>
            </div>
            <div>
              <label>Theme</label>
              <p>{formData.theme}</p>
            </div>
            <div>
              <label>Pages</label>
              <p>{formData.pageCount || 12}</p>
            </div>
            <div>
              <label>Face Swap</label>
              <p>{uploadedPhotoUrl ? '✅ Enabled' : '❌ No photo'}</p>
            </div>
          </div>
        </div>

        {/* Preview Button */}
        <button
          onClick={handlePreviewStory}
          disabled={isGenerating}
          className="btn-primary"
        >
          {isGenerating ? (
            <>
              <span className="spinner" />
              Generating Story with Face Swap ({progress}%)
            </>
          ) : (
            '👁️ Preview Story'
          )}
        </button>

        {/* Progress Bar */}
        {isGenerating && (
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
            <p className="progress-text">
              {progress < 30
                ? '📝 Generating story structure...'
                : progress < 70
                  ? '🎨 Creating illustrations...'
                  : progress < 90
                    ? '👤 Applying face swap...'
                    : '✨ Finalizing...'}
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}
      </div>
    );
  }

  // Story Preview Display
  const currentPage = story.pages[currentPageIndex];

  return (
    <div className="review-section">
      <div className="preview-header">
        <h2>✨ Your Personalized Story</h2>
        <p>
          {formData.childName}'s story with face-personalized illustrations
        </p>
      </div>

      {/* Page Preview */}
      <div className="page-preview-container">
        <div className="page-image">
          {/* Show face-swapped image if available, else original */}
          <img
            src={currentPage.faceSwappedUrl || currentPage.illustrationUrl}
            alt={currentPage.title}
            className="page-image-content"
          />

          {currentPage.faceSwappedUrl && (
            <span className="face-swap-badge">
              👤 Face Personalized
            </span>
          )}
        </div>

        <div className="page-content">
          <h3>{currentPage.title}</h3>
          <p>{currentPage.content}</p>

          {/* Show both versions for comparison */}
          <details className="comparison">
            <summary>👀 Compare Original vs Face Swap</summary>
            <div className="comparison-grid">
              <div>
                <p className="label">Original</p>
                <img src={currentPage.illustrationUrl} alt="Original" />
              </div>
              <div>
                <p className="label">Face Swap</p>
                <img
                  src={currentPage.faceSwappedUrl}
                  alt="Face Swapped"
                />
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* Navigation */}
      <div className="page-navigation">
        <button
          onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
          disabled={currentPageIndex === 0}
        >
          ← Previous
        </button>
        <span className="page-counter">
          Page {currentPageIndex + 1} of {story.pages.length}
        </span>
        <button
          onClick={() =>
            setCurrentPageIndex(
              Math.min(story.pages.length - 1, currentPageIndex + 1)
            )
          }
          disabled={currentPageIndex === story.pages.length - 1}
        >
          Next →
        </button>
      </div>

      {/* Checkout */}
      <div className="checkout-section">
        <div className="price-breakdown">
          <div className="price-item">
            <span>{story.pageCount} Page Story</span>
            <span>$12.99</span>
          </div>
          <div className="price-item">
            <span>✅ Face Personalization</span>
            <span>Included</span>
          </div>
          <div className="price-item total">
            <span>Total</span>
            <span>$12.99</span>
          </div>
        </div>

        <button
          onClick={() => onCheckout(story)}
          className="btn-checkout"
        >
          🛒 Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

/**
 * Example 3: Storage & Retrieval
 */

// Save generated story to database
async function saveGeneratedStory(story, userId) {
  const response = await fetch('/api/story/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify({
      projectId: story.projectId,
      childName: story.childName,
      title: story.title,
      pages: story.pages.map((page) => ({
        pageNumber: page.pageNumber,
        title: page.title,
        content: page.content,
        illustrationUrl: page.illustrationUrl,
        faceSwappedUrl: page.faceSwappedUrl, // ⭐ Store face-swapped URLs
        pageType: page.pageType,
      })),
      faceSwapEnabled: true,
      userId: userId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save story');
  }

  return response.json();
}

// Retrieve saved story
async function retrieveStory(projectId) {
  const response = await fetch(`/api/story/${projectId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to retrieve story');
  }

  return response.json();
}

/**
 * Example 4: PDF Export with Face-Swapped Images
 */

import { jsPDF } from 'jspdf';

async function generatePDFWithFaceSwap(story, childName) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  for (let i = 0; i < story.pages.length; i++) {
    const page = story.pages[i];

    if (i > 0) {
      pdf.addPage();
    }

    // Add page image (use face-swapped version if available)
    const imageUrl = page.faceSwappedUrl || page.illustrationUrl;

    if (imageUrl) {
      pdf.addImage(imageUrl, 'JPEG', 10, 10, 190, 200);
    }

    // Add text
    pdf.setFontSize(14);
    pdf.text(page.title, 105, 220, { align: 'center' });

    pdf.setFontSize(10);
    const splitText = pdf.splitTextToSize(page.content, 180);
    pdf.text(splitText, 15, 230);

    // Add page number
    pdf.setFontSize(8);
    pdf.text(`Page ${page.pageNumber}`, 105, 285, { align: 'center' });
  }

  // Save PDF
  pdf.save(`${childName}-story.pdf`);
}

/**
 * Example 5: Error Handling & Fallbacks
 */

function handleStoryGenerationError(error) {
  if (error.message.includes('Face swap failed')) {
    return {
      type: 'face-swap-error',
      message:
        'Face swap processing had an issue. Using original illustrations.',
      severity: 'warning',
      action: 'continue',
    };
  }

  if (error.message.includes('Photo required')) {
    return {
      type: 'photo-error',
      message: 'Please upload a child photo to enable face personalization.',
      severity: 'info',
      action: 'redirect-to-upload',
    };
  }

  if (error.message.includes('Timeout')) {
    return {
      type: 'timeout-error',
      message:
        'Story generation took too long. Please try again or contact support.',
      severity: 'error',
      action: 'retry',
    };
  }

  return {
    type: 'unknown-error',
    message: 'An unexpected error occurred. Please try again.',
    severity: 'error',
    action: 'retry',
  };
}

/**
 * CSS Styling Reference
 */

const styles = `
.review-section {
  max-width: 800px;
  margin: 20px auto;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  color: white;
}

.preview-header h2 {
  font-size: 28px;
  margin-bottom: 10px;
}

.page-preview-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin: 30px 0;
  background: white;
  color: #333;
  padding: 30px;
  border-radius: 15px;
}

.page-image {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
}

.face-swap-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 200, 100, 0.9);
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.comparison {
  margin-top: 20px;
  cursor: pointer;
}

.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 15px;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  margin: 15px 0;
  transition: width 0.3s ease;
}

.page-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
}

.btn-checkout {
  width: 100%;
  padding: 15px;
  font-size: 18px;
  font-weight: bold;
  background: linear-gradient(135deg, #00c86e, #00a854);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  margin-top: 20px;
}

.btn-checkout:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 200, 110, 0.3);
}

@media (max-width: 768px) {
  .page-preview-container {
    grid-template-columns: 1fr;
  }
  
  .comparison-grid {
    grid-template-columns: 1fr;
  }
}
`;
