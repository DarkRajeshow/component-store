import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { hashPassword, comparePasswords } from '../utils/bcrypt';
import { User } from '../models/user.model';
import { IUser } from '../types/user.types';


// Define interfaces for request bodies
interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

// Define response types
interface AuthResponse {
    success: boolean;
    status: string;
    user?: IUser;
    userId?: string;
    token?: string;
}

class UserService {
    /**
     * Register a new user
     */
    async registerUser(
        username: string,
        email: string,
        password: string
    ): Promise<AuthResponse> {
        try {
            // Check if user with username or email already exists
            let existingUser = await User.findOne({
                $or: [{ username }, { email }]
            });

            if (existingUser) {
                return {
                    success: false,
                    status: 'User with this username or email already exists'
                };
            }

            const hashedPassword = await hashPassword(password);

            const user = new User({
                username,
                email,
                password: hashedPassword,
                preferences: {
                    theme: 'light',
                    language: 'en'
                },
                projects: [],
                designs: []
            });

            await user.save();

            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || '', {
                expiresIn: "15d"
            });

            return {
                success: true,
                status: 'User registered successfully',
                user,
                token
            };
        } catch (error) {
            console.error('Error registering user:', error);
            return { success: false, status: 'Internal Server Error' };
        }
    }

    /**
     * Login a user
     */
    async loginUser(
        username: string,
        password: string
    ): Promise<AuthResponse> {
        try {
            // Try to find user by username or email
            const user = await User.findOne({
                $or: [{ username }, { email: username }]
            });

            if (!user) {
                return { success: false, status: 'Invalid username or password' };
            }

            const passwordMatch = await comparePasswords(password, user.password);

            if (!passwordMatch) {
                return { success: false, status: 'Invalid username or password' };
            }

            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || '', {
                expiresIn: "15d"
            });

            return {
                success: true,
                status: 'Login successful',
                user,
                token
            };
        } catch (error) {
            console.error('Error logging in:', error);
            return { success: false, status: 'Internal Server Error' };
        }
    }

    /**
     * Get user data by ID
     */
    async getUserData(userId: string): Promise<AuthResponse> {
        try {
            const userData = await User.findById(userId)
                .populate('projects')
                .populate('designs');

            if (!userData) {
                return { success: false, status: 'User not found' };
            }

            return {
                success: true,
                status: 'User data retrieved successfully.',
                user: userData
            };
        } catch (error) {
            console.error('Error getting user data:', error);
            return { success: false, status: 'Internal Server Error' };
        }
    }

    /**
     * Verify a JWT token
     */
    verifyToken(token: string): { success: boolean; userId?: string; status?: string } {
        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET || '') as { userId: string };
            return { success: true, userId: decodedToken.userId };
        } catch (error) {
            console.error('Error decoding or verifying JWT token:', error);
            return { success: false, status: 'Invalid token' };
        }
    }

    /**
     * Add a project to user's projects array
     */
    async addProjectToUser(userId: string, projectId: mongoose.Types.ObjectId): Promise<AuthResponse> {
        try {
            const user = await User.findByIdAndUpdate(
                userId,
                { $addToSet: { projects: projectId } },
                { new: true }
            );

            if (!user) {
                return { success: false, status: 'User not found' };
            }

            return {
                success: true,
                status: 'Project added to user successfully',
                user
            };
        } catch (error) {
            console.error('Error adding project to user:', error);
            return { success: false, status: 'Internal Server Error' };
        }
    }

    /**
     * Add a design to user's designs array
     */
    async addDesignToUser(userId: string, designId: mongoose.Types.ObjectId): Promise<AuthResponse> {
        try {
            const user = await User.findByIdAndUpdate(
                userId,
                { $addToSet: { designs: designId } },
                { new: true }
            );

            if (!user) {
                return { success: false, status: 'User not found' };
            }

            return {
                success: true,
                status: 'Design added to user successfully',
                user
            };
        } catch (error) {
            console.error('Error adding design to user:', error);
            return { success: false, status: 'Internal Server Error' };
        }
    }

    /**
     * Update user preferences
     */
    async updateUserPreferences(
        userId: string,
        theme?: "light" | "dark",
        language?: string
    ): Promise<AuthResponse> {
        try {
            const updateData: any = {};

            if (theme) {
                updateData['preferences.theme'] = theme;
            }

            if (language) {
                updateData['preferences.language'] = language;
            }

            const user = await User.findByIdAndUpdate(
                userId,
                { $set: updateData },
                { new: true }
            );

            if (!user) {
                return { success: false, status: 'User not found' };
            }

            return {
                success: true,
                status: 'User preferences updated successfully',
                user
            };
        } catch (error) {
            console.error('Error updating user preferences:', error);
            return { success: false, status: 'Internal Server Error' };
        }
    }

    async getReportingTo(designation: string, department: string): Promise<IUser[]> {
        console.log(`Fetching reporting to for designation: ${designation} in department: ${department}`);
        let reportingToDesignations: string[] = [];
        switch (designation) {
            case 'Senior Manager':
                reportingToDesignations = ['Department Head'];
                break;
            case 'Manager':
                reportingToDesignations = ['Senior Manager', 'Department Head'];
                break;
            case 'Assistant Manager':
                reportingToDesignations = ['Manager', 'Senior Manager', 'Department Head'];
                break;
            case 'Employee':
                reportingToDesignations = ['Assistant Manager', 'Manager', 'Senior Manager', 'Department Head'];
                break;
            default:
                reportingToDesignations = [];
        }

        if (reportingToDesignations.length === 0 || !department) {
            console.log('No reporting designations or department found, returning empty array.');
            return [];
        }

        console.log(`Searching for users with designations: ${reportingToDesignations.join(', ')} in department: ${department}`);

        const users = await User.find({
            designation: { $in: reportingToDesignations },
            department: department,
            isApproved: true,
        });

        console.log(`Found ${users.length} approved users in department ${department}.`);
        return users;
    }
}

export default new UserService();