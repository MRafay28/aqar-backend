import { Schema, model, Document, Types } from 'mongoose';

export interface IFailedAd extends Document {
    user: Types.ObjectId;
    purpose: string;
    propertyType?: Types.ObjectId;
    area?: Types.ObjectId;
    price?: number;
    description?: string;
    phoneNumber?: string;
    altPhoneNumber?: string;
    media?: Types.ObjectId[];
    premiumAd: boolean;
    isPremium?: boolean;
    error?: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

const failedAdSchema = new Schema<IFailedAd>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        purpose: { type: String, required: true },
        propertyType: { type: Schema.Types.ObjectId, ref: 'PropertyType' },
        area: { type: Schema.Types.ObjectId, ref: 'Area' },
        price: { type: Number },
        description: { type: String },
        phoneNumber: { type: String },
        altPhoneNumber: { type: String },
        media: [{ type: Schema.Types.ObjectId, ref: 'Media' }],
        premiumAd: { type: Boolean, default: false },
        error: { type: String },
        metadata: { type: Schema.Types.Mixed }
    },
    { timestamps: true }
);

export const FailedAdModel = model<IFailedAd>('FailedAd', failedAdSchema);
