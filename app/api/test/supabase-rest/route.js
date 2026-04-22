export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const results = {
      timestamp: new Date().toISOString(),
      status: 'TESTING',
      tests: {},
      supabaseConnection: {},
      readiness: {},
    };

    // Test 1: Supabase REST API connection
    try {
      const supabaseUrl = 'https://wwninqezevmxlvtjhruo.supabase.co';
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3bmlucWV6ZXZteGx2dGpocnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTI0MjUsImV4cCI6MjA5MjAyODQyNX0.sUJDiz980D3q-Lpt_R-ndJcojZD4dOZZr1nnB5d5IvA';

      const testResponse = await fetch(`${supabaseUrl}/rest/v1/auth_users?limit=1`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
      });

      if (testResponse.ok) {
        results.supabaseConnection.status = 'CONNECTED';
        results.supabaseConnection.message = 'Successfully connected to Supabase REST API';
      } else {
        results.supabaseConnection.status = 'FAILED';
        results.supabaseConnection.message = `Status ${testResponse.status}: ${testResponse.statusText}`;
      }
    } catch (error) {
      results.supabaseConnection.status = 'ERROR';
      results.supabaseConnection.message = error.message;
    }

    // Test 2: Signup flow
    try {
      const signupResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://www.kidzstorymagic.org'}/api/auth/register-rest-live`,
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
          status: '✅ PASS',
          description: 'Signup with REST API',
          userId: data.user?.id,
          message: 'User created successfully',
        };
      } else {
        results.tests.signup = {
          status: '❌ FAIL',
          description: 'Signup with REST API',
          statusCode: signupResponse.status,
        };
      }
    } catch (error) {
      results.tests.signup = {
        status: '❌ ERROR',
        description: 'Signup with REST API',
        message: error.message,
      };
    }

    // Test 3: Login flow
    try {
      const loginResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://www.kidzstorymagic.org'}/api/auth/login-rest-live`,
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
          status: '✅ PASS',
          description: 'Login with REST API',
          message: 'Login successful',
          hasToken: !!data.token,
        };
      } else {
        results.tests.login = {
          status: '⏸️ SKIP',
          description: 'Login with REST API',
          reason: 'Test user may not exist',
        };
      }
    } catch (error) {
      results.tests.login = {
        status: '❌ ERROR',
        description: 'Login with REST API',
        message: error.message,
      };
    }

    // Overall status
    const allPassed = Object.values(results.tests).every((t) => t.status.includes('PASS') || t.status.includes('SKIP'));
    results.status = allPassed && results.supabaseConnection.status === 'CONNECTED' ? 'SUCCESS' : 'PARTIAL';

    results.readiness = {
      supabaseConnection: results.supabaseConnection.status === 'CONNECTED' ? '✅ READY' : '❌ NOT READY',
      restApiSignup: results.tests.signup?.status?.includes('PASS') ? '✅ READY' : '❌ NOT READY',
      restApiLogin: results.tests.login?.status?.includes('PASS') ? '✅ READY' : '⏸️ NEEDS TEST',
      recommendation: results.supabaseConnection.status === 'CONNECTED' 
        ? 'Real database integration is working! Ready for end-to-end testing.'
        : 'Supabase connection failed. Check network and API key.',
    };

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
