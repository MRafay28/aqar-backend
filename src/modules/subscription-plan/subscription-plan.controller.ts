import { Request, Response } from 'express';
import * as subscriptionPlanService from './subscription-plan.service';
import asyncHandler from '../../utils/async-handler';
import { formatResponse } from '../../utils/helpers';

export const getAllSubscriptionPlans = asyncHandler(async (req: Request, res: Response) => {
    const plans = await subscriptionPlanService.getAllSubscriptionPlans();
    res.status(200).json(formatResponse(true, 'Subscription plans fetched successfully', plans));
});

export const getSubscriptionPlanById = asyncHandler(async (req: Request, res: Response) => {
    const plan = await subscriptionPlanService.getSubscriptionPlanById(req.params.id as string);
    if (!plan) {
        return res.status(404).json(formatResponse(false, 'Subscription plan not found'));
    }
    res.status(200).json(formatResponse(true, 'Subscription plan fetched successfully', plan));
});
