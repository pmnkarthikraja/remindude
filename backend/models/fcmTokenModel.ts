import mongoose, { Document, Schema } from 'mongoose';

export interface FCMToken extends Document {
    email: string,
    tokens: string[]
}

const fcmTokenSchema: Schema<FCMToken> = new Schema({
    email: { type: String, required: true, unique: true },
    tokens: [{ type: String }]
}, { timestamps: true })


const FCMTokenModel = mongoose.model<FCMToken>('FcmToken', fcmTokenSchema);

export default FCMTokenModel
