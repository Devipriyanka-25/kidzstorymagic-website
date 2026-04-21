// Generic proxy for all other API routes
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_API_URL || 'https://kidzstorymagic-api.railway.app/api';

async function proxyRequest(method, pathname, request) {
  try {
    const backendUrl = `${BACKEND_URL}${pathname}`;
    const authHeader = request.headers.get('Authorization');
    const body = ['POST', 'PUT', 'PATCH'].includes(method) ? await request.json() : undefined;

    const response = await axios({
      method,
      url: backendUrl,
      data: body,
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
    const data = error.response?.data || { error: 'Backend proxy error' };

    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET(request, { params }) {
  const pathname = `/${params.path.join('/')}`;
  return proxyRequest('GET', pathname, request);
}

export async function POST(request, { params }) {
  const pathname = `/${params.path.join('/')}`;
  return proxyRequest('POST', pathname, request);
}

export async function PUT(request, { params }) {
  const pathname = `/${params.path.join('/')}`;
  return proxyRequest('PUT', pathname, request);
}

export async function DELETE(request, { params }) {
  const pathname = `/${params.path.join('/')}`;
  return proxyRequest('DELETE', pathname, request);
}

export async function PATCH(request, { params }) {
  const pathname = `/${params.path.join('/')}`;
  return proxyRequest('PATCH', pathname, request);
}
