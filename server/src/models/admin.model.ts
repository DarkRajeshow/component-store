import mongoose, { Schema } from "mongoose";
import { FinalApprovalStatus, IAdmin } from "../types/user.types";

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
        type: String,
        enum: Object.values(FinalApprovalStatus),
        default: FinalApprovalStatus.PENDING,
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

// Virtual population for approver
AdminSchema.virtual('approver', {
    ref: 'Admin',
    localField: 'approvedBy',
    foreignField: '_id',
    justOne: true
});


export const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);