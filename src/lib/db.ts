import mongoose from 'mongoose';
import logger from './utils/logger';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      autoIndex: true,
    };

    logger.info('Connecting to MongoDB database...');
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      logger.info('MongoDB connection established successfully.');
      return mongooseInstance;
    }).catch((err) => {
      logger.error(`MongoDB connection failed: ${err.message}`);
      cached.promise = null;
      throw err;
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

export async function disconnectDB() {
  try {
    await mongoose.connection.close();
    logger.info('Database connection closed gracefully.');
  } catch (error) {
    const err = error as Error;
    logger.error(`Error closing database connection: ${err.message}`);
  }
}
