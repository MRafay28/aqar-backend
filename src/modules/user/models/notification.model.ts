import mongoose, { Schema, Document } from 'mongoose';

export enum NotificationType {
    WISH_MATCHED = 'wish_matched',
    AD_APPROVED = 'ad_approved',
    AD_REJECTED = 'ad_rejected',
    SUBSCRIPTION_ACTIVATED = 'subscription_activated',
    PREMIUM_AD_EXPIRED = 'premium_ad_expired',
    GENERAL = 'general'
}

export interface INotification extends Document {
    user: mongoose.Types.ObjectId;
    type: NotificationType;
    title: { en: string; ar: string };
    message: { en: string; ar: string };
    redirectUrl?: string;
    relatedAd?: mongoose.Types.ObjectId;
    relatedWishlist?: mongoose.Types.ObjectId;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        type: { type: String, enum: Object.values(NotificationType), required: true },
        title: {
            en: { type: String, required: true },
            ar: { type: String, required: true }
        },
        message: {
            en: { type: String, required: true },
            ar: { type: String, required: true }
        },
        redirectUrl: { type: String },
        relatedAd: { type: Schema.Types.ObjectId, ref: 'Ad' },
        relatedWishlist: { type: Schema.Types.ObjectId, ref: 'Wishlist' },
        isRead: { type: Boolean, default: false, index: true }
    },
    { timestamps: true }
);

NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ user: 1, createdAt: -1 });

export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);
