import { Request, Response } from 'express';
import * as subscriptionService from './subscription.service';
import asyncHandler from '../../utils/async-handler';
import { formatResponse } from '../../utils/helpers';

export const subscribe = asyncHandler(async (req: Request, res: Response) => {
    const { planId, coupon } = req.body;
    const user = req.user as any;
    const lang = req.headers['accept-language']?.includes('ar') ? 'ar' : 'en';

    if (!planId) {
        return res.status(400).json(formatResponse(false, 'Plan ID is required'));
    }

    try {
        const subscription = await subscriptionService.subscribeUser(user.id, planId, coupon, lang);
        res.status(200).json(formatResponse(true, 'Subscribed successfully', subscription));
    } catch (error: any) {
        res.status(400).json(formatResponse(false, error.message));
    }
});

export const getMySubscriptions = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const subscriptions = await subscriptionService.getUserSubscriptions(user.id);
    res.status(200).json(formatResponse(true, 'User subscriptions fetched successfully', subscriptions));
});

export const getRemainingCredits = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const credits = await subscriptionService.getRemainingAdCredits(user.id);
    res.status(200).json(formatResponse(true, 'Remaining ad credits fetched successfully', credits));
});
