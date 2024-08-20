import mongoose, { Mongoose } from "mongoose";
require('dotenv').config()

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

let cached: MongooseConnection = (global as any).mongoose || { conn: null, promise: null };

export const connectToDatabase = async (): Promise<Mongoose> => {
    if (cached.conn) return cached.conn;

    if (!MONGODB_URL) {
        throw new Error("Missing MongoDB URL");
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URL, {
            dbName: 'Imaginify',
            bufferCommands: false,
            // Removed useNewUrlParser and useUnifiedTopology as they are not needed in Mongoose 6+
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
};

// Ensure the mongoose connection is stored globally
(global as any).mongoose = cached;
