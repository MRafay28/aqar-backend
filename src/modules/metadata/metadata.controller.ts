
import { Request, Response } from 'express';
import * as metadataService from './metadata.service';
import asyncHandler from '../../utils/async-handler';
import { formatResponse } from '../../utils/helpers';

export const getPropertyTypes = asyncHandler(async (req: Request, res: Response) => {
    const types = await metadataService.getPropertyTypes();
    res.status(200).json(formatResponse(true, 'Property types fetched successfully', types));
});

export const getAreas = asyncHandler(async (req: Request, res: Response) => {
    const areas = await metadataService.getAreas();
    res.status(200).json(formatResponse(true, 'Areas fetched successfully', areas));
});
