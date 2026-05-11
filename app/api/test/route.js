import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function areTestRoutesEnabled() {
  return (
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_TEST_ROUTES === 'true'
  );
}

export async function GET(request) {
  if (!areTestRoutesEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  console.log('[API_TEST] Test endpoint called');
  
  // Check environment variables
  const hasDatabase = !!process.env.DATABASE_URL;
  const hasJWT = !!process.env.JWT_SECRET;
  const dbUrlPreview = process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 40) + '...' : 'NOT SET';
  
  return NextResponse.json({ 
    message: 'API routes are working!',
    timestamp: new Date().toISOString(),
    environment: {
      DATABASE_URL: hasDatabase ? dbUrlPreview : 'NOT SET',
      JWT_SECRET: hasJWT ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'not set'
    }
  });
}
