/**
 * Auth Register Endpoint
 * Serverless implementation: POST /api/auth/register
 * Strategy: Supabase REST API → Mock Database Fallback
 */

import { NextResponse } from 'next/server';
import { userStore } from '../../shared/userStore.js';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, preferredCurrency } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    console.log('[REGISTER] Processing registration for:', email);

    const jwtSecret = process.env.JWT_SECRET || 'kidz-story-magic-jwt-secret-key-2024-production-secure-random-12345';

    // Try Supabase REST API first
    try {
      console.log('[REGISTER] Attempting Supabase REST API...');
      const passwordHash = await bcrypt.hash(password, 10);
      
      const supabaseUrl = 'https://wwninqezevmxlvtjhruo.supabase.co';
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3bmlucWV6ZXZteGx2dGpocnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTI0MjUsImV4cCI6MjA5MjAyODQyNX0.sUJDiz980D3q-Lpt_R-ndJcojZD4dOZZr1nnB5d5IvA';

      const response = await fetch(`${supabaseUrl}/rest/v1/auth_users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          name,
          email,
          password_hash: passwordHash,
          preferred_currency: preferredCurrency || 'USD',
          is_active: true,
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('[REGISTER] ✓ Supabase registration successful');
        
        const token = jwt.sign(
          { id: userData[0]?.id || userData.id, email, name },
          jwtSecret,
          { expiresIn: '7d' }
        );

        return NextResponse.json(
          {
            message: 'User registered successfully',
            user: {
              id: userData[0]?.id || userData.id,
              name: userData[0]?.name || userData.name,
              email: userData[0]?.email || userData.email,
              preferredCurrency: userData[0]?.preferred_currency || userData.preferred_currency,
            },
            token,
            source: 'supabase',
          },
          { status: 201 }
        );
      } else {
        throw new Error(`Supabase ${response.status}`);
      }
    } catch (supabaseErr) {
      console.log('[REGISTER] Supabase failed:', supabaseErr.message, '- Using shared user store');
      
      // Fallback: Shared user store with in-memory storage
      if (userStore.userExists(email)) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        );
      }

      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const passwordHash = await bcrypt.hash(password, 10);
      
      const userData = {
        id: userId,
        name,
        email,
        passwordHash,
        preferredCurrency: preferredCurrency || 'USD',
        createdAt: new Date().toISOString(),
      };

      userStore.addUser(email, userData);

      console.log('[REGISTER] ✓ Demo registration successful');

      const token = jwt.sign(
        { id: userId, email, name },
        jwtSecret,
        { expiresIn: '7d' }
      );

      return NextResponse.json(
        {
          message: 'User registered successfully (demo mode)',
          user: {
            id: userId,
            name,
            email,
            preferredCurrency: preferredCurrency || 'USD',
          },
          token,
          source: 'demo',
          note: 'Running in demo mode - Supabase not available',
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('[REGISTER] Unexpected error:', error.message);
    return NextResponse.json(
      {
        error: 'Registration failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}
