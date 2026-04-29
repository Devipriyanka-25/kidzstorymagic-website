import { NextResponse } from 'next/server';
import { sendGiftStoryEmail } from '@/lib/giftStory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      recipientName,
      recipientEmail,
      senderName,
      senderEmail,
      childName,
      giftMessage,
      previewUrl,
      downloadUrl,
    } = body;

    const resolvedPreviewUrl = previewUrl || downloadUrl;

    await sendGiftStoryEmail({
      recipientName,
      recipientEmail,
      senderName,
      senderEmail,
      childName,
      giftMessage,
      previewUrl: resolvedPreviewUrl,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Gift story email sent successfully.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GIFT_SEND] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send gift story email.',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
