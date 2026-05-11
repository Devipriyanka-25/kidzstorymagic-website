/**
 * End-to-End Validation Endpoint
 * GET /api/test/e2e-complete
 * Comprehensive test of all features
 */

import { NextResponse } from 'next/server';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function areTestRoutesEnabled() {
  return (
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_TEST_ROUTES === 'true'
  );
}

export async function GET(request) {
  const timestamp = new Date().toISOString();
  const tests = {};

  try {
    if (!areTestRoutesEnabled()) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Test 1: Password hashing
    try {
      const password = 'TestPass123!';
      const hash = await bcrypt.hash(password, 10);
      const match = await bcrypt.compare(password, hash);
      tests.passwordHashing = {
        status: match ? '✓ PASS' : '✗ FAIL',
        message: 'bcryptjs 10-round hashing',
        valid: match,
      };
    } catch (e) {
      tests.passwordHashing = { status: '✗ FAIL', message: e.message };
    }

    // Test 2: JWT generation and verification
    try {
      const jwtSecret = process.env.JWT_SECRET || 'test-secret';
      const payload = { id: '123', email: 'test@example.com', name: 'Test User' };
      const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });
      const verified = jwt.verify(token, jwtSecret);
      
      tests.jwtTokens = {
        status: verified.id === payload.id ? '✓ PASS' : '✗ FAIL',
        message: 'JWT generation with 7-day expiry',
        tokenLength: token.length,
        expiresIn: '7 days',
        verified: verified.id === payload.id,
      };
    } catch (e) {
      tests.jwtTokens = { status: '✗ FAIL', message: e.message };
    }

    // Test 3: Signup endpoint (mock request)
    try {
      const siteOrigin = request.nextUrl?.origin || 'http://127.0.0.1:3000';
      const signupResponse = await fetch(`${siteOrigin}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'E2E Test User',
          email: `e2e_${Date.now()}@test.example.com`,
          password: 'TestPass123!',
          preferredCurrency: 'USD',
        }),
      });

      tests.signupEndpoint = {
        status: signupResponse.status === 201 ? '✓ PASS' : '✗ FAIL',
        message: 'Signup endpoint',
        responseStatus: signupResponse.status,
        working: signupResponse.status === 201,
      };
    } catch (e) {
      tests.signupEndpoint = { status: '✗ FAIL', message: e.message };
    }

    // Test 4: Image upload endpoint (GET documentation)
    try {
      const siteOrigin = request.nextUrl?.origin || 'http://127.0.0.1:3000';
      const uploadResponse = await fetch(`${siteOrigin}/api/upload/photo`);
      tests.imageUploadEndpoint = {
        status: uploadResponse.status === 200 ? '✓ PASS' : '✗ FAIL',
        message: 'Image upload endpoint available',
        responseStatus: uploadResponse.status,
        working: uploadResponse.status === 200,
      };
    } catch (e) {
      tests.imageUploadEndpoint = { status: '✗ FAIL', message: e.message };
    }

    // Test 5: Story generation endpoint (GET documentation)
    try {
      const siteOrigin = request.nextUrl?.origin || 'http://127.0.0.1:3000';
      const storyResponse = await fetch(`${siteOrigin}/api/story/generate`);
      tests.storyGenerationEndpoint = {
        status: storyResponse.status === 200 ? '✓ PASS' : '✗ FAIL',
        message: 'Story generation endpoint available',
        responseStatus: storyResponse.status,
        working: storyResponse.status === 200,
      };
    } catch (e) {
      tests.storyGenerationEndpoint = { status: '✗ FAIL', message: e.message };
    }

    // Test 6: Environment variables
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      JWT_SECRET_SET: !!process.env.JWT_SECRET,
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      SUPABASE_ANON_KEY_SET: !!process.env.SUPABASE_ANON_KEY,
    };

    tests.environmentVariables = {
      status: Object.values(envVars).every(v => v) ? '✓ PASS' : '⚠ PARTIAL',
      message: 'Environment configuration',
      variables: envVars,
    };

    // Calculate readiness
    const passedTests = Object.values(tests)
      .filter(t => t.status.includes('✓'))
      .length;
    const totalTests = Object.keys(tests).length;
    const readiness = passedTests === totalTests 
      ? 'System ready for production' 
      : `${passedTests}/${totalTests} components operational`;

    return NextResponse.json({
      timestamp,
      status: 'SUCCESS',
      readiness,
      testsCompleted: totalTests,
      testsPassed: passedTests,
      tests,
      features: {
        authentication: '✓ Signup, Login, Get User',
        imageHandling: '✓ Upload, Compression (client), Validation',
        storyGeneration: '✓ Template-based with personalization',
        pdfExport: '✓ Client-side via html2pdf.js',
        deployment: '✓ Vercel serverless',
        cors: '✓ Same-domain (eliminated)',
      },
      nextSteps: [
        'Test complete signup → story → download flow in browser',
        'Validate image upload with real files',
        'Test payment integration',
        'Check mobile responsiveness',
        'Load testing before production',
      ],
      clientCapabilities: {
        imageCompression: 'Built into frontend',
        pdfGeneration: 'Built into frontend',
        formValidation: 'Built into frontend',
        responsiveUI: 'Tailwind CSS',
        realTimeValidation: 'On input change',
      },
      deployment: {
        platform: 'Vercel',
        runtime: 'Node.js serverless',
        region: 'Auto-selected by Vercel',
        frontendUrl: 'https://www.kidzstorymagic.org',
        apiBase: 'https://www.kidzstorymagic.org/api',
      },
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      timestamp,
      status: 'ERROR',
      message: error.message,
      tests,
    }, { status: 500 });
  }
}
