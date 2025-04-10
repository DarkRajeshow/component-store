import { Request } from 'express';
import { Document, Types } from 'mongoose';

export interface IUserPreferences {
    theme: 'light' | 'dark';
    language: string;
}

// Base user interface
export interface IUserBase {
    _id?: Types.ObjectId;
    username: string;
    email: string;
    password: string;
    dp: string;
    role: 'user' | 'admin';
    preferences: IUserPreferences;
    projects: Types.ObjectId[];
    designs: Types.ObjectId[];
    organization?: Types.ObjectId;
}

// Mongoose document interface
export interface IUser extends Document {
    _id: Types.ObjectId | string;
    username: string;
    email: string;
    password: string;
    dp: string;
    role: 'user' | 'admin';
    preferences: IUserPreferences;
    projects: Types.ObjectId[];
    designs: Types.ObjectId[];
    organization?: Types.ObjectId;
}

export interface AuthRequest extends Request {
    isAuthenticated: () => boolean;
    userId?: string;
}

export interface UserResponse {
    success: boolean;
    status?: string;
    user?: IUserBase;
    userId?: string;
    token?: string;
}

export interface CookieConfig {
    maxAge: number;
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
}