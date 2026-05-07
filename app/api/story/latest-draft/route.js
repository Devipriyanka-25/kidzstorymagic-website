import { NextResponse } from 'next/server';

import { resolveRequestUser } from '../../shared/requestAuth.js';
import { getLatestDraftForUser } from '../../shared/storyDrafts.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { error, authUser } = await resolveRequestUser(request);
    if (error) {
      return error;
    }

    const draft = await getLatestDraftForUser(authUser.id);

    if (!draft) {
      return NextResponse.json(
        {
          success: true,
          draft: null,
          expired: false,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        draft,
        expired: false,
        message: 'Latest active draft loaded.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[LATEST_DRAFT] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to load latest draft',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
