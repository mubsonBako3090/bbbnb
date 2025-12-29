import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('❌ Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { 
    conn: null, 
    promise: null,
    connected: false
  };
}

async function connectDB() {
  if (cached.conn && cached.connected) {
    console.log('✅ Using cached MongoDB connection');
    return cached.conn;
  }

  if (cached.promise) {
    console.log('🔄 MongoDB connection in progress, waiting...');
    return await cached.promise;
  }

  const opts = {
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true,
    w: 'majority'
  };

  console.log('🔄 Attempting to connect to MongoDB Atlas...');

  try {
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log('✅ MongoDB Atlas connected successfully!');

        cached.connected = true;

        const db = mongooseInstance.connection;

        db.on('error', (error) => {
          console.error('❌ MongoDB connection error:', error);
          cached.connected = false;
          cached.conn = null;
          cached.promise = null;
        });

        db.on('disconnected', () => {
          console.log('⚠ MongoDB disconnected');
          cached.connected = false;
          cached.conn = null;
          cached.promise = null;
        });

        db.on('reconnected', () => {
          console.log('✅ MongoDB reconnected');
          cached.connected = true;
        });

        return mongooseInstance;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection failed:', error);
        cached.promise = null;
        cached.conn = null;
        cached.connected = false;
        throw new Error(`Database connection failed: ${error.message}`);
      });

    cached.conn = await cached.promise;
    return cached.conn;

  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    cached.connected = false;

    console.error('❌ Failed to establish MongoDB connection:', error);
    throw error;
  }
}

export function withDatabase(handler) {
  return async (req, res) => {
    try {
      await connectDB();
      return handler(req, res);
    } catch (error) {
      console.error('Database connection error in API route:', error);
      return res.status(503).json({
        success: false,
        error: 'Service temporarily unavailable. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
}

export default connectDB;
