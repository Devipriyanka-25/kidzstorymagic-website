/**
 * Enhanced Story Preview API
 * GET /api/story/preview-with-payment/[id]
 * Returns story preview with payment status and unlocked status
 */

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Mock story data
const mockStories = {
  'story_1': {
    id: 'story_1',
    title: "Emma's Amazing Adventure",
    childName: 'Emma',
    theme: 'Adventure',
    pages: [
      {
        pageNumber: 1,
        type: 'cover',
        title: "Emma's Amazing Adventure",
        text: 'A magical journey for Emma',
        imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&h=500&fit=crop',
        message: 'Open this book to begin your adventure!'
      },
      {
        pageNumber: 2,
        type: 'story',
        title: 'Chapter 1: The Discovery',
        text: 'On a sunny morning, Emma found a mysterious golden door hidden behind the old oak tree in her backyard.',
        imageUrl: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=500&h=500&fit=crop',
        lesson: 'Curiosity leads to amazing discoveries'
      },
      {
        pageNumber: 3,
        type: 'story',
        title: 'Chapter 2: Meeting the Guardians',
        text: 'A group of friendly creatures welcomed Emma. They had been waiting for someone brave enough to help them.',
        imageUrl: 'https://images.unsplash.com/photo-1499633346015-edf0fa291f64?w=500&h=500&fit=crop',
        lesson: 'Friendship comes from helping others'
      },
      {
        pageNumber: 4,
        type: 'end',
        title: 'The End',
        text: 'Emma discovered that imagination is the greatest superpower of all.',
        imageUrl: 'https://images.unsplash.com/photo-1490090967868-88aa0486ad1d?w=500&h=500&fit=crop',
        message: 'You are brave like Emma! The End 🌟'
      }
    ]
  }
};

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.substring(7);
    
    let decoded = null;
    if (token) {
      try {
        const jwtSecret = process.env.JWT_SECRET || 'kidz-story-magic-jwt-secret-key-2024-production-secure-random-12345';
        decoded = jwt.verify(token, jwtSecret);
      } catch (err) {
        console.log('[PREVIEW] Token verification failed, allowing public access to preview');
      }
    }

    console.log('[PREVIEW] Getting story preview:', id);

    // Get story from mock data
    const story = mockStories[id];
    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Determine payment status
    // In production: Query orders table to check if user paid
    const mockPaidStories = [
      'mock_paid_story_1',
      'paid_story_1'
    ];

    const isPaid = mockPaidStories.includes(id) || id.startsWith('paid_');

    return NextResponse.json({
      success: true,
      story: {
        id: story.id,
        title: story.title,
        childName: story.childName,
        theme: story.theme,
        totalPages: story.pages.length,
        pages: story.pages,
        paymentStatus: isPaid ? 'paid' : 'unpaid',
        isUnlocked: isPaid,
        canDownload: isPaid,
        watermarkRequired: !isPaid,
        blurRequired: !isPaid,
        previewMessage: isPaid 
          ? 'Full story unlocked! Enjoy reading.' 
          : 'Story preview - Complete checkout to unlock full access'
      }
    }, { status: 200 });

  } catch (error) {
    console.error('[PREVIEW_ERROR]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get story preview'
      },
      { status: 500 }
    );
  }
}
