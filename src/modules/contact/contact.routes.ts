import { Router } from 'express';
import * as ContactController from './contact.controller';
import optionalAuth from '../../middlewares/optional-auth';

const router = Router();

router.post('/', optionalAuth, ContactController.createContact);

export default router;
