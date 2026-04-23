/**
 * Auth Login Endpoint
 * Serverless implementation: POST /api/auth/login
 * Strategy: Demo User → Supabase REST API → Mock Database Fallback
 */

import { NextResponse } from 'next/server';
import { userStore } from '../../shared/userStore.js';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Demo user credentials for testing
const DEMO_USER = {
  email: 'demo@example.com',
  password: 'Demo@123456',
  name: 'Demo User',
  id: 'demo_user_001',
};

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

    // Check for demo credentials first (these are available for testing)
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      console.log('[LOGIN] ✓ Demo user login successful - returning demo token');
      
      // Add demo user to shared store for subsequent API calls
      userStore.addUser(DEMO_USER.email, {
        id: DEMO_USER.id,
        name: DEMO_USER.name,
        email: DEMO_USER.email,
        preferredCurrency: 'USD',
        createdAt: new Date().toISOString(),
      });
      
      const token = jwt.sign(
        { id: DEMO_USER.id, email: DEMO_USER.email, name: DEMO_USER.name },
        jwtSecret,
        { expiresIn: '7d' }
      );

      return NextResponse.json(
        {
          message: 'Login successful',
          user: {
            id: DEMO_USER.id,
            name: DEMO_USER.name,
            email: DEMO_USER.email,
            preferredCurrency: 'USD',
          },
          token,
          source: 'demo',
        },
        { status: 200 }
      );
    }

    // Try Supabase REST API
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

      if (users && users.length > 0) {
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
          { id: user.id, email: user.email, name: user.name },
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
      }

      throw new Error('User not found in Supabase');
    } catch (supabaseErr) {
      console.log('[LOGIN] Supabase failed:', supabaseErr.message, '- Checking user store');
    }

    // Fallback: Check shared user store
    const demoUser = userStore.getUser(email);

    if (demoUser) {
      console.log('[LOGIN] ✓ Found user in shared store');
      const passwordMatch = await bcrypt.compare(password, demoUser.passwordHash);

      if (!passwordMatch) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const token = jwt.sign(
        { id: demoUser.id, email: demoUser.email, name: demoUser.name },
        jwtSecret,
        { expiresIn: '7d' }
      );

      return NextResponse.json(
        {
          message: 'Login successful (shared store)',
          user: {
            id: demoUser.id,
            name: demoUser.name,
            email: demoUser.email,
            preferredCurrency: demoUser.preferredCurrency,
          },
          token,
          source: 'shared-store',
        },
        { status: 200 }
      );
    }

    // If no user found anywhere, provide helpful message
    console.log('[LOGIN] ✗ User not found anywhere');
    console.log('[LOGIN] Available users in store:', userStore.getAllUsers().length);
    
    return NextResponse.json(
      { 
        error: 'Invalid email or password',
        details: 'User not found. Please sign up first.',
      },
      { status: 401 }
    );
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
