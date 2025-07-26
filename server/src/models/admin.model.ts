import mongoose, { Schema } from "mongoose";
import { IAdmin } from "../types/user.types";

const AdminSchema = new Schema<IAdmin>({
    name: {
        type: String,
        required: [true, 'Admin name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Admin email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters']
    },
    role: {
        type: String,
        default: 'admin',
        immutable: true
    },
    isApproved: {
        type: Boolean,
        default: null,
    },
    isSystemAdmin: {
        type: Boolean,
        default: false,
    },
    isDisabled: {
        type: Boolean,
        default: false,
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    statusLogs: [{
        status: { type: String },
        timestamp: { type: Date },
        message: { type: String },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
    }]
}, {
    timestamps: true
});

export const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);