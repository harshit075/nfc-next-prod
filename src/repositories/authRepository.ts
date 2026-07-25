import { User, IUser } from '@/models/User';
import { Session, ISession } from '@/models/Session';
import { hashToken } from '@/lib/helpers/tokenHelper';

/**
 * Auth Repository — handles all database operations for authentication.
 * No business logic here; only raw DB access.
 */
export class AuthRepository {
  /**
   * Find a user by email address, including the password field.
   * @param email - The user's email address.
   */
  async findUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() }).select('+password').exec();
  }

  /**
   * Find a user by their MongoDB ObjectId.
   * @param userId - The user's ObjectId string.
   */
  async findUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId).exec();
  }

  /**
   * Update the lastLogin timestamp for a user.
   * @param userId - The user's ObjectId string.
   */
  async updateLastLogin(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { lastLogin: new Date() }).exec();
  }

  /**
   * Persist a new session record for a refresh token.
   * @param userId - The user's ObjectId string.
   * @param refreshToken - The raw (unhashed) refresh token.
   * @param expiresAt - Token expiry date.
   * @param ipAddress - Client IP address.
   * @param userAgent - Client user agent.
   */
  async createSession(
    userId: string,
    refreshToken: string,
    expiresAt: Date,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await Session.create({
      userId,
      refreshTokenHash: hashToken(refreshToken),
      expiresAt,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Find and return an active, non-revoked session that matches the given refresh token hash.
   * @param refreshToken - The raw refresh token to look up.
   */
  async findActiveSession(refreshToken: string): Promise<ISession | null> {
    const tokenHash = hashToken(refreshToken);
    return Session.findOne({
      refreshTokenHash: tokenHash,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    })
      .select('+refreshTokenHash')
      .exec();
  }

  /**
   * Revoke a session by its ID (logout single device).
   * @param sessionId - The session's ObjectId string.
   */
  async revokeSession(sessionId: string): Promise<void> {
    await Session.findByIdAndUpdate(sessionId, { isRevoked: true }).exec();
  }

  /**
   * Revoke all active sessions for a user (logout all devices).
   * @param userId - The user's ObjectId string.
   */
  async revokeAllUserSessions(userId: string): Promise<void> {
    await Session.updateMany({ userId, isRevoked: false }, { isRevoked: true }).exec();
  }
}

export default new AuthRepository();
