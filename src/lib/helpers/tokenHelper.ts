import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRole } from '../constants/roles';

export interface TokenPayload {
  userId: string;
  role: UserRole;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate a signed JWT access token.
 * @param payload - Token payload containing userId and role.
 * @returns Signed JWT access token string.
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_ACCESS_SECRET;
  const expiration = process.env.JWT_ACCESS_EXPIRATION || '15m';

  if (!secret) throw new Error('JWT_ACCESS_SECRET is not configured');

  return jwt.sign(payload, secret, { expiresIn: expiration } as jwt.SignOptions);
};

/**
 * Generate a signed JWT refresh token.
 * @param payload - Token payload containing userId and role.
 * @returns Signed JWT refresh token string.
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  const expiration = process.env.JWT_REFRESH_EXPIRATION || '7d';

  if (!secret) throw new Error('JWT_REFRESH_SECRET is not configured');

  return jwt.sign(payload, secret, { expiresIn: expiration } as jwt.SignOptions);
};

/**
 * Verify and decode a JWT access token.
 * @param token - Signed JWT access token to verify.
 * @returns Decoded token payload.
 * @throws Error if token is invalid or expired.
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_SECRET is not configured');
  return jwt.verify(token, secret) as TokenPayload;
};

/**
 * Verify and decode a JWT refresh token.
 * @param token - Signed JWT refresh token to verify.
 * @returns Decoded token payload.
 * @throws Error if token is invalid or expired.
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET is not configured');
  return jwt.verify(token, secret) as TokenPayload;
};

/**
 * Generate a cryptographically secure random refresh token (used for session hashing).
 * @returns A hex-encoded 64-byte random string.
 */
export const generateSecureToken = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Hash a plaintext token using SHA-256 for safe database storage.
 * @param token - The raw token string.
 * @returns Hex-encoded SHA-256 hash.
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Get cookie options for set/clear operations.
 */
export const getRefreshTokenCookieOptions = () => {
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
    maxAge: sevenDays / 1000, // Next.js cookies use seconds for maxAge
    path: '/',
  };
};
