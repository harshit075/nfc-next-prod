import mongoose, { Document, Schema } from 'mongoose';

/**
 * Emergency contact sub-document interface.
 */
export interface IEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

/**
 * Patient document interface extending Mongoose Document.
 */
export interface IPatient extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  publicId: string; // UUID used in API responses, never expose _id
  fullName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  profilePhotoUrl?: string;
  phone?: string;
  address?: string;
  criticalAllergies: string[];
  currentMedicines: string[];
  medicalConditions: string[];
  medicalDevices: string[];
  emergencyContacts: IEmergencyContact[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyContactSchema = new Schema<IEmergencyContact>(
  {
    name: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const PatientSchema = new Schema<IPatient>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    profilePhotoUrl: String,
    phone: String,
    address: String,
    criticalAllergies: [{ type: String, trim: true }],
    currentMedicines: [{ type: String, trim: true }],
    medicalConditions: [{ type: String, trim: true }],
    medicalDevices: [{ type: String, trim: true }],
    emergencyContacts: [EmergencyContactSchema],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown> & { [key: string]: unknown }) => {
        const r = ret as any;
        delete r._id;
        delete r.__v;
        delete r.userId;
        return ret;
      },
    },
  }
);

export const Patient = mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
export default Patient;
