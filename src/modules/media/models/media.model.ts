import mongoose, { Schema, Document } from 'mongoose';

export enum MediaType {
    IMAGE = 'image',
    VIDEO = 'video'
}

export interface IMedia extends Document {
    url: string;
    key: string;
    type: MediaType;
    thumbnail?: string;
    thumbnailKey?: string;
    mimeType: string;
    size: number;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const MediaSchema: Schema = new Schema(
    {
        url: { type: String, required: true },
        key: { type: String, required: true },
        type: { type: String, enum: Object.values(MediaType), required: true },
        thumbnail: { type: String },
        thumbnailKey: { type: String },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        order: { type: Number, default: 0 }
    },
    { timestamps: true }
);

export const MediaModel = mongoose.model<IMedia>('Media', MediaSchema);
