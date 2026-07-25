import mongoose, { Document, Schema } from 'mongoose';

export interface IEmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface IOrganPledge {
  pledgeId?: string;
  pledgedOrgans?: string[];
  signedDate?: string;
  signatureHash?: string;
  nottoVerified?: boolean;
}

export interface IMedicalReport {
  title_key?: string;
  issuer_key?: string;
  date?: string;
  status_key?: string;
  doctor_key?: string;
  name?: string;
  url?: string;
  uploadedAt?: Date;
}

export interface IReceipt {
  title_key?: string;
  issuer_key?: string;
  date?: string;
  amount?: string;
  status_key?: string;
}

export interface IRxItem {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface IPrescription {
  prescriptionId?: string;
  doctorName?: string;
  qualification?: string;
  hospitalName?: string;
  date?: string;
  diagnosis?: string;
  rxList?: IRxItem[];
  doctorNotes?: string;
  pdfUrl?: string;
  status?: string;
}

export interface ICitizen extends Document {
  _id: mongoose.Types.ObjectId;
  profileId: string;
  phoneNumber?: string;
  email?: string;
  fullName: string;
  bloodGroup: string;
  age?: number;
  address: string;
  allergies: string;
  medications: string;
  chronicConditions: string;
  specialInstructions: string;
  isDnr: boolean;
  emergencyContacts: IEmergencyContact[];
  organPledge?: IOrganPledge;
  insuranceCompany: string;
  insurancePolicyNumber: string;
  medicalReports: IMedicalReport[];
  receipts: IReceipt[];
  prescriptions: IPrescription[];
  isBloodDonor: boolean;
  donorRadiusKm: number;
  homeLat: number;
  homeLng: number;
  lifeCredits: number;
  selectedLanguage: string;
  profileCompleteness: number;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyContactSchema = new Schema<IEmergencyContact>(
  {
    name: { type: String, required: true },
    relation: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const OrganPledgeSchema = new Schema<IOrganPledge>(
  {
    pledgeId: String,
    pledgedOrgans: [String],
    signedDate: String,
    signatureHash: String,
    nottoVerified: { type: Boolean, default: false },
  },
  { _id: false }
);

const MedicalReportSchema = new Schema<IMedicalReport>(
  {
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now },
    title_key: String,
    issuer_key: String,
    date: String,
    status_key: String,
    doctor_key: String,
  },
  { _id: false }
);

const ReceiptSchema = new Schema<IReceipt>(
  {
    title_key: String,
    issuer_key: String,
    date: String,
    amount: String,
    status_key: String,
  },
  { _id: false }
);

const PrescriptionSchema = new Schema<IPrescription>(
  {
    prescriptionId: String,
    doctorName: String,
    qualification: String,
    hospitalName: String,
    date: String,
    diagnosis: String,
    rxList: [
      {
        medicineName: String,
        dosage: String,
        frequency: String,
        duration: String,
        instructions: String,
      }
    ],
    doctorNotes: String,
    pdfUrl: String,
    status: { type: String, default: 'Active' },
  },
  { _id: false }
);

const CitizenSchema = new Schema<ICitizen>(
  {
    profileId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    fullName: { type: String, required: true },
    bloodGroup: { type: String, default: 'Unknown' },
    age: { type: Number, default: null },
    address: { type: String, default: '' },
    allergies: { type: String, default: 'None' },
    medications: { type: String, default: 'None' },
    chronicConditions: { type: String, default: 'None' },
    specialInstructions: { type: String, default: 'None' },
    isDnr: { type: Boolean, default: false },
    emergencyContacts: [EmergencyContactSchema],
    organPledge: OrganPledgeSchema,
    insuranceCompany: { type: String, default: '' },
    insurancePolicyNumber: { type: String, default: '' },
    medicalReports: [MedicalReportSchema],
    receipts: [ReceiptSchema],
    prescriptions: [PrescriptionSchema],
    isBloodDonor: { type: Boolean, default: false },
    donorRadiusKm: { type: Number, default: 5.0 },
    homeLat: { type: Number, default: 12.9716 },
    homeLng: { type: Number, default: 77.5946 },
    lifeCredits: { type: Number, default: 0 },
    selectedLanguage: { type: String, default: 'English' },
    profileCompleteness: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'citizens' }
);

export const Citizen = mongoose.models.Citizen || mongoose.model<ICitizen>('Citizen', CitizenSchema);
export default Citizen;
