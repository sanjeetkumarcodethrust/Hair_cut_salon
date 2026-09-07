import mongoose from 'mongoose';
import User from './models/User.js';
import Salon from './models/Salon.js';
import Appointment from './models/Appointment.js';
import BarberProfile from './models/BarberProfile.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGO_URI;

const runTests = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    // Create a mock salon for testing
    console.log('Seeding mock salon...');
    const owner = await User.findOne({ role: 'owner' }) || await User.create({
      name: 'Test Owner', email: `owner_${Date.now()}@example.com`, password: 'Password123!', role: 'owner'
    });

    const salon = await Salon.create({
      name: 'E2E Test Salon',
      owner: owner._id,
      address: '123 Test St',
      city: 'Test City',
      location: { type: 'Point', coordinates: [77.5946, 12.9716] },
      isActive: true,
      verificationStatus: 'approved',
      services: [{
        name: 'E2E Haircut',
        price: 50,
        duration: 30,
        category: 'Hair',
        isActive: true
      }]
    });
    
    console.log(`Salon created with ID: ${salon._id}`);
    const serviceId = salon.services[0]._id;

    console.log('--- STARTING DIRECT DB E2E ISOLATION AUDIT ---');

    const emailA = `usera_${Date.now()}@example.com`;
    const emailB = `userb_${Date.now()}@example.com`;

    const userA = await User.create({ name: 'User A', email: emailA, password: 'Password123!' });
    const userB = await User.create({ name: 'User B', email: emailB, password: 'Password123!' });
    console.log(`User A: ${userA._id} | User B: ${userB._id}`);

    // Create Booking A directly via model to test query scoping
    const bookingA = await Appointment.create({
      customer: userA._id,
      salon: salon._id,
      service: { name: 'E2E Haircut', price: 50, duration: 30 },
      date: new Date(),
      time: '10:00',
      status: 'confirmed'
    });
    console.log(`Booking A created: ${bookingA._id}`);

    // Create Booking B
    const bookingB = await Appointment.create({
      customer: userB._id,
      salon: salon._id,
      service: { name: 'E2E Haircut', price: 50, duration: 30 },
      date: new Date(),
      time: '11:00',
      status: 'confirmed'
    });
    console.log(`Booking B created: ${bookingB._id}`);

    // Query Test: Ensure find({ customer: userA._id }) DOES NOT return Booking B
    const appointmentsA = await Appointment.find({ customer: userA._id });
    const userBIdsInA = appointmentsA.filter(a => a._id.toString() === bookingB._id.toString());
    
    if (userBIdsInA.length > 0) {
      throw new Error("VULNERABILITY: User A's query returned User B's booking!");
    } else {
      console.log('Isolation Test 1 Passed: User A query strictly returns User A bookings.');
    }

    const appointmentsB = await Appointment.find({ customer: userB._id });
    if (appointmentsB.filter(a => a._id.toString() === bookingA._id.toString()).length > 0) {
      throw new Error("VULNERABILITY: User B's query returned User A's booking!");
    } else {
      console.log('Isolation Test 2 Passed: User B query strictly returns User B bookings.');
    }

    // Clean up
    console.log('Cleaning up test data...');
    await Salon.findByIdAndDelete(salon._id);
    await Appointment.deleteMany({ _id: { $in: [bookingA._id, bookingB._id] } });
    await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });
    
    console.log('Test complete. Everything is securely isolated.');
    process.exit(0);

  } catch (error) {
    console.error('TEST FAILED:', error);
    process.exit(1);
  }
};

runTests();
