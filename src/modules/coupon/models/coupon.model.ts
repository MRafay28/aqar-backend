import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
    code: string;
    discountValue: number; // Percentage or fixed amount (using as percentage based on typical sniper project patterns)
    userLimit: number;
    expiryDate: Date;
    isActive: boolean;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const CouponSchema: Schema = new Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true },
        discountValue: { type: Number, required: true, min: 0, max: 100 },
        userLimit: { type: Number, required: true, default: 0 }, // 0 for unlimited if applicable, but user says admin can set it
        expiryDate: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
        usageCount: { type: Number, default: 0 }
    },
    { timestamps: true }
);

// Index for faster lookups and search
CouponSchema.index({ code: 'text' });

export const CouponModel = mongoose.model<ICoupon>('Coupon', CouponSchema);
