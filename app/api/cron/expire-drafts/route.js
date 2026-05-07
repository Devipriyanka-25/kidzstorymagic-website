import { NextResponse } from 'next/server';

import { purgeExpiredDrafts } from '../../shared/storyDrafts.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function isAuthorizedCronRequest(request) {
  const cronSecret = String(process.env.CRON_SECRET || '').trim();

  if (!cronSecret) {
    return {
      ok: false,
      status: 500,
      error: 'CRON_SECRET is not configured.',
    };
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return {
      ok: false,
      status: 401,
      error: 'Unauthorized.',
    };
  }

  return { ok: true };
}

export async function GET(request) {
  const authorization = isAuthorizedCronRequest(request);
  if (!authorization.ok) {
    return NextResponse.json(
      {
        success: false,
        error: authorization.error,
      },
      { status: authorization.status }
    );
  }

  try {
    const result = await purgeExpiredDrafts();

    console.log('[CRON_EXPIRE_DRAFTS]', result);

    return NextResponse.json(
      {
        success: true,
        deletedCount: result.deletedCount,
        scannedCount: result.scannedCount,
        deletedProjects: result.deletedProjects,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[CRON_EXPIRE_DRAFTS] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to expire drafts.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
