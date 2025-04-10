import mongoose, { Schema, Document } from "mongoose";

// Define the interface for the User document
interface IUserPreferences {
    theme: "light" | "dark"; // Enum for theme
    language: string; // Language preference
}

interface IUser extends Document {
    username: string; // Unique username
    email: string; // Unique email
    password: string; // User password
    dp: string; // Display picture
    role: "user" | "admin"; // User role
    preferences: IUserPreferences; // User preferences
    projects: mongoose.Types.ObjectId[]; // Array of references to Project
    designs: mongoose.Types.ObjectId[]; // Array of references to Design
    organization?: mongoose.Types.ObjectId; // Optional reference to Organization
}

// Define the User schema
const UserSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            unique: true,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        dp: {
            type: String,
            default: "newUser.png",
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        preferences: {
            theme: {
                type: String,
                enum: ["light", "dark"],
                default: "light",
            },
            language: {
                type: String,
                default: "en",
            },
        },
        projects: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Project",
            },
        ],
        designs: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Design",
            },
        ],
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            default: null, // For team-based access later
        },
    },
    { timestamps: true }
);

// Export the User model
export default mongoose.model<IUser>("User", UserSchema);