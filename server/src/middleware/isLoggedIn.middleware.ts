import { Request, Response, NextFunction } from 'express';

// Extend the Express Request type to include authentication methods
interface AuthenticatedRequest extends Request {
    isAuthenticated(): boolean;
}

export function isLoggedIn(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void {
    try {
        const isAuthenticated = req.isAuthenticated();
        if (isAuthenticated) {
            res.json({ success: true });
        } else {
            res.json({ success: false, status: "Login to continue." });
        }
    } catch (error) {
        res.json({ success: false, status: "Internal server error" });
    }
}