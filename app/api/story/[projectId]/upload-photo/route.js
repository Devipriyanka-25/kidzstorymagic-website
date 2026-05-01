/**
 * Photo Upload Proxy Endpoint
 * Next.js API route: POST /api/story/[projectId]/upload-photo
 * Forwards photo uploads to the backend Express server
 */

import { NextResponse } from 'next/server';

// Helper to get auth header
function getAuthHeader(request) {
  const authHeader = request.headers.get('authorization');
  return authHeader ? { Authorization: authHeader } : {};
}

// Helper to get backend URL
function getBackendApiUrl() {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const normalizedUrl = backendUrl.replace(/\/+$/, '');
  return normalizedUrl.endsWith('/api') ? normalizedUrl : `${normalizedUrl}/api`;
}

async function readJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      error: 'Unexpected backend response',
      details: text.slice(0, 500),
    };
  }
}

export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    console.log(`[UPLOAD_PHOTO] Processing photo upload for project: ${projectId}`);

    // Parse the multipart form data
    const formData = await request.formData();

    if (!formData.has('photo')) {
      console.error('[UPLOAD_PHOTO] No photo file in request');
      return NextResponse.json(
        { error: 'No photo file provided' },
        { status: 400 }
      );
    }

    const photo = formData.get('photo');
    console.log(`[UPLOAD_PHOTO] Photo file: ${photo.name}, Size: ${photo.size} bytes`);

    // Create a new FormData for the backend request
    const backendFormData = new FormData();
    backendFormData.append('photo', photo);

    // Get auth headers
    const authHeaders = getAuthHeader(request);
    const backendApiUrl = getBackendApiUrl();

    // Forward to backend
    console.log(`[UPLOAD_PHOTO] Forwarding to backend: ${backendApiUrl}/story/${projectId}/upload-photo`);

    const response = await fetch(
      `${backendApiUrl}/story/${projectId}/upload-photo`,
      {
        method: 'POST',
        headers: {
          ...authHeaders,
        },
        body: backendFormData,
        timeout: 60000,
      }
    );

    const responseData = await readJsonResponse(response);

    if (!response.ok) {
      console.error('[UPLOAD_PHOTO] Backend error:', response.status, responseData);
      return NextResponse.json(
        responseData || { error: 'Photo upload failed' },
        { status: response.status }
      );
    }

    console.log('[UPLOAD_PHOTO] Success:', responseData);
    return NextResponse.json(responseData, { status: response.status });

  } catch (error) {
    console.error('[UPLOAD_PHOTO] Error:', error.message);
    return NextResponse.json(
      {
        error: 'Photo upload failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  return NextResponse.json(
    {
      message: 'Photo upload endpoint',
      method: 'POST',
      description: 'Upload a photo for a story project',
      projectId: params.projectId,
    },
    { status: 200 }
  );
}
