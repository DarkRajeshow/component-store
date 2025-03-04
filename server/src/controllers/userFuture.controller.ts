import { Request, Response } from 'express';
import { UserService } from '../services/userFuture.service';
import { AuthRequest } from '../types/user.types';

export class UserController {
    public static async register(req: Request, res: Response): Promise<void> {
        try {
            const { username, email, password } = req.body;
            const result = await UserService.registerUser(username, email, password);

            if (result.success && result.token) {
                res.cookie('jwt', result.token, UserService.getCookieOptions());
            }

            res.json(result);
        } catch (error) {
            res.json({ success: false, status: 'Internal Server Error' });
        }
    }

    public static async login(req: Request, res: Response): Promise<void> {
        try {
            const { username, password } = req.body;
            const result = await UserService.loginUser(username, password);

            if (result.success && result.token) {
                res.cookie('jwt', result.token, UserService.getCookieOptions());
            }

            res.json(result);
        } catch (error) {
            res.json({ success: false, status: 'Internal Server Error' });
        }
    }

    public static logout(_req: Request, res: Response): void {
        res.clearCookie('jwt', UserService.getCookieOptions());
        res.json({ success: true, status: 'Logged out successfully' });
    }

    public static async getUserData(req: Request, res: Response): Promise<void> {
        const authReq = req as AuthRequest;

        try {
            const token = authReq.cookies?.jwt;
            if (!token) {
                res.json({ success: false, status: 'User not logged in' });
                return;
            }

            const userId = UserService.verifyToken(token);
            if (!userId) {
                res.json({ success: false, status: 'Invalid token' });
                return;
            }

            const result = await UserService.getUserData(userId);
            res.json(result);
        } catch (error) {
            res.json({ success: false, status: 'Internal Server Error' });
        }
    }
}