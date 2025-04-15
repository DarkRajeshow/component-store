import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';

class UserController {
    /**
     * Register a new user
     */
    async registerUser(req: Request, res: Response, next: NextFunction) {
        const { username, email, password } = req.body;

        console.log('Registering user:', username, email, password);
        

        try {
            const result = await userService.registerUser(username, email, password);


            if (result.success && result.token) {
                // Determine if the environment is development or production
                const isProduction = process.env.CLIENT_DOMAIN !== 'localhost';

                res.cookie('jwt', result.token, {
                    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
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

    /**
     * Login a user
     */
    async loginUser(req: Request, res: Response, next: NextFunction) {
        const { username, password } = req.body;

        try {
            const result = await userService.loginUser(username, password);

            if (result.success && result.token) {
                // Determine if the environment is development or production
                const isProduction = process.env.CLIENT_DOMAIN !== 'localhost';

                res.cookie('jwt', result.token, {
                    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
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

    /**
     * Logout a user
     */
    logoutUser(req: Request, res: Response, next: NextFunction) {
        res.clearCookie('jwt');
        res.json({ success: true, status: 'Logged out successfully.' });
    }

    /**
     * Middleware to check if a user is authenticated
     */
    isAuthenticated(req: Request & { isAuthenticated: () => boolean }, res: Response, next: NextFunction) {
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

    /**
     * Get user ID from JWT token
     */
    getUserId(req: Request, res: Response) {
        const jwtCookie = req.cookies.jwt;

        if (!jwtCookie) {
            return res.json({ success: false, status: "Login to continue." });
        }

        const result = userService.verifyToken(jwtCookie);

        if (result.success && result.userId) {
            res.json({ success: true, userId: result.userId });
        } else {
            res.json({ success: false, status: result.status || 'Internal Server Error' });
        }
    }

    /**
     * Get user data
     */
    async getUserData(req: Request, res: Response) {
        const jwtCookie = req.cookies.jwt;

        if (!jwtCookie) {
            return res.json({ success: false, status: "User not logged in." });
        }

        const tokenResult = userService.verifyToken(jwtCookie);

        if (!tokenResult.success || !tokenResult.userId) {
            return res.json({ success: false, status: 'User not logged in.' });
        }

        const result = await userService.getUserData(tokenResult.userId);
        res.json(result);
    }

    /**
     * Update user preferences
     */
    async updateUserPreferences(req: Request, res: Response) {
        const jwtCookie = req.cookies.jwt;
        const { theme, language } = req.body;

        if (!jwtCookie) {
            return res.json({ success: false, status: "User not logged in." });
        }

        const tokenResult = userService.verifyToken(jwtCookie);

        if (!tokenResult.success || !tokenResult.userId) {
            return res.json({ success: false, status: 'User not logged in.' });
        }

        const result = await userService.updateUserPreferences(
            tokenResult.userId,
            theme,
            language
        );

        res.json(result);
    }
}

export default new UserController();