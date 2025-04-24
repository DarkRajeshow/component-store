import mongoose, { Schema, Document } from "mongoose";

// Define the interface for the Organization document
interface IMember {
    user: mongoose.Types.ObjectId; // Reference to User
    role: "admin" | "editor" | "viewer"; // Role of the member
    joinedAt: Date; // Timestamp of when the member joined
}

interface IOrganization extends Document {
    version: number; // Version of the organization schema
    owner: mongoose.Types.ObjectId; // Reference to User who owns the organization
    name: string; // Name of the organization
    description?: string; // Optional description of the organization
    members: IMember[]; // Array of members with their roles
}

// Define the Organization schema
const OrganizationSchema = new Schema<IOrganization>(
    {
        version: {
            type: Number,
            required: true,
            default: 1,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
            unique: true, // Ensure organization names are unique
        },
        description: {
            type: String,
            default: "", // Default to an empty string if not provided
        },
        members: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true, // Ensure user reference is required
                },
                role: {
                    type: String,
                    enum: ["admin", "editor", "viewer"],
                    default: "editor",
                },
                joinedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

// Export the Organization model
export default mongoose.model<IOrganization>("Organization", OrganizationSchema);