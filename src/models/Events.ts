import mongoose, { Schema, models } from 'mongoose';

export interface IEvent {
    _id?: string;
    title: string;
    date: Date;
    type: string;
    color: string;
    description?: string;
    attendees?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
    {
        title: {
            type: String,
            required: [true, 'Etkinlik başlığı zorunlu'],
            trim: true,
        },
        date: {
            type: Date,
            required: [true, 'Etkinlik tarihi zorunlu'],
        },
        type: {
            type: String,
            required: [true, 'Etkinlik türü zorunlu'],
            trim: true,
        },
        color: {
            type: String,
            default: 'from-gray-300 to-gray-400',
        },
        description: {
            type: String,
            trim: true,
        },
        attendees: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

export const Event = models.Event || mongoose.model<IEvent>('Event', eventSchema); 