import { Request, Response } from 'express';
import * as officeService from './office.service';
import asyncHandler from '../../utils/async-handler';
import { formatResponse } from '../../utils/helpers';
import { JwtPayload } from 'jsonwebtoken';

export const getOffices = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, propertyType, area, minPrice, maxPrice, search } = req.query;

    // Handle area parameter
    let areaParam: string | string[] | undefined = undefined;
    if (area) {
        if (Array.isArray(area)) {
            areaParam = area as string[];
        } else {
            areaParam = area as string;
        }
    } else if (req.query['area[]']) {
        const areaArray = req.query['area[]'];
        areaParam = Array.isArray(areaArray) ? (areaArray as string[]) : [areaArray as string];
    }

    const params = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        propertyType: propertyType as string,
        area: areaParam,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        search: search as string
    };

    const result = await officeService.getOffices(params);
    res.status(200).json(formatResponse(true, 'Offices fetched successfully', result));
});

export const getOfficeById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { propertyType, area, minPrice, maxPrice, page, limit, purpose } = req.query;

    // Handle area parameter
    let areaParam: string | string[] | undefined = undefined;
    if (area) {
        if (Array.isArray(area)) {
            areaParam = area as string[];
        } else {
            areaParam = area as string;
        }
    } else if (req.query['area[]']) {
        const areaArray = req.query['area[]'];
        areaParam = Array.isArray(areaArray) ? (areaArray as string[]) : [areaArray as string];
    }

    const adFilters = {
        propertyType: propertyType as string,
        area: areaParam,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        purpose: purpose as string
    };

    const user = req.user as JwtPayload | undefined;
    const result = await officeService.getOfficeById(id as string, adFilters, user?.id);

    if (!result.office) {
        return res.status(404).json(formatResponse(false, 'Office not found'));
    }

    res.status(200).json(formatResponse(true, 'Office fetched successfully', result));
});
