import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Salon from './models/Salon.js';

dotenv.config();

const updateSalons = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    const salons = await Salon.find({});
    console.log(`Found ${salons.length} salons.`);
    
    for (const salon of salons) {
      let changed = false;
      
      if (!salon.openingHours) {
         salon.openingHours = {};
      }
      
      for (const day of days) {
        if (!salon.openingHours[day]) {
          salon.openingHours[day] = { open: '09:00 AM', close: '08:00 PM', isClosed: false };
          changed = true;
        } else if (salon.openingHours[day].isClosed) {
          salon.openingHours[day].isClosed = false;
          if (!salon.openingHours[day].open) {
             salon.openingHours[day].open = '09:00 AM';
             salon.openingHours[day].close = '08:00 PM';
          }
          changed = true;
        }
      }
      
      if (changed) {
         await salon.save();
         console.log(`Updated salon ${salon.name}`);
      }
    }
    console.log('Done');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

updateSalons();
