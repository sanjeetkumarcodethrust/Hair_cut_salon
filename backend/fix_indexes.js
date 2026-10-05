import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Fix dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Salon from './models/Salon.js';

async function fix() {
  try {
    console.log('Connecting to', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    // Drop all indexes on Salon collection except _id
    const indexes = await Salon.collection.indexes();
    for (const index of indexes) {
      if (index.name !== '_id_') {
        console.log(`Dropping index: ${index.name}`);
        await Salon.collection.dropIndex(index.name);
      }
    }
    
    // Re-sync indexes based on the current schema
    await Salon.syncIndexes();
    console.log('Created fresh indexes from schema');
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fix();
