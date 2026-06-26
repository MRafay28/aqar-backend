import { Request, Response } from 'express';
import { formatResponse } from '../../utils/helpers';
import * as AdminService from './admin.service';

const getDashboardStats = async (req: Request, res: Response) => {
    const stats = await AdminService.getDashboardStats();
    res.status(200).json(formatResponse(true, 'Dashboard stats retrieved successfully', stats));
};

const getAdsOverTime = async (req: Request, res: Response) => {
    const period = (req.query.period as string) || 'monthly';
    if (!['weekly', 'monthly', 'yearly'].includes(period)) {
        return res.status(400).json(formatResponse(false, 'Invalid period. Use weekly, monthly, or yearly.'));
    }
    const data = await AdminService.getAdsOverTime(period as 'weekly' | 'monthly' | 'yearly');
    res.status(200).json(formatResponse(true, 'Ads over time data retrieved successfully', data));
};

const getAllUsers = async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;

    const result = await AdminService.getAllUsersForAdmin(page, limit, search, status);

    res.status(200).json(
        formatResponse(true, 'Users retrieved successfully', {
            data: result.users,
            pagination: result.pagination
        })
    );
};

const createUser = async (req: Request, res: Response) => {
    const user = await AdminService.createAdminUser(req.body);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, __v, ...userWithoutSensitiveData } = user.toObject();

    res.status(201).json(formatResponse(true, 'User created successfully', userWithoutSensitiveData));
};

const getUserDetails = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
        const result = await AdminService.getUserDetailsForAdmin(id, page, limit);
        res.status(200).json(formatResponse(true, 'User details retrieved successfully', result));
    } catch (error: any) {
        res.status(404).json(formatResponse(false, error.message || 'User not found'));
    }
};

const deleteUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await AdminService.deleteUser(id);
        res.status(200).json(formatResponse(true, 'User and associated data deleted successfully'));
    } catch (error: any) {
        res.status(400).json(formatResponse(false, error.message || 'Failed to delete user'));
    }
};

const changeUserPassword = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json(formatResponse(false, 'Password must be at least 6 characters'));
        }
        await AdminService.changeUserPassword(id, newPassword);
        res.status(200).json(formatResponse(true, 'User password updated successfully'));
    } catch (error: any) {
        res.status(400).json(formatResponse(false, error.message || 'Failed to update password'));
    }
};

const updateUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { ...updatedData } = req.body;
        const updatedUser = await AdminService.updateUserForAdmin(id, updatedData);
        res.status(200).json(formatResponse(true, 'User updated successfully', updatedUser));
    } catch (error: any) {
        res.status(400).json(formatResponse(false, error.message || 'Failed to update user'));
    }
};

const verifyUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const result = await AdminService.verifyUserForAdmin(id);
        res.status(200).json(formatResponse(true, 'User verified successfully', result));
    } catch (error: any) {
        res.status(400).json(formatResponse(false, error.message || 'Failed to verify user'));
    }
};

const getAllAds = async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 12));
    const purpose = req.query.purpose as string | undefined;
    const propertyType = req.query.propertyType as string | undefined;
    const area = req.query.area as string | string[] | undefined;
    const status = req.query.status as string | undefined;
    const isPremium = req.query.isPremium as string | undefined;

    const result = await AdminService.getAllAdsForAdmin({
        page,
        limit,
        purpose,
        propertyType,
        area,
        status: status || 'all',
        isPremium: isPremium === 'true' ? true : isPremium === 'false' ? false : undefined
    });

    res.status(200).json(formatResponse(true, 'Ads retrieved successfully', result));
};

const getAdminSubscriptions = async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const search = req.query.search as string | undefined;

    const result = await AdminService.getAdminSubscriptions(page, limit, search);
    res.status(200).json(formatResponse(true, 'Subscriptions retrieved successfully', result));
};

const cancelSubscription = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await AdminService.cancelSubscription(id as string);
        res.status(200).json(formatResponse(true, 'Subscription cancelled successfully'));
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to cancel subscription';
        res.status(400).json(formatResponse(false, errorMessage));
    }
};

const getFailedAds = async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 12));
    const search = req.query.search as string | undefined;

    const result = await AdminService.getFailedAdsForAdmin(page, limit, search);
    res.status(200).json(formatResponse(true, 'Failed ads retrieved successfully', result));
};

const getFailedAdById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const ad = await AdminService.getFailedAdByIdForAdmin(id as string);
        if (!ad) {
            return res.status(404).json(formatResponse(false, 'Failed ad not found'));
        }
        res.status(200).json(formatResponse(true, 'Failed ad retrieved successfully', ad));
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve failed ad';
        res.status(400).json(formatResponse(false, errorMessage));
    }
};

const deleteFailedAd = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await AdminService.deleteFailedAdForAdmin(id as string);
        res.status(200).json(formatResponse(true, 'Failed ad deleted successfully'));
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete failed ad';
        res.status(400).json(formatResponse(false, errorMessage));
    }
};

const getAllPlans = async (req: Request, res: Response) => {
    try {
        const plans = await AdminService.getAllSubscriptionPlansForAdmin();
        res.status(200).json(formatResponse(true, 'Subscription plans retrieved successfully', plans));
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve plans';
        res.status(400).json(formatResponse(false, errorMessage));
    }
};

const updatePlan = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const plan = await AdminService.updateSubscriptionPlanForAdmin(id, req.body);
        res.status(200).json(formatResponse(true, 'Subscription plan updated successfully', plan));
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update plan';
        res.status(400).json(formatResponse(false, errorMessage));
    }
};

const togglePlanStatus = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const plan = await AdminService.toggleSubscriptionPlanStatus(id);
        res.status(200).json(formatResponse(true, 'Subscription plan status updated successfully', plan));
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update plan status';
        res.status(400).json(formatResponse(false, errorMessage));
    }
};

export {
    getDashboardStats,
    getAdsOverTime,
    getAllUsers,
    createUser,
    getUserDetails,
    deleteUser,
    changeUserPassword,
    updateUser,
    verifyUser,
    getAllAds,
    getAdminSubscriptions,
    cancelSubscription,
    getFailedAds,
    getFailedAdById,
    deleteFailedAd,
    getAllPlans,
    updatePlan,
    togglePlanStatus
};
