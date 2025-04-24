import mongoose, { Schema, Document } from "mongoose";
import { IDesign } from "../types/design.types";

// Define the Design schema
const DesignSchema = new Schema<IDesign>({
    version: {
        type: Number,
        required: [true, 'Version number is required'],
        default: 1,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'User ID is required'],
        ref: 'User',
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    sourceDesign: {
        type: Schema.Types.ObjectId,
        ref: 'Design',
        default: null
    },
    folder: {
        type: String,
        required: true,
    },
    categoryId: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    code: {
        type: String,
        required: true,
        unique : true,
    },
    hash: {
        type: String,
        required: true,
    },
    revisions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Revision",
        },
    ],
    accessTo: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Corrected reference
            permissions: { type: String, enum: ["edit", "view"], default: "view" },
        },
    ],
    structure: {
        type: Schema.Types.Mixed,
        required: true,
    },
    derivedDesigns: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Design",
        },
    ],
}, { timestamps: true });

// Export the Design model
export default mongoose.model<IDesign>('Design', DesignSchema);


// Example of creating a new design
// const createDesign = async () => {
//     const newDesign = await Design.create({
//         user: someUser Id,
//         folder: "Design Folder",
//         category: "Category 1",
//         code: "Design Code",
//         hash: "Generated Hash",
//         revisions: [],
//         selectedPage: "Page 1",
//         accessTo: [{ userId: someUser Id, permissions: "edit" }],
//         info: { /* additional info */ },
//         structure: { /* structure data */ },
//         derivedDesigns: [],
//     });
//     return newDesign;
// };