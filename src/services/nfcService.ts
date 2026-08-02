import mongoose from 'mongoose';
import crypto from 'crypto';
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
    let card = await nfcRepository.findCardByToken(rawToken);
    let patient = card ? (card.patientId as unknown as ICitizen) : null;

    // 1. If not resolved via card token, check if rawToken is a 6-character profileId
    if (!patient && rawToken.length === 6) {
      const Citizen = mongoose.models.Citizen || mongoose.model<ICitizen>('Citizen');
      const foundCitizen = await Citizen.findOne({ profileId: rawToken });
      if (foundCitizen) {
        patient = foundCitizen;
        card = {
          publicCardId: `card-${patient.profileId}-direct`,
          _id: new mongoose.Types.ObjectId(),
        } as any;
      }
    }

    // 2. If still not resolved and rawToken is a 64-character hash, check if it's the SHA-256 fallback hash of a profileId
    if (!patient && rawToken.length === 64) {
      const Citizen = mongoose.models.Citizen || mongoose.model<ICitizen>('Citizen');
      const citizens = await Citizen.find({});
      const foundCitizen = citizens.find(
        c => crypto.createHash('sha256').update(c.profileId).digest('hex') === rawToken
      );
      if (foundCitizen) {
        patient = foundCitizen;
        card = {
          publicCardId: `card-${patient.profileId}-fallback`,
          _id: new mongoose.Types.ObjectId(),
        } as any;
      }
    }

    if (!patient || !card) {
      await writeAuditLog({
        action: 'nfc.card.scan',
        status: 'failure',
        ipAddress,
        userAgent,
        metadata: { reason: 'invalid_token' },
      });
      throw new AppError('This NFC card is invalid or deactivated.', HTTP_STATUS.NOT_FOUND);
    }

    // Record the scan asynchronously without blocking the response
    if (card._id && card.publicCardId !== `card-${patient.profileId}-direct` && card.publicCardId !== `card-${patient.profileId}-fallback`) {
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
