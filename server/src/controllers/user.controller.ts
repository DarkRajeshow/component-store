import { Request, Response } from 'express';
import userService from '../services/user.service';
import { User } from '../models/user.model';
import { comparePasswords, hashPassword } from '../utils/bcrypt';
import { Admin } from '../models/admin.model';
import { AuthRequest } from '../utils/auth';

class UserController {
    async getReportingTo(req: Request, res: Response) {
        try {
            const { designation, department } = req.query;
            if (!designation || !department) {
                return res.status(400).json({ message: 'Designation and department are required' });
            }
            const users = await userService.getReportingTo(designation as string, department as string);
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    }

    async getAllUsers(req: Request, res: Response) {
        try {
            const users = await User.find();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    }

    async searchUsers(req: Request, res: Response) {
        try {
            const { search, limit = 10 } = req.query;

            let query = {};
            if (search && typeof search === 'string') {
                query = {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } }
                    ]
                };
            }

            const users = await User.find(query)
                .select('_id name email')
                .limit(Number(limit))
                .sort({ name: 1 });

            res.status(200).json({ users });
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    }

    async getCurrentUserProfile(req: AuthRequest, res: Response) {
        try {
            // @ts-ignore
            const userId = req.user?._id || req.user?.userId;
            const userType = req.userType; // 'user' or 'admin'

            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // Find user based on type
            let user;
            if (userType === 'admin') {
                user = await Admin.findById(userId);
            } else {
                user = await User.findById(userId).populate('reportingTo approvedBy');
            }

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    }

    async updateCurrentUserProfile(req: AuthRequest, res: Response) {
        try {
            // @ts-ignore
            const userId = req.user?._id || req.user?.userId;
            const userType = req.userType; // 'user' or 'admin'

            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const { name, mobileNo, preferences } = req.body;
            const updateData: any = {};
            if (name) updateData.name = name;
            if (mobileNo) updateData.mobileNo = mobileNo;
            if (preferences) updateData.preferences = preferences;

            // Update user based on type
            let user;
            if (userType === 'admin') {
                user = await Admin.findByIdAndUpdate(userId, updateData, { new: true });
            } else {
                user = await User.findByIdAndUpdate(userId, updateData, { new: true }).populate({
                    path: 'reportingTo',
                    select: 'name designation email mobileNo'
                }).populate({
                    path: 'approvedBy',
                    select: 'name email'
                });;
            }

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    }

    async changePassword(req: AuthRequest, res: Response) {
        try {
            // @ts-ignore
            const userId = req.user?._id || req.user?.userId;
            const userType = req.userType; // 'user' or 'admin'

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized - User ID not found'
                });
            }

            const { currentPassword, newPassword, confirmPassword } = req.body;

            // Validation
            if (!currentPassword || !newPassword || !confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'All password fields are required'
                });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'New password and confirmation do not match'
                });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 8 characters long'
                });
            }

            if (currentPassword === newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be different from current password'
                });
            }

            // Find user based on type
            let user;
            if (userType === 'admin') {
                user = await Admin.findById(userId);
            } else {
                user = await User.findById(userId);
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Verify current password
            const isCurrentPasswordValid = await comparePasswords(currentPassword, user.password);

            if (!isCurrentPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Hash new password
            const hashedNewPassword = await hashPassword(newPassword);

            // Update password
            user.password = hashedNewPassword;
            await user.save();

            console.log(`Password changed successfully for ${userType} with ID: ${userId}`);

            res.status(200).json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            console.error('Password change error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during password change'
            });
        }
    }
}

export default new UserController();
