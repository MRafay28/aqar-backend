import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
    user: mongoose.Types.ObjectId;
    ad: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const FavoriteSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        ad: { type: Schema.Types.ObjectId, ref: 'Ad', required: true, index: true }
    },
    { timestamps: true }
);

FavoriteSchema.index({ user: 1, ad: 1 }, { unique: true });

export const FavoriteModel = mongoose.model<IFavorite>('Favorite', FavoriteSchema);
