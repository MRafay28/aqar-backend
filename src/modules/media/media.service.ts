// import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
// import logger from '../../utils/logger';
// import path from 'path';
// import { v4 as uuidv4 } from 'uuid';
// import config from '../../config/default';
// import ffmpeg from 'fluent-ffmpeg';
// import ffmpegStatic from 'ffmpeg-static';
// import fs from 'fs';
// import os from 'os';

// // Configure ffmpeg path if ffmpeg-static is available
// if (ffmpegStatic) {
//     ffmpeg.setFfmpegPath(ffmpegStatic);
// }
// export { MediaModel, IMedia, MediaType } from './models/media.model';
// import { MediaModel, IMedia, MediaType } from './models/media.model';

// // Initialize S3 Client for Cloudflare R2
// const s3Client = new S3Client({
//     region: 'auto',
//     endpoint: config.R2_ENDPOINT || '',
//     credentials: {
//         accessKeyId: config.R2_ACCESS_KEY_ID || '',
//         secretAccessKey: config.R2_SECRET_ACCESS_KEY || ''
//     }
// });

// const BUCKET_NAME = config.R2_BUCKET_NAME || '';

// // Helper to get public URL
// const getPublicUrl = (key: string): string => {
//     const publicDomain = process.env.R2_PUBLIC_DOMAIN;
//     if (publicDomain) {
//         return `${publicDomain}/${key}`;
//     }
//     return key;
// };

// // Upload file to R2 and save to Database
// export const uploadFile = async (file: Express.Multer.File): Promise<IMedia> => {
//     try {
//         const fileExtension = path.extname(file.originalname);
//         const fileName = uuidv4();
//         let key = `ads/${fileName}${fileExtension}`;
//         let uploadBuffer = file.buffer;
//         let contentType = file.mimetype;

//         let videoThumbnail: string | undefined;
//         let thumbnailKey: string | undefined;

//         // Generate thumbnail and compress if it's a video
//         if (file.mimetype.startsWith('video/')) {
//             try {
//                 const tempVideoPath = path.join(os.tmpdir(), `${fileName}-orig${fileExtension}`);
//                 const compressedVideoPath = path.join(os.tmpdir(), `${fileName}-comp.mp4`);
//                 const tempThumbnailName = `${fileName}-thumb.jpg`;
//                 const tempThumbnailPath = path.join(os.tmpdir(), tempThumbnailName);

//                 // Write video buffer to temp file
//                 fs.writeFileSync(tempVideoPath, file.buffer);

//                 // Compress video and extract thumbnail
//                 await new Promise((resolve, reject) => {
//                     ffmpeg(tempVideoPath)
//                         .videoCodec('libx264')
//                         .outputOptions(['-preset fast', '-crf 28', '-movflags +faststart'])
//                         .toFormat('mp4')
//                         .on('end', resolve)
//                         .on('error', reject)
//                         .save(compressedVideoPath);
//                 });

//                 if (fs.existsSync(compressedVideoPath)) {
//                     uploadBuffer = fs.readFileSync(compressedVideoPath);
//                     key = `ads/${fileName}.mp4`;
//                     contentType = 'video/mp4';

//                     // Extract thumbnail from the compressed video
//                     await new Promise((resolve, reject) => {
//                         ffmpeg(compressedVideoPath)
//                             .screenshots({
//                                 timestamps: ['00:00:01'],
//                                 filename: tempThumbnailName,
//                                 folder: os.tmpdir(),
//                                 size: '640x?'
//                             })
//                             .on('end', resolve)
//                             .on('error', reject);
//                     });

//                     // Read generated thumbnail
//                     if (fs.existsSync(tempThumbnailPath)) {
//                         const thumbnailBuffer = fs.readFileSync(tempThumbnailPath);
//                         thumbnailKey = `ads/thumbnails/${tempThumbnailName}`;

//                         const thumbCommand = new PutObjectCommand({
//                             Bucket: BUCKET_NAME,
//                             Key: thumbnailKey,
//                             Body: thumbnailBuffer,
//                             ContentType: 'image/jpeg'
//                         });

//                         await s3Client.send(thumbCommand);
//                         videoThumbnail = getPublicUrl(thumbnailKey);

