import mongoose, { Schema, Document } from 'mongoose';

export interface Contact extends Document {
    fullName: string;
    email: string;
    subject: string;
    message: string;
    userId?: mongoose.Types.ObjectId;
    action?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ContactSchema: Schema = new Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        subject: { type: String, required: true },
        message: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        action: { type: String }
    },
    { timestamps: true }
);

export const ContactModel = mongoose.model<Contact>('Contact', ContactSchema);
