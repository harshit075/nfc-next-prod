import { AuditLog } from '@/models/AuditLog';
import logger from '@/lib/utils/logger';

export interface AuditLogEntry {
  actorId?: string;
  actorRole?: string;
  action: string;                        // e.g. 'auth.login', 'card.scan', 'report.view'
  resource?: string;                     // e.g. 'Patient', 'NFCCard'
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  metadata?: Record<string, unknown>;
}

/**
 * Write an audit log entry to the database.
 * Failures to log are captured and reported but do not interrupt the request.
 * @param entry - The audit log entry data.
 */
export const writeAuditLog = async (entry: AuditLogEntry): Promise<void> => {
  try {
    await AuditLog.create(entry);
  } catch (err) {
    logger.error('Failed to write audit log entry', err);
  }
};

export default { writeAuditLog };
