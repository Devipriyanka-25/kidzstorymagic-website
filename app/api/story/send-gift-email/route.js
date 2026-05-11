import { NextResponse } from 'next/server';
import { supabaseClient } from '../../shared/supabaseClient.js';
import { resolveRequestUser } from '../../shared/requestAuth.js';
import {
  buildGiftPreviewUrl,
  sendGiftStoryEmail,
} from '@/lib/giftStory';

export async function POST(request) {
  try {
    const { error, authUser } = await resolveRequestUser(request);
    if (error) {
      return error;
    }

    const body = await request.json();
    const {
      projectId,
      recipientName,
      recipientEmail,
      giftMessage,
    } = body;

    // Validate required fields
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required.' },
        { status: 400 }
      );
    }

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'Recipient email is required.' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(recipientEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address.' },
        { status: 400 }
      );
    }

    // Verify the project belongs to the user
    if (!supabaseClient) {
      return NextResponse.json(
        { error: 'Story storage is not configured.' },
        { status: 500 }
      );
    }

    const { data: project, error: projectError } = await supabaseClient
      .from('story_projects')
      .select('id, child_name, theme, user_id')
      .eq('id', Number(projectId))
      .maybeSingle();

    if (projectError) {
      console.error('[SEND_GIFT_EMAIL] Project fetch error:', projectError);
      return NextResponse.json(
        { error: 'Failed to fetch project.' },
        { status: 500 }
      );
    }

    if (!project || Number(project.user_id) !== Number(authUser.id)) {
      return NextResponse.json(
        { error: 'Project not found or unauthorized.' },
        { status: 404 }
      );
    }

    // Build gift preview URL
    const previewUrl = buildGiftPreviewUrl({
      projectId,
      recipientEmail,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
    });

    // Send gift story email
    await sendGiftStoryEmail({
      recipientName: recipientName || 'Friend',
      recipientEmail,
      senderName: authUser?.name || authUser?.email || 'Someone special',
      senderEmail: authUser?.email || '',
      childName: project.child_name,
      giftMessage: giftMessage || '',
      previewUrl,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Gift email sent successfully to ${recipientEmail}`,
        recipientEmail,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[SEND_GIFT_EMAIL] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send gift email.',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
