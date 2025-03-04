import mongoose, { Schema, Document } from "mongoose";

// Define the interface for the Project document
interface IAccess {
    userId: mongoose.Types.ObjectId;
    permissions: "edit" | "view"; // Enum for permissions
}

interface IProject extends Document {
    user: mongoose.Types.ObjectId; // Reference to the User
    folder: string; // Unique folder name
    selectedCategory: string; // Selected category
    selectedPage: string; // Selected page
    info: any; // Mixed type for additional info
    hierarchy: any; // Mixed type for hierarchy
    accessTo: IAccess[]; // Array of access permissions
    derivedDesigns: mongoose.Types.ObjectId[]; // Array of references to Design
}

// Define the Project schema
const ProjectSchema = new Schema < IProject > ({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
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
    selectedPage: {
        type: String,
        required: true,
    },
    info: {
        type: Schema.Types.Mixed,
        required: true,
    },
    hierarchy: {
        type: Schema.Types.Mixed,
        required: true,
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
export default mongoose.model < IProject > ('Project', ProjectSchema);



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
