
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
    SUPREME = "Supreme",
    DEPARTMENT_HEAD = 'Department Head',
    SENIOR_MANAGER = 'Senior Manager',
    MANAGER = 'Manager',
    ASSISTANT_MANAGER = 'Assistant Manager',
    EMPLOYEE = 'Employee'
}

export enum Role {
    ADMIN = 'admin',
    DEPARTMENT_HEAD = "Department Head",
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
    updatedBy?: string;
}

export interface IPreferences {
    notifications: {
        email: boolean;
        inApp: boolean;
        sound: boolean;
        push: boolean;
    };
    theme: 'light' | 'dark';
    layout: 'list' | 'grid';
}

export interface IUser {
    _id: string;
    name: string;
    email: string;
    mobileNo: string;
    password?: string;
    isApproved: FinalApprovalStatus;
    employeeId: string;
    department: Department;
    designation: Designation;
    reportingTo?: string | IUser | undefined; // Reference to another IUser
    role: Role;
    preferences: IPreferences; //temp key value types may change in future
    approvedBy?: string | IAdmin | undefined;
    isDisabled: boolean,
    dhApprovalStatus: ApprovalStatus;
    adminApprovalStatus: ApprovalStatus;
    statusLogs: IStatusLog[];
    createdAt: Date;
    updatedAt: Date;
}


export interface IAdmin {
    _id: string;
    name: string;
    email: string;
    password?: string;
    approvedBy?: string | IAdmin;
    isApproved: FinalApprovalStatus;
    role: 'admin';
    statusLogs: IStatusLog[];
    isSystemAdmin: boolean;
    preferences: IPreferences;
    isDisabled: boolean,
    createdAt: Date;
    updatedAt: Date;
}
