import mongoose, { Schema } from 'mongoose';

export interface IBot extends mongoose.Document {
    ownerID: number;
    token: string;
    botID: number;
    username: string;
    template?: string;
}

const botSchema: mongoose.Schema = new Schema(
    {
        ownerID: {
            type: Number,
            required: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        botID: {
            type: Number,
            required: true,
            unique: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        template: {
            type: String,
        },
    },
    { timestamps: true },
);

const Bot = mongoose.model<IBot>(`Bot`, botSchema);

export default Bot;
