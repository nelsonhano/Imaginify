import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

let cached: MongooseConnection = (global as any).mongoose || { conn: null, promise: null };

export const connectToDatabase = async (): Promise<Mongoose> => {
    if (cached.conn && mongoose.connection.readyState === 1) return cached.conn;

    const mongoUrl = process.env.MONGODB_URL || MONGODB_URL;

    if (!mongoUrl) {
        throw new Error("Missing MongoDB URL");
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(mongoUrl, {
            dbName: 'Imaginify',
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
        }).catch((err) => {
            cached.promise = null;
            throw err;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
};

// Ensure the mongoose connection is stored globally
(global as any).mongoose = cached;
