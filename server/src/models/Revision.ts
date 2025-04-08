import mongoose, { Schema, Document, Model } from "mongoose";

// Define the interface for the Revision document
interface IRevision extends Document {
    revisionCode: string; // 4-digit code
    designId: mongoose.Types.ObjectId; // Reference to the Design
    changes: string[]; // Array of change messages
    createdAt: Date; // Timestamp of creation
    updatedBy?: mongoose.Types.ObjectId | null; // Optional reference to the User who made the changes
    description?: string; // Optional description of the changes
}

// Define the schema for the Revision model
const RevisionSchema = new Schema<IRevision>({
    revisionCode: {
        type: String,
        required: true,
        unique: true,
    },
    designId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Design",
    },
    changes: {
        type: [String],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    description: {
        type: String,
    },
});

// Define the model type explicitly
interface RevisionModel extends Model<IRevision> { }

// Pre-save hook to auto-increment the revisionCode
RevisionSchema.pre<IRevision>("save", async function (next) {
    if (this.isNew) {
        const Revision = this.model("Revision") as RevisionModel; // Explicitly cast to Model<IRevision>
        const lastRevision = await Revision.findOne({ designId: this.designId }).sort({ revisionCode: -1 });

        const lastCode = lastRevision ? parseInt(lastRevision.revisionCode) : 0;
        const newCode = (lastCode + 1).toString().padStart(4, '0'); // Increment and pad to 4 digits
        this.revisionCode = newCode;
    }
    next();
});

// Export the model with the correct type
const Revision = mongoose.model<IRevision, RevisionModel>("Revision", RevisionSchema);
export default Revision;
