import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  console.log('[API_TEST] Test endpoint called');
  return NextResponse.json({ 
    message: 'API routes are working!',
    timestamp: new Date().toISOString()
  });
}
