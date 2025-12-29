import { NextResponse } from 'next/server';
import { clearTokenCookie } from '@/lib/auth';
import { successResponse } from '@/lib/utils';

export async function POST() {
  try {
    const response = NextResponse.json(
      successResponse(null, 'Logout successful')
    );

    clearTokenCookie(response);

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}