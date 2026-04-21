// POST /api/auth/login
import bcrypt from 'bcryptjs';
import User from '@/lib/User';
import { generateToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

async function validateLogin(body) {
  const errors = [];
  
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push('Valid email is required');
  }
  
  if (!body.password) {
    errors.push('Password is required');
  }

  return errors;
}

export async function POST(request) {
  try {
    const body = await request.json();

    console.log('[LOGIN] Incoming request:', {
      email: body.email,
      timestamp: new Date().toISOString()
    });

    const errors = await validateLogin(body);
    if (errors.length > 0) {
      console.log('[LOGIN] Validation errors:', errors);
      return new Response(JSON.stringify({
        success: false,
        error: 'Validation failed',
        details: errors
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const { email, password } = body;

    // Find user
    const user = await User.findByEmail(email.toLowerCase());
    if (!user) {
      console.log('[LOGIN] User not found:', email);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid credentials'
      }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      console.log('[LOGIN] Invalid password for:', email);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid credentials'
      }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // Create JWT token
    const token = generateToken({
      id: user.id,
      email: user.email
    });

    console.log('[LOGIN] User logged in successfully:', {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString()
    });

    return new Response(JSON.stringify({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        preferred_currency: user.preferred_currency
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('[LOGIN] Error:', {
      message: err.message,
      stack: err.stack
    });
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Login failed',
      details: err.message
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
