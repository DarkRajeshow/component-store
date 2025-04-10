import { Request, Response, NextFunction } from 'express';
import {
    registerUserService,
    loginUserService,
    getUserDataService,
    verifyTokenService
} from '../services/user.service';

export async function registerUser(req: Request, res: Response, next: NextFunction) {
    const { username, password } = req.body;

    console.log(username);
    console.log(password);
    
    try {
        const result = await registerUserService(username, password);

        if (result.success && result.token) {
            // Determine if the environment is development or production
            const isProduction = process.env.CLIENT_DOMAIN !== 'localhost';

            res.cookie('jwt', result.token, {
                maxAge: 15 * 24 * 60 * 60 * 1000,
                secure: isProduction,
                httpOnly: true,
                sameSite: "strict"
            });
        }

        res.json({
            success: result.success,
            status: result.status,
            user: result.user
        });
    } catch (error) {
        console.error('Error in registerUser controller:', error);
        res.json({ success: false, status: 'Internal Server Error' });
    }
}

export async function loginUser(req: Request, res: Response, next: NextFunction) {
    const { username, password } = req.body;

    try {
        const result = await loginUserService(username, password);

        if (result.success && result.token) {
            // Determine if the environment is development or production
            const isProduction = process.env.CLIENT_DOMAIN !== 'localhost';

            res.cookie('jwt', result.token, {
                maxAge: 15 * 24 * 60 * 60 * 1000,
                secure: isProduction,
                httpOnly: true,
                sameSite: "strict"
            });
        }

        res.json({
            success: result.success,
            status: result.status,
            user: result.user
        });
    } catch (error) {
        console.error('Error in loginUser controller:', error);
        res.json({ success: false, status: 'Internal Server Error' });
    }
}

export async function logoutUser(req: Request, res: Response, next: NextFunction) {
    res.clearCookie('jwt');
    res.json({ success: true, status: 'Logged out successfully.' });
}

export function isAuthenticated(req: Request & { isAuthenticated: () => boolean }, res: Response, next: NextFunction) {
    try {
        const jwtCookie = req.cookies.jwt;
        if (!jwtCookie) {
            req.isAuthenticated = () => false; // No JWT cookie present
        } else {
            req.isAuthenticated = () => true; // JWT cookie present and valid
        }
    } catch (error) {
        console.error('Error decoding or verifying JWT token:', error);
        req.isAuthenticated = () => false; // Error decoding or verifying JWT token
    }
    next();
}

export function getUserId(req: Request, res: Response) {
    const jwtCookie = req.cookies.jwt;

    if (!jwtCookie) {
        return res.json({ success: false, status: "Login to continue." });
    }

    const result = verifyTokenService(jwtCookie);

    if (result.success && result.userId) {
        res.json({ success: true, userId: result.userId });
    } else {
        res.json({ success: false, status: result.status || 'Internal Server Error' });
    }
}

export async function getUserData(req: Request, res: Response) {
    const jwtCookie = req.cookies.jwt;

    if (!jwtCookie) {
        return res.json({ success: false, status: "User not logged in." });
    }

    const tokenResult = verifyTokenService(jwtCookie);

    if (!tokenResult.success || !tokenResult.userId) {
        return res.json({ success: false, status: 'User not logged in.' });
    }

    const result = await getUserDataService(tokenResult.userId);
    res.json(result);
}