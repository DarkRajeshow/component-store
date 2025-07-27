import mongoose, { Schema, Document } from 'mongoose';

export interface IComponent extends Document {
    name: string;
    description: string;
    issueNumber?: string; // Optional - set when first revision is uploaded
    latestRevisionNumber?: string; // Optional - set when first revision is uploaded
    componentCode: string;
    createdAt: Date;
    createdBy: mongoose.Types.ObjectId;
    lastUpdatedAt: Date;
    lastUpdatedBy: mongoose.Types.ObjectId;
    notifyTo: mongoose.Types.ObjectId[];
    revisions: mongoose.Types.ObjectId[];
}

const ComponentSchema = new Schema<IComponent>(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        issueNumber: { type: String, required: false }, // Will be set when first revision is uploaded
        latestRevisionNumber: { type: String, required: false }, // Will be set when first revision is uploaded
        componentCode: { type: String, required: true },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        notifyTo: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
        revisions: [{ type: Schema.Types.ObjectId, ref: 'Revision', required: true }],
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'lastUpdatedAt' },
    }
);

const Component = mongoose.model<IComponent>('Component', ComponentSchema);
export default Component; 