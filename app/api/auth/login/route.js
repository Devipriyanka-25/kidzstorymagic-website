/**
 * Auth Login Endpoint - IMPROVED
 * POST /api/auth/login
 * Strategy: Demo User → Supabase REST API → Shared User Store
 */

import { NextResponse } from 'next/server';
import { userStore } from '../../shared/userStore.js';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('[LOGIN] Login attempt for:', email);
    const jwtSecret = process.env.JWT_SECRET || 'kidz-story-magic-jwt-secret-key-2024-production-secure-random-12345';

    // Check demo user
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      console.log('[LOGIN] ✓ Demo user login');
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

      return NextResponse.json({
        message: 'Login successful',
        user: {
          id: DEMO_USER.id,
          name: DEMO_USER.name,
          email: DEMO_USER.email,
          preferredCurrency: 'USD',
        },
        token,
        source: 'demo',
      }, { status: 200 });
    }

    // Try Supabase
    let supabaseError = null;
    try {
      console.log('[LOGIN] Checking Supabase...');
      const supabaseUrl = 'https://wwninqezevmxlvtjhruo.supabase.co';
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3bmlucWV6ZXZteGx2dGpocnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTI0MjUsImV4cCI6MjA5MjAyODQyNX0.sUJDiz980D3q-Lpt_R-ndJcojZD4dOZZr1nnB5d5IvA';

      const queryUrl = `${supabaseUrl}/rest/v1/auth_users?email=eq.${encodeURIComponent(email)}&select=*`;
      const response = await fetch(queryUrl, {
        method: 'GET',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('[LOGIN] Supabase status:', response.status);

      if (!response.ok) {
        throw new Error(`Supabase ${response.status}`);
      }

      const users = await response.json();

      if (users && users.length > 0) {
        const user = users[0];
        console.log('[LOGIN] Found user in Supabase');
        
        if (!user.password_hash) {
          throw new Error('User account corrupted');
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
          console.log('[LOGIN] Password mismatch');
          return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
          );
        }

        console.log('[LOGIN] ✓ Supabase login success');
        const token = jwt.sign(
          { id: user.id, email: user.email, name: user.name },
          jwtSecret,
          { expiresIn: '7d' }
        );

        userStore.addUser(email, {
          id: user.id,
          name: user.name,
          email: user.email,
          passwordHash: user.password_hash,
          preferredCurrency: user.preferred_currency,
        });

        return NextResponse.json({
          message: 'Login successful',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            preferredCurrency: user.preferred_currency,
          },
          token,
          source: 'supabase',
        }, { status: 200 });
      }

      supabaseError = 'User not found';
      console.log('[LOGIN] User not in Supabase');
    } catch (err) {
      supabaseError = err.message;
      console.log('[LOGIN] Supabase error:', supabaseError);
    }

    // Check shared store
    console.log('[LOGIN] Checking shared store...');
    const storedUser = userStore.getUser(email);

    if (storedUser) {
      console.log('[LOGIN] Found in shared store');
      
      if (!storedUser.passwordHash) {
        return NextResponse.json(
          { error: 'Account error' },
          { status: 500 }
        );
      }

      const match = await bcrypt.compare(password, storedUser.passwordHash);
      if (!match) {
        console.log('[LOGIN] Password mismatch in store');
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      console.log('[LOGIN] ✓ Store login success');
      const token = jwt.sign(
        { id: storedUser.id, email: storedUser.email, name: storedUser.name },
        jwtSecret,
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        message: 'Login successful',
        user: {
          id: storedUser.id,
          name: storedUser.name,
          email: storedUser.email,
          preferredCurrency: storedUser.preferredCurrency,
        },
        token,
        source: 'store',
      }, { status: 200 });
    }

    console.log('[LOGIN] User not found anywhere');
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('[LOGIN] Error:', error.message);
    return NextResponse.json(
      { error: 'Login failed', details: error.message },
      { status: 500 }
    );
  }
}
