import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Salon from './models/Salon.js';
import User from './models/User.js';
import Job from './models/Job.js';

const seedSalons = async () => {
  await connectDB();

  try {
    // Create a dummy owner if not exists
    let owner = await User.findOne({ email: 'owner@marunji.com' });
    if (!owner) {
      owner = await User.create({
        name: 'Marunji Owner',
        email: 'owner@marunji.com',
        password: 'password123',
        role: 'owner',
        phone: '9876543210',
      });
    }

    await Salon.deleteMany({});
    await Job.deleteMany({});

    const seededSalons = await Salon.insertMany([
      {
        owner: owner._id,
        name: 'Lakme Salon Marunji',
        description: 'Premium hair cutting and styling services.',
        address: 'Laxmi Chowk, Marunji Village',
        city: 'Pune',
        state: 'Maharashtra',
        phone: '9876543211',
        services: [
          { name: 'Men Haircut', description: 'Classic men haircut', price: 200, duration: 30 },
          { name: 'Women Haircut', description: 'Stylish women haircut', price: 500, duration: 45 },
        ],
      },
      {
        owner: owner._id,
        name: 'Style Studio Unisex Salon',
        description: 'Best unisex salon in Laxmi Chowk for all hair needs.',
        address: 'Near Life Republic, Marunji Road',
        city: 'Pune',
        state: 'Maharashtra',
        phone: '9876543212',
        services: [
          { name: 'Haircut', description: 'Basic Haircut', price: 150, duration: 30 },
          { name: 'Hair Coloring', description: 'Global hair color', price: 1500, duration: 120 },
        ],
      },
      {
        owner: owner._id,
        name: 'The Grooming Room',
        description: 'Specialized in hair cuts and beard grooming.',
        address: 'Hinjewadi - Marunji Link Road, Laxmi Chowk',
        city: 'Pune',
        state: 'Maharashtra',
        phone: '9876543213',
        services: [
          { name: 'Haircut & Beard', description: 'Combo styling', price: 300, duration: 45 },
        ],
      },
    ]);

    const jobs = [
      {
        title: 'Senior Hair Stylist & Barber',
        salon: seededSalons[0]._id,
        createdBy: owner._id,
        description:
          'We are looking for an experienced hair stylist and barber to join our team at Lakme Salon Marunji. Must have expertise in modern haircuts, hair styling, and client care.',
        skills: ['Hair Cutting', 'Styling', 'Beard Trimming', 'Hair Coloring'],
        experience: 2,
        salary: { min: 25000, max: 40000, currency: 'INR' },
        location: 'Marunji, Pune',
        jobType: 'full-time',
        status: 'open',
      },
      {
        title: 'Unisex Hairdresser / Barber',
        salon: seededSalons[1]._id,
        createdBy: owner._id,
        description:
          'Style Studio Unisex Salon is hiring a skilled unisex hairdresser. Great salary + attractive commission on services.',
        skills: ['Unisex Haircuts', 'Keratin Treatment', 'Facials'],
        experience: 1,
        salary: { min: 20000, max: 35000, currency: 'INR' },
        location: 'Marunji Road, Pune',
        jobType: 'full-time',
        status: 'open',
      },
      {
        title: 'Beard & Grooming Specialist',
        salon: seededSalons[2]._id,
        createdBy: owner._id,
        description:
          'Specialist barber needed for beard shaping, luxury shaves, and mens hair grooming.',
        skills: ['Beard Grooming', 'Hot Towel Shave', 'Men Haircut'],
        experience: 3,
        salary: { min: 30000, max: 45000, currency: 'INR' },
        location: 'Hinjewadi Link Road, Pune',
        jobType: 'full-time',
        status: 'open',
      },
    ];

    await Job.insertMany(jobs);
    console.log('Salons and Barber Jobs seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedSalons();
