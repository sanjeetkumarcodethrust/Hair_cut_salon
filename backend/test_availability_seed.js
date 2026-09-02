import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Salon from './models/Salon.js';
import BarberProfile from './models/BarberProfile.js';
import Chair from './models/Chair.js';

dotenv.config();

const testDb = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const salon = await Salon.findOne({ name: /Urban Cuts/ });
  if (!salon) return console.log('No salon found');
  
  // Make sure salon has some hours
  salon.openingHours = {
    monday: { open: '10:00', close: '20:00', isClosed: false },
    tuesday: { open: '10:00', close: '20:00', isClosed: false },
    wednesday: { open: '10:00', close: '20:00', isClosed: false },
    thursday: { open: '10:00', close: '20:00', isClosed: false },
    friday: { open: '10:00', close: '20:00', isClosed: false },
    saturday: { open: '10:00', close: '20:00', isClosed: false },
    sunday: { open: '10:00', close: '20:00', isClosed: false },
  };
  await salon.save();

  // Find owner (or any user)
  const users = await mongoose.model('User').find();
  if (users.length === 0) return console.log('No users found');
  
  // Create a Barber
  await BarberProfile.deleteMany({ salonId: salon._id });
  const barber = new BarberProfile({
    user: users[0]._id,
    name: 'John Doe (Barber)',
    salonId: salon._id,
    status: 'active',
    availability: {
      monday: { start: '10:00', end: '18:00', isWorking: true },
      tuesday: { start: '10:00', end: '18:00', isWorking: true },
      wednesday: { start: '10:00', end: '18:00', isWorking: true },
      thursday: { start: '10:00', end: '18:00', isWorking: true },
      friday: { start: '10:00', end: '18:00', isWorking: true },
      saturday: { start: '10:00', end: '18:00', isWorking: true },
      sunday: { start: '10:00', end: '18:00', isWorking: false }
    },
    breaks: [
      { day: 'monday', start: '14:00', end: '15:00' }, // 1 hr break
      { day: 'tuesday', start: '14:00', end: '15:00' },
      { day: 'wednesday', start: '14:00', end: '15:00' },
      { day: 'thursday', start: '14:00', end: '15:00' },
      { day: 'friday', start: '14:00', end: '15:00' },
      { day: 'saturday', start: '14:00', end: '15:00' }
    ],
    services: salon.services
  });
  await barber.save();

  // Create Chairs
  await Chair.deleteMany({ shopId: salon._id });
  const chair1 = new Chair({ shopId: salon._id, name: 'Chair 1' });
  await chair1.save();

  console.log(`Test Data Seeded for ${salon.name}`);
  console.log(`Salon ID: ${salon._id}`);
  console.log(`Service ID (Fade Haircut): ${salon.services[0]._id}`);
  process.exit(0);
};

testDb();
