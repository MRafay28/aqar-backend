// requestLogger.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Extend the Express Request interface to include requestId
declare global {
    namespace Express {
        interface Request {
            requestId?: string;
        }
    }
}

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const requestId = uuidv4();
    const { method, url, headers, body } = req;
    req.requestId = requestId;

    const requestLog = {
        type: 'Request',
        requestId: requestId,
        method: method,
        url: url,
        headers: headers,
        body: body
    };

    logger.info(JSON.stringify(requestLog));

    // Capture response details after it finishes
    res.on('finish', () => {
        const duration = Date.now() - start;
        const responseLog = {
            type: 'Response',
            requestId: requestId,
            method: method,
            url: url,
            status: res.statusCode,
            duration: `${duration}ms`
        };
        logger.info(JSON.stringify(responseLog));
    });

    next();
};

export default requestLogger;
