// Proxy: POST /api/auth/login -> Railway backend
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const railwayUrl = process.env.RAILWAY_API_URL || 'https://kidzstorymagic-api.railway.app';
    
    console.log('[PROXY_LOGIN] Forwarding to:', railwayUrl + '/api/auth/login');

    const response = await fetch(`${railwayUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    console.log('[PROXY_LOGIN] Response status:', response.status);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[PROXY_LOGIN] Error:', error.message);
    return NextResponse.json(
      { error: 'Backend error', details: error.message },
      { status: 500 }
    );
  }
}
