import authRepository from '@/repositories/authRepository';
import { writeAuditLog } from '@/repositories/auditLogRepository';
import AppError from '@/lib/utils/AppError';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '@/lib/helpers/tokenHelper';
import { HTTP_STATUS } from '@/lib/constants/roles';
import { TokenPair } from '@/lib/helpers/tokenHelper';

export interface LoginResult extends TokenPair {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Auth Service — all business logic for authentication flows.
 * Delegates DB access exclusively to AuthRepository.
 */
export class AuthService {
  /**
   * Authenticate a user with email and password.
   * Issues a JWT access token and an HTTP-only refresh token.
   *
   * @param email - User's email address.
   * @param password - Plaintext password.
   * @param ipAddress - Client IP for audit logging.
   * @param userAgent - Client user agent for session tracking.
   * @returns Login result containing token pair and public user data.
   * @throws AppError for invalid credentials or inactive account.
   */
  async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<LoginResult> {
    // Fetch user (includes password field)
    const user = await authRepository.findUserByEmail(email);

    if (!user || !(await user.comparePassword(password))) {
      await writeAuditLog({
        action: 'auth.login',
        status: 'failure',
        ipAddress,
        userAgent,
        metadata: { email },
      });
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', HTTP_STATUS.FORBIDDEN);
    }

    const payload = { userId: user._id.toString(), role: user.role };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Persist session (7-day expiry)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await authRepository.createSession(user._id.toString(), refreshToken, expiresAt, ipAddress, userAgent);
    await authRepository.updateLastLogin(user._id.toString());

    await writeAuditLog({
      actorId: user._id.toString(),
      actorRole: user.role,
      action: 'auth.login',
      resource: 'User',
      resourceId: user._id.toString(),
      status: 'success',
      ipAddress,
      userAgent,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Refresh the access token using a valid refresh token.
   * Invalidates the old session and issues a fresh token pair (token rotation).
   *
   * @param refreshToken - The raw refresh token from the cookie.
   * @param ipAddress - Client IP for audit logging.
   * @param userAgent - Client user agent.
   * @returns A new token pair.
   * @throws AppError if session is invalid or expired.
   */
  async refreshTokens(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<TokenPair> {
    // Verify token signature first
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token', HTTP_STATUS.UNAUTHORIZED);
    }

    // Check session in DB
    const session = await authRepository.findActiveSession(refreshToken);
    if (!session) {
      throw new AppError('Session not found or revoked. Please login again.', HTTP_STATUS.UNAUTHORIZED);
    }

    // Rotate: revoke old session, create new one
    await authRepository.revokeSession(session._id.toString());

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await authRepository.createSession(payload.userId, newRefreshToken, expiresAt, ipAddress, userAgent);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * Logout a user by revoking their current refresh token session.
   * @param refreshToken - The raw refresh token to revoke.
   * @param userId - The user's ID for audit logging.
   * @param ipAddress - Client IP for audit logging.
   */
  async logout(refreshToken: string, userId?: string, ipAddress?: string): Promise<void> {
    const session = await authRepository.findActiveSession(refreshToken);
    if (session) {
      await authRepository.revokeSession(session._id.toString());
    }

    await writeAuditLog({
      actorId: userId,
      action: 'auth.logout',
      status: 'success',
      ipAddress,
    });
  }
}

export default new AuthService();
