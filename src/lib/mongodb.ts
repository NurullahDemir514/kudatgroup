import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI ortam değişkeni tanımlanmamış');
}

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global değişken - bağlantı durumunu saklar
 */
declare global {
    var mongoose: {
        conn: mongoose.Connection | null;
        promise: Promise<mongoose.Connection> | null;
    };
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Veritabanına bağlantı kurar
 */
export async function connectToDatabase() {
    if (cached.conn) {
        console.log('MongoDB bağlantısı mevcut');
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        mongoose.set('strictQuery', true);
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('MongoDB\'ye başarıyla bağlanıldı!');
            return mongoose.connection;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
} 