import mongoose from 'mongoose';
import nfcRepository from '@/repositories/nfcRepository';
import { writeAuditLog } from '@/repositories/auditLogRepository';
import AppError from '@/lib/utils/AppError';
import { HTTP_STATUS } from '@/lib/constants/roles';
import { ICitizen } from '@/models/Citizen';
import '@/models/Citizen'; // Register Citizen model for population lookup

export interface NFCValidationResult {
  patient: ICitizen;
  cardPublicId: string;
}

/**
 * NFC Service — business logic for NFC card token validation and patient data retrieval.
 */
export class NFCService {
  /**
   * Validate an NFC card token and return the associated patient's emergency profile data.
   *
   * @param rawToken - The raw token extracted from the NFC card URL path parameter.
   * @param ipAddress - Client IP for audit logging.
   * @param userAgent - Client user agent.
   * @returns The patient profile linked to the card.
   * @throws AppError if the token is invalid, card is inactive, or patient not found.
   */
  async validateAndResolveCard(
    rawToken: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<NFCValidationResult> {
    const card = await nfcRepository.findCardByToken(rawToken);

    if (!card) {
      await writeAuditLog({
        action: 'nfc.card.scan',
        status: 'failure',
        ipAddress,
        userAgent,
        metadata: { reason: 'invalid_token' },
      });
      throw new AppError('This NFC card is invalid or deactivated.', HTTP_STATUS.NOT_FOUND);
    }

    // The patient should be populated on the card
    const patient = card.patientId as unknown as ICitizen;

    if (!patient) {
      throw new AppError('No patient profile associated with this card.', HTTP_STATUS.NOT_FOUND);
    }

    // Record the scan asynchronously without blocking the response
    if (card._id) {
      nfcRepository.recordScan(card._id.toString()).catch(() => null);
    }

    await writeAuditLog({
      action: 'nfc.card.scan',
      resource: 'NFCCard',
      resourceId: card.publicCardId,
      status: 'success',
      ipAddress,
      userAgent,
      metadata: { patientPublicId: patient.profileId },
    });

    return { patient, cardPublicId: card.publicCardId };
  }
}

export default new NFCService();
