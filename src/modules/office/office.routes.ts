import { Router } from 'express';
import * as officeController from './office.controller';
import optionalAuthMiddleware from '../../middlewares/optional-auth';

const router = Router();

// Public routes - offices listing and detail
router.get('/', optionalAuthMiddleware, officeController.getOffices);
router.get('/:id', optionalAuthMiddleware, officeController.getOfficeById);

export default router;
