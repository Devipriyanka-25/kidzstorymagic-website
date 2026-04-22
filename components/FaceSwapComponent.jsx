'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/utils/store';

export default function FaceSwapComponent({ storyId, onFaceDetected }) {
  const { user } = useAuthStore();
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [faceData, setFaceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [childName, setChildName] = useState('');
  const [detectionStatus, setDetectionStatus] = useState('idle');
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Handle photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image too large. Maximum 10MB');
      return;
    }

    setPhoto(file);
    setError('');
    setFaceData(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result);
    };
    reader.readAsDataURL(file);
  };

  // Detect face in photo
  const detectFace = async () => {
    if (!photo || !user) {
      setError('Please upload a photo and ensure you are logged in');
      return;
    }

    setLoading(true);
    setDetectionStatus('detecting');
    setError('');

    try {
      const formData = new FormData();
      formData.append('photo', photo);
      formData.append('childName', childName || 'Child');
      formData.append('userId', user.id);
      formData.append('storyId', storyId);

      const response = await fetch('/api/photos/detect-face', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Face detection failed');
      }

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Face detection failed');
        setDetectionStatus('idle');
        return;
      }

      setFaceData(data.faceData);
      setDetectionStatus('detected');

      // Call parent callback if provided
      if (onFaceDetected) {
        onFaceDetected({
          ...data.faceData,
          childName,
          photoBase64: data.photo.original_base64,
        });
      }

      console.log('Face detected:', data.faceData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Face detection failed';
      setError(message);
      setDetectionStatus('error');
      console.error('[FACE_DETECT_UI] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Draw face detection boxes on canvas
  useEffect(() => {
    if (faceData && photoPreview) {
      drawFaceBoxes();
    }
  }, [faceData, photoPreview]);

  const drawFaceBoxes = () => {
    if (!canvasRef.current || !faceData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create image to get dimensions
    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Draw face box
      const pos = faceData.position;
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 3;
      ctx.strokeRect(pos.x, pos.y, pos.width, pos.height);

      // Draw confidence label
      ctx.fillStyle = '#00FF00';
      ctx.font = '16px Arial';
      ctx.fillText(
        `Confidence: ${(faceData.confidence * 100).toFixed(0)}%`,
        pos.x,
        pos.y - 10
      );

      // Draw landmarks
      if (faceData.landmarks) {
        ctx.fillStyle = '#FF0000';
        Object.entries(faceData.landmarks).forEach(([key, point]) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillText(key, point.x + 10, point.y);
        });
      }
    };
    img.src = photoPreview;
  };

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 shadow-lg">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            📸 Face Detection & Swap
          </h2>
          <p className="text-gray-600">
            Upload a photo of your child to detect their face and include it in their story illustrations
          </p>
        </div>

        {/* Child Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Child's Name
          </label>
          <input
            type="text"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="e.g., Emma, Alex"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Photo Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="mb-6 p-8 border-2 border-dashed border-blue-300 rounded-lg bg-white cursor-pointer hover:border-blue-500 transition"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          {photoPreview ? (
            <div className="text-center">
              <img
                src={photoPreview}
                alt="Preview"
                className="max-w-sm mx-auto max-h-64 rounded-lg mb-4"
              />
              <p className="text-blue-600 font-semibold">
                ✓ Photo loaded. Click to change.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-4xl mb-2">📷</p>
              <p className="text-gray-700 font-semibold mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Detect Face Button */}
        <button
          onClick={detectFace}
          disabled={!photo || loading}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition mb-6 ${
            loading || !photo
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Detecting face...
            </span>
          ) : (
            '🔍 Detect Face'
          )}
        </button>

        {/* Face Detection Result */}
        {faceData && (
          <div className="bg-white rounded-lg p-6 border-2 border-green-300">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-green-600 mb-2">
                ✓ Face Detected Successfully!
              </h3>
              <p className="text-gray-600">
                Confidence: {(faceData.confidence * 100).toFixed(1)}%
              </p>
            </div>

            {/* Face Preview */}
            {faceData.extracted_base64 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Extracted Face:
                </p>
                <img
                  src={faceData.extracted_base64}
                  alt="Extracted face"
                  className="w-40 h-40 rounded-lg border-2 border-blue-300 object-cover"
                />
              </div>
            )}

            {/* Face Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold">Position:</span> X: {faceData.position.x}, Y:{' '}
                {faceData.position.y}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold">Size:</span> {faceData.position.width} x{' '}
                {faceData.position.height}px
              </p>
              {faceData.landmarks && (
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Landmarks detected:</span> Eyes, Nose, Mouth
                </p>
              )}
            </div>

            {/* Face Detection Canvas */}
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Detection Visualization:
              </p>
              <canvas
                ref={canvasRef}
                className="max-w-sm border-2 border-blue-300 rounded-lg"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">💡 How it works:</span> We'll detect your child's face
            in the photo, extract it, and blend it into the story illustrations they appear in.
            This creates a personalized experience where they're the hero of their own story!
          </p>
        </div>
      </div>
    </div>
  );
}
