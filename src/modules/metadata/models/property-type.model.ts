import mongoose, { Schema, Document } from 'mongoose';

export interface IPropertyType extends Document {
    label: string;
    labelAr: string;
    value: string;
    order: number;
}

const PropertyTypeSchema: Schema = new Schema(
    {
        label: { type: String, required: true },
        labelAr: { type: String, default: '' },
        value: { type: String, required: true, unique: true },
        order: { type: Number, default: 0 }
    },
    { timestamps: true }
);

export const PropertyType = mongoose.model<IPropertyType>('PropertyType', PropertyTypeSchema);
