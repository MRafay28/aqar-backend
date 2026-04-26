import { Router } from 'express';
import * as subscriptionPlanController from './subscription-plan.controller';
import validateRequest from '../../middlewares/validate-request';
import { getSubscriptionPlanByIdSchema } from './subscription-plan.validation';

const router = Router();

// Public routes - no authentication required
router.get('/', subscriptionPlanController.getAllSubscriptionPlans);
router.get('/:id', validateRequest(getSubscriptionPlanByIdSchema), subscriptionPlanController.getSubscriptionPlanById);

export default router;
