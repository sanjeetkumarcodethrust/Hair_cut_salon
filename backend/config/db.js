import mongoose from 'mongoose';
import env from './env.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`MongoDB connected successfully`);
  } catch (error) {
    console.error(`MongoDB connection failed. Please ensure the database is running.\nError Details: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
