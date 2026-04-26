import { AnyZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { formatResponse } from '../utils/helpers';

const validateRequest = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params
        });
        next();
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json(formatResponse(false, 'Validation error', JSON.parse(error.message)));
        }
    }
};

export default validateRequest;
