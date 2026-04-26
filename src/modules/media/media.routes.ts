import { Router } from 'express';
import * as mediaController from './media.controller';
import upload, { localUpload } from '../../middlewares/upload';
import authMiddleware from '../../middlewares/auth';

const router = Router();

// Protected route for uploads
router.post('/upload', authMiddleware, upload.single('file'), mediaController.uploadMedia);
router.post('/upload-local', authMiddleware, localUpload.single('file'), mediaController.uploadLocalMedia);
router.post('/multipart/init', authMiddleware, mediaController.initMultipartUpload);
router.post('/multipart/part-url', authMiddleware, mediaController.getMultipartPartUploadUrl);
router.post('/multipart/thumbnail-url', authMiddleware, mediaController.getMultipartThumbnailUploadUrl);
router.post('/multipart/complete', authMiddleware, mediaController.completeMultipartUpload);
router.post('/multipart/abort', authMiddleware, mediaController.abortMultipartUpload);

export default router;
