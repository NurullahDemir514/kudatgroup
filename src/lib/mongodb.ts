import mongoose from 'mongoose';

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
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error('MONGODB_URI ortam değişkeni tanımlanmamış');
    }

    if (cached.conn) {
        console.log('MongoDB bağlantısı mevcut');
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        mongoose.set('strictQuery', true);
        cached.promise = mongoose.connect(mongoUri, opts).then((mongoose) => {
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
