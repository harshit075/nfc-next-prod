import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export type NFCCardStatus = 'active' | 'inactive' | 'revoked' | 'expired';

/**
 * NFC Card document interface.
 * Stores a hashed token; the raw token is only ever written to the physical NFC chip.
 */
export interface INFCCard extends Document {
  _id: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  hashedToken: string;       // SHA-256 hash of the raw token on the NFC chip
  publicCardId: string;      // UUID safe for API exposure
  status: NFCCardStatus;
  issuedAt: Date;
  expiresAt?: Date;
  lastScannedAt?: Date;
  scanCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const NFCCardSchema = new Schema<INFCCard>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Citizen',
      required: true,
      index: true,
    },
    hashedToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
      select: false, // Never return hashed token in queries by default
    },
    publicCardId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'revoked', 'expired'],
      default: 'active',
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: Date,
    lastScannedAt: Date,
    scanCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown> & { [key: string]: unknown }) => {
        const r = ret as any;
        delete r._id;
        delete r.__v;
        delete r.hashedToken;
        delete r.patientId;
        return ret;
      },
    },
  }
);

/**
 * Hash an NFC raw token using SHA-256.
 * @param rawToken - The raw token string stored on the NFC chip.
 * @returns The hex-encoded SHA-256 hash.
 */
export const hashNFCToken = (rawToken: string): string => {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};

export const NFCCard = mongoose.models.NFCCard || mongoose.model<INFCCard>('NFCCard', NFCCardSchema);
export default NFCCard;
