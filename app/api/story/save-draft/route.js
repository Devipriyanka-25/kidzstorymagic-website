import { NextResponse } from 'next/server';

import { resolveRequestUser } from '../../shared/requestAuth.js';
import { saveDraftForUser } from '../../shared/storyDrafts.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { error, authUser } = await resolveRequestUser(request);
    if (error) {
      return error;
    }

    const body = await request.json();
    const draft = await saveDraftForUser(authUser.id, body || {});

    return NextResponse.json(
      {
        success: true,
        draft,
        projectId: draft.id,
      },
      { status: body?.startNew ? 201 : 200 }
    );
  } catch (error) {
    console.error('[SAVE_DRAFT] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to save draft',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
