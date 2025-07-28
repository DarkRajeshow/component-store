// src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';
import { ApprovalStatus, Department, Designation, FinalApprovalStatus, IStatusLog, IUser, Role } from '../types/user.types';

const StatusLogSchema = new Schema<IStatusLog>({
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    message: { type: String, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
});

const UserSchema = new Schema<IUser>({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    mobileNo: {
        type: String,
        required: [true, 'Mobile number is required'],
        match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters']
    },
    isApproved: {
        type: String,
        enum: Object.values(FinalApprovalStatus),
        default: FinalApprovalStatus.PENDING
    },
    employeeId: {
        type: String,
        required: [true, 'Employee ID is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    department: {
        type: String,
        enum: Object.values(Department),
        required: [true, 'Department is required']
    },
    designation: {
        type: String,
        enum: Object.values(Designation),
        required: [true, 'Designation is required']
    },
    reportingTo: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        validate: {
            validator: function (this: IUser, value: mongoose.Types.ObjectId) {
                // Custom validation will be handled in pre-save middleware
                return true;
            },
            message: 'Invalid reporting manager'
        }
    },
    role: {
        type: String,
        enum: Object.values(Role),
        required: [true, 'Role is required']
    },
    preferences: {
        type: Schema.Types.Mixed,
        default: {
            notifications: {
                email: false,
                inApp: true,
                sound: true,
                push: false
            },
            theme: 'light',
            layout: 'list',
        }
    },
    approvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    dhApprovalStatus: {
        type: String,
        enum: Object.values(ApprovalStatus),
        default: function (this: IUser) {
            return this.designation === Designation.DEPARTMENT_HEAD
                ? ApprovalStatus.NOT_REQUIRED
                : ApprovalStatus.PENDING;
        }
    },
    adminApprovalStatus: {
        type: String,
        enum: Object.values(ApprovalStatus),
        default: ApprovalStatus.PENDING
    },
    statusLogs: [StatusLogSchema],
    isDisabled: {
        type: Boolean,
        default: false,
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual population for reporting manager
UserSchema.virtual('reportingManager', {
    ref: 'User',
    localField: 'reportingTo',
    foreignField: '_id',
    justOne: true
});

// Virtual population for approver
UserSchema.virtual('approver', {
    ref: 'User',
    localField: 'approvedBy',
    foreignField: '_id',
    justOne: true
});

// Pre-save middleware for validation and status logs
UserSchema.pre('save', async function (next) {
    const user = this as IUser & { isNew: boolean };

    // Add initial status log for new users
    if (user.isNew) {
        user.statusLogs.push({
            status: 'registered',
            timestamp: new Date(),
            message: 'User registered successfully'
        });
    }

    // Validate reporting hierarchy
    if (user.reportingTo && user.designation !== Designation.DEPARTMENT_HEAD) {
        const reportingManager = await mongoose.model('User').findById(user.reportingTo);
        if (!reportingManager) {
            return next(new Error('Reporting manager not found'));
        }

        // Check if reporting manager is in same department
        if (reportingManager.department !== user.department) {
            return next(new Error('Reporting manager must be from the same department'));
        }

        // Check if reporting manager has higher designation
        const designationHierarchy = [
            Designation.EMPLOYEE,
            Designation.ASSISTANT_MANAGER,
            Designation.MANAGER,
            Designation.SENIOR_MANAGER,
            Designation.DEPARTMENT_HEAD
        ];

        const userLevel = designationHierarchy.indexOf(user.designation);
        const managerLevel = designationHierarchy.indexOf(reportingManager.designation);

        if (managerLevel <= userLevel) {
            return next(new Error('Reporting manager must have a higher designation'));
        }
    }

    next();
});

// Index for better query performance
// UserSchema.index({ email: 1 });
// UserSchema.index({ employeeId: 1 });
UserSchema.index({ department: 1, designation: 1 });
UserSchema.index({ dhApprovalStatus: 1, adminApprovalStatus: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);