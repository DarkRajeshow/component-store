import jwt from 'jsonwebtoken';
import User from '../models/UserFuture';
import { IUser, UserResponse, CookieConfig, IUserBase } from '../types/user.types';
import { hashPassword, comparePasswords } from '../utils/bcrypt';
import { Types } from 'mongoose';

export class UserService {
    public static getCookieOptions(): CookieConfig {
        const isProduction = process.env.CLIENT_DOMAIN !== 'localhost';
        return {
            maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
            secure: isProduction,
            httpOnly: true,
            sameSite: 'strict'
        };
    }

    private static generateToken(userId: Types.ObjectId): string {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }
        return jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET, {
            expiresIn: '15d'
        });
    }

    public static async registerUser(
        username: string,
        email: string,
        password: string
    ): Promise<UserResponse> {
        try {
            const existingUser = await User.findOne({ $or: [{ username }, { email }] }).lean();
            if (existingUser) {
                return { success: false, status: 'User already exists' };
            }

            const hashedPassword = await hashPassword(password);
            const user = new User({
                username,
                email,
                password: hashedPassword,
                preferences: { theme: 'light', language: 'en' }
            });

            const savedUser = await user.save() as IUser;
            const token = this.generateToken(savedUser._id);

            // Convert to plain object and ensure proper typing
            const userObject: IUserBase = {
                _id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                password: savedUser.password,
                dp: savedUser.dp,
                role: savedUser.role,
                preferences: savedUser.preferences,
                projects: savedUser.projects,
                designs: savedUser.designs,
                organization: savedUser.organization
            };

            return {
                success: true,
                status: 'User registered successfully',
                user: userObject,
                token
            };
        } catch (error) {
            console.error('Error registering user:', error);
            throw new Error('Internal Server Error');
        }
    }

    public static async loginUser(username: string, password: string): Promise<UserResponse> {
        try {
            const user = await User.findOne({ username }).lean() as IUserBase | null;
            if (!user) {
                return { success: false, status: 'Invalid username or password' };
            }

            const passwordMatch = await comparePasswords(password, user.password);
            if (!passwordMatch) {
                return { success: false, status: 'Invalid username or password' };
            }

            const token = this.generateToken(user._id as Types.ObjectId);

            return {
                success: true,
                status: 'Login successful',
                user,
                token
            };
        } catch (error) {
            console.error('Error logging in:', error);
            throw new Error('Internal Server Error');
        }
    }

    public static async getUserData(userId: string): Promise<UserResponse> {
        try {
            const user = await User.findById(new Types.ObjectId(userId))
                .lean() as IUserBase | null;

            if (!user) {
                return { success: false, status: 'User not found' };
            }

            return {
                success: true,
                status: 'User data retrieved successfully',
                user
            };
        } catch (error) {
            console.error('Error retrieving user data:', error);
            throw new Error('Internal Server Error');
        }
    }

    public static verifyToken(token: string): string | null {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
            return decoded.userId;
        } catch (error) {
            return null;
        }
    }
}