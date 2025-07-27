import mongoose from "mongoose";

// Enums for better type safety
export enum Department {
    DESIGN = 'Design',
    MACHINE_SHOP = 'Machine Shop',
    VENDOR_DEVELOPMENT = 'Vendor Development',
    MAINTENANCE = 'Maintenance',
    PRODUCTION = 'Production',
    QUALITY = 'Quality',
    STORE = 'Store',
    PATTERN_SHOP = 'Pattern Shop',
    TESTING = 'Testing',
    OTHER = 'Other'
}

export enum Designation {
    DEPARTMENT_HEAD = 'Department Head',
    SENIOR_MANAGER = 'Senior Manager',
    MANAGER = 'Manager',
    ASSISTANT_MANAGER = 'Assistant Manager',
    EMPLOYEE = 'Employee'
}

export enum Role {
    ADMIN = 'admin',
    DESIGNER = 'designer',
    OTHER = 'other'
}

export enum ApprovalStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    NOT_REQUIRED = 'not_required'
}

export enum FinalApprovalStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

export interface IStatusLog {
    status: string;
    timestamp: Date;
    message: string;
    updatedBy?: mongoose.Types.ObjectId | string;
}

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId | string;
    name: string;
    email: string;
    mobileNo: string;
    password: string;
    isApproved: FinalApprovalStatus;
    employeeId: string;
    department: Department;
    designation: Designation;
    reportingTo?: mongoose.Types.ObjectId | string; // Reference to another IUser
    role: Role;
    preferences?: Record<string, any>;
    approvedBy?: mongoose.Types.ObjectId | string;
    dhApprovalStatus: ApprovalStatus;
    adminApprovalStatus: ApprovalStatus;
    statusLogs: IStatusLog[];
    createdAt: Date;
    updatedAt: Date;
    isDisabled: boolean,
    approver?: IUser;
    reportingManager?: IUser;
    // Virtual fields
}


export interface IAdmin extends Document {
    _id: mongoose.Types.ObjectId | string;
    name: string;
    email: string;
    password: string;
    isApproved: FinalApprovalStatus;
    approvedBy: mongoose.Types.ObjectId | string | IAdmin,
    statusLogs: IStatusLog[],
    role: 'admin';
    isSystemAdmin: boolean;
    isDisabled: boolean,
    createdAt: Date;
    updatedAt: Date;
}
