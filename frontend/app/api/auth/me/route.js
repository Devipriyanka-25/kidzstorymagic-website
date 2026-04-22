// Proxy: GET/PUT /api/auth/me -> Railway backend
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const railwayUrl = process.env.RAILWAY_API_URL || 'https://kidzstorymagic-api.railway.app';
    const authHeader = request.headers.get('Authorization');

    const response = await fetch(`${railwayUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[PROXY_ME_GET] Error:', error.message);
    return NextResponse.json(
      { error: 'Backend error', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const railwayUrl = process.env.RAILWAY_API_URL || 'https://kidzstorymagic-api.railway.app';
    const authHeader = request.headers.get('Authorization');

    const response = await fetch(`${railwayUrl}/api/auth/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[PROXY_ME_PUT] Error:', error.message);
    return NextResponse.json(
      { error: 'Backend error', details: error.message },
      { status: 500 }
    );
  }
}
