import { Router } from 'express';
import * as AdminController from './admin.controller';
import { toggleUserStatus } from '../user/user.controller';
import asyncHandler from '../../utils/async-handler';
import authMiddleware from '../../middlewares/auth';
import authorizeRoles from '../../middlewares/authorize-roles';
import { UserRole } from '../user/user.constants';

const router = Router();

// All admin routes require authentication + super_admin role
router.use(authMiddleware, authorizeRoles([UserRole.SUPER_ADMIN]));

// Dashboard
router.get('/dashboard', asyncHandler(AdminController.getDashboardStats));
router.get('/ads-over-time', asyncHandler(AdminController.getAdsOverTime));

// Users management
router.get('/users', asyncHandler(AdminController.getAllUsers));
router.get('/users/:id', asyncHandler(AdminController.getUserDetails));
router.put('/users/:id', asyncHandler(AdminController.updateUser));
router.delete('/users/:id', asyncHandler(AdminController.deleteUser));
router.patch('/users/:id/toggle-status', asyncHandler(toggleUserStatus));
router.patch('/users/:id/password', asyncHandler(AdminController.changeUserPassword));

// Ads management
router.get('/ads', asyncHandler(AdminController.getAllAds));

// Failed Ads management
router.get('/failed-ads', asyncHandler(AdminController.getFailedAds));
router.get('/failed-ads/:id', asyncHandler(AdminController.getFailedAdById));
router.delete('/failed-ads/:id', asyncHandler(AdminController.deleteFailedAd));

// Subscription management
router.get('/subscriptions', asyncHandler(AdminController.getAdminSubscriptions));
router.patch('/subscriptions/:id/cancel', asyncHandler(AdminController.cancelSubscription));

// Plan management
router.get('/plans', asyncHandler(AdminController.getAllPlans));
router.put('/plans/:id', asyncHandler(AdminController.updatePlan));
router.patch('/plans/:id/toggle-status', asyncHandler(AdminController.togglePlanStatus));

export default router;
