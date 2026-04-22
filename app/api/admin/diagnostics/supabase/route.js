/**
 * Supabase Connection Diagnostic Endpoint
 * Tests connection and queries to identify auth issues
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    tests: [],
  };

  try {
    // Test 1: Check environment variables
    const hasJwtSecret = !!process.env.JWT_SECRET;
    const supabaseUrl = 'https://wwninqezevmxlvtjhruo.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3bmlucWV6ZXZteGx2dGpocnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTI0MjUsImV4cCI6MjA5MjAyODQyNX0.sUJDiz980D3q-Lpt_R-ndJcojZD4dOZZr1nnB5d5IvA';

    diagnostics.tests.push({
      name: 'Environment Variables',
      passed: hasJwtSecret,
      details: `JWT_SECRET: ${hasJwtSecret ? 'set' : 'missing'}`,
    });

    // Test 2: Check Supabase connectivity
    try {
      const connTest = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
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

    // Test 3: Check if auth_users table exists
    try {
      const tableTest = await fetch(
        `${supabaseUrl}/rest/v1/auth_users?limit=0`,
        {
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
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

    // Test 4: Try to query existing user by email (from URL params)
    const emailParam = request.nextUrl.searchParams.get('email');
    if (emailParam) {
      try {
        const userTest = await fetch(
          `${supabaseUrl}/rest/v1/auth_users?email=eq.${encodeURIComponent(emailParam)}`,
          {
            headers: {
              'apikey': anonKey,
              'Authorization': `Bearer ${anonKey}`,
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
