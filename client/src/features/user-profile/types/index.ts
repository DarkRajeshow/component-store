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

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}