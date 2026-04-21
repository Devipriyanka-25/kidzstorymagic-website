import { NextResponse } from 'next/server';

export async function GET(request) {
  return NextResponse.json({ message: 'API routes are working!' });
}
