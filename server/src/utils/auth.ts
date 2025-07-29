// src/utils/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { IUser, IAdmin, Department, Designation, FinalApprovalStatus } from '../types/user.types';
import { JWT_REFRESH_SECRET, JWT_SECRET } from '../config/env';
import { Admin } from '../models/admin.model';
import { User } from '../models/user.model';

export interface JWTPayload {
    id: string;
    email: string;
    role: 'admin' | 'designer' | 'other';
    isApproved?: FinalApprovalStatus;
    userType: 'user' | 'admin';
    sessionId: string; // For enhanced security
    deviceInfo?: string;
}

export interface AuthRequest extends Request {
    user?: IUser | IAdmin;
    userId?: string;
    userType?: 'user' | 'admin';
}

// Enhanced JWT token generation with session management
export const generateTokens = (payload: Omit<JWTPayload, 'sessionId'>) => {
    const sessionId = require('crypto').randomBytes(32).toString('hex');

    const tokenPayload: JWTPayload = {
        ...payload,
        sessionId
    };


    // Check for empty strings as well as undefined/null
    if (!JWT_SECRET || JWT_SECRET === '' || !JWT_REFRESH_SECRET || JWT_REFRESH_SECRET === '') {
        throw new Error('JWT secrets must be configured and not empty');
    }

    const accessToken = jwt.sign(
        tokenPayload,
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const refreshToken = jwt.sign(
        { id: payload.id, sessionId },
        JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
    return { accessToken, refreshToken, sessionId };
};

// Verify and decode JWT token
export const verifyToken = (token: string): JWTPayload => {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
};

// Verify refresh token
export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: string; sessionId: string };
};

// Password hashing utilities
export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

// Enhanced authentication middleware with security features
export const authenticateToken = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.substring(7)
            : req.cookies.accessToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        const decoded = verifyToken(token);

        // Additional security checks
        // const userAgent = req.headers['user-agent'];
        // const clientIP = req.ip || req.connection.remoteAddress;

        // Find user based on type
        let user: IUser | IAdmin | null = null;

        if (decoded.userType === 'admin') {
            user = await Admin.findById(decoded.id);
        } else {
            user = await User.findById(decoded.id).populate({
                path: 'reportingTo',
                select: 'name designation email mobileNo'
            }).populate({
                path: 'approvedBy',
                select: 'name email'
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Store user info in request
        req.user = user;
        req.userType = decoded.userType;
        req.userId = decoded.id; // Set userId for controllers that need it

        next();
    } catch (error) {
        console.log(error);

        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

// Role-based authorization middleware
export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const userRole = req.userType === 'admin' ? 'admin' : (req.user as IUser).role;

        if (!roles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

// Approval status check middleware
export const requireApproval = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.userType === 'admin') {
        return next(); // Admins don't need approval
    }

    const user = req.user as IUser;

    if (user.isApproved !== FinalApprovalStatus.APPROVED) {
        return res.status(403).json({
            success: false,
            message: 'Account not approved',
            approvalStatus: {
                dhApproval: user.dhApprovalStatus,
                adminApproval: user.adminApprovalStatus
            }
        });
    }

    next();
};

// Department head check middleware
export const requireDepartmentHead = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.userType === 'admin') {
        return next();
    }

    const user = req.user as IUser;

    if (user.designation !== 'Department Head') {
        return res.status(403).json({
            success: false,
            message: 'Department Head access required'
        });
    }

    next();
};

// Get user hierarchy for dropdown population
export const getUserHierarchy = async (department: string, currentUserId?: string) => {
    const users = await User.find({
        department,
        isApproved: FinalApprovalStatus.APPROVED,
        _id: { $ne: currentUserId } // Exclude current user
    }).select('name designation email employeeId').sort({ designation: 1 });

    const hierarchy = [
        'Department Head',
        'Senior Manager',
        'Manager',
        'Assistant Manager',
        'Employee'
    ];

    return users.sort((a, b) => {
        return hierarchy.indexOf(a.designation) - hierarchy.indexOf(b.designation);
    });
};

// Validation helper for user registration
export const validateUserRegistration = (userData: Partial<IUser>) => {
    const errors: string[] = [];

    if (!userData.name || userData.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }

    if (!userData.email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(userData.email)) {
        errors.push('Valid email is required');
    }

    if (!userData.mobileNo || !/^[6-9]\d{9}$/.test(userData.mobileNo)) {
        errors.push('Valid 10-digit mobile number is required');
    }

    if (!userData.password || userData.password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!userData.employeeId || userData.employeeId.trim().length < 3) {
        errors.push('Employee ID is required');
        if (!userData.department || !Object.values(Department).includes(userData.department)) {
            errors.push('Valid department is required');
        }

        if (!userData.designation || !Object.values(Designation).includes(userData.designation)) {
            errors.push('Valid designation is required');
        }

        if (!userData.role || !['designer', 'other'].includes(userData.role)) {
            errors.push('Valid role is required');
        }

        return errors;
    };
};
// Generate secure device fingerprint
export const generateDeviceFingerprint = (req: Request): string => {
    const userAgent = req.headers['user-agent'] || '';
    const acceptLanguage = req.headers['accept-language'] || '';
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const ip = req.ip || req.connection.remoteAddress || '';

    const fingerprint = require('crypto')
        .createHash('sha256')
        .update(`${userAgent}${acceptLanguage}${acceptEncoding}${ip}`)
        .digest('hex');

    return fingerprint;
}