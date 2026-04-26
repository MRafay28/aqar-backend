import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config/default';
import CustomError from '../utils/custom-error';
import { UserModel } from '../modules/user/models';
import { ERROR_MESSAGES } from '../modules/user/user.messages';
import { UserRole } from '../modules/user/user.constants';

// Extend the Express Request interface to include the user property and subscription
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload & { subscription?: { status: string } | null };
        }
    }
}

const extractSubscription = (user: { role: string; subscriptionId?: unknown }): { status: string } | null => {
    if ((user.role === UserRole.BUSINESS_OWNER || user.role === UserRole.STAFF) && user.subscriptionId) {
        if (typeof user.subscriptionId === 'object' && 'status' in user.subscriptionId) {
            return { status: (user.subscriptionId as { status: string }).status };
        }
    }
    return null;
};

/**
 * Returns CustomError if subscription is inactive for non-settings routes, null otherwise
 */
const validateSubscriptionStatus = (subscription: { status: string } | null, userRole: string, req: Request): CustomError | null => {
    if (userRole === UserRole.SUPER_ADMIN || !subscription) {
        return null;
    }

    const path = req.path.toLowerCase();
    const isSettingsRoute =
        path.includes('/settings') ||
        path.includes('/payment-methods') ||
        path.includes('/subscriptions/current') ||
        path.includes('/subscriptions/payment-methods') ||
        path.includes('/subscriptions/create-checkout-session') ||
        path.includes('/subscriptions/verify-session') ||
        path.includes('/subscriptions/cancel') ||
        path.includes('/subscriptions/renew');

    return null;
};

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new CustomError('Authorization token is missing or invalid', 401));
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, config.jwtSecret!) as JwtPayload;
        const selectFields = 'isActive role isVerified';
        const user = await UserModel.findById(decoded.id).select(selectFields);
        if (!user) {
            return next(new CustomError('User not found', 401));
        }
        if (user.role !== decoded.role) {
            return next(new CustomError('Unauthorized', 403));
        }
        if (!user.isVerified) {
            return next(new CustomError(ERROR_MESSAGES.EMAIL_NOT_VERIFIED, 403, 'EMAIL_NOT_VERIFIED'));
        }
        if (!user.isActive) {
            return next(new CustomError(ERROR_MESSAGES.ACCOUNT_INACTIVE, 403));
        }

        // // Extract and validate subscription status
        // const subscription = extractSubscription(user);
        // const subscriptionError = validateSubscriptionStatus(subscription, user.role, req);

        // if (subscriptionError) {
        //     return next(subscriptionError);
        // }

        req.user = {
            ...decoded
        } as JwtPayload & { subscription?: { status: string } | null };
        next();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return next(new CustomError('Invalid or expired token', 401));
    }
};

export default authMiddleware;
