// Proxy: POST /api/auth/reset-password -> Railway backend
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const railwayUrl = process.env.RAILWAY_API_URL || 'https://kidzstorymagic-api.railway.app';

    const response = await fetch(`${railwayUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[PROXY_RESET_PASSWORD] Error:', error.message);
    return NextResponse.json(
      { error: 'Backend error', details: error.message },
      { status: 500 }
    );
  }
}
