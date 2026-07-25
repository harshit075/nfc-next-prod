import { NFCCard, INFCCard, hashNFCToken } from '@/models/NFCCard';
import { Patient, IPatient } from '@/models/Patient';
import '@/models/Citizen'; // Make sure Citizen is registered

/**
 * NFC Repository — all database operations for NFC card lookups.
 */
export class NFCRepository {
  /**
   * Look up an NFC card by hashing the provided raw token.
   * Joins the associated patient record.
   *
   * @param rawToken - The raw token from the NFC chip URL.
   * @returns The populated NFC card document or null if not found.
   */
  async findCardByToken(rawToken: string): Promise<INFCCard | null> {
    const hashedToken = hashNFCToken(rawToken);
    return NFCCard.findOne({ hashedToken, status: 'active' })
      .select('+hashedToken')
      .populate('patientId')
      .exec();
  }

  /**
   * Increment the scan count and record the last scan timestamp for a card.
   * @param cardId - The NFC card's ObjectId string.
   */
  async recordScan(cardId: string): Promise<void> {
    await NFCCard.findByIdAndUpdate(cardId, {
      $inc: { scanCount: 1 },
      lastScannedAt: new Date(),
    }).exec();
  }
}

export default new NFCRepository();

/**
 * Patient Repository — patient-specific DB queries.
 */
export class PatientRepository {
  /**
   * Find a patient by their public UUID (safe for API exposure).
   * @param publicId - The patient's publicId field.
   */
  async findByPublicId(publicId: string): Promise<IPatient | null> {
    return Patient.findOne({ publicId, isActive: true }).exec();
  }

  /**
   * Find a patient by their associated userId.
   * @param userId - The linked User's ObjectId string.
   */
  async findByUserId(userId: string): Promise<IPatient | null> {
    return Patient.findOne({ userId, isActive: true }).exec();
  }
}

export const patientRepository = new PatientRepository();
