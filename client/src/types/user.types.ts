export interface IUserPreferences {
    theme: 'light' | 'dark';
    language: string;
}

// Base user interface
export interface IUserBase {
    _id?: string;
    username: string;
    email: string;
    password: string;
    dp: string;
    role: 'user' | 'admin';
    preferences: IUserPreferences;
    projects: string[];
    designs: string[];
    organization?: string;
}

// Mongoose document interface
export interface IUser extends Document {
    _id: string | string;
    username: string;
    email: string;
    password: string;
    dp: string;
    role: 'user' | 'admin';
    preferences: IUserPreferences;
    projects: string[];
    designs: string[];
    organization?: string;
}

export interface AuthRequest extends Request {
    isAuthenticated: () => boolean;
    userId?: string;
}

export interface IUserResponse {
    success: boolean;
    status?: string;
    user?: IUserBase;
    userId?: string;
    token?: string;
}

export interface ICookieConfig {
    maxAge: number;
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
}

// user request 
export interface IUserLoginRequest {
    username: string;
    password: string;
}

export interface IUserRegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface IUpdatePreferencesRequest {
    theme: 'light' | 'dark';
    language: string;
}

// user responses
export interface IUserLoginResponse {
    success: boolean;
    status?: string;
    user?: IUserBase;
}

export interface IUserRegisterResponse {
    success: boolean;
    status?: string;
    user?: IUserBase;
}

export interface IUpdatePreferencesResponse {
    success: boolean;
    status?: string;
    user?: IUserBase;
}