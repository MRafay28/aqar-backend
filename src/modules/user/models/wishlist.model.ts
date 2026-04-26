import mongoose, { Schema, Document } from 'mongoose';

export enum WishlistStatus {
    ACTIVE = 'active',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export interface IWishlist extends Document {
    user: mongoose.Types.ObjectId;
    purpose?: string; // 'sale' | 'rent' | 'exchange'
    propertyType?: mongoose.Types.ObjectId;
    area?: mongoose.Types.ObjectId;
    minPrice?: number;
    maxPrice?: number;
    status: WishlistStatus;
    matchedAd?: mongoose.Types.ObjectId; // Ad that matched this wish
    createdAt: Date;
    updatedAt: Date;
}

const WishlistSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        purpose: { type: String, enum: ['sale', 'rent', 'exchange'] },
        propertyType: { type: Schema.Types.ObjectId, ref: 'PropertyType' },
        area: { type: Schema.Types.ObjectId, ref: 'Area' },
        minPrice: { type: Number },
        maxPrice: { type: Number },
        status: { type: String, enum: Object.values(WishlistStatus), default: WishlistStatus.ACTIVE, index: true },
        matchedAd: { type: Schema.Types.ObjectId, ref: 'Ad' }
    },
    { timestamps: true }
);

WishlistSchema.index({ user: 1, status: 1 });

export const WishlistModel = mongoose.model<IWishlist>('Wishlist', WishlistSchema);
