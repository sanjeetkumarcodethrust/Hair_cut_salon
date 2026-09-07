import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import '../models/User.js';
import '../models/Salon.js';

// Load environment variables
dotenv.config();

// Since server.js starts the server unconditionally, we'll hit the running dev server.
const API_URL = 'http://localhost:5000/api';

describe('End-to-End Identity & Ownership Isolation Tests', () => {
  let userA, userB, tokenA, tokenB, salonId, serviceId, bookingIdA, bookingIdB;

  beforeAll(async () => {
    // 1. Create User A
    const emailA = `usera_${Date.now()}@example.com`;
    const resA = await request(API_URL)
      .post('/auth/register')
      .send({ name: 'User A', email: emailA, password: 'Password123!' });
    tokenA = resA.body.token;

    // 2. Create User B
    const emailB = `userb_${Date.now()}@example.com`;
    const resB = await request(API_URL)
      .post('/auth/register')
      .send({ name: 'User B', email: emailB, password: 'Password123!' });
    tokenB = resB.body.token;

    // 3. Create an Owner and a test Salon to book directly via mongoose
    await mongoose.connect(process.env.MONGO_URI);
    const owner = await mongoose.model('User').create({
      name: 'Owner', email: `owner_${Date.now()}@example.com`, password: 'Password123!', role: 'owner'
    });
    
    const salon = await mongoose.model('Salon').create({
      name: 'Jest E2E Salon',
      owner: owner._id,
      address: '123 Test',
      city: 'Test City',
      description: 'Test',
      phone: '9999999999',
      isActive: true,
      verificationStatus: 'approved',
      services: [{ name: 'Cut', price: 20, duration: 30, description: 'Cut', isActive: true }]
    });

    salonId = salon._id;
    serviceId = salon.services[0]._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('User A can create a booking', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const res = await request(API_URL)
      .post('/appointments/scheduled')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        shopId: salonId,
        serviceIds: [serviceId],
        date: tomorrow.toISOString(),
        startTime: '10:00'
      });
    
    expect(res.status).toBe(201);
    bookingIdA = res.body.data._id;
  });

  it('User A can see their own booking', async () => {
    const res = await request(API_URL)
      .get('/appointments/my')
      .set('Authorization', `Bearer ${tokenA}`);
    
    expect(res.status).toBe(200);
    const bookings = res.body.data;
    const found = bookings.find(b => b._id === bookingIdA);
    expect(found).toBeDefined();
  });

  it('User B CANNOT see User A booking', async () => {
    const res = await request(API_URL)
      .get('/appointments/my')
      .set('Authorization', `Bearer ${tokenB}`);
    
    expect(res.status).toBe(200);
    const bookings = res.body.data;
    const found = bookings.find(b => b._id === bookingIdA);
    expect(found).toBeUndefined(); // Must be strictly isolated
  });

  it('User B can create their own booking', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const res = await request(API_URL)
      .post('/appointments/scheduled')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        shopId: salonId,
        serviceIds: [serviceId],
        date: tomorrow.toISOString(),
        startTime: '11:00'
      });
    
    expect(res.status).toBe(201);
    bookingIdB = res.body.data._id;
  });

  it('User A gets 403 Forbidden when trying to access User B booking (IDOR Check)', async () => {
    const res = await request(API_URL)
      .get(`/appointments/${bookingIdB}`)
      .set('Authorization', `Bearer ${tokenA}`);
    
    expect(res.status).toBe(403);
  });

  it('User A gets 403 Forbidden when trying to cancel User B booking (IDOR Check)', async () => {
    const res = await request(API_URL)
      .put(`/appointments/${bookingIdB}/cancel`)
      .set('Authorization', `Bearer ${tokenA}`);
    
    expect(res.status).toBe(403);
  });

});
