import { Router } from 'express';
import * as couponController from './coupon.controller';
import authMiddleware from '../../middlewares/auth';
import authorizeRoles from '../../middlewares/authorize-roles';
import { UserRole } from '../user/user.constants';
import validateRequest from '../../middlewares/validate-request';
import { createCouponSchema, updateCouponSchema } from './coupon.validation';

const router = Router();

// Public/User accessible routes (e.g., validate coupon on checkout)
router.get('/validate', authMiddleware, couponController.validateCoupon);

// Admin only routes
router.use(authMiddleware, authorizeRoles([UserRole.SUPER_ADMIN]));

router.get('/', couponController.getAllCoupons);
router.get('/stats', couponController.getCouponStats);
router.get('/:id', couponController.getCouponById);
router.post('/', validateRequest(createCouponSchema), couponController.createCoupon);
router.put('/:id', validateRequest(updateCouponSchema), couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);

export default router;
