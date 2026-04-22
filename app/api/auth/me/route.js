// Proxy: GET /api/auth/me -> Railway backend
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const railwayUrl = process.env.RAILWAY_API_URL || 'https://kidzstorymagic-api.railway.app';
    
    console.log('[PROXY_ME] Forwarding to:', railwayUrl + '/api/auth/me');

    const response = await fetch(`${railwayUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      },
    });

    const data = await response.json();
    
    console.log('[PROXY_ME] Response status:', response.status);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[PROXY_ME] Error:', error.message);
    return NextResponse.json(
      { error: 'Backend error', details: error.message },
      { status: 500 }
    );
  }
}
