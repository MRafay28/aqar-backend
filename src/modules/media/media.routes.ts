import { Router } from 'express';
import * as mediaController from './media.controller';
import upload, { localUpload } from '../../middlewares/upload';

const router = Router();

// Public media routes to support unauthenticated flows such as signup profile image upload
router.post('/upload', upload.single('file'), mediaController.uploadMedia);
router.post('/upload-local', localUpload.single('file'), mediaController.uploadLocalMedia);
router.post('/multipart/init', mediaController.initMultipartUpload);
router.post('/multipart/part-url', mediaController.getMultipartPartUploadUrl);
router.post('/multipart/thumbnail-url', mediaController.getMultipartThumbnailUploadUrl);
router.post('/multipart/complete', mediaController.completeMultipartUpload);
router.post('/multipart/abort', mediaController.abortMultipartUpload);

export default router;
