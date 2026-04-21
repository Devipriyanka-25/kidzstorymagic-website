// POST /api/auth/register
import bcrypt from 'bcryptjs';
import User from '@/lib/User';
import { generateToken } from '@/lib/jwt';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/responses';

export const dynamic = 'force-dynamic';

async function validateRegister(body) {
  const errors = [];
  
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.push('Name is required');
  }
  
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push('Valid email is required');
  }
  
  if (!body.password || body.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (body.preferredCurrency && !['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'INR'].includes(body.preferredCurrency)) {
    errors.push('Invalid preferred currency');
  }

  return errors;
}

export async function POST(request) {
  try {
    const body = await request.json();

    console.log('[REGISTER] Incoming request:', {
      email: body.email,
      contentType: request.headers.get('content-type'),
      timestamp: new Date().toISOString()
    });

    const errors = await validateRegister(body);
    if (errors.length > 0) {
      console.log('[REGISTER] Validation errors:', errors);
      return new Response(JSON.stringify({
        success: false,
        error: 'Validation failed',
        details: errors
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const { name, email, password, preferredCurrency } = body;

    // Check if user exists
    const existingUser = await User.findByEmail(email.toLowerCase());
    if (existingUser) {
      console.log('[REGISTER] Email already registered:', email);
      return new Response(JSON.stringify({
        success: false,
        error: 'Email already registered'
      }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      preferred_currency: preferredCurrency || 'USD'
    });

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email
    });

    console.log('[REGISTER] User registered successfully:', {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString()
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        preferredCurrency: user.preferred_currency
      }
    }), { status: 201, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('[REGISTER] Error:', {
      message: err.message,
      stack: err.stack,
      code: err.code
    });
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Registration failed',
      details: err.message
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
