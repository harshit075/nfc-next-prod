import mongoose, { Document, Schema } from 'mongoose';

export type ReportCategory = 'lab' | 'imaging' | 'pathology' | 'cardiology' | 'neurology' | 'general';

/**
 * Report document interface.
 */
export interface IReport extends Document {
  _id: mongoose.Types.ObjectId;
  publicId: string;
  patientId: mongoose.Types.ObjectId;
  hospitalName: string;
  doctorName: string;
  doctorId?: mongoose.Types.ObjectId;
  title: string;
  category: ReportCategory;
  department?: string;
  summary?: string;
  fileUrl?: string;        // S3/Cloudinary URL
  fileName?: string;
  fileSize?: number;
  reportDate: Date;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    hospitalName: { type: String, required: true, trim: true },
    doctorName: { type: String, required: true, trim: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['lab', 'imaging', 'pathology', 'cardiology', 'neurology', 'general'],
      required: true,
    },
    department: String,
    summary: String,
    fileUrl: String,
    fileName: String,
    fileSize: Number,
    reportDate: { type: Date, required: true },
    tags: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown> & { [key: string]: unknown }) => {
        const r = ret as any;
        delete r._id;
        delete r.__v;
        delete r.patientId;
        return ret;
      },
    },
  }
);

export const Report = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
export default Report;
