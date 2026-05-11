/**
 * Supabase Connection Diagnostic Endpoint
 * Tests connection and queries to identify auth issues
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const diagnostics = {
    timestamp: new Date().toISOString(),
    tests: [],
  };

  try {
    // Test 1: Check environment variables
    const hasJwtSecret = !!process.env.JWT_SECRET;
    const supabaseUrl = String(process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
    const supabaseKey = String(
      process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
    ).trim();

    diagnostics.tests.push({
      name: 'Environment Variables',
      passed: hasJwtSecret && Boolean(supabaseUrl) && Boolean(supabaseKey),
      details: `JWT_SECRET: ${hasJwtSecret ? 'set' : 'missing'}, SUPABASE_URL: ${supabaseUrl ? 'set' : 'missing'}, SUPABASE_KEY: ${supabaseKey ? 'set' : 'missing'}`,
    });

    // Test 2: Check Supabase connectivity
    if (!supabaseUrl || !supabaseKey) {
      diagnostics.tests.push({
        name: 'Supabase Connectivity',
        passed: false,
        error:
          'NEXT_PUBLIC_SUPABASE_URL and a server-side Supabase key are required.',
      });
    } else {
      try {
        const connTest = await fetch(`${supabaseUrl}/rest/v1/`, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        });

        diagnostics.tests.push({
          name: 'Supabase Connectivity',
          passed: connTest.ok,
          statusCode: connTest.status,
          details: connTest.ok ? 'Connected successfully' : `Error: ${connTest.status}`,
        });
      } catch (err) {
        diagnostics.tests.push({
          name: 'Supabase Connectivity',
          passed: false,
          error: err.message,
        });
      }
    }

    // Test 3: Check if auth_users table exists
    if (!supabaseUrl || !supabaseKey) {
      diagnostics.tests.push({
        name: 'auth_users Table',
        passed: false,
        error:
          'NEXT_PUBLIC_SUPABASE_URL and a server-side Supabase key are required.',
      });
    } else {
      try {
        const tableTest = await fetch(
          `${supabaseUrl}/rest/v1/auth_users?limit=0`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
          }
        );

        diagnostics.tests.push({
          name: 'auth_users Table',
          passed: tableTest.ok,
          statusCode: tableTest.status,
          details: tableTest.ok ? 'Table accessible' : `Error: ${tableTest.status}`,
        });

        if (!tableTest.ok) {
          const errorBody = await tableTest.text();
          diagnostics.tests[diagnostics.tests.length - 1].errorBody = errorBody;
        }
      } catch (err) {
        diagnostics.tests.push({
          name: 'auth_users Table',
          passed: false,
          error: err.message,
        });
      }
    }

    // Test 4: Try to query existing user by email (from URL params)
    const emailParam = request.nextUrl.searchParams.get('email');
    if (emailParam) {
      try {
        const userTest = await fetch(
          `${supabaseUrl}/rest/v1/auth_users?email=eq.${encodeURIComponent(emailParam)}`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
          }
        );

        const userData = await userTest.json();
        diagnostics.tests.push({
          name: `Query User: ${emailParam}`,
          passed: userTest.ok,
          statusCode: userTest.status,
          userCount: Array.isArray(userData) ? userData.length : 0,
          details: userTest.ok ? `Found ${Array.isArray(userData) ? userData.length : 0} user(s)` : userTest.statusText,
        });
      } catch (err) {
        diagnostics.tests.push({
          name: `Query User: ${emailParam}`,
          passed: false,
          error: err.message,
        });
      }
    }

    // Overall status
    diagnostics.allTestsPassed = diagnostics.tests.every((t) => t.passed);

    return NextResponse.json(diagnostics, { status: 200 });
  } catch (error) {
    diagnostics.error = error.message;
    return NextResponse.json(diagnostics, { status: 500 });
  }
}
