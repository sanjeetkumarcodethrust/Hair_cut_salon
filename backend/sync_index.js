import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Salon from './models/Salon.js';

dotenv.config();

async function sync() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  await Salon.syncIndexes();
  console.log('Indexes synced');
  process.exit(0);
}

sync();
