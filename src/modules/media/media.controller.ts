import { Request, Response } from 'express';
import * as mediaService from './media.service';
import asyncHandler from '../../utils/async-handler';
import { formatResponse } from '../../utils/helpers';
import CustomError from '../../utils/custom-error';
import { z } from 'zod';
import { MediaType } from './models/media.model';

export const uploadMedia = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
        throw new CustomError('No file uploaded', 400);
    }

    const result = await mediaService.uploadFile(req.file);

    res.status(200).json(formatResponse(true, 'File uploaded successfully', result));
});

export const uploadLocalMedia = (req: Request, res: Response) => {
    if (!req.file) {
        throw new CustomError('No file uploaded', 400);
    }

    const fileUrl = `/uploads/public/${req.file.filename}`;

    res.status(200).json(
        formatResponse(true, 'File uploaded locally successfully', {
            url: fileUrl,
            filename: req.file.filename,
            mimeType: req.file.mimetype,
            size: req.file.size
        })
    );
};

const multipartInitSchema = z.object({
    fileName: z.string().min(1),
    mimeType: z.string().min(1),
    fileSize: z.number().int().positive()
});

const multipartPartUrlSchema = z.object({
    key: z.string().min(1),
    uploadId: z.string().min(1),
    partNumber: z.number().int().min(1).max(10000)
});

const multipartThumbnailSchema = z.object({
    mimeType: z.string().min(1)
});

const multipartCompleteSchema = z.object({
    key: z.string().min(1),
    uploadId: z.string().min(1),
    parts: z
        .array(
            z.object({
                partNumber: z.number().int().min(1).max(10000),
                etag: z.string().min(1)
            })
        )
        .min(1),
    mimeType: z.string().min(1),
    fileSize: z.number().int().positive(),
    type: z.nativeEnum(MediaType),
    thumbnailKey: z.string().min(1).optional()
});

const multipartAbortSchema = z.object({
    key: z.string().min(1),
    uploadId: z.string().min(1)
});

export const initMultipartUpload = asyncHandler(async (req: Request, res: Response) => {
    const payload = multipartInitSchema.parse(req.body);
    const result = await mediaService.initMultipartUpload(payload);

    res.status(200).json(formatResponse(true, 'Multipart upload initialized', result));
});

export const getMultipartPartUploadUrl = asyncHandler(async (req: Request, res: Response) => {
    const payload = multipartPartUrlSchema.parse(req.body);
    const result = await mediaService.getMultipartPartUploadUrl(payload);

    res.status(200).json(formatResponse(true, 'Multipart part URL generated', result));
});

export const getMultipartThumbnailUploadUrl = asyncHandler(async (req: Request, res: Response) => {
    const payload = multipartThumbnailSchema.parse(req.body);
    const result = await mediaService.getMultipartThumbnailUploadUrl(payload);

    res.status(200).json(formatResponse(true, 'Thumbnail upload URL generated', result));
});

export const completeMultipartUpload = asyncHandler(async (req: Request, res: Response) => {
    const payload = multipartCompleteSchema.parse(req.body);
    const result = await mediaService.completeMultipartUpload(payload);

    res.status(200).json(formatResponse(true, 'Multipart upload completed', result));
});

export const abortMultipartUpload = asyncHandler(async (req: Request, res: Response) => {
    const payload = multipartAbortSchema.parse(req.body);
    await mediaService.abortMultipartUpload(payload);

    res.status(200).json(formatResponse(true, 'Multipart upload aborted', null));
});
