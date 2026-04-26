
import { Router } from 'express';
import * as metadataController from './metadata.controller';

const router = Router();

router.get('/property-types', metadataController.getPropertyTypes);
router.get('/areas', metadataController.getAreas);

export default router;
