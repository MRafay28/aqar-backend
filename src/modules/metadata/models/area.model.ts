import mongoose, { Schema, Document } from 'mongoose';

export interface IArea extends Document {
    label: string;
    labelAr: string;
    value: string;
    governorate: string;
    governorateAr: string;
    order: number;
}

const AreaSchema: Schema = new Schema(
    {
        label: { type: String, required: true },
        labelAr: { type: String, default: '' },
        value: { type: String, required: true, unique: true },
        governorate: { type: String, required: true },
        governorateAr: { type: String, default: '' },
        order: { type: Number, default: 0 }
    },
    { timestamps: true }
);

export const Area = mongoose.model<IArea>('Area', AreaSchema);
