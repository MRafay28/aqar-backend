import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config/default';
import { UserModel } from '../modules/user/models';

/**
 * Optional authentication middleware - doesn't fail if no token is provided
 * Sets req.user if valid token is present, otherwise continues without user
 */
const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No token provided, continue without user
        return next();
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, config.jwtSecret!) as JwtPayload;
        const selectFields = 'isActive role isVerified';
        const user = await UserModel.findById(decoded.id).select(selectFields);

        if (user && user.isActive && user.isVerified && user.role === decoded.role) {
            req.user = {
                ...decoded
            } as JwtPayload;
        }
        // If user validation fails, continue without user (don't throw error)
    } catch (error) {
        // Invalid token, continue without user (don't throw error)
    }

    next();
};

export default optionalAuthMiddleware;
