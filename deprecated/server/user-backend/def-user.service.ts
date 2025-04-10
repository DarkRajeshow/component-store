import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { hashPassword, comparePasswords } from '../utils/bcrypt';
import { Request, Response } from 'express';

// Define interfaces for request bodies
interface RegisterLoginRequest {
    username: string;
    password: string;
}

// Define response types
interface AuthResponse {
    success: boolean;
    status: string;
    user?: IUser;
    userId?: string;
}

export const registerUserService = async (
    username: string,
    password: string
): Promise<{ success: boolean; status: string; user?: IUser; token?: string }> => {
    try {
        let user = await User.findOne({ username });
        if (user) {
            return { success: false, status: 'User already exists' };
        }

        const hashedPassword = await hashPassword(password);

        user = new User({
            username,
            password: hashedPassword
        });

        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || '', {
            expiresIn: "15d"
        });

        return { success: true, status: 'User registered successfully', user, token };
    } catch (error) {
        console.error('Error registering user:', error);
        return { success: false, status: 'Internal Server Error' };
    }
};

export const loginUserService = async (
    username: string,
    password: string
): Promise<{ success: boolean; status: string; user?: IUser; token?: string }> => {
    try {
        const user = await User.findOne({ username });

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

        return { success: true, status: 'Login successful', user, token };
    } catch (error) {
        console.error('Error logging in:', error);
        return { success: false, status: 'Internal Server Error' };
    }
};

export const getUserDataService = async (userId: string): Promise<AuthResponse> => {
    try {
        const userData = await User.findById(userId);

        if (!userData) {
            return { success: false, status: 'User not found' };
        }

        return { success: true, status: 'User data retrieved successfully.', user: userData };
    } catch (error) {
        console.error('Error getting user data:', error);
        return { success: false, status: 'Internal Server Error' };
    }
};

export const verifyTokenService = (token: string): { success: boolean; userId?: string; status?: string } => {
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || '') as { userId: string };
        return { success: true, userId: decodedToken.userId };
    } catch (error) {
        console.error('Error decoding or verifying JWT token:', error);
        return { success: false, status: 'Invalid token' };
    }
};