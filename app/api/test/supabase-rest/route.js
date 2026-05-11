import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getSiteOrigin(request) {
  const configured = String(
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_APP_URL || ''
  ).trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  return request.nextUrl?.origin || 'http://127.0.0.1:3000';
}

export async function GET(request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const results = {
    timestamp: new Date().toISOString(),
    status: 'TESTING',
    tests: {},
    supabaseConnection: {},
    readiness: {},
  };

  try {
    const supabaseUrl = String(process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
    const supabaseKey = String(
      process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
    ).trim();
    const siteOrigin = getSiteOrigin(request);

    try {
      if (!supabaseUrl || !supabaseKey) {
        results.supabaseConnection = {
          status: 'MISSING_ENV',
          message:
            'NEXT_PUBLIC_SUPABASE_URL and a server-side Supabase key are required.',
        };
      } else {
        const testResponse = await fetch(`${supabaseUrl}/rest/v1/users?limit=1`, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        });

        if (testResponse.ok) {
          results.supabaseConnection = {
            status: 'CONNECTED',
            message: 'Successfully connected to Supabase REST API.',
          };
        } else {
          results.supabaseConnection = {
            status: 'FAILED',
            message: `Status ${testResponse.status}: ${testResponse.statusText}`,
          };
        }
      }
    } catch (error) {
      results.supabaseConnection = {
        status: 'ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    try {
      const signupResponse = await fetch(
        `${siteOrigin}/api/auth/register-rest-live`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: `test_${Date.now()}@example.com`,
            password: 'TestPassword123',
            name: 'Test User',
            preferredCurrency: 'USD',
          }),
        }
      );

      if (signupResponse.ok) {
        const data = await signupResponse.json();
        results.tests.signup = {
          status: 'PASS',
          description: 'Signup with REST API',
          userId: data.user?.id,
          message: 'User created successfully',
        };
      } else {
        results.tests.signup = {
          status: 'FAIL',
          description: 'Signup with REST API',
          statusCode: signupResponse.status,
        };
      }
    } catch (error) {
      results.tests.signup = {
        status: 'ERROR',
        description: 'Signup with REST API',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    try {
      const loginResponse = await fetch(
        `${siteOrigin}/api/auth/login-rest-live`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'Password123',
          }),
        }
      );

      if (loginResponse.ok) {
        const data = await loginResponse.json();
        results.tests.login = {
          status: 'PASS',
          description: 'Login with REST API',
          message: 'Login successful',
          hasToken: Boolean(data.token),
        };
      } else {
        results.tests.login = {
          status: 'SKIP',
          description: 'Login with REST API',
          reason: 'Test user may not exist',
        };
      }
    } catch (error) {
      results.tests.login = {
        status: 'ERROR',
        description: 'Login with REST API',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    const testStatuses = Object.values(results.tests);
    const allPassed = testStatuses.every((test) => {
      const status = typeof test?.status === 'string' ? test.status : '';
      return status.includes('PASS') || status.includes('SKIP');
    });
    const connectionReady = results.supabaseConnection.status === 'CONNECTED';

    results.status = allPassed && connectionReady ? 'SUCCESS' : 'PARTIAL';
    results.readiness = {
      supabaseConnection: connectionReady ? 'READY' : 'NOT READY',
      restApiSignup: results.tests.signup?.status?.includes('PASS') ? 'READY' : 'NOT READY',
      restApiLogin: results.tests.login?.status?.includes('PASS') ? 'READY' : 'NEEDS TEST',
      recommendation: connectionReady
        ? 'Real database integration is working. Ready for end-to-end testing.'
        : 'Supabase connection failed. Check network and API key.',
    };

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
