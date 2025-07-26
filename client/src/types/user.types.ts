
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

export interface IStatusLog {
    status: string;
    timestamp: Date;
    message: string;
    updatedBy?: string;
}

export interface IUser {
    _id: string;
    name: string;
    email: string;
    mobileNo: string;
    password: string;
    isApproved: boolean;
    employeeId: string;
    department: Department;
    designation: Designation;
    reportingTo?: string | IUser; // Reference to another IUser
    role: Role;
    preferences?: Record<string, string | number>; //temp key value types may change in future
    approvedBy?: string;
    isDisabled: boolean,
    dhApprovalStatus: ApprovalStatus;
    adminApprovalStatus: ApprovalStatus;
    statusLogs: IStatusLog[];
    createdAt: Date;
    updatedAt: Date;
    approver?: IUser;
}


export interface IAdmin {
    _id: string;
    name: string;
    email: string;
    password: string;
    isApproved: boolean;
    role: 'admin';
    isSystemAdmin: boolean;
    isDisabled: boolean,
    createdAt: Date;
    updatedAt: Date;
}
