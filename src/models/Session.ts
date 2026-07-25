import mongoose, { Document, Schema } from 'mongoose';

/**
 * Session document for tracking active refresh tokens.
 * Enables server-side invalidation of refresh tokens (logout all devices).
 */
export interface ISession extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  refreshTokenHash: string;  // SHA-256 hash of the refresh token
  userAgent?: string;
  ipAddress?: string;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshTokenHash: { type: String, required: true, select: false },
    userAgent: String,
    ipAddress: String,
    isRevoked: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }, // TTL index
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Session = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
export default Session;
