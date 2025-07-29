// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { Admin } from '../models/admin.model';

import { IUser, IAdmin, Designation, Role, ApprovalStatus, FinalApprovalStatus } from '../types/user.types';
import {
    hashPassword,
    comparePassword,
    generateTokens,
    validateUserRegistration,
    generateDeviceFingerprint,
    AuthRequest,
    getUserHierarchy
} from '../utils/auth';
import { NotificationService } from '../services/notification.service';
import { ADMIN_SETUP_KEY } from '../config/env';

// User Registration
export const registerUser = async (req: Request, res: Response) => {
    try {
        const userData = req.body;

        // Validate input data
        const validationErrors = validateUserRegistration(userData);
        if (validationErrors && validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        // Check for existing user
        const existingUser = await User.findOne({
            $or: [
                { email: userData.email.toLowerCase() },
                { employeeId: userData.employeeId.toUpperCase() },
                { mobileNo: userData.mobileNo }
            ]
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User already exists with this email, employee ID, or mobile number'
            });
        }

        // Validate reporting manager if provided
        if (userData.reportingTo && userData.designation !== Designation.DEPARTMENT_HEAD) {
            // Check if reportingTo is a valid MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(userData.reportingTo)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid reporting manager ID format'
                });
            }

            const reportingManager = await User.findById(userData.reportingTo);
            if (!reportingManager || reportingManager.department !== userData.department) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid reporting manager'
                });
            }
        }

        // Hash password
        const hashedPassword = await hashPassword(userData.password);

        // Create new user
        const newUser = new User({
            ...userData,
            email: userData.email.toLowerCase(),
            employeeId: userData.employeeId.toUpperCase(),
            password: hashedPassword,
            statusLogs: [{
                status: 'registered',
                timestamp: new Date(),
                message: 'User registration completed successfully'
            }]
        });

        await newUser.save();

        // Done: Send notification to department head and newly created user.
        // This returns immediately without waiting for notifications to be sent
        NotificationService.sendRegistrationNotifications(newUser).catch(error => {
            console.error('Error queueing registration notifications:', error);
            // Consider adding monitoring/alerting here for failed notification queuing
        });

        // Remove password from response
        const userResponse = newUser.toObject();
        if ('password' in userResponse) {
            delete (userResponse as { password?: string }).password;
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful. Awaiting department head approval.',
            user: userResponse,
            approvalStatus: {
                dhApproval: newUser.dhApprovalStatus,
                adminApproval: newUser.adminApprovalStatus
            }
        });

    } catch (error: Error | any) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// User Login
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password, role, secretKey } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Validate secret key for admin login
        if (role === 'admin' && secretKey !== ADMIN_SETUP_KEY) {
            return res.status(403).json({
                success: false,
                message: 'Invalid secret key for admin login'
            });
        }

        // Check if user exists (both User and Admin collections)
        let user: IUser | IAdmin | null;
        let userType: 'user' | 'admin';

        if (role === 'admin') {
            user = await Admin.findOne({ email: email.toLowerCase() });
            userType = 'admin';
        } else {
            user = await User.findOne({
                email: email.toLowerCase(),
                role: role // 'designer' or 'other'
            }).populate({
                path: 'reportingTo',
                select: 'name designation email'
            }).populate({
                path: 'approvedBy',
                select: 'name email'
            });
            userType = 'user';
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Restrict login based on isApproved (for users) and isSystemAdmin (for admins)
        if ((userType === 'user' && ((user as IUser).isApproved !== FinalApprovalStatus.APPROVED || (user as IUser).isDisabled)) ||
            (userType === 'admin' && (!(user as IAdmin).isSystemAdmin || (user as IAdmin).isDisabled))) {
            return res.status(403).json({
                success: false,
                message: 'Your account is not approved or is disabled. Please contact the administrator.'
            });
        }

        // Generate device fingerprint for enhanced security
        const deviceFingerprint = generateDeviceFingerprint(req);

        // Generate tokens
        const tokenPayload = {
            id: user._id.toString(),
            email: user.email,
            role: userType === 'admin' ? 'admin' as const : (user as IUser).role,
            isApproved: userType === 'admin' ? FinalApprovalStatus.APPROVED : (user as IUser).isApproved,
            userType,
            deviceInfo: deviceFingerprint
        };

        const { accessToken, refreshToken } = generateTokens(tokenPayload);

        // Set HTTP-only cookies
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict' as const,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        };

        res.cookie('accessToken', accessToken, cookieOptions);
        res.cookie('refreshToken', refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Prepare user response
        const userResponse = (user as any).toObject();
        delete userResponse.password;

        res.json({
            success: true,
            message: 'Login successful',
            user: userResponse,
            tokens: {
                accessToken,
                refreshToken
            },
            approvalStatus: userType === 'user' ? {
                dhApproval: (user as IUser).dhApprovalStatus,
                adminApproval: (user as IUser).adminApprovalStatus,
                isApproved: (user as IUser).isApproved
            } : undefined
        });

    } catch (error: Error | any) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Department Head Approval
export const departmentHeadApproval = async (req: AuthRequest, res: Response) => {
    try {
        const { userId, action, remarks } = req.body; // action: 'approve' | 'reject'
        const departmentHead = req.user as IUser;

        if (!userId || !action || !['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'User ID and valid action (approve/reject) are required'
            });
        }

        // Find the user to be approved
        const userToApprove = await User.findById(userId);
        if (!userToApprove) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify department head can approve this user
        if (userToApprove.department !== departmentHead.department) {
            return res.status(403).json({
                success: false,
                message: 'You can only approve users from your department'
            });
        }

        // Update approval status
        const newStatus = action === 'approve' ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;
        userToApprove.dhApprovalStatus = newStatus;

        // Add status log
        const statusMessage = action === 'approve'
            ? 'Approved by Department Head. Awaiting Admin approval.'
            : `Rejected by Department Head. ${remarks || ''}`;

        userToApprove.statusLogs.push({
            status: `dh_${action}`,
            timestamp: new Date(),
            message: statusMessage,
            updatedBy: departmentHead._id
        });

        await userToApprove.save();

        // Done: Send notification to user and admin (if approved)
        const isApproved = action === 'approve';

        // This returns immediately without waiting for notifications to be sent
        NotificationService.sendDHApprovalNotifications(userToApprove, isApproved).catch(error => {
            console.error('Error queueing Dh approval notifications:', error);
            // Consider adding monitoring/alerting here for failed notification queuing
        });

        res.json({
            success: true,
            message: `User ${action}d successfully`,
            user: {
                id: userToApprove._id,
                name: userToApprove.name,
                dhApprovalStatus: userToApprove.dhApprovalStatus,
                adminApprovalStatus: userToApprove.adminApprovalStatus
            }
        });

    } catch (error: Error | any) {
        console.error('Department head approval error:', error);
        res.status(500).json({
            success: false,
            message: 'Approval process failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Admin Final Approval
export const adminApprovalForUser = async (req: AuthRequest, res: Response) => {
    try {
        const { action, remarks } = req.body;
        const { id: userId } = req.params;
        const adminId = req.user._id;

        const userToApprove = await User.findById(userId);
        if (!userToApprove) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if department head has approved
        if ((userToApprove.dhApprovalStatus !== ApprovalStatus.APPROVED && userToApprove.dhApprovalStatus !== ApprovalStatus.NOT_REQUIRED)) {
            return res.status(400).json({
                success: false,
                message: 'Department head approval required first'
            });
        }

        // Prevent re-approval or re-rejection
        if (userToApprove.adminApprovalStatus === ApprovalStatus.APPROVED || userToApprove.adminApprovalStatus === ApprovalStatus.REJECTED) {
            return res.status(400).json({
                success: false,
                message: 'User has already been reviewed by admin. Approval/rejection can only be done once.'
            });
        }

        // Update approval status
        const newStatus = action === 'approve' ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;
        userToApprove.adminApprovalStatus = newStatus;

        if (action === 'approve') {
            userToApprove.isApproved = FinalApprovalStatus.APPROVED;
            userToApprove.approvedBy = adminId;
        }

        // Add status log
        const statusMessage = action === 'approve'
            ? 'Fully approved by Admin. Account activated.'
            : `Rejected by Admin. ${remarks || ''}`;

        userToApprove.statusLogs.push({
            status: `admin_${action}`,
            timestamp: new Date(),
            message: statusMessage,
            updatedBy: adminId
        });

        await userToApprove.save();

        // Done: Send final notification to user
        const isApproved = action === 'approve';

        // This returns immediately without waiting for notifications to be sent
        NotificationService.sendAdminApprovalNotifications(userToApprove, isApproved).catch(error => {
            console.error('Error queueing admin approval notifications:', error);
            // Consider adding monitoring/alerting here for failed notification queuing
        });

        res.json({
            success: true,
            message: `User ${action}d successfully`,
            user: {
                id: userToApprove._id,
                name: userToApprove.name,
                isApproved: userToApprove.isApproved,
                dhApprovalStatus: userToApprove.dhApprovalStatus,
                adminApprovalStatus: userToApprove.adminApprovalStatus
            }
        });

    } catch (error: Error | any) {
        console.error('Admin approval error:', error);
        res.status(500).json({
            success: false,
            message: 'Approval process failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

export const adminApprovalForAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const { action, remarks } = req.body;
        const { id: adminIdToApprove } = req.params;
        console.log(adminIdToApprove);

        const adminId = req.userId;

        const adminToApprove = await Admin.findById(adminIdToApprove);
        if (!adminToApprove) {
            return res.status(404).json({
                success: false,
                message: 'Admin user not found'
            });
        }

        // Prevent re-approval or re-rejection
        if (adminToApprove.isApproved === FinalApprovalStatus.APPROVED || adminToApprove.isApproved === FinalApprovalStatus.REJECTED) {
            return res.status(400).json({
                success: false,
                message: 'Admin user has already been reviewed. Approval/rejection can only be done once.'
            });
        }

        // Update approval status
        const newStatus = action === 'approve' ? FinalApprovalStatus.APPROVED : FinalApprovalStatus.REJECTED;
        adminToApprove.isApproved = newStatus;
        adminToApprove.approvedBy = adminId;

        // Add status log
        const statusMessage = newStatus === FinalApprovalStatus.APPROVED
            ? 'Admin user approved. Account activated.'
            : `Admin user rejected. ${remarks || ''}`;

        if (!adminToApprove.statusLogs) adminToApprove.statusLogs = [];
        adminToApprove.statusLogs.push({
            status: `admin_${action}`,
            timestamp: new Date(),
            message: statusMessage,
            updatedBy: adminId
        });

        await adminToApprove.save();

        // Send notification to admin user
        NotificationService.sendAdminApprovalNotificationsToAdmin(adminToApprove, newStatus === FinalApprovalStatus.APPROVED).catch(error => {
            console.error('Error queueing admin approval notifications:', error);
        });

        res.json({
            success: true,
            message: `Admin user ${action}d successfully`,
            admin: {
                id: adminToApprove._id,
                name: adminToApprove.name,
                email: adminToApprove.email,
                isApproved: adminToApprove.isApproved,
                isSystemAdmin: adminToApprove.isSystemAdmin
            }
        });
    } catch (error: Error | any) {
        console.error('Admin approval for admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Approval process failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get User Status (for status tracking page)
export const getUserStatus = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user as IUser;

        const userWithDetails = await User.findById(user._id)
            .populate('reportingTo', 'name designation')
            .populate('approvedBy', 'name')
            .select('-password');

        if (!userWithDetails) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Calculate progress percentage
        let progressPercentage = 25; // Base for registration

        if (userWithDetails.dhApprovalStatus === ApprovalStatus.APPROVED) {
            progressPercentage = 75;
        }
        if (userWithDetails.adminApprovalStatus === ApprovalStatus.APPROVED) {
            progressPercentage = 100;
        }
        if (userWithDetails.dhApprovalStatus === ApprovalStatus.REJECTED ||
            userWithDetails.adminApprovalStatus === ApprovalStatus.REJECTED) {
            progressPercentage = 0; // Reset to 0 if rejected at any stage
        }

        res.json({
            success: true,
            user: userWithDetails,
            approvalStatus: {
                dhApproval: userWithDetails.dhApprovalStatus,
                adminApproval: userWithDetails.adminApprovalStatus,
                isApproved: userWithDetails.isApproved,
                progressPercentage,
                currentStage: userWithDetails.isApproved === FinalApprovalStatus.APPROVED ? 'completed' :
                    userWithDetails.dhApprovalStatus === ApprovalStatus.PENDING ? 'department_head' :
                        userWithDetails.adminApprovalStatus === ApprovalStatus.PENDING ? 'admin' : 'rejected'
            },
            statusLogs: userWithDetails.statusLogs
        });

    } catch (error: Error | any) {
        console.error('Get user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get Pending Users (for Department Heads)
export const getPendingUsersForDH = async (req: AuthRequest, res: Response) => {
    try {
        const departmentHead = req.user as IUser;

        const pendingUsers = await User.find({
            department: departmentHead.department,
            dhApprovalStatus: ApprovalStatus.PENDING,
            _id: { $ne: departmentHead._id } // Exclude the department head themselves
        }).select('-password').sort({ createdAt: -1 });

        res.json({
            success: true,
            pendingUsers,
            count: pendingUsers.length
        });

    } catch (error: Error | any) {
        console.error('Get pending users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending users',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get all users in department (for DH dashboard)
export const getDepartmentUsers = async (req: AuthRequest, res: Response) => {
    try {
        const departmentHead = req.user as IUser;

        const departmentUsers = await User.find({
            department: departmentHead.department,
            _id: { $ne: departmentHead._id } // Exclude the department head themselves
        }).select('-password').sort({ createdAt: -1 });

        res.json({
            success: true,
            users: departmentUsers,
            count: departmentUsers.length
        });

    } catch (error: Error | any) {
        console.error('Get department users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch department users',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get Pending Users (for Admin)
export const getPendingUsersForAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const pendingUsers = await User.find({
            dhApprovalStatus: ApprovalStatus.APPROVED,
            adminApprovalStatus: ApprovalStatus.PENDING
        })
            .populate('reportingTo', 'name designation')
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            pendingUsers,
            count: pendingUsers.length
        });

    } catch (error: Error | any) {
        console.error('Get pending users for admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending users',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get Department Hierarchy (for dropdown in registration)
export const getDepartmentHierarchy = async (req: Request, res: Response) => {
    try {
        const { department } = req.query;

        if (!department) {
            return res.status(400).json({
                success: false,
                message: 'Department parameter is required'
            });
        }

        const hierarchy = await getUserHierarchy(department as string);

        res.json({
            success: true,
            hierarchy
        });

    } catch (error: Error | any) {
        console.error('Get hierarchy error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch department hierarchy',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Logout
export const logout = async (req: Request, res: Response) => {
    try {
        // Clear cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error: Error | any) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get Current User Profile
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
    try {
        let user;

        if (req.user?._id === undefined) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized access'
            });
        }
        if (req.userType === 'admin') {
            user = await Admin.findById(req.user!._id).select('-password');
        } else {
            user = await User.findById(req.user!._id)
                .populate('reportingTo', 'name designation email')
                .populate('approvedBy', 'name email')
                .select('-password');
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user,
            userType: req.userType
        });

    } catch (error: Error | any) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user profile',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Create Initial Admin (First admin will be system admin and other will be regular admin.)
export const createInitialAdmin = async (req: Request, res: Response) => {
    try {
        const { name, email, password, setupKey } = req.body;

        // Verify setup key for security
        if (setupKey !== ADMIN_SETUP_KEY) {
            return res.status(403).json({
                success: false,
                message: 'Invalid setup key'
            });
        }

        // Check if a system admin already exists
        const systemAdminExists = await Admin.findOne({ isSystemAdmin: true });

        // If no system admin exists, the first one is created as such
        const isSystemAdmin = !systemAdminExists;

        // For subsequent admins, ensure they are not duplicates
        if (!isSystemAdmin) {
            const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
            if (existingAdmin) {
                return res.status(409).json({
                    success: false,
                    message: 'An admin with this email already exists.'
                });
            }
        } else {
            // If we are setting up the first admin, ensure the collection is empty
            const anyAdmin = await Admin.findOne({});
            if (anyAdmin) {
                return res.status(409).json({
                    success: false,
                    message: 'A System Administrator already exists. Cannot create another.'
                });
            }
        }

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create admin
        const admin = new Admin({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            isSystemAdmin,
        });

        await admin.save();

        res.status(201).json({
            success: true,
            message: `Admin created successfully. ${isSystemAdmin ? 'This is the System Administrator.' : ''}`,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                isSystemAdmin: admin.isSystemAdmin,
            }
        });

    } catch (error: Error | any) {
        console.error('Create admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create admin',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};