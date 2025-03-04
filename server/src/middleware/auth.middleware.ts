import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend the Request interface
interface AuthenticatedRequest extends Request {
    isAuthenticated: () => boolean;
    userId?: string;
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const jwtCookie = req.cookies.jwt;

    if (!jwtCookie) {
        req.isAuthenticated = () => false;
        return next();
    }

    try {
        const decodedToken = jwt.verify(jwtCookie, process.env.JWT_SECRET || '') as { userId: string };
        req.userId = decodedToken.userId;
        req.isAuthenticated = () => true;
        next();
    } catch (error) {
        console.error('Error authenticating JWT:', error);
        req.isAuthenticated = () => false;
        next();
    }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, status: 'Authentication required' });
    }
    next();
}