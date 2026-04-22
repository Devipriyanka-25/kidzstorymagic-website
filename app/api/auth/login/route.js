/**
 * Auth Login Endpoint
 * Serverless implementation: POST /api/auth/login
 * Strategy: Supabase REST API → Mock Database Fallback
 */

import { NextResponse } from 'next/server';
import { userStore } from '../shared/userStore.js';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('[LOGIN] Processing login for:', email);

    const jwtSecret = process.env.JWT_SECRET || 'kidz-story-magic-jwt-secret-key-2024-production-secure-random-12345';

    // Try Supabase REST API first
    try {
      console.log('[LOGIN] Attempting Supabase REST API...');
      
      const supabaseUrl = 'https://wwninqezevmxlvtjhruo.supabase.co';
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3bmlucWV6ZXZteGx2dGpocnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTI0MjUsImV4cCI6MjA5MjAyODQyNX0.sUJDiz980D3q-Lpt_R-ndJcojZD4dOZZr1nnB5d5IvA';

      // Query user by email
      const response = await fetch(
        `${supabaseUrl}/rest/v1/auth_users?email=eq.${encodeURIComponent(email)}`,
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
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const user = users[0];
      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      console.log('[LOGIN] ✓ Supabase login successful');

      const token = jwt.sign(
        { id: user.id, email: user.email },
        jwtSecret,
        { expiresIn: '7d' }
      );

      return NextResponse.json(
        {
          message: 'Login successful',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            preferredCurrency: user.preferred_currency,
          },
          token,
          source: 'supabase',
        },
        { status: 200 }
      );
    } catch (supabaseErr) {
      console.log('[LOGIN] Supabase failed:', supabaseErr.message, '- Using shared user store');

      // Fallback: Check shared user store
      const demoUser = userStore.getUser(email);

      if (!demoUser) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const passwordMatch = await bcrypt.compare(password, demoUser.passwordHash);

      if (!passwordMatch) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      console.log('[LOGIN] ✓ Shared user store login successful');

      const token = jwt.sign(
        { id: demoUser.id, email: demoUser.email },
        jwtSecret,
        { expiresIn: '7d' }
      );

      return NextResponse.json(
        {
          message: 'Login successful (demo mode)',
          user: {
            id: demoUser.id,
            name: demoUser.name,
            email: demoUser.email,
            preferredCurrency: demoUser.preferredCurrency,
          },
          token,
          source: 'demo',
          note: 'Running in demo mode - Supabase not available',
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('[LOGIN] Unexpected error:', error.message);
    return NextResponse.json(
      {
        error: 'Login failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}
