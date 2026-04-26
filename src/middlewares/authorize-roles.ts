import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import CustomError from '../utils/custom-error';
import { UserRole } from '../modules/user/user.constants';
const authorizeRoles = (allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as JwtPayload;
        if (!user) {
            return next(new CustomError('Authentication required', 401));
        }
        if (!allowedRoles.includes(user.role as UserRole)) {
            return next(new CustomError('You do not have permission to access this resource.', 403));
        }

        next();
    };
};

export default authorizeRoles;
