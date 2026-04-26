import mongoose, { Schema, Document } from 'mongoose';

interface OTP extends Document {
    userId: mongoose.Types.ObjectId;
    code: string;
}

const OTPSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        code: { type: String, required: true },
        createdAt: { type: Date, default: Date.now, expires: 300 } // OTP expires after 5 minutes
    },
    { timestamps: false }
);

const OTPModel = mongoose.model<OTP>('OTP', OTPSchema);

export { OTPModel, OTP };
