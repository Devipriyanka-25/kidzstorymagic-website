/**
 * Supabase Connectivity Test - Try to insert and query a test user
 * This helps debug why auth isn't working
 */

import { NextResponse } from 'next/server';
const bcrypt = require('bcryptjs');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
  };

  const supabaseUrl = 'https://wwninqezevmxlvtjhruo.supabase.co';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3bmlucWV6ZXZteGx2dGpocnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTI0MjUsImV4cCI6MjA5MjAyODQyNX0.sUJDiz980D3q-Lpt_R-ndJcojZD4dOZZr1nnB5d5IvA';

  try {
    // Test 1: Query for our test user
    const testEmail = 'test-supabase-connectivity@example.com';
    
    try {
      const queryRes = await fetch(
        `${supabaseUrl}/rest/v1/auth_users?email=eq.${encodeURIComponent(testEmail)}`,
        {
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
          },
        }
      );

      const existingUsers = await queryRes.json();
      results.tests.push({
        name: 'Query existing test user',
        status: queryRes.ok ? 'success' : 'error',
        statusCode: queryRes.status,
        userCount: Array.isArray(existingUsers) ? existingUsers.length : 'error',
      });

      // If test user already exists, skip insertion
      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        results.tests.push({
          name: 'Test user already exists',
          status: 'info',
          message: `Test user ${testEmail} already in database`,
        });
      } else {
        // Test 2: Try to insert a test user
        const passwordHash = await bcrypt.hash('TestPassword123!', 10);

        try {
          const insertRes = await fetch(`${supabaseUrl}/rest/v1/auth_users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': anonKey,
              'Authorization': `Bearer ${anonKey}`,
            },
            body: JSON.stringify({
              name: 'Test User',
              email: testEmail,
              password_hash: passwordHash,
              preferred_currency: 'USD',
              is_active: true,
            }),
          });

          const insertedData = await insertRes.json();

          results.tests.push({
            name: 'Insert test user',
            status: insertRes.ok ? 'success' : 'error',
            statusCode: insertRes.status,
            response: insertedData,
          });

          // Test 3: Query back the inserted user
          if (insertRes.ok) {
            const queryRes2 = await fetch(
              `${supabaseUrl}/rest/v1/auth_users?email=eq.${encodeURIComponent(testEmail)}`,
              {
                headers: {
                  'apikey': anonKey,
                  'Authorization': `Bearer ${anonKey}`,
                },
              }
            );

            const queriedUsers = await queryRes2.json();
            results.tests.push({
              name: 'Query back inserted user',
              status: queryRes2.ok ? 'success' : 'error',
              statusCode: queryRes2.status,
              userCount: Array.isArray(queriedUsers) ? queriedUsers.length : 'error',
              userData: Array.isArray(queriedUsers) && queriedUsers.length > 0 ? queriedUsers[0] : null,
            });
          }
        } catch (insertErr) {
          results.tests.push({
            name: 'Insert test user',
            status: 'error',
            error: insertErr.message,
          });
        }
      }
    } catch (queryErr) {
      results.tests.push({
        name: 'Query existing test user',
        status: 'error',
        error: queryErr.message,
      });
    }

    // Test 4: Query the actual user that should have been created
    const userEmail = 'devipriyankak91@gmail.com';
    try {
      const userRes = await fetch(
        `${supabaseUrl}/rest/v1/auth_users?email=eq.${encodeURIComponent(userEmail)}`,
        {
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
          },
        }
      );

      const userData = await userRes.json();
      results.tests.push({
        name: `Query user: ${userEmail}`,
        status: userRes.ok ? 'success' : 'error',
        statusCode: userRes.status,
        found: Array.isArray(userData) && userData.length > 0,
        userCount: Array.isArray(userData) ? userData.length : 0,
      });
    } catch (userErr) {
      results.tests.push({
        name: `Query user: ${userEmail}`,
        status: 'error',
        error: userErr.message,
      });
    }

    results.summary = 'Supabase connectivity test complete';
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    results.error = error.message;
    results.summary = 'Test failed with error';
    return NextResponse.json(results, { status: 500 });
  }
}
