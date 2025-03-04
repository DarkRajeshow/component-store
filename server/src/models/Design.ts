// Design.ts (model)
import mongoose, { Schema, Document } from "mongoose";

// Interface for Design document
export interface IDesign extends Document {
    user: mongoose.Types.ObjectId;
    code: number;
    folder: string;
    selectedCategory: string;
    selectedPage: string;
    designType: 'motor' | 'smiley';
    designInfo: any;
    structure: any;
    createdAt: Date;
    updatedAt: Date;
}

// Define the design schema
const DesignSchema = new Schema<IDesign>({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    code: {
        type: Number,
        default: 1,
        unique: true
    },
    folder: {
        type: String,
        required: true,
        unique: true
    },
    selectedCategory: {
        type: String,
        required: true,
    },
    selectedPage: {
        type: String,
        required: true,
    },
    designType: {
        type: String,
        required: true,
        enum: ['motor', 'smiley'],
        message: '{VALUE} is not a valid design type'
    },
    designInfo: {
        type: Schema.Types.Mixed,
        required: true
    },
    structure: {
        type: Schema.Types.Mixed,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to update the updatedAt field on save
DesignSchema.pre('save', async function (next) {
    const design = this;
    design.updatedAt = new Date();

    if (design.isNew) {
        try {
            const lastDesign = await mongoose.model('Design').findOne().sort({ code: -1 });
            design.code = lastDesign ? lastDesign.code + 1 : 1;
        } catch (error) {
            return next(error as Error);
        }
    }
    next();
});

export default mongoose.model<IDesign>('Design', DesignSchema);
