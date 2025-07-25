import { Request, Response, NextFunction } from 'express';

export function isLoggedIn(req: Request, res: Response, next: NextFunction): void {
    // Example: check for a JWT token or session
    // You can add your real authentication logic here
    next();
}