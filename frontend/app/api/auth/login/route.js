// Proxy: POST /api/auth/login -> Railway backend
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_API_URL || 'https://kidzstorymagic-api.railway.app/api';

export async function POST(request) {
  try {
    const body = await request.json();

    // Forward request to Railway backend
    const response = await axios.post(`${BACKEND_URL}/auth/login`, body, {
      headers: {
        'Content-Type': 'application/json',
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
