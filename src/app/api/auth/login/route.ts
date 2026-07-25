import { NextRequest, NextResponse } from 'next/server';
import { wrapApi } from '@/lib/utils/apiHandler';
import authService from '@/services/authService';
import { getRefreshTokenCookieOptions } from '@/lib/helpers/tokenHelper';
import { HTTP_STATUS } from '@/lib/constants/roles';

export const POST = wrapApi(async (req: NextRequest) => {
  const { email, password } = await req.json();
  const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || undefined;

  const result = await authService.login(email, password, ipAddress, userAgent);

  const response = NextResponse.json({
    success: true,
    message: 'Login successful',
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });

  // Set HTTP-only refresh token cookie
  response.cookies.set('refreshToken', result.refreshToken, getRefreshTokenCookieOptions());

  return response;
});