//                         // Clean up thumbnail
//                         fs.unlinkSync(tempThumbnailPath);
//                     }

//                     // Clean up compressed video
//                     fs.unlinkSync(compressedVideoPath);
//                 }

//                 // Clean up original video
//                 if (fs.existsSync(tempVideoPath)) {
//                     fs.unlinkSync(tempVideoPath);
//                 }
//             } catch (videoError) {
//                 console.log(videoError);
//                 logger.error('Error processing video:', videoError);
//                 // Continue without compression/thumbnail if processing fails
//                 // Keep uploadBuffer as original file.buffer
//             }
//         }

//         const command = new PutObjectCommand({
//             Bucket: BUCKET_NAME,
//             Key: key,
//             Body: uploadBuffer,
//             ContentType: contentType
//         });

//         await s3Client.send(command);
//         const url = getPublicUrl(key);

//         // Save to Database
//         const media = await MediaModel.create({
//             url,
//             key,
//             type: contentType.startsWith('video/') ? MediaType.VIDEO : MediaType.IMAGE,
//             thumbnail: videoThumbnail,
//             thumbnailKey: thumbnailKey,
//             mimeType: contentType,
//             size: uploadBuffer.length
//         });

//         return media;
//     } catch (error) {
//         console.log(error);
//         logger.error('Error uploading file to R2:', error);
//         throw new Error('File upload failed');
//     }
// };

// // Delete file from R2
// export const deleteFile = async (key: string): Promise<void> => {
//     try {
//         // Extract key from URL if full URL is passed
//         let objectKey = key;
//         if (key.startsWith('http')) {
//             const urlObj = new URL(key);
//             objectKey = urlObj.pathname.substring(1); // Remove leading slash
//         }

//         const command = new DeleteObjectCommand({
//             Bucket: BUCKET_NAME,
//             Key: objectKey
//         });

//         await s3Client.send(command);
//         await MediaModel.deleteOne({ key: objectKey });
//     } catch (error) {
//         logger.error('Error deleting file from R2:', error);
//         // Don't throw for delete, just log
//     }
// };

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import logger from "../../utils/logger";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import config from "../../config/default";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import fs from "fs";
import os from "os";

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

export { MediaModel, IMedia, MediaType } from "./models/media.model";
import { MediaModel, IMedia, MediaType } from "./models/media.model";

