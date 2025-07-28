export interface UserPreferences {
  notifications: {
    email: boolean;
    inApp: boolean;
    sound: boolean;
    push: boolean;
  };
  theme: 'light' | 'dark';
  layout: 'list' | 'grid';
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  mobileNo: string;
  employeeId: string;
  department: string;
  designation: string;
  role: string;
  isApproved: string;
  dhApprovalStatus: string;
  adminApprovalStatus: string;
  reportingTo?: string;
  approvedBy?: string;
  isDisabled: boolean;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
  // Virtual fields
  reportingManager?: {
    _id: string;
    name: string;
    email: string;
  };
  approver?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface AdminProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  isApproved: string;
  isSystemAdmin: boolean;
  isDisabled: boolean;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type ProfileData = UserProfile | AdminProfile; 