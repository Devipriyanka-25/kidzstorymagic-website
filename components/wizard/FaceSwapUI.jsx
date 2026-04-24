'use client';

import React, { useState } from 'react';

/**
 * FaceSwapUI - Face swap interface for users to:
 * 1. Upload/select child face image
 * 2. Choose story page to swap
 * 3. Process face swap
 * 4. Display results
 */
export default function FaceSwapUI({ uploadedImages, storyPages, currentPageNumber, onFaceSwap, isFaceSwapping, onSelectImage }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showUploadArea, setShowUploadArea] = useState(!uploadedImages || uploadedImages.length === 0);
  const [dragActive, setDragActive] = useState(false);

  const selectedImage = uploadedImages?.[selectedImageIndex];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        onSelectImage(reader.result);
        setShowUploadArea(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 shadow-lg">
      <h3 className="text-3xl font-bold text-gray-900 mb-6">👤 Face Swap Setup</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Child Face Selection */}
        <div className="space-y-6">
          <h4 className="text-xl font-bold text-gray-800">Step 1: Select Child's Face</h4>

          {!showUploadArea && uploadedImages && uploadedImages.length > 0 ? (
            <>
              {/* Display Selected Image */}
              <div className="bg-white rounded-xl p-4 border-2 border-indigo-200">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <img
                    src={selectedImage}
                    alt="Selected face"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-center text-gray-600 font-semibold">Image {selectedImageIndex + 1} of {uploadedImages.length}</p>
              </div>

              {/* Image Selection Gallery */}
              {uploadedImages.length > 1 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Choose another image:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {uploadedImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedImageIndex(idx);
                          onSelectImage(img);
                        }}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === idx ? 'border-indigo-500 ring-2 ring-indigo-300' : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <img src={img} alt={`Option ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowUploadArea(true)}
                className="w-full px-4 py-2 border-2 border-indigo-300 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-all"
              >
                📸 Upload Different Image
              </button>
            </>
          ) : (
            <>
              {/* Upload Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-4 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-indigo-200 bg-white hover:border-indigo-400 hover:bg-indigo-50'
                }`}
              >
                <div className="text-6xl mb-4">📸</div>
                <p className="text-lg font-bold text-gray-800 mb-2">Upload Child Face Image</p>
                <p className="text-gray-600 mb-4">Drag and drop or click to select</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        onSelectImage(reader.result);
                        setShowUploadArea(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="face-upload"
                />
                <label htmlFor="face-upload" className="inline-block px-6 py-3 bg-indigo-500 text-white font-bold rounded-lg hover:bg-indigo-600 transition-all cursor-pointer">
                  Select Image
                </label>
              </div>
            </>
          )}
        </div>

        {/* Right: Story Page Selection & Action */}
        <div className="space-y-6">
          <h4 className="text-xl font-bold text-gray-800">Step 2: Select Story Page</h4>

          <div className="bg-white rounded-xl p-4 border-2 border-purple-200">
            <p className="text-gray-600 text-sm mb-3 font-semibold">Current page:</p>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-purple-600">{currentPageNumber + 1}</p>
              <p className="text-gray-600">{storyPages?.[currentPageNumber]?.title || 'Story Page'}</p>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-purple-900">
                ℹ️ Face swaps work best on story pages (not on cover or end pages).
              </p>
            </div>

            <button
              onClick={onFaceSwap}
              disabled={!selectedImage || isFaceSwapping || currentPageNumber === 0}
              className={`w-full px-6 py-4 rounded-lg font-bold text-lg transition-all ${
                isFaceSwapping
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : selectedImage && currentPageNumber > 0
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              {isFaceSwapping ? (
                <>
                  <span className="animate-spin inline-block mr-2">⏳</span>
                  Processing Face Swap...
                </>
              ) : (
                '✨ Generate Face Swap'
              )}
            </button>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-300">
            <p className="font-bold text-yellow-900 mb-3">💡 Tips for Best Results:</p>
            <ul className="text-sm text-yellow-900 space-y-2">
              <li>✓ Use a clear, well-lit face image</li>
              <li>✓ Face should be clearly visible</li>
              <li>✓ Avoid sunglasses or hats</li>
              <li>✓ Try different story pages for variations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