const s3Client = new S3Client({
  region: "auto",
  endpoint: config.R2_ENDPOINT || "",
  credentials: {
    accessKeyId: config.R2_ACCESS_KEY_ID || "",
    secretAccessKey: config.R2_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = config.R2_BUCKET_NAME || "";
const MULTIPART_PART_SIZE = 8 * 1024 * 1024; // 8MB
const MAX_MULTIPART_PARTS = 10_000;

const getPublicUrl = (key: string): string => {
  const publicDomain = process.env.R2_PUBLIC_DOMAIN;
  return publicDomain ? `${publicDomain}/${key}` : key;
};

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/mov": "mov",
  "video/quicktime": "mov",
};

const getFileExtension = (fileName: string, mimeType: string): string => {
  const nameExtension = path
    .extname(fileName || "")
    .replace(".", "")
    .toLowerCase();
  if (nameExtension) {
    return nameExtension;
  }

  return MIME_EXTENSION_MAP[mimeType] || "bin";
};

export interface MultipartInitInput {
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export interface MultipartInitResult {
  uploadId: string;
  key: string;
  partSize: number;
}

export interface MultipartPartUrlInput {
  key: string;
  uploadId: string;
  partNumber: number;
}

export interface MultipartPartUrlResult {
  uploadUrl: string;
}

export interface MultipartThumbnailUrlInput {
  mimeType: string;
}

export interface MultipartThumbnailUrlResult {
  key: string;
  uploadUrl: string;
}

export interface MultipartCompletePart {
  partNumber: number;
  etag: string;
}

export interface MultipartCompleteInput {
  key: string;
  uploadId: string;
  parts: MultipartCompletePart[];
  mimeType: string;
  fileSize: number;
  type: MediaType;
  thumbnailKey?: string;
}

export interface MultipartAbortInput {
  key: string;
  uploadId: string;
}
const ensureCloudflareR2Config = () => {
  console.log("Checking Cloudflare R2 configuration...");
  console.log("R2_ENDPOINT:", config.R2_ENDPOINT);
  console.log("R2_ACCESS_KEY_ID:", config.R2_ACCESS_KEY_ID);
  console.log("R2_SECRET_ACCESS_KEY:", config.R2_SECRET_ACCESS_KEY);
  if (
    !config.R2_ENDPOINT ||
    !config.R2_ACCESS_KEY_ID ||
    !config.R2_SECRET_ACCESS_KEY ||
    !config.R2_BUCKET_NAME
  ) {
    throw new Error(
      "Cloudflare R2 configuration is missing. Please check your environment variables.",
    );
  }
};

export const initMultipartUpload = async ({
  fileName,
  mimeType,
  fileSize,
}: MultipartInitInput): Promise<MultipartInitResult> => {
  const totalParts = Math.ceil(fileSize / MULTIPART_PART_SIZE);
  if (totalParts > MAX_MULTIPART_PARTS) {
    throw new Error("File is too large for multipart upload");
  }

  const fileNameWithoutQuery = fileName.split("?")[0];
  const extension = getFileExtension(fileNameWithoutQuery, mimeType);
  const key = `ads/${uuidv4()}.${extension}`;

  const command = new CreateMultipartUploadCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: mimeType,
  });
  ensureCloudflareR2Config();

  const response = await s3Client.send(command);
  if (!response.UploadId) {
    throw new Error("Failed to initialize multipart upload");
  }

  return {
    uploadId: response.UploadId,
    key,
    partSize: MULTIPART_PART_SIZE,
  };
};

export const getMultipartPartUploadUrl = async ({
  key,
  uploadId,
  partNumber,
}: MultipartPartUrlInput): Promise<MultipartPartUrlResult> => {
  const command = new UploadPartCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  });
  ensureCloudflareR2Config();
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

  return { uploadUrl };
};

