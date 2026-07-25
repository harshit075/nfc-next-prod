import { NextRequest, NextResponse } from 'next/server';
import { wrapApi } from '@/lib/utils/apiHandler';
import authService from '@/services/authService';
import { getRefreshTokenCookieOptions } from '@/lib/helpers/tokenHelper';
import { HTTP_STATUS } from '@/lib/constants/roles';
import AppError from '@/lib/utils/AppError';

export const POST = wrapApi(async (req: NextRequest) => {
  const refreshToken = req.cookies.get('refreshToken')?.value;

  if (!refreshToken) {
    throw new AppError('No refresh token provided', HTTP_STATUS.UNAUTHORIZED);
  }

  const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || undefined;

  const tokens = await authService.refreshTokens(refreshToken, ipAddress, userAgent);

  const response = NextResponse.json({
    success: true,
    message: 'Token refreshed successfully',
    data: { accessToken: tokens.accessToken },
  });

  // Rotate HTTP-only refresh token cookie
  response.cookies.set('refreshToken', tokens.refreshToken, getRefreshTokenCookieOptions());

  return response;
});
