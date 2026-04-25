import { NextResponse } from 'next/server';
import { sendTransactionalEmail } from '@/lib/email';
import { getEmailVerificationTemplate } from '@/lib/emailTemplates';
import { generateVerificationToken } from '../verify-email/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const { email, password, name, preferredCurrency } = await request.json();

  // Validate inputs
  if (!email || !password || !name) {
    return NextResponse.json(
      { error: 'Missing required fields: email, password, name' },
      { status: 400 }
    );
  }

  try {
    // Import bcryptjs
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const supabaseUrl = 'https://wwninqezevmxlvtjhruo.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3bmlucWV6ZXZteGx2dGpocnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTI0MjUsImV4cCI6MjA5MjAyODQyNX0.sUJDiz980D3q-Lpt_R-ndJcojZD4dOZZr1nnB5d5IvA';

    // Use Supabase REST API to insert user
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
        is_active: false,
        email_verified: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Supabase error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create user', details: errorData },
        { status: response.status }
      );
    }

    const user = await response.json();
    console.log('User created:', user);

    // Generate verification token
    const verificationToken = generateVerificationToken(email);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.kidzstorymagic.org';
    const verificationLink = `${appUrl}/auth/verify?token=${verificationToken}`;

    // Send verification email
    try {
      const emailTemplate = getEmailVerificationTemplate(name, verificationLink);
      await sendTransactionalEmail({
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
        idempotencyKey: `verify-${email}-${Date.now()}`,
      });
      console.log(`[EMAIL_SENT] Verification email sent to ${email}`);
    } catch (emailError) {
      console.error('[EMAIL_ERROR] Failed to send verification email:', emailError);
      // Don't fail registration if email fails, but log it
      // In production, you might want to retry or alert
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'kidz-story-magic-jwt-secret-key-2024-production-secure-random-12345';
    const token = jwt.sign(
      { id: user[0]?.id || 1, email, name, emailVerified: false },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user[0]?.id,
        name: user[0]?.name,
        email: user[0]?.email,
        preferredCurrency: user[0]?.preferred_currency,
        emailVerified: false,
      },
      token,
      message: 'User registered successfully. Verification email sent.',
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        error: 'Registration failed',
        message: error.message,
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
