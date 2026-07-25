import mongoose, { Document, Schema } from 'mongoose';

/**
 * A single medicine dose timing entry.
 */
export interface IMedicineDose {
  name: string;
  dosage: string;
  morning: boolean;
  afternoon: boolean;
  night: boolean;
  durationDays: number;
  instructions?: string;
}

/**
 * Prescription document interface.
 */
export interface IPrescription extends Document {
  _id: mongoose.Types.ObjectId;
  publicId: string;
  patientId: mongoose.Types.ObjectId;
  doctorName: string;
  doctorId?: mongoose.Types.ObjectId;
  hospitalName: string;
  diagnosis: string;
  medicines: IMedicineDose[];
  notes?: string;
  isActive: boolean;
  prescribedAt: Date;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MedicineDoseSchema = new Schema<IMedicineDose>(
  {
    name: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true },
    morning: { type: Boolean, default: false },
    afternoon: { type: Boolean, default: false },
    night: { type: Boolean, default: false },
    durationDays: { type: Number, required: true, min: 1 },
    instructions: String,
  },
  { _id: false }
);

const PrescriptionSchema = new Schema<IPrescription>(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctorName: { type: String, required: true, trim: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User' },
    hospitalName: { type: String, required: true, trim: true },
    diagnosis: { type: String, required: true, trim: true },
    medicines: [MedicineDoseSchema],
    notes: String,
    isActive: { type: Boolean, default: true },
    prescribedAt: { type: Date, required: true },
    validUntil: Date,
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

export const Prescription = mongoose.models.Prescription || mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
export default Prescription;
