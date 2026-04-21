// Proxy: GET /api/auth/me -> Railway backend
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_API_URL || 'https://kidzstorymagic-api.railway.app/api';

export async function GET(request) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');

    const response = await axios.get(`${BACKEND_URL}/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
    });

    return new Response(JSON.stringify(response.data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Backend error' };

    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
