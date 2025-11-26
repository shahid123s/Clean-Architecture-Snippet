import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
    name: string;
    email: string;
    role: string;
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        default: 'user',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
