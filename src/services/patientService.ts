import { patientRepository } from '@/repositories/nfcRepository';
import { reportRepository, prescriptionRepository, timelineRepository } from '@/repositories/patientDataRepository';
import AppError from '@/lib/utils/AppError';
import { HTTP_STATUS } from '@/lib/constants/roles';
import { IPatient } from '@/models/Patient';
import { IReport } from '@/models/Report';
import { IPrescription } from '@/models/Prescription';
import { ITimelineEvent } from '@/models/TimelineEvent';

/**
 * Patient Service — business logic for patient data retrieval.
 */
export class PatientService {
  /**
   * Get the full patient profile for an authenticated user.
   * @param userId - The authenticated user's ID.
   */
  async getProfileByUserId(userId: string): Promise<IPatient> {
    const patient = await patientRepository.findByUserId(userId);
    if (!patient) throw new AppError('Patient profile not found', HTTP_STATUS.NOT_FOUND);
    return patient;
  }

  /**
   * Get reports for a patient with optional filters.
   */
  async getReports(
    patientId: string,
    filters: {
      hospitalName?: string;
      doctorName?: string;
      category?: string;
      department?: string;
      fromDate?: string;
      toDate?: string;
    }
  ): Promise<IReport[]> {
    return reportRepository.findReportsByPatient(patientId, {
      ...filters,
      fromDate: filters.fromDate ? new Date(filters.fromDate) : undefined,
      toDate: filters.toDate ? new Date(filters.toDate) : undefined,
    });
  }

  /**
   * Get active prescriptions for a patient.
   */
  async getActivePrescriptions(patientId: string): Promise<IPrescription[]> {
    return prescriptionRepository.findPrescriptionsByPatient(patientId, true);
  }

  /**
   * Get all prescriptions for a patient.
   */
  async getAllPrescriptions(patientId: string): Promise<IPrescription[]> {
    return prescriptionRepository.findPrescriptionsByPatient(patientId, false);
  }

  /**
   * Get medical timeline events for a patient.
   */
  async getTimeline(patientId: string): Promise<ITimelineEvent[]> {
    return timelineRepository.findTimelineByPatient(patientId);
  }
}

export default new PatientService();
