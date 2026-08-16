import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Salon from './models/Salon.js';
import User from './models/User.js';

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
        phone: '9876543210'
      });
    }

    const salons = [
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
          { name: 'Women Haircut', description: 'Stylish women haircut', price: 500, duration: 45 }
        ]
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
          { name: 'Hair Coloring', description: 'Global hair color', price: 1500, duration: 120 }
        ]
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
          { name: 'Haircut & Beard', description: 'Combo styling', price: 300, duration: 45 }
        ]
      }
    ];

    await Salon.insertMany(salons);
    console.log('Salons near Laxmi Chowk, Marunji seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding salons:', error);
    process.exit(1);
  }
};

seedSalons();
