// GET/PUT /api/auth/me - Get or update current user profile
import User from '@/lib/User';
import { authenticateRequest } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const decoded = authenticateRequest(request);
    if (!decoded || !decoded.id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No token provided'
      }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const user = await User.findById(decoded.id);
    
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User not found'
      }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      success: true,
      data: user
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('[AUTH_ME_GET] Error:', err.message);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch user',
      details: err.message
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function PUT(request) {
  try {
    const decoded = authenticateRequest(request);
    if (!decoded || !decoded.id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No token provided'
      }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const body = await request.json();
    const { name, profilePictureUrl, preferredCurrency, location } = body;

    // Validate currency if provided
    if (preferredCurrency && !['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'INR'].includes(preferredCurrency)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid preferred currency'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const user = await User.update(decoded.id, {
      name,
      profile_picture_url: profilePictureUrl,
      preferred_currency: preferredCurrency,
      location
    });

    console.log('[AUTH_ME_PUT] User updated:', {
      userId: decoded.id,
      timestamp: new Date().toISOString()
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Profile updated successfully',
      data: user
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('[AUTH_ME_PUT] Error:', err.message);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update profile',
      details: err.message
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
