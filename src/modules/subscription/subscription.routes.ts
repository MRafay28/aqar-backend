import { Router } from 'express';
import * as subscriptionController from './subscription.controller';
import authMiddleware from '../../middlewares/auth';

const router = Router();

// Protected routes
router.post('/subscribe', authMiddleware, subscriptionController.subscribe);
router.get('/my-subscriptions', authMiddleware, subscriptionController.getMySubscriptions);
router.get('/remaining-credits', authMiddleware, subscriptionController.getRemainingCredits);

export default router;