export const getMultipartThumbnailUploadUrl = async ({
  mimeType,
}: MultipartThumbnailUrlInput): Promise<MultipartThumbnailUrlResult> => {
  const extension = MIME_EXTENSION_MAP[mimeType] || "jpg";
  const key = `ads/thumbnails/${uuidv4()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: mimeType,
  });
  ensureCloudflareR2Config();
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

  return {
    key,
    uploadUrl,
  };
};

export const completeMultipartUpload = async ({
  key,
  uploadId,
  parts,
  mimeType,
  fileSize,
  type,
  thumbnailKey,
}: MultipartCompleteInput): Promise<IMedia> => {
  const sortedParts = [...parts]
    .sort((a, b) => a.partNumber - b.partNumber)
    .map((part) => ({
      ETag: part.etag,
      PartNumber: part.partNumber,
    }));

  const command = new CompleteMultipartUploadCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: sortedParts,
    },
  });

  await s3Client.send(command);

  const media = await MediaModel.create({
    url: getPublicUrl(key),
    key,
    type,
    thumbnail: thumbnailKey ? getPublicUrl(thumbnailKey) : undefined,
    thumbnailKey,
    mimeType,
    size: fileSize,
  });

  return media;
};

export const abortMultipartUpload = async ({
  key,
  uploadId,
}: MultipartAbortInput): Promise<void> => {
  await s3Client.send(
    new AbortMultipartUploadCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
    }),
  );
};

export const uploadFile = async (
  file: Express.Multer.File,
): Promise<IMedia> => {
  try {
    const fileExtension = path.extname(file.originalname);
    const fileName = uuidv4();

    let key = `ads/${fileName}${fileExtension}`;
    let uploadBuffer = file.buffer;
    let contentType = file.mimetype;

    let videoThumbnail: string | undefined;
    let thumbnailKey: string | undefined;

    const isVideo = file.mimetype.startsWith("video/");
    const SHOULD_COMPRESS = file.size > 15 * 1024 * 1024;

    if (isVideo) {
      const tempVideoPath = path.join(
        os.tmpdir(),
        `${fileName}-orig${fileExtension}`,
      );
      const compressedVideoPath = path.join(
        os.tmpdir(),
        `${fileName}-comp.mp4`,
      );
      const tempThumbnailName = `${fileName}-thumb.jpg`;
      const tempThumbnailPath = path.join(os.tmpdir(), tempThumbnailName);

      try {
        // Write original file (always needed for thumbnail at least)
        fs.writeFileSync(tempVideoPath, file.buffer);

        let videoForThumbnailPath = tempVideoPath;

        // 🔥 Compress ONLY if needed
        if (SHOULD_COMPRESS) {
          const compressStart = Date.now();

          await new Promise((resolve, reject) => {
            ffmpeg(tempVideoPath)
              .videoCodec("libx264")
              .outputOptions([
                "-preset ultrafast",
                "-crf 30",
                "-movflags +faststart",
                "-threads 0",
                "-vf scale=854:-2",
                "-r 24",
              ])
              .toFormat("mp4")
              .on("end", resolve)
              .on("error", reject)
              .save(compressedVideoPath);
          });

          logger.info(
            `Compression time: ${(Date.now() - compressStart) / 1000}s`,
          );

          if (fs.existsSync(compressedVideoPath)) {
            uploadBuffer = fs.readFileSync(compressedVideoPath);
            key = `ads/${fileName}.mp4`;
            contentType = "video/mp4";

            videoForThumbnailPath = compressedVideoPath;
          }
        }

        // 🎯 ALWAYS GENERATE THUMBNAIL
        await new Promise((resolve, reject) => {
          ffmpeg(videoForThumbnailPath)
            .screenshots({
              timestamps: ["00:00:01"],
              filename: tempThumbnailName,
              folder: os.tmpdir(),
              size: "640x?",
            })
            .on("end", resolve)
            .on("error", reject);
        });

        const uploadPromises: Promise<any>[] = [];

        // 📦 Prepare video upload
        const videoCommand = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: uploadBuffer,
          ContentType: contentType,
        });

        uploadPromises.push(s3Client.send(videoCommand));

        // 📦 Prepare thumbnail upload
        if (fs.existsSync(tempThumbnailPath)) {
          const thumbnailBuffer = fs.readFileSync(tempThumbnailPath);
          thumbnailKey = `ads/thumbnails/${tempThumbnailName}`;

          const thumbCommand = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: thumbnailKey,
            Body: thumbnailBuffer,
            ContentType: "image/jpeg",
          });

          uploadPromises.push(s3Client.send(thumbCommand));
          videoThumbnail = getPublicUrl(thumbnailKey);
        }

        // 🚀 PARALLEL UPLOAD
        await Promise.all(uploadPromises);

        // 🧹 Cleanup
        if (fs.existsSync(tempVideoPath)) fs.unlinkSync(tempVideoPath);
        if (fs.existsSync(compressedVideoPath))
          fs.unlinkSync(compressedVideoPath);
        if (fs.existsSync(tempThumbnailPath)) fs.unlinkSync(tempThumbnailPath);
      } catch (err) {
        logger.error("Video processing failed:", err);
      }
    } else {
      // 📌 IMAGE UPLOAD
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: uploadBuffer,
        ContentType: contentType,
      });

      await s3Client.send(command);
    }

    // 💾 SAVE DB
    const media = await MediaModel.create({
      url: getPublicUrl(key),
      key,
      type: isVideo ? MediaType.VIDEO : MediaType.IMAGE,
      thumbnail: videoThumbnail,
      thumbnailKey,
      mimeType: contentType,
      size: uploadBuffer.length,
    });

    return media;
  } catch (error) {
    logger.error("Upload failed:", error);
    throw new Error("File upload failed");
  }
};

export const deleteFile = async (key: string): Promise<void> => {
  try {
    let objectKey = key;

    if (key.startsWith("http")) {
      const urlObj = new URL(key);
      objectKey = urlObj.pathname.substring(1);
    }

    logger.info(`[media.delete] start key=${objectKey}`);

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: objectKey,
      }),
    );

    await MediaModel.deleteOne({ key: objectKey });
    logger.info(`[media.delete] success key=${objectKey}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    logger.error(`[media.delete] failed key=${key} reason=${message}`);
  }
};
