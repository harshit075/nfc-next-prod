import { NextRequest } from 'next/server';
import { verifyAccessToken, TokenPayload } from '@/lib/helpers/tokenHelper';
import AppError from '@/lib/utils/AppError';
import { HTTP_STATUS, UserRole } from '@/lib/constants/roles';

/**
 * Helper: Authenticate requests by verifying the JWT access token from the Authorization header.
 * @param req - NextRequest object
 * @returns Decoded TokenPayload
 * @throws AppError if authentication fails
 */
export function authenticate(req: NextRequest): TokenPayload {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication token is missing or malformed', HTTP_STATUS.UNAUTHORIZED);
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyAccessToken(token);
    return payload;
  } catch {
    throw new AppError('Invalid or expired access token. Please login again.', HTTP_STATUS.UNAUTHORIZED);
  }
}

/**
 * Helper: Authorize user role.
 * @param user - Decoded TokenPayload
 * @param allowedRoles - List of allowed roles
 * @throws AppError if unauthorized
 */
export function authorize(user: TokenPayload, ...allowedRoles: UserRole[]): void {
  if (!allowedRoles.includes(user.role)) {
    throw new AppError(
      `Access denied. Role '${user.role}' is not permitted to access this resource.`,
      HTTP_STATUS.FORBIDDEN
    );
  }
}
