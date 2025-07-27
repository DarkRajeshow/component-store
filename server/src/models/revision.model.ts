import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRevision extends Document {
  revisionNumber: string;
  issueNumber: string;
  remark: string;
  fileId: string; // UUID of the uploaded file (no extension)
  date: Date;
  createdBy: mongoose.Types.ObjectId; // User reference
  component: mongoose.Types.ObjectId; // Reference to Component
  originalFileName?: string; // Optional: store original file name
  createdAt: Date;
  updatedAt: Date;
}

const RevisionSchema = new Schema<IRevision>(
  {
    revisionNumber: { type: String, required: true },
    issueNumber: { type: String, required: true },
    remark: { type: String, required: true },
    fileId: { type: String, required: true },
    date: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    component: { type: Schema.Types.ObjectId, ref: 'Component', required: true },
    originalFileName: { type: String },
  },
  {
    timestamps: true,
  }
);

const Revision = mongoose.model<IRevision>('Revision', RevisionSchema);
export default Revision;
