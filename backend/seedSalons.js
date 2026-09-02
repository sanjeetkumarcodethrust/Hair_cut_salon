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
        location: { type: 'Point', coordinates: [73.7381, 18.5991] },
        description: 'Premium hair cutting, styling, and luxury grooming services.',
        address: 'Laxmi Chowk, Marunji Village',
        city: 'Pune',
        state: 'Maharashtra',
        phone: '9876543211',
        rating: 4.8,
        totalReviews: 124,
        images: [
          'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
        ],
        services: [
          { name: 'Men Haircut', description: 'Classic men haircut', price: 200, duration: 30 },
          { name: 'Women Haircut', description: 'Stylish women haircut', price: 500, duration: 45 },
          { name: 'Hair Spa', description: 'Nourishing hair spa treatment', price: 800, duration: 60 },
        ],
      },
      {
        owner: owner._id,
        name: 'Style Studio Unisex Salon',
        activeOffer: { title: '10% OFF Color', isActive: true, discountValue: '10%' },
        location: { type: 'Point', coordinates: [73.7402, 18.5975] },
        description: 'Best unisex salon in Laxmi Chowk for modern styling and hair color.',
        address: 'Near Life Republic, Marunji Road',
        city: 'Pune',
        state: 'Maharashtra',
        phone: '9876543212',
        rating: 4.6,
        totalReviews: 98,
        images: [
          'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
        ],
        services: [
          { name: 'Haircut', description: 'Basic Haircut', price: 150, duration: 30 },
          { name: 'Hair Coloring', description: 'Global hair color', price: 1500, duration: 120 },
        ],
      },
      {
        owner: owner._id,
        name: 'The Grooming Room',
        location: { type: 'Point', coordinates: [73.7431, 18.6010] },
        description: 'Specialized in precision hair cuts, hot towel shaves, and beard grooming.',
        address: 'Hinjewadi - Marunji Link Road, Laxmi Chowk',
        city: 'Pune',
        state: 'Maharashtra',
        phone: '9876543213',
        rating: 4.7,
        totalReviews: 85,
        images: [
          'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
        ],
        services: [
          { name: 'Haircut & Beard', description: 'Combo styling', price: 300, duration: 45 },
          { name: 'Beard Trimming', description: 'Precision shape up', price: 150, duration: 20 },
        ],
      },
      {
        owner: owner._id,
        name: 'Urban Cuts & Shave Lounge',
        activeOffer: { title: '20% OFF Fade', isActive: true, discountValue: '20%' },
        location: { type: 'Point', coordinates: [73.7350, 18.5950] },
        description: 'Trendy barbershop offering modern fade cuts, beard design, and facial care.',
        address: 'Phase 1, Hinjewadi IT Park',
        city: 'Pune',
        state: 'Maharashtra',
        phone: '9876543214',
        rating: 4.9,
        totalReviews: 142,
        images: [
          'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
        ],
        services: [
          { name: 'Fade Haircut', description: 'Skin fade with sharp outline', price: 250, duration: 35 },
          { name: 'Charcoal Facial', description: 'Deep cleansing facial', price: 600, duration: 40 },
        ],
      },
      {
        owner: owner._id,
        name: 'Vogue Hair & Beauty Spa',
        location: { type: 'Point', coordinates: [73.7420, 18.5980] },
        description: 'Luxury styling lounge specializing in hair keratin, treatments, and bridal makeups.',
        address: 'Bhakti Plaza, Marunji Road',
        city: 'Pune',
        state: 'Maharashtra',
        phone: '9876543215',
        rating: 4.8,
        totalReviews: 110,
        images: [
          'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
        ],
        services: [
          { name: 'Keratin Treatment', description: 'Smooth hair shine', price: 2500, duration: 150 },
          { name: 'Head Massage', description: 'Relaxing hot oil massage', price: 350, duration: 30 },
        ],
      },
      {
        owner: owner._id,
        name: 'Classic Gentlemen Barber Shop',
        location: { type: 'Point', coordinates: [73.7390, 18.5960] },
        description: 'Authentic vintage barbershop experience with premium grooming products.',
        address: 'Near Laxmi Chowk Bus Stop, Marunji',
        city: 'Pune',
        state: 'Maharashtra',
        phone: '9876543216',
        rating: 4.7,
        totalReviews: 76,
        images: [
          'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
        ],
        services: [
          { name: 'Classic Haircut', description: 'Traditional scissor cut', price: 180, duration: 30 },
          { name: 'Royal Hot Towel Shave', description: 'Luxury shave experience', price: 200, duration: 25 },
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
    console.log('Salons with photos and Barber Jobs seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedSalons();
