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

    // FIXED BUG 1: Normalize email for consistency
    const normalizedEmail = email.toLowerCase().trim();
    console.log('[REGISTER] Processing registration for:', normalizedEmail);

    const jwtSecret = process.env.JWT_SECRET || 'kidz-story-magic-jwt-secret-key-2024-production-secure-random-12345';

    // CRITICAL: Hash password first (use for both Supabase and fallback)
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('[REGISTER] ✓ Password hashed');

    // Try Supabase REST API first
    try {
      console.log('[REGISTER] Attempting Supabase REST API...');
      
      const supabaseUrl = 'https://wwninqezevmxlvtjhruo.supabase.co';
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3bmlucWV6ZXZteGx2dGpocnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTI0MjUsImV4cCI6MjA5MjAyODQyNX0.sUJDiz980D3q-Lpt_R-ndJcojZD4dOZZr1nnB5d5IvA';

      const insertPayload = {
        name,
        email: normalizedEmail,
        password_hash: passwordHash,
        preferred_currency: preferredCurrency || 'USD',
        is_active: true,
      };

      console.log('[REGISTER] Posting to Supabase:', { name, email: normalizedEmail, has_password_hash: !!passwordHash });

      const response = await fetch(`${supabaseUrl}/rest/v1/auth_users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(insertPayload),
      });

      console.log('[REGISTER] Supabase response status:', response.status);
      const responseData = await response.json();
      console.log('[REGISTER] Supabase response:', responseData);

      if (response.ok && responseData && responseData.length > 0) {
        const userData = responseData[0];
        console.log('[REGISTER] ✓ Supabase registration successful');
        
        // Also add to shared store for consistency
        userStore.addUser(normalizedEmail, {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          passwordHash,
          preferredCurrency: userData.preferred_currency,
          createdAt: userData.created_at,
        });
        
        const token = jwt.sign(
          { id: userData.id, email, name },
          jwtSecret,
          { expiresIn: '7d' }
        );

        return NextResponse.json(
          {
            message: 'User registered successfully',
            user: {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              preferredCurrency: userData.preferred_currency,
            },
            token,
            source: 'supabase',
          },
          { status: 201 }
        );
      } else if (response.status === 409) {
        console.log('[REGISTER] Email already exists in Supabase');
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        );
      } else {
        throw new Error(`Supabase ${response.status}: ${JSON.stringify(responseData)}`);
      }
    } catch (supabaseErr) {
      console.log('[REGISTER] Supabase failed:', supabaseErr.message, '- Using shared user store');
      
      // Fallback: Shared user store with in-memory storage
      if (userStore.userExists(normalizedEmail)) {
        console.log('[REGISTER] Email already exists in shared store:', normalizedEmail);
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        );
      }

      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const userData = {
        id: userId,
        name,
        email: normalizedEmail,
        passwordHash, // Store the hashed password
        preferredCurrency: preferredCurrency || 'USD',
        createdAt: new Date().toISOString(),
      };

      userStore.addUser(normalizedEmail, userData);
      console.log('[REGISTER] ✓ Shared store registration successful');

      const token = jwt.sign(
        { id: userId, email: normalizedEmail, name },
        jwtSecret,
        { expiresIn: '7d' }
      );

      console.log('[REGISTER] ✓ User registered successfully in shared store');
      return NextResponse.json(
        {
          message: 'User registered successfully',
          user: {
            id: userId,
            name,
            email: normalizedEmail,
            preferredCurrency: preferredCurrency || 'USD',
          },
          token,
          source: 'shared-store',
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
