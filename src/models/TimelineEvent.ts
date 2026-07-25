import mongoose, { Document, Schema } from 'mongoose';

export type TimelineEventType = 'diagnosis' | 'hospitalization' | 'surgery' | 'medication' | 'vaccination' | 'test' | 'checkup' | 'allergy' | 'other';

/**
 * Medical Timeline Event document interface.
 */
export interface ITimelineEvent extends Document {
  _id: mongoose.Types.ObjectId;
  publicId: string;
  patientId: mongoose.Types.ObjectId;
  eventType: TimelineEventType;
  title: string;
  description?: string;
  hospitalName?: string;
  doctorName?: string;
  eventDate: Date;
  attachments?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TimelineEventSchema = new Schema<ITimelineEvent>(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    eventType: {
      type: String,
      enum: ['diagnosis', 'hospitalization', 'surgery', 'medication', 'vaccination', 'test', 'checkup', 'allergy', 'other'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: String,
    hospitalName: String,
    doctorName: String,
    eventDate: { type: Date, required: true },
    attachments: [{ type: String }],
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

export const TimelineEvent = mongoose.models.TimelineEvent || mongoose.model<ITimelineEvent>('TimelineEvent', TimelineEventSchema);
export default TimelineEvent;
