import mongoose, { Document, Schema } from 'mongoose';

/**
 * Audit log document for tracking security-sensitive operations.
 */
export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  actorId?: mongoose.Types.ObjectId;    // Who performed the action (null = anonymous)
  actorRole?: string;
  action: string;                        // e.g. 'auth.login', 'card.scan', 'report.view'
  resource?: string;                     // e.g. 'Patient', 'NFCCard'
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    actorRole: String,
    action: { type: String, required: true, index: true },
    resource: String,
    resourceId: String,
    ipAddress: String,
    userAgent: String,
    status: { type: String, enum: ['success', 'failure'], required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;
