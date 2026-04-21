// Proxy: POST /api/auth/register -> Railway backend
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_API_URL || 'https://kidzstorymagic-api.railway.app/api';

export async function POST(request) {
  try {
    console.log('[PROXY_REGISTER_CALLED] Proxy route was invoked!');
    const body = await request.json();
    console.log('[PROXY_REGISTER] Forwarding to:', BACKEND_URL + '/auth/register');

    // Forward request to Railway backend
    const response = await axios.post(`${BACKEND_URL}/auth/register`, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[PROXY_REGISTER_SUCCESS] Response:', response.status);
    return new Response(JSON.stringify(response.data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.log('[PROXY_REGISTER_ERROR] Error:', error.message);
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Backend error' };

    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
