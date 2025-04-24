import mongoose, { Schema, Document } from "mongoose";
import { IProject } from "../types/project.types";

// Define the Project schema
const ProjectSchema = new Schema<IProject>({
    version: {
        type: Number,
        required: true,
        default: 1,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: true,
    },
    folder: {
        type: String,
        required: true,
        unique: true,
    },
    selectedCategory: {
        type: String,
        required: true,
    },
    selectedCategoryId: {
        type: String,
        required: true,
    },
    // selectedPage: {
    //     type: String,
    //     required: true,
    // },
    hierarchy: {
        type: Schema.Types.Mixed,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    accessTo: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            permissions: { type: String, enum: ["edit", "view"], default: "view" },
        },
    ],
    derivedDesigns: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Design",
        },
    ],
}, { timestamps: true });

// Export the Project model
export default mongoose.model<IProject>('Project', ProjectSchema);



// Example of creating a new project
// const createProject = async () => {
//     const newProject = await Project.create({
//         user: someUserId,
//         folder: "Project Folder",
//         selectedCategory: "Category 1",
//         selectedPage: "Page 1",
//         info: { /* additional info */ },
//         hierarchy: { /* hierarchy data */ },
//         accessTo: [{ userId: someUser Id, permissions: "edit" }],
//         derivedDesigns: [],
//     });
//     return newProject;
// };
