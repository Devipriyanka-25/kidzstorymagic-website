/**
 * Mock Payment Processing Endpoint
 * POST /api/payment/process-mock
 * For testing end-to-end payment flows
 */

import { NextResponse } from 'next/server';
import { mockDB } from '../../lib/mock-db.js';
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    console.log('[PAYMENT-MOCK] Processing payment...');

    const body = await request.json();
    const { amount, currency, description } = body;

    // Extract and verify token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret || 'your-secret-key');
    } catch (err) {
      console.log('[PAYMENT-MOCK] Invalid token:', err.message);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate user exists
    const user = mockDB.findUserById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Validate payment details
    if (!amount || !currency) {
      return NextResponse.json(
        { error: 'Amount and currency are required' },
        { status: 400 }
      );
    }

    console.log('[PAYMENT-MOCK] Processing payment for user:', user.id);
    console.log('[PAYMENT-MOCK] Amount:', amount, currency);

    // Mock payment processing
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const result = {
      success: true,
      transactionId,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      payment: {
        amount,
        currency,
        description: description || 'Story Generation Service',
        status: 'completed',
        timestamp: new Date().toISOString()
      },
      mode: 'mock-test'
    };

    console.log('[PAYMENT-MOCK] Payment processed successfully:', transactionId);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[PAYMENT-MOCK] Error:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: 'Payment processing failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}
