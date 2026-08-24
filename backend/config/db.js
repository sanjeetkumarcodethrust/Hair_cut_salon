import mongoose from 'mongoose';
import env from './env.js';

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;

const connectDB = async () => {
  try {
    if (!env.mongoUri) {
      throw new Error('MONGO_URI is missing from backend/.env');
    }

    const conn = await mongoose.connect(env.mongoUri);
    console.log(`MongoDB connected successfully`);
  } catch (error) {
    console.error(`MongoDB connection failed. Please ensure the database is running.\nError Details: ${error.message}`);
    // Do not exit process, allow backend to stay up to serve 500 errors gracefully
  }
};

export default connectDB;
