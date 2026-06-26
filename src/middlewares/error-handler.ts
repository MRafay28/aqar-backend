import { Request, Response, NextFunction } from 'express';
import CustomError from '../utils/custom-error';
import { formatResponse } from '../utils/helpers';
import logger from '../utils/logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(
        JSON.stringify({
            type: 'Error',
            requestId: req.requestId || 'unknown', //requestId inserted by requestLogger middleware
            error: err.message,
            stack: err.stack
        })
    );

    if (err instanceof CustomError) {
        res.status(err.statusCode).json(formatResponse(false, err.message, err.data ?? null, err.code));
    } else {
        res.status(500).json(formatResponse(false, err.message || 'Something went wrong!'));
    }
};

export default errorHandler;
