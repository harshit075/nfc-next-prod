import { NextRequest, NextResponse } from 'next/server';
import { wrapApi } from '@/lib/utils/apiHandler';
import authService from '@/services/authService';
import { authenticate } from '@/lib/middleware/auth';

export const POST = wrapApi(async (req: NextRequest) => {
  const refreshToken = req.cookies.get('refreshToken')?.value;
  const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';

  let userId: string | undefined;
  try {
    const user = authenticate(req);
    userId = user.userId;
  } catch {
    // Suppress error so logout succeeds even if access token is already expired
  }

  if (refreshToken) {
    await authService.logout(refreshToken, userId, ipAddress);
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
  // Clear the refresh token cookie
  response.cookies.set('refreshToken', '', { maxAge: 0, path: '/' });

  return response;
});
