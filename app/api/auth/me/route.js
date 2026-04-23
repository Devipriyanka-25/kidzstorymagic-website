/**
 * Get Current User Endpoint
 * Serverless implementation: GET /api/auth/me
 * Strategy: Supabase REST API → Mock Database Fallback
 */

import { NextResponse } from 'next/server';
import { userStore } from '../../shared/userStore.js';

const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    console.log('[ME] Verifying user from token');

    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[ME] No valid token provided');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'kidz-story-magic-jwt-secret-key-2024-production-secure-random-12345';

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err) {
      console.log('[ME] Invalid token:', err.message);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!decoded || (!decoded.id && !decoded.email)) {
      console.log('[ME] Invalid token payload');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Try Supabase REST API first
    try {
      console.log('[ME] Attempting Supabase REST API...');
      
      const supabaseUrl = 'https://wwninqezevmxlvtjhruo.supabase.co';
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3bmlucWV6ZXZteGx2dGpocnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTI0MjUsImV4cCI6MjA5MjAyODQyNX0.sUJDiz980D3q-Lpt_R-ndJcojZD4dOZZr1nnB5d5IvA';

      // Query user by ID
      const response = await fetch(
        `${supabaseUrl}/rest/v1/auth_users?id=eq.${encoded(decoded.id)}`,
        {
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Supabase ${response.status}`);
      }

      const users = await response.json();

      if (!users || users.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const user = users[0];
      console.log('[ME] ✓ Supabase user verified');

      return NextResponse.json(
        {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            profilePictureUrl: user.profile_picture_url,
            preferredCurrency: user.preferred_currency,
            location: user.location,
            createdAt: user.created_at,
          },
          source: 'supabase',
        },
        { status: 200 }
      );
    } catch (supabaseErr) {
      console.log('[ME] Supabase failed:', supabaseErr.message, '- Using shared user store');

      // Fallback: Shared user store
      if (!decoded.email) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const demoUser = userStore.getUser(decoded.email);

      if (!demoUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      console.log('[ME] ✓ Demo user verified');

      return NextResponse.json(
        {
          user: {
            id: demoUser.id,
            name: demoUser.name,
            email: demoUser.email,
            profilePictureUrl: null,
            preferredCurrency: demoUser.preferredCurrency,
            location: null,
            createdAt: demoUser.createdAt,
          },
          source: 'demo',
          note: 'Running in demo mode - Supabase not available',
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('[ME] Unexpected error:', error.message);
    return NextResponse.json(
      { error: 'Failed to get user info', details: error.message },
      { status: 500 }
    );
  }
}

function encoded(str) {
  return String(str || '');
}
