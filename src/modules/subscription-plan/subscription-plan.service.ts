import { Document, Types } from 'mongoose';
import { SubscriptionPlanModel, ISubscriptionPlan, PlanType } from './models/subscription-plan.model';

export type SubscriptionPlanDocument = Document<unknown, {}, ISubscriptionPlan> & ISubscriptionPlan & { _id: Types.ObjectId };

export interface CreateSubscriptionPlanData {
    name: string;
    nameAr: string;
    planType: string;
    description: string;
    price: number;
    numberOfMonths: number;
    adCredits: number;
    discount?: number;
    isActive?: boolean;
}

export const createSubscriptionPlan = async (planData: CreateSubscriptionPlanData): Promise<SubscriptionPlanDocument> => {
    if (planData.planType !== PlanType.OFFICE_PLAN) throw new Error('Only office plans are supported');
    const plan = await SubscriptionPlanModel.create(planData);
    return plan as SubscriptionPlanDocument;
};

export const updateSubscriptionPlan = async (id: string, planData: CreateSubscriptionPlanData): Promise<SubscriptionPlanDocument> => {
    if (planData.planType !== PlanType.OFFICE_PLAN) throw new Error('Only office plans are supported');
    const plan = await SubscriptionPlanModel.findOneAndUpdate({ _id: id, planType: PlanType.OFFICE_PLAN }, planData, { new: true });
    return plan as SubscriptionPlanDocument;
};

export const getAllSubscriptionPlans = async (): Promise<ISubscriptionPlan[]> => {
    return await SubscriptionPlanModel.find({ isActive: true, planType: PlanType.OFFICE_PLAN }).sort({ createdAt: -1 });
};

export const getSubscriptionPlanById = async (id: string): Promise<ISubscriptionPlan | null> => {
    return await SubscriptionPlanModel.findOne({ _id: id, isActive: true, planType: PlanType.OFFICE_PLAN });
};
