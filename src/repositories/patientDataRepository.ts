import { Report, IReport } from '@/models/Report';
import { Prescription, IPrescription } from '@/models/Prescription';
import { TimelineEvent, ITimelineEvent } from '@/models/TimelineEvent';

/**
 * Report Repository
 */
export class ReportRepository {
  /**
   * Get all reports for a patient, with optional filters.
   * @param patientId - Patient ObjectId string.
   * @param filters - Optional filter criteria.
   */
  async findReportsByPatient(
    patientId: string,
    filters: {
      hospitalName?: string;
      doctorName?: string;
      category?: string;
      department?: string;
      fromDate?: Date;
      toDate?: Date;
    } = {}
  ): Promise<IReport[]> {
    const query: Record<string, unknown> = { patientId, isActive: true };

    if (filters.hospitalName) query.hospitalName = new RegExp(filters.hospitalName, 'i');
    if (filters.doctorName) query.doctorName = new RegExp(filters.doctorName, 'i');
    if (filters.category) query.category = filters.category;
    if (filters.department) query.department = new RegExp(filters.department, 'i');
    if (filters.fromDate || filters.toDate) {
      const dateFilter: Record<string, Date> = {};
      if (filters.fromDate) dateFilter.$gte = filters.fromDate;
      if (filters.toDate) dateFilter.$lte = filters.toDate;
      query.reportDate = dateFilter;
    }

    return Report.find(query).sort({ reportDate: -1 }).exec();
  }

  /**
   * Find a single report by its public ID.
   * @param publicId - The report's public UUID.
   */
  async findByPublicId(publicId: string): Promise<IReport | null> {
    return Report.findOne({ publicId, isActive: true }).exec();
  }
}

/**
 * Prescription Repository
 */
export class PrescriptionRepository {
  /**
   * Get active prescriptions for a patient.
   * @param patientId - Patient ObjectId string.
   * @param activeOnly - If true, only return currently active prescriptions.
   */
  async findPrescriptionsByPatient(patientId: string, activeOnly = false): Promise<IPrescription[]> {
    const query: Record<string, unknown> = { patientId };
    if (activeOnly) query.isActive = true;
    return Prescription.find(query).sort({ prescribedAt: -1 }).exec();
  }
}

/**
 * Timeline Repository
 */
export class TimelineRepository {
  /**
   * Get all timeline events for a patient sorted by event date.
   * @param patientId - Patient ObjectId string.
   */
  async findTimelineByPatient(patientId: string): Promise<ITimelineEvent[]> {
    return TimelineEvent.find({ patientId, isActive: true }).sort({ eventDate: -1 }).exec();
  }
}

export const reportRepository = new ReportRepository();
export const prescriptionRepository = new PrescriptionRepository();
export const timelineRepository = new TimelineRepository();
